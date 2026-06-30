"""샘플 데이터 시딩 스크립트 - 초기 테스트용"""
import httpx

API = "http://localhost:8000"


def seed():
    # 샘플 ESG 정책 등록
    policies = [
        {
            "title": "탄소중립기본법 시행령 개정 (식품·유통 부문 포함)",
            "authority": "환경부",
            "category": "환경(E)",
            "effective_date": "2024-01-01",
            "summary": "식품제조업체의 Scope 3 배출량 공시 의무화 및 2030년까지 30% 감축 목표 설정",
            "impact_level": "high",
        },
        {
            "title": "식품 포장재 재활용 의무화 강화",
            "authority": "환경부/식약처",
            "category": "환경(E)",
            "effective_date": "2024-06-01",
            "summary": "2025년까지 식품 포장재 재활용 가능 소재 80% 이상 전환 의무화",
            "impact_level": "high",
        },
        {
            "title": "ESG 공시 의무화 로드맵 (금융위)",
            "authority": "금융위원회",
            "category": "지배구조(G)",
            "effective_date": "2026-01-01",
            "summary": "코스피 상장사 ESG 공시 단계적 의무화 - 자산 2조 이상 2026년, 전체 2030년",
            "impact_level": "high",
        },
        {
            "title": "공급망 실사 가이드라인 (산업부)",
            "authority": "산업통상자원부",
            "category": "사회(S)",
            "effective_date": "2024-09-01",
            "summary": "EU 공급망 실사 지침 대응 한국 기업 가이드라인 - 식품원료 협력사 인권·환경 실사 포함",
            "impact_level": "medium",
        },
        {
            "title": "동물복지 인증제도 확대 적용",
            "authority": "농림축산식품부",
            "category": "사회(S)",
            "effective_date": "2025-01-01",
            "summary": "축산물 원재료 사용 식품기업의 동물복지 인증 원료 사용 비율 공시 권고",
            "impact_level": "medium",
        },
    ]

    for p in policies:
        r = httpx.post(f"{API}/crawl/policy", json=p)
        print(f"정책 등록: {p['title'][:30]}... → {r.status_code}")

    # 샘플 미디어 리서치 등록
    media_items = [
        {
            "title": "CJ제일제당, 2030 넷제로 선언... 식품업계 탄소중립 레이스",
            "source": "한국경제",
            "url": "https://example.com/news/1",
            "summary": "CJ제일제당이 2030년 탄소중립 달성을 선언하며 태양광 발전 확대, 바이오 연료 전환 계획 발표",
            "esg_category": "E",
            "sentiment": "positive",
            "keywords": ["탄소중립", "넷제로", "CJ제일제당", "재생에너지"],
            "published_at": "2024-03-15",
        },
        {
            "title": "식품기업 ESG 평가 줄줄이 낮아져... 포장재·물 이슈 취약",
            "source": "ESG경제",
            "url": "https://example.com/news/2",
            "summary": "국내 주요 식품기업 ESG 등급 평가에서 플라스틱 포장재 사용과 용수 관리 취약점 지적",
            "esg_category": "E",
            "sentiment": "negative",
            "keywords": ["ESG평가", "포장재", "플라스틱", "식품기업"],
            "published_at": "2024-04-20",
        },
        {
            "title": "풀무원, 동물복지 인증 확대로 글로벌 ESG 기준 선도",
            "source": "조선비즈",
            "url": "https://example.com/news/3",
            "summary": "풀무원이 동물복지 인증 원료 사용 비율 80% 달성, 글로벌 식품 ESG 벤치마크로 주목",
            "esg_category": "S",
            "sentiment": "positive",
            "keywords": ["풀무원", "동물복지", "ESG", "인증"],
            "published_at": "2024-05-10",
        },
        {
            "title": "식품업계 온실가스 배출, 제조보다 물류·원료 단계가 더 크다",
            "source": "매일경제",
            "url": "https://example.com/news/4",
            "summary": "식품기업 Scope 3 분석 결과 원료 조달과 물류에서 전체 배출의 70%를 차지, Scope 3 관리 중요성 부각",
            "esg_category": "E",
            "sentiment": "neutral",
            "keywords": ["Scope3", "온실가스", "공급망", "물류"],
            "published_at": "2024-06-01",
        },
        {
            "title": "농심·삼양, 식품안전 ESG 평가서 상위권 유지",
            "source": "식품음료신문",
            "url": "https://example.com/news/5",
            "summary": "농심과 삼양식품이 HACCP 확대 및 품질관리 시스템 강화로 식품 안전 부문 ESG 평가 호조",
            "esg_category": "S",
            "sentiment": "positive",
            "keywords": ["농심", "삼양", "식품안전", "HACCP", "ESG"],
            "published_at": "2024-06-15",
        },
    ]

    for m in media_items:
        r = httpx.post(f"{API}/crawl/media", json=m)
        print(f"미디어 등록: {m['title'][:30]}... → {r.status_code}")

    print("\n✅ 샘플 데이터 시딩 완료!")
    print("이제 '보고서 업로드' 메뉴에서 자사 및 동종사 PDF를 업로드하고 분석을 시작하세요.")


if __name__ == "__main__":
    seed()
