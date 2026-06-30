# ESG 지속가능경영 비교분석 시스템

식품업계 ESG 보고서를 수집·분석하고 동종사 대비 비교분석 보고서를 자동 생성합니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| PDF 업로드 | 자사/동종사 지속가능경영보고서 PDF 업로드 |
| 자동 크롤링 | CJ제일제당·오리온·농심·롯데웰푸드 등 IR 사이트 자동 수집 |
| ESG 지표 추출 | Claude AI가 E/S/G 핵심 지표(온실가스·재해율·이사회 구성 등) 자동 추출 |
| 정책 관리 | 환경부·금융위 등 ESG 규제·정책 등록 및 영향 분석 |
| 미디어 리서치 | 업계 ESG 뉴스 수집 및 AI 감성 분석 |
| 보고서 생성 | Word(.docx) + PDF 비교분석 보고서 자동 생성 |

## 빠른 시작

### 환경 설정
```bash
cp .env.example .env
# .env 파일에서 ANTHROPIC_API_KEY 입력
```

### Docker로 실행 (권장)
```bash
docker-compose up --build
```
- 백엔드 API: http://localhost:8000
- 프론트엔드: http://localhost:8501
- API 문서: http://localhost:8000/docs

### 로컬 실행
```bash
# 백엔드
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 프론트엔드 (다른 터미널)
cd frontend
pip install -r requirements.txt
streamlit run app.py

# 샘플 데이터 시딩 (선택)
python scripts/seed_sample_data.py
```

## 사용 흐름

1. **보고서 업로드**: 자사 보고서(is_mine=true) 및 동종사 보고서 PDF 업로드
2. **자동 크롤링** (선택): 주요 식품기업 IR 사이트에서 보고서 자동 수집
3. **정책/미디어 등록**: ESG 규제 동향 및 업계 뉴스 등록
4. **분석 실행**: 자사+동종사 선택 후 AI 비교분석 시작 (소요: 2~5분)
5. **보고서 다운로드**: 완성된 Word/PDF 보고서 다운로드

## 분석 보고서 구성

1. 종합 요약 (Executive Summary)
2. 환경(E) 비교분석 - 온실가스, 에너지, 물, 포장재
3. 사회(S) 비교분석 - 식품안전, 임직원, 공급망
4. 지배구조(G) 비교분석 - 이사회, ESG 위원회
5. 업계 ESG 정책·규제 영향 분석
6. 미디어 평판 분석
7. 전략적 제언 (단기/중기/장기)
8. 부록: ESG 핵심 지표 비교표

## 식품업계 분석 대상 기업

CJ제일제당, 오리온, 농심, 롯데웰푸드, 삼양식품, 풀무원, 대상, 빙그레
