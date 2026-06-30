from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, Float
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.ext.asyncio import async_sessionmaker
from datetime import datetime

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    ticker = Column(String(20))
    industry = Column(String(50), default="식품")
    is_mine = Column(Integer, default=0)  # 1=자사
    ir_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("ESGReport", back_populates="company")


class ESGReport(Base):
    __tablename__ = "esg_reports"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    year = Column(Integer, nullable=False)
    file_path = Column(String(500))
    source_url = Column(String(500))
    raw_text = Column(Text)
    extracted_metrics = Column(JSON)  # 추출된 ESG 지표
    status = Column(String(20), default="pending")  # pending/processing/done/error
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="reports")


class MediaResearch(Base):
    __tablename__ = "media_research"

    id = Column(Integer, primary_key=True)
    title = Column(String(500))
    source = Column(String(100))
    published_at = Column(DateTime)
    url = Column(String(500))
    summary = Column(Text)
    keywords = Column(JSON)
    sentiment = Column(String(20))  # positive/negative/neutral
    esg_category = Column(String(50))  # E/S/G/종합
    created_at = Column(DateTime, default=datetime.utcnow)


class ESGPolicy(Base):
    __tablename__ = "esg_policies"

    id = Column(Integer, primary_key=True)
    title = Column(String(500))
    authority = Column(String(100))  # 발행기관
    category = Column(String(50))
    effective_date = Column(DateTime)
    summary = Column(Text)
    impact_level = Column(String(20))  # high/medium/low
    created_at = Column(DateTime, default=datetime.utcnow)


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True)
    title = Column(String(500))
    year = Column(Integer)
    my_company_id = Column(Integer, ForeignKey("companies.id"))
    competitor_ids = Column(JSON)
    analysis_result = Column(JSON)
    file_path = Column(String(500))
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
