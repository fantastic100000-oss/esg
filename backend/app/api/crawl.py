"""크롤링 및 미디어/정책 데이터 관리 API"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db, MediaResearch, ESGPolicy, Company, ESGReport
from app.services.crawler import (
    crawl_all_food_companies,
    search_esg_news,
    summarize_article_with_ai,
    FOOD_COMPANY_IR_URLS,
    ESG_NEWS_QUERIES,
    download_pdf,
)
from app.services.pdf_extractor import extract_text_from_pdf
from app.config import settings

router = APIRouter(prefix="/crawl", tags=["crawl"])


class PolicyInput(BaseModel):
    title: str
    authority: str
    category: str = "종합"
    effective_date: Optional[str] = None
    summary: str
    impact_level: str = "medium"


class MediaInput(BaseModel):
    title: str
    source: str
    url: str
    published_at: Optional[str] = None
    summary: str
    esg_category: str = "종합"
    sentiment: str = "neutral"
    keywords: list[str] = []


@router.get("/companies")
async def list_crawlable_companies():
    """크롤링 가능한 식품기업 목록"""
    return [
        {"name": name, "ir_url": url}
        for name, url in FOOD_COMPANY_IR_URLS.items()
    ]


@router.post("/start")
async def start_crawl(
    background_tasks: BackgroundTasks,
    companies: Optional[list[str]] = None,
    db: AsyncSession = Depends(get_db),
):
    """동종사 보고서 크롤링 시작"""
    background_tasks.add_task(_crawl_and_save, companies)
    return {
        "message": f"크롤링을 시작했습니다. 대상: {companies or '전체 식품기업'}",
        "target_companies": companies or list(FOOD_COMPANY_IR_URLS.keys()),
    }


async def _crawl_and_save(companies: Optional[list[str]]):
    """크롤링 실행 및 DB 저장"""
    from app.models.database import AsyncSessionLocal
    links = await crawl_all_food_companies(companies)

    async with AsyncSessionLocal() as db:
        for link in links:
            if not link.get("is_pdf"):
                continue

            comp_name = link["company"]
            result = await db.execute(select(Company).where(Company.name == comp_name))
            company = result.scalar_one_or_none()
            if not company:
                company = Company(name=comp_name, industry="식품", is_mine=0)
                db.add(company)
                await db.flush()

            # PDF 다운로드
            url = link["url"]
            file_path = settings.upload_dir / f"{comp_name}_{url.split('/')[-1]}"
            downloaded = await download_pdf(url, str(file_path))
            if not downloaded:
                continue

            try:
                text = extract_text_from_pdf(file_path)
            except Exception:
                text = ""

            import re
            year_match = re.search(r"20\d{2}", link.get("text", url))
            year = int(year_match.group()) if year_match else datetime.now().year - 1

            report = ESGReport(
                company_id=company.id,
                year=year,
                file_path=str(file_path),
                source_url=url,
                raw_text=text[:50000],
                status="pending",
            )
            db.add(report)

        await db.commit()


@router.post("/news")
async def crawl_news(
    background_tasks: BackgroundTasks,
    queries: Optional[list[str]] = None,
    db: AsyncSession = Depends(get_db),
):
    """ESG 뉴스 수집 시작"""
    target_queries = queries or ESG_NEWS_QUERIES
    background_tasks.add_task(_crawl_news_and_save, target_queries)
    return {
        "message": "뉴스 수집을 시작했습니다.",
        "queries": target_queries,
    }


async def _crawl_news_and_save(queries: list[str]):
    from app.models.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        for query in queries:
            articles = await search_esg_news(query, max_results=10)
            for article in articles:
                ai_result = await summarize_article_with_ai(
                    article["title"], article.get("content", article["title"])
                )
                media = MediaResearch(
                    title=article["title"],
                    source=article.get("source", ""),
                    url=article.get("url", ""),
                    published_at=datetime.utcnow(),
                    summary=ai_result.get("summary", ""),
                    keywords=ai_result.get("keywords", []),
                    sentiment=ai_result.get("sentiment", "neutral"),
                    esg_category=ai_result.get("esg_category", "종합"),
                )
                db.add(media)
        await db.commit()


# 수동 데이터 입력 API
@router.post("/policy")
async def add_policy(policy: PolicyInput, db: AsyncSession = Depends(get_db)):
    """ESG 정책/규제 수동 등록"""
    p = ESGPolicy(
        title=policy.title,
        authority=policy.authority,
        category=policy.category,
        effective_date=datetime.fromisoformat(policy.effective_date) if policy.effective_date else None,
        summary=policy.summary,
        impact_level=policy.impact_level,
    )
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return {"id": p.id, "message": "정책이 등록되었습니다."}


@router.post("/media")
async def add_media(media: MediaInput, db: AsyncSession = Depends(get_db)):
    """미디어 리서치 수동 등록"""
    m = MediaResearch(
        title=media.title,
        source=media.source,
        url=media.url,
        published_at=datetime.fromisoformat(media.published_at) if media.published_at else datetime.utcnow(),
        summary=media.summary,
        esg_category=media.esg_category,
        sentiment=media.sentiment,
        keywords=media.keywords,
    )
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return {"id": m.id, "message": "미디어 리서치가 등록되었습니다."}


@router.get("/policies")
async def list_policies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ESGPolicy))
    policies = result.scalars().all()
    return [
        {"id": p.id, "title": p.title, "authority": p.authority,
         "category": p.category, "impact_level": p.impact_level, "summary": p.summary}
        for p in policies
    ]


@router.get("/media")
async def list_media(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MediaResearch))
    items = result.scalars().all()
    return [
        {"id": m.id, "title": m.title, "source": m.source,
         "sentiment": m.sentiment, "esg_category": m.esg_category,
         "summary": m.summary}
        for m in items
    ]
