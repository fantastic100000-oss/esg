"""보고서 PDF 업로드 API"""
import shutil
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.database import get_db, Company, ESGReport
from app.services.pdf_extractor import extract_text_from_pdf, quick_scan_esg_mentions

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/report")
async def upload_report(
    file: UploadFile = File(...),
    company_name: str = Form(...),
    year: int = Form(...),
    is_mine: bool = Form(False),
    db: AsyncSession = Depends(get_db),
):
    """ESG 보고서 PDF 업로드"""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "PDF 파일만 업로드 가능합니다.")

    size = 0
    content = await file.read()
    size = len(content)
    if size > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(413, f"파일 크기가 {settings.max_upload_size_mb}MB를 초과합니다.")

    # 기업 조회 또는 생성
    result = await db.execute(select(Company).where(Company.name == company_name))
    company = result.scalar_one_or_none()
    if not company:
        company = Company(
            name=company_name,
            industry="식품",
            is_mine=1 if is_mine else 0,
        )
        db.add(company)
        await db.flush()

    # 파일 저장
    safe_name = company_name.replace(" ", "_")
    file_path = settings.upload_dir / f"{safe_name}_{year}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    with open(file_path, "wb") as f:
        f.write(content)

    # 텍스트 추출 및 빠른 스캔
    try:
        text = extract_text_from_pdf(file_path)
        scan = quick_scan_esg_mentions(text)
    except Exception:
        text = ""
        scan = {}

    # DB 저장
    report = ESGReport(
        company_id=company.id,
        year=year,
        file_path=str(file_path),
        raw_text=text[:50000] if text else "",  # 최대 50K자 저장
        status="pending",
        extracted_metrics={"quick_scan": scan},
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    return {
        "success": True,
        "report_id": report.id,
        "company": company_name,
        "year": year,
        "pages_detected": text.count("\n\n") if text else 0,
        "esg_scan": scan,
        "message": f"'{company_name}' {year}년 보고서 업로드 완료. 분석 대기 중입니다.",
    }


@router.get("/companies")
async def list_companies(db: AsyncSession = Depends(get_db)):
    """등록된 기업 목록"""
    result = await db.execute(select(Company))
    companies = result.scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "is_mine": bool(c.is_mine),
            "ir_url": c.ir_url,
        }
        for c in companies
    ]


@router.get("/reports")
async def list_reports(db: AsyncSession = Depends(get_db)):
    """업로드된 보고서 목록"""
    result = await db.execute(select(ESGReport))
    reports = result.scalars().all()
    return [
        {
            "id": r.id,
            "company_id": r.company_id,
            "year": r.year,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]
