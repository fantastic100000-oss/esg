"""ESG 분석 실행 API"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import asyncio

from app.models.database import get_db, Company, ESGReport, AnalysisReport, MediaResearch, ESGPolicy
from app.services.esg_analyzer import extract_esg_metrics, generate_comparison_report
from app.services.report_generator import generate_word_report, generate_pdf_report
from app.config import settings

router = APIRouter(prefix="/analyze", tags=["analyze"])


class AnalysisRequest(BaseModel):
    my_company_id: int
    competitor_ids: list[int]
    year: int
    output_format: str = "both"  # word / pdf / both
    report_title: Optional[str] = None


async def _run_analysis(analysis_id: int, request: AnalysisRequest):
    """백그라운드 분석 실행"""
    from app.models.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        # 분석 레코드 상태 업데이트
        result = await db.execute(
            select(AnalysisReport).where(AnalysisReport.id == analysis_id)
        )
        analysis_record = result.scalar_one_or_none()
        if not analysis_record:
            return

        analysis_record.status = "processing"
        await db.commit()

        try:
            # 자사 데이터 로드
            my_company_data = await _load_company_data(db, request.my_company_id, request.year)
            if not my_company_data:
                raise ValueError(f"자사({request.my_company_id}) 보고서 데이터 없음")

            # 동종사 데이터 로드
            competitor_data = []
            for cid in request.competitor_ids:
                data = await _load_company_data(db, cid, request.year)
                if data:
                    competitor_data.append(data)

            # 정책 및 미디어 데이터 로드
            policies_result = await db.execute(select(ESGPolicy).limit(20))
            policies = [
                {"title": p.title, "authority": p.authority, "summary": p.summary}
                for p in policies_result.scalars().all()
            ]

            media_result = await db.execute(select(MediaResearch).limit(30))
            media = [
                {"title": m.title, "source": m.source, "summary": m.summary,
                 "sentiment": m.sentiment}
                for m in media_result.scalars().all()
            ]

            # AI 비교분석 실행
            analysis = await generate_comparison_report(
                my_company=my_company_data,
                competitors=competitor_data,
                policies=policies,
                media=media,
            )

            # 보고서 파일 생성
            base_name = f"esg_report_{analysis_id}_{request.year}"
            file_paths = []

            if request.output_format in ("word", "both"):
                word_path = settings.reports_dir / f"{base_name}.docx"
                generate_word_report(analysis, my_company_data, competitor_data, word_path)
                file_paths.append(str(word_path))

            if request.output_format in ("pdf", "both"):
                pdf_path = settings.reports_dir / f"{base_name}.pdf"
                generate_pdf_report(analysis, my_company_data, competitor_data, pdf_path)
                file_paths.append(str(pdf_path))

            analysis_record.analysis_result = {
                "text": analysis.get("text", ""),
                "sections": analysis.get("sections", {}),
                "companies": analysis.get("companies", []),
                "file_paths": file_paths,
            }
            analysis_record.file_path = file_paths[0] if file_paths else None
            analysis_record.status = "done"

        except Exception as e:
            analysis_record.status = "error"
            analysis_record.analysis_result = {"error": str(e)}

        await db.commit()


async def _load_company_data(db: AsyncSession, company_id: int, year: int) -> Optional[dict]:
    """기업 + 해당 연도 보고서 데이터 로드 및 지표 추출"""
    comp_result = await db.execute(select(Company).where(Company.id == company_id))
    company = comp_result.scalar_one_or_none()
    if not company:
        return None

    report_result = await db.execute(
        select(ESGReport).where(
            ESGReport.company_id == company_id,
            ESGReport.year == year,
        )
    )
    report = report_result.scalar_one_or_none()
    if not report:
        return {"id": company_id, "name": company.name, "metrics": {}}

    # 지표가 이미 추출되어 있으면 재사용
    metrics = report.extracted_metrics or {}
    if "E" not in metrics and report.raw_text:
        metrics = await extract_esg_metrics(report.raw_text, company.name)
        report.extracted_metrics = metrics
        report.status = "done"
        await db.commit()

    return {"id": company_id, "name": company.name, "metrics": metrics}


@router.post("/run")
async def run_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """ESG 비교분석 시작"""
    comp_result = await db.execute(select(Company).where(Company.id == request.my_company_id))
    my_company = comp_result.scalar_one_or_none()
    if not my_company:
        raise HTTPException(404, "자사 기업 정보를 찾을 수 없습니다.")

    title = request.report_title or f"{my_company.name} ESG 비교분석 {request.year}"
    analysis_record = AnalysisReport(
        title=title,
        year=request.year,
        my_company_id=request.my_company_id,
        competitor_ids=request.competitor_ids,
        status="pending",
    )
    db.add(analysis_record)
    await db.commit()
    await db.refresh(analysis_record)

    background_tasks.add_task(_run_analysis, analysis_record.id, request)

    return {
        "analysis_id": analysis_record.id,
        "title": title,
        "status": "pending",
        "message": "분석이 시작되었습니다. /analyze/status/{id}로 진행 상황을 확인하세요.",
    }


@router.get("/status/{analysis_id}")
async def get_analysis_status(analysis_id: int, db: AsyncSession = Depends(get_db)):
    """분석 진행 상황 조회"""
    result = await db.execute(select(AnalysisReport).where(AnalysisReport.id == analysis_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "분석 결과를 찾을 수 없습니다.")

    return {
        "id": record.id,
        "title": record.title,
        "status": record.status,
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "file_paths": record.analysis_result.get("file_paths", []) if record.analysis_result else [],
        "error": record.analysis_result.get("error") if record.analysis_result else None,
    }


@router.get("/result/{analysis_id}")
async def get_analysis_result(analysis_id: int, db: AsyncSession = Depends(get_db)):
    """분석 결과 전체 조회"""
    result = await db.execute(select(AnalysisReport).where(AnalysisReport.id == analysis_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "분석 결과를 찾을 수 없습니다.")
    if record.status != "done":
        raise HTTPException(202, f"분석 중입니다 (상태: {record.status})")

    return {
        "id": record.id,
        "title": record.title,
        "year": record.year,
        "result": record.analysis_result,
    }
