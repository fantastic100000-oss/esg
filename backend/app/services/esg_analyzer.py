"""Claude AI를 활용한 ESG 지표 추출 및 비교분석"""
import json
import anthropic
from app.config import settings
from app.services.pdf_extractor import chunk_text, ESG_KEYWORD_MAP

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

FOOD_ESG_EXTRACTION_PROMPT = """당신은 식품기업 ESG 전문 애널리스트입니다.
아래 지속가능경영보고서 텍스트에서 ESG 핵심 지표를 추출해주세요.

추출할 항목 (숫자값, 단위, 전년 대비 변화 포함):
환경(E):
- 온실가스 배출량 (Scope 1, 2, 3, 단위: tCO2eq)
- 에너지 사용량 (단위: TJ 또는 MWh)
- 재생에너지 비율 (%)
- 용수 사용량 (단위: m³)
- 폐기물 발생량 및 재활용률
- 친환경 포장재 비율
- 식품손실 감소 목표/실적

사회(S):
- 임직원 수, 여성 비율
- 산업재해율 (LTIR 또는 재해율)
- 식품안전 인증 현황 (HACCP 등)
- 협력사 ESG 평가 현황
- 사회공헌 투자액

지배구조(G):
- 이사회 구성 (사외이사 비율, 여성이사 비율)
- ESG 위원회 존재 여부
- 보고 기준 (GRI, TCFD, SASB 등)

텍스트:
{text}

JSON 형식으로 반환하세요. 값이 없으면 null로 표시하고, 단위를 반드시 포함하세요.
형식:
{{
  "E": {{
    "ghg_scope1": {{"value": 숫자, "unit": "tCO2eq", "yoy_change": 숫자or null}},
    "ghg_scope2": {{"value": 숫자, "unit": "tCO2eq", "yoy_change": 숫자or null}},
    "energy_total": {{"value": 숫자, "unit": "TJ", "yoy_change": 숫자or null}},
    "renewable_ratio": {{"value": 숫자, "unit": "%", "yoy_change": 숫자or null}},
    "water_usage": {{"value": 숫자, "unit": "m3", "yoy_change": 숫자or null}},
    "waste_recycling_ratio": {{"value": 숫자, "unit": "%", "yoy_change": 숫자or null}},
    "eco_packaging_ratio": {{"value": 숫자, "unit": "%", "yoy_change": 숫자or null}}
  }},
  "S": {{
    "employee_count": {{"value": 숫자, "unit": "명", "yoy_change": 숫자or null}},
    "female_ratio": {{"value": 숫자, "unit": "%", "yoy_change": 숫자or null}},
    "injury_rate": {{"value": 숫자, "unit": "‰", "yoy_change": 숫자or null}},
    "food_safety_cert": {{"value": "인증 목록", "unit": null}},
    "social_contribution": {{"value": 숫자, "unit": "억원", "yoy_change": 숫자or null}}
  }},
  "G": {{
    "outside_director_ratio": {{"value": 숫자, "unit": "%"}},
    "female_director_ratio": {{"value": 숫자, "unit": "%"}},
    "esg_committee": {{"value": true or false}},
    "reporting_standards": {{"value": ["GRI", "TCFD", ...]}}
  }},
  "summary": "주요 ESG 성과 3줄 요약"
}}"""


COMPARISON_PROMPT = """당신은 식품기업 ESG 전문 리서치 애널리스트입니다.
아래 자사와 동종사들의 ESG 지표를 비교 분석하여 종합 보고서를 작성해주세요.

분석 데이터:
{data}

업계 ESG 정책 동향:
{policies}

최근 미디어 리서치:
{media}

다음 항목을 포함한 상세 분석을 한국어로 작성하세요:

1. 종합 요약 (Executive Summary)
   - 자사 ESG 수준 평가 (업계 대비 위치)
   - 핵심 강점 3가지
   - 개선 필요 영역 3가지

2. 환경(E) 부문 비교분석
   - 온실가스 배출 비교 (표 포함)
   - 에너지/재생에너지 전환 현황
   - 물·폐기물 관리
   - 식품 특화: 포장재, 식품손실

3. 사회(S) 부문 비교분석
   - 임직원 현황 및 안전
   - 식품안전 인증 비교
   - 공급망 ESG 관리

4. 지배구조(G) 부문 비교분석
   - 이사회 다양성
   - ESG 거버넌스 체계

5. 업계 ESG 정책/규제 동향 및 영향 분석

6. 미디어 평판 분석
   - 동종사 대비 ESG 미디어 노출 현황

7. 전략적 제언
   - 단기 (1년): 즉시 개선 가능한 항목
   - 중기 (3년): 업계 평균 도달 목표
   - 장기 (5년+): 업계 선도를 위한 전략

각 섹션은 구체적인 수치를 인용하고, 동종사 평균과의 차이를 명시하세요."""


async def extract_esg_metrics(text: str, company_name: str) -> dict:
    """보고서 텍스트에서 ESG 지표 추출"""
    chunks = chunk_text(text, chunk_size=10000)
    all_metrics = []

    for i, chunk in enumerate(chunks[:5]):  # 최대 5개 청크 처리
        prompt = FOOD_ESG_EXTRACTION_PROMPT.format(text=chunk)
        message = client.messages.create(
            model=settings.claude_model,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        # JSON 블록 추출
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0]
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0]
        try:
            metrics = json.loads(raw)
            all_metrics.append(metrics)
        except json.JSONDecodeError:
            continue

    if not all_metrics:
        return {}

    # 여러 청크에서 추출한 지표 병합 (첫 번째 우선, null 값은 이후 청크로 보완)
    merged = all_metrics[0]
    for m in all_metrics[1:]:
        merged = _merge_metrics(merged, m)

    return merged


def _merge_metrics(base: dict, update: dict) -> dict:
    """두 지표 딕셔너리 병합 (null인 값만 업데이트)"""
    for key, val in update.items():
        if key not in base:
            base[key] = val
        elif isinstance(val, dict) and isinstance(base[key], dict):
            base[key] = _merge_metrics(base[key], val)
        elif base[key] is None and val is not None:
            base[key] = val
    return base


async def generate_comparison_report(
    my_company: dict,
    competitors: list[dict],
    policies: list[dict],
    media: list[dict],
) -> dict:
    """자사 vs 동종사 ESG 비교분석 보고서 생성"""
    data_str = f"## 자사: {my_company['name']}\n"
    data_str += json.dumps(my_company.get("metrics", {}), ensure_ascii=False, indent=2)
    data_str += "\n\n## 동종사\n"
    for comp in competitors:
        data_str += f"\n### {comp['name']}\n"
        data_str += json.dumps(comp.get("metrics", {}), ensure_ascii=False, indent=2)

    policies_str = "\n".join([
        f"- [{p.get('authority', '')}] {p.get('title', '')}: {p.get('summary', '')}"
        for p in policies[:10]
    ])

    media_str = "\n".join([
        f"- [{m.get('source', '')}][{m.get('sentiment', '')}] {m.get('title', '')}: {m.get('summary', '')}"
        for m in media[:15]
    ])

    prompt = COMPARISON_PROMPT.format(
        data=data_str,
        policies=policies_str or "현재 등록된 정책 데이터 없음",
        media=media_str or "현재 등록된 미디어 데이터 없음",
    )

    message = client.messages.create(
        model=settings.claude_model,
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    )

    report_text = message.content[0].text
    return {
        "text": report_text,
        "companies": [my_company["name"]] + [c["name"] for c in competitors],
        "sections": _parse_sections(report_text),
    }


def _parse_sections(text: str) -> dict:
    """보고서 텍스트를 섹션별로 파싱"""
    sections = {}
    current_section = "intro"
    current_lines = []

    for line in text.split("\n"):
        if line.startswith("## ") or line.startswith("# "):
            if current_lines:
                sections[current_section] = "\n".join(current_lines).strip()
            current_section = line.lstrip("#").strip()
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines:
        sections[current_section] = "\n".join(current_lines).strip()

    return sections
