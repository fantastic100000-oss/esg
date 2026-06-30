from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.models.database import init_db
from app.api import upload, analyze, crawl, report


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="ESG 지속가능경영 비교분석 시스템",
    description="식품업계 ESG 보고서 수집·분석·비교 및 보고서 자동 생성",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(crawl.router)
app.include_router(report.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ESG Analysis System"}


@app.get("/")
async def root():
    return {
        "message": "ESG 지속가능경영 비교분석 시스템",
        "docs": "/docs",
        "endpoints": {
            "업로드": "POST /upload/report",
            "크롤링": "POST /crawl/start",
            "분석": "POST /analyze/run",
            "보고서 다운로드": "GET /report/download/{id}",
        },
    }
