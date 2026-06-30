"""완성된 보고서 다운로드 API"""
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db, AnalysisReport

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/download/{analysis_id}")
async def download_report(
    analysis_id: int,
    format: str = "docx",
    db: AsyncSession = Depends(get_db),
):
    """완성된 보고서 파일 다운로드"""
    result = await db.execute(select(AnalysisReport).where(AnalysisReport.id == analysis_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "보고서를 찾을 수 없습니다.")
    if record.status != "done":
        raise HTTPException(202, f"보고서 생성 중입니다 (상태: {record.status})")

    file_paths = record.analysis_result.get("file_paths", []) if record.analysis_result else []
    target_path = next(
        (p for p in file_paths if p.endswith(f".{format}")), None
    )
    if not target_path or not Path(target_path).exists():
        raise HTTPException(404, f"{format.upper()} 파일이 없습니다. 분석 시 해당 형식을 선택했는지 확인하세요.")

    media_type = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if format == "docx"
        else "application/pdf"
    )
    filename = f"esg_report_{analysis_id}_{record.year}.{format}"

    return FileResponse(target_path, media_type=media_type, filename=filename)


@router.get("/list")
async def list_reports(db: AsyncSession = Depends(get_db)):
    """완성된 보고서 목록"""
    result = await db.execute(select(AnalysisReport))
    records = result.scalars().all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "year": r.year,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "file_count": len(r.analysis_result.get("file_paths", [])) if r.analysis_result else 0,
        }
        for r in records
    ]
