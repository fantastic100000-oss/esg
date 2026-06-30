"""식품기업 IR/ESG 페이지 크롤링 및 미디어 리서치 수집"""
import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional
import anthropic

from app.config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

# 주요 식품기업 ESG/지속가능경영 보고서 페이지
FOOD_COMPANY_IR_URLS = {
    "CJ제일제당": "https://www.cj.co.kr/kr/about/esg/sustainability",
    "오리온": "https://www.orionworld.com/kr/sustainability",
    "농심": "https://www.nongshim.com/sustainability",
    "롯데웰푸드": "https://www.lottewellfood.com/esg",
    "삼양식품": "https://www.samyangfood.com/sustainability",
    "풀무원": "https://www.pulmuone.co.kr/pulmuone/esg",
    "대상": "https://www.daesang.com/kr/esg",
    "빙그레": "https://www.bing.co.kr/esg",
}

# 식품업계 ESG 뉴스 검색 쿼리
ESG_NEWS_QUERIES = [
    "식품기업 ESG",
    "식품산업 탄소중립",
    "식품 지속가능경영",
    "식품 포장재 친환경",
    "식품안전 ESG",
    "K-푸드 ESG",
]

# 주요 ESG 정책/규제 기관
POLICY_SOURCES = [
    {"name": "환경부", "url": "https://www.me.go.kr"},
    {"name": "금융위원회", "url": "https://www.fsc.go.kr"},
    {"name": "한국거래소 ESG", "url": "https://esg.krx.co.kr"},
    {"name": "GRI Korea", "url": "https://www.globalreporting.org"},
]


async def fetch_page(url: str, timeout: int = 30) -> Optional[str]:
    """웹 페이지 HTML 가져오기"""
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; ESGAnalyzer/1.0)",
        "Accept-Language": "ko-KR,ko;q=0.9",
    }
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.text
    except Exception as e:
        return None


def parse_report_links(html: str, base_url: str) -> list[dict]:
    """HTML에서 ESG/지속가능경영보고서 PDF 링크 추출"""
    soup = BeautifulSoup(html, "lxml")
    links = []

    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)
        if not text:
            continue

        is_report = any(kw in text for kw in [
            "지속가능경영", "ESG", "CSV", "Sustainability", "환경", "사회책임"
        ])
        is_pdf = href.lower().endswith(".pdf") or "pdf" in href.lower()

        if is_report or is_pdf:
            if href.startswith("/"):
                from urllib.parse import urlparse
                parsed = urlparse(base_url)
                href = f"{parsed.scheme}://{parsed.netloc}{href}"
            elif not href.startswith("http"):
                href = f"{base_url.rstrip('/')}/{href}"

            links.append({
                "url": href,
                "text": text,
                "is_pdf": is_pdf,
            })

    return links


async def download_pdf(url: str, save_path: str) -> bool:
    """PDF 파일 다운로드"""
    try:
        async with httpx.AsyncClient(timeout=120, follow_redirects=True) as client:
            async with client.stream("GET", url) as response:
                response.raise_for_status()
                with open(save_path, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=8192):
                        f.write(chunk)
        return True
    except Exception:
        return False


async def crawl_company_reports(company_name: str, ir_url: str) -> list[dict]:
    """기업 IR 페이지에서 ESG 보고서 찾기"""
    html = await fetch_page(ir_url)
    if not html:
        return []

    links = parse_report_links(html, ir_url)
    return [{"company": company_name, **link} for link in links]


async def summarize_article_with_ai(title: str, content: str) -> dict:
    """AI로 뉴스 기사 요약 및 ESG 카테고리 분류"""
    prompt = f"""다음 뉴스 기사를 분석해주세요.

제목: {title}
내용: {content[:2000]}

JSON 형식으로 반환:
{{
  "summary": "2-3문장 핵심 요약",
  "esg_category": "E 또는 S 또는 G 또는 종합",
  "sentiment": "positive 또는 negative 또는 neutral",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "relevance_score": 1-10 (식품업계 ESG 관련성)
}}"""

    try:
        message = client.messages.create(
            model=settings.claude_model,
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0]
        import json
        return json.loads(raw)
    except Exception:
        return {
            "summary": content[:200],
            "esg_category": "종합",
            "sentiment": "neutral",
            "keywords": [],
            "relevance_score": 5,
        }


async def search_esg_news(query: str, max_results: int = 10) -> list[dict]:
    """ESG 관련 뉴스 검색 (네이버 뉴스 RSS 활용)"""
    from urllib.parse import quote
    rss_url = f"https://news.naver.com/search/news.naver?query={quote(query)}&sort=1"
    html = await fetch_page(rss_url)
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    articles = []

    for item in soup.select(".news_tit")[:max_results]:
        title = item.get_text(strip=True)
        url = item.get("href", "")
        articles.append({
            "title": title,
            "url": url,
            "source": "네이버뉴스",
            "query": query,
            "published_at": datetime.utcnow().isoformat(),
        })

    return articles


async def crawl_all_food_companies(
    target_companies: Optional[list[str]] = None,
) -> list[dict]:
    """모든 또는 지정된 식품기업 크롤링"""
    companies = target_companies or list(FOOD_COMPANY_IR_URLS.keys())
    results = []

    tasks = [
        crawl_company_reports(name, FOOD_COMPANY_IR_URLS[name])
        for name in companies
        if name in FOOD_COMPANY_IR_URLS
    ]
    company_results = await asyncio.gather(*tasks, return_exceptions=True)

    for result in company_results:
        if isinstance(result, list):
            results.extend(result)

    return results
