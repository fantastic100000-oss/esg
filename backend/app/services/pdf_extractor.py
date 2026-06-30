"""PDF에서 텍스트 추출 및 ESG 지표 파싱"""
import pdfplumber
import re
from pathlib import Path
from typing import Optional


def extract_text_from_pdf(file_path: str | Path) -> str:
    """PDF 파일에서 전체 텍스트 추출"""
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    return "\n".join(text_parts)


def extract_tables_from_pdf(file_path: str | Path) -> list[dict]:
    """PDF에서 표 데이터 추출"""
    tables = []
    with pdfplumber.open(file_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            for table in page.extract_tables():
                if table and len(table) > 1:
                    tables.append({
                        "page": page_num,
                        "headers": table[0],
                        "rows": table[1:],
                    })
    return tables


def chunk_text(text: str, chunk_size: int = 8000, overlap: int = 500) -> list[str]:
    """긴 텍스트를 청크로 분할 (LLM 컨텍스트 제한 대응)"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


# 식품업계 ESG 핵심 지표 키워드 매핑
ESG_KEYWORD_MAP = {
    "E": {
        "탄소배출": ["온실가스", "탄소", "CO2", "GHG", "탄소중립", "넷제로"],
        "에너지": ["에너지", "전력", "재생에너지", "태양광"],
        "물": ["용수", "물", "수자원", "폐수"],
        "폐기물": ["폐기물", "재활용", "순환경제", "플라스틱"],
        "포장재": ["포장", "친환경포장", "생분해"],
        "식품손실": ["푸드로스", "식품손실", "폐기"],
    },
    "S": {
        "식품안전": ["식품안전", "HACCP", "품질관리", "안전사고"],
        "임직원": ["임직원", "직원", "고용", "인력", "근로"],
        "산업재해": ["산업재해", "안전사고", "재해율"],
        "공급망": ["공급망", "협력사", "공급업체", "상생"],
        "지역사회": ["지역사회", "사회공헌", "CSV"],
        "동물복지": ["동물복지", "동물권"],
    },
    "G": {
        "이사회": ["이사회", "독립이사", "사외이사"],
        "윤리경영": ["윤리", "반부패", "컴플라이언스"],
        "주주": ["주주", "배당", "주주환원"],
        "정보공시": ["공시", "투명성", "GRI", "TCFD", "SASB"],
    },
}


def quick_scan_esg_mentions(text: str) -> dict:
    """텍스트에서 ESG 항목별 언급 횟수 빠른 스캔"""
    result = {}
    for category, items in ESG_KEYWORD_MAP.items():
        result[category] = {}
        for item, keywords in items.items():
            count = sum(text.count(kw) for kw in keywords)
            result[category][item] = count
    return result
