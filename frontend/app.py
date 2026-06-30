"""ESG 비교분석 시스템 - Streamlit 프론트엔드"""
import streamlit as st
import httpx
import time
from datetime import datetime

API_BASE = "http://localhost:8000"

st.set_page_config(
    page_title="ESG 비교분석 시스템",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded",
)

# 사이드바 네비게이션
st.sidebar.title("🌿 ESG 분석 시스템")
st.sidebar.markdown("**식품업계 지속가능경영보고서 비교분석**")
st.sidebar.divider()

page = st.sidebar.radio(
    "메뉴",
    ["대시보드", "보고서 업로드", "동종사 크롤링", "ESG 정책/미디어", "비교분석 실행", "보고서 다운로드"],
    index=0,
)


def api_get(path: str) -> dict | list | None:
    try:
        r = httpx.get(f"{API_BASE}{path}", timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        st.error(f"API 오류: {e}")
        return None


def api_post(path: str, **kwargs) -> dict | None:
    try:
        r = httpx.post(f"{API_BASE}{path}", timeout=60, **kwargs)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        st.error(f"API 오류: {e}")
        return None


# ─── 대시보드 ───────────────────────────────────────────────────
if page == "대시보드":
    st.title("📊 ESG 비교분석 시스템 대시보드")

    col1, col2, col3, col4 = st.columns(4)
    companies = api_get("/upload/companies") or []
    reports = api_get("/upload/reports") or []
    policies = api_get("/crawl/policies") or []
    media = api_get("/crawl/media") or []
    analysis_list = api_get("/report/list") or []

    col1.metric("등록 기업", len(companies))
    col2.metric("업로드 보고서", len(reports))
    col3.metric("ESG 정책/규제", len(policies))
    col4.metric("미디어 리서치", len(media))

    st.divider()
    col_a, col_b = st.columns(2)

    with col_a:
        st.subheader("등록된 기업")
        if companies:
            for c in companies:
                badge = "🏠 자사" if c["is_mine"] else "🏢 동종사"
                st.write(f"{badge} **{c['name']}**")
        else:
            st.info("등록된 기업이 없습니다. 보고서를 업로드하세요.")

    with col_b:
        st.subheader("최근 분석 보고서")
        if analysis_list:
            for r in analysis_list[-5:]:
                status_icon = "✅" if r["status"] == "done" else "⏳" if r["status"] == "processing" else "📋"
                st.write(f"{status_icon} **{r['title']}** ({r['year']}년)")
        else:
            st.info("생성된 보고서가 없습니다.")

    st.divider()
    st.subheader("📋 사용 흐름")
    st.markdown("""
    1. **보고서 업로드** → 자사 및 동종사 지속가능경영보고서 PDF 업로드
    2. **동종사 크롤링** (선택) → CJ제일제당, 오리온 등 자동 수집
    3. **ESG 정책/미디어** → 업계 규제 동향 및 뉴스 등록
    4. **비교분석 실행** → AI가 ESG 지표를 추출하고 비교분석
    5. **보고서 다운로드** → Word/PDF 보고서 다운로드
    """)


# ─── 보고서 업로드 ───────────────────────────────────────────────
elif page == "보고서 업로드":
    st.title("📤 ESG 보고서 PDF 업로드")
    st.info("자사 및 동종 식품기업의 지속가능경영보고서 PDF를 업로드합니다.")

    with st.form("upload_form"):
        company_name = st.text_input("기업명", placeholder="예: CJ제일제당")
        col1, col2 = st.columns(2)
        year = col1.number_input("보고서 연도", min_value=2018, max_value=2025, value=2023)
        is_mine = col2.checkbox("자사 보고서")
        uploaded_file = st.file_uploader("PDF 파일 선택", type=["pdf"])
        submitted = st.form_submit_button("업로드", type="primary")

    if submitted:
        if not company_name:
            st.error("기업명을 입력하세요.")
        elif not uploaded_file:
            st.error("PDF 파일을 선택하세요.")
        else:
            with st.spinner(f"{company_name} 보고서 업로드 중..."):
                result = api_post(
                    "/upload/report",
                    files={"file": (uploaded_file.name, uploaded_file.getvalue(), "application/pdf")},
                    data={"company_name": company_name, "year": str(year), "is_mine": str(is_mine).lower()},
                )
            if result:
                st.success(result.get("message", "업로드 완료"))
                if result.get("esg_scan"):
                    st.subheader("📊 ESG 키워드 빠른 스캔 결과")
                    scan = result["esg_scan"]
                    for cat, items in scan.items():
                        with st.expander(f"{cat} 부문"):
                            for item, count in items.items():
                                st.write(f"- {item}: **{count}회** 언급")

    st.divider()
    st.subheader("📋 업로드된 보고서")
    reports = api_get("/upload/reports") or []
    companies = {c["id"]: c["name"] for c in (api_get("/upload/companies") or [])}
    if reports:
        import pandas as pd
        df = pd.DataFrame([
            {
                "기업": companies.get(r["company_id"], f"ID:{r['company_id']}"),
                "연도": r["year"],
                "상태": r["status"],
                "업로드일": r["created_at"][:10] if r["created_at"] else "-",
            }
            for r in reports
        ])
        st.dataframe(df, use_container_width=True)
    else:
        st.info("업로드된 보고서가 없습니다.")


# ─── 동종사 크롤링 ──────────────────────────────────────────────
elif page == "동종사 크롤링":
    st.title("🔍 동종사 ESG 보고서 자동 수집")
    st.info("주요 식품기업 IR 사이트에서 지속가능경영보고서를 자동으로 찾아 다운로드합니다.")

    crawlable = api_get("/crawl/companies") or []
    company_names = [c["name"] for c in crawlable]

    selected = st.multiselect(
        "수집할 기업 선택 (미선택 시 전체)",
        options=company_names,
        help="선택하지 않으면 등록된 모든 식품기업을 대상으로 수집합니다.",
    )

    col1, col2 = st.columns(2)
    if col1.button("🚀 크롤링 시작", type="primary"):
        result = api_post(
            "/crawl/start",
            json=selected if selected else None,
        )
        if result:
            st.success(result.get("message", "크롤링 시작됨"))
            st.write("대상 기업:", result.get("target_companies", []))

    if col2.button("📰 ESG 뉴스 수집"):
        result = api_post("/crawl/news", json=None)
        if result:
            st.success(result.get("message", "뉴스 수집 시작됨"))

    st.divider()
    st.subheader("🏢 수집 대상 기업 목록")
    if crawlable:
        import pandas as pd
        df = pd.DataFrame(crawlable)
        df.columns = ["기업명", "IR URL"]
        st.dataframe(df, use_container_width=True)


# ─── ESG 정책/미디어 ────────────────────────────────────────────
elif page == "ESG 정책/미디어":
    st.title("📜 ESG 정책 & 미디어 리서치")

    tab1, tab2 = st.tabs(["정책/규제", "미디어 리서치"])

    with tab1:
        st.subheader("ESG 정책/규제 등록")
        with st.form("policy_form"):
            title = st.text_input("정책명", placeholder="예: 탄소중립기본법 시행령")
            authority = st.text_input("발행기관", placeholder="예: 환경부")
            col1, col2 = st.columns(2)
            category = col1.selectbox("분류", ["환경(E)", "사회(S)", "지배구조(G)", "종합"])
            impact = col2.selectbox("영향도", ["high", "medium", "low"])
            effective_date = st.date_input("시행일")
            summary = st.text_area("내용 요약", height=100)
            submitted = st.form_submit_button("등록", type="primary")

        if submitted and title and summary:
            result = api_post("/crawl/policy", json={
                "title": title, "authority": authority,
                "category": category, "impact_level": impact,
                "effective_date": str(effective_date),
                "summary": summary,
            })
            if result:
                st.success("정책이 등록되었습니다.")

        st.divider()
        policies = api_get("/crawl/policies") or []
        if policies:
            import pandas as pd
            df = pd.DataFrame([
                {"정책명": p["title"], "기관": p["authority"],
                 "분류": p["category"], "영향도": p["impact_level"],
                 "요약": p["summary"][:80] + "..."}
                for p in policies
            ])
            st.dataframe(df, use_container_width=True)
        else:
            st.info("등록된 정책이 없습니다.")

    with tab2:
        st.subheader("미디어 리서치 등록")
        with st.form("media_form"):
            title = st.text_input("기사 제목")
            col1, col2 = st.columns(2)
            source = col1.text_input("출처", placeholder="예: 한국경제")
            url = col2.text_input("URL")
            col3, col4 = st.columns(2)
            esg_cat = col3.selectbox("ESG 분류", ["E", "S", "G", "종합"])
            sentiment = col4.selectbox("논조", ["positive", "neutral", "negative"])
            summary = st.text_area("기사 요약", height=80)
            keywords = st.text_input("키워드 (쉼표 구분)", placeholder="예: 탄소중립, 포장재")
            submitted = st.form_submit_button("등록", type="primary")

        if submitted and title and summary:
            result = api_post("/crawl/media", json={
                "title": title, "source": source, "url": url,
                "summary": summary, "esg_category": esg_cat,
                "sentiment": sentiment,
                "keywords": [k.strip() for k in keywords.split(",") if k.strip()],
            })
            if result:
                st.success("미디어 리서치가 등록되었습니다.")

        st.divider()
        media = api_get("/crawl/media") or []
        if media:
            import pandas as pd
            sentiment_icon = {"positive": "🟢", "neutral": "🟡", "negative": "🔴"}
            df = pd.DataFrame([
                {
                    "논조": sentiment_icon.get(m["sentiment"], "⚪"),
                    "제목": m["title"],
                    "출처": m["source"],
                    "분류": m["esg_category"],
                    "요약": m["summary"][:60] + "...",
                }
                for m in media
            ])
            st.dataframe(df, use_container_width=True)
        else:
            st.info("등록된 미디어 리서치가 없습니다.")


# ─── 비교분석 실행 ──────────────────────────────────────────────
elif page == "비교분석 실행":
    st.title("🤖 AI ESG 비교분석 실행")

    companies = api_get("/upload/companies") or []
    if not companies:
        st.warning("먼저 '보고서 업로드' 또는 '동종사 크롤링'에서 데이터를 수집하세요.")
        st.stop()

    my_companies = [c for c in companies if c["is_mine"]]
    other_companies = [c for c in companies if not c["is_mine"]]

    if not my_companies:
        st.warning("자사 보고서가 없습니다. 업로드 시 '자사 보고서' 체크박스를 선택하세요.")
        st.stop()

    with st.form("analyze_form"):
        my_company = st.selectbox(
            "자사 선택",
            options=my_companies,
            format_func=lambda c: c["name"],
        )

        competitors = st.multiselect(
            "비교 동종사 선택 (최대 5개 권장)",
            options=other_companies,
            format_func=lambda c: c["name"],
        )

        col1, col2 = st.columns(2)
        year = col1.number_input("분석 연도", min_value=2018, max_value=2025, value=2023)
        output_format = col2.selectbox("출력 형식", ["both", "docx", "pdf"],
                                        format_func=lambda x: {"both": "Word + PDF", "docx": "Word만", "pdf": "PDF만"}[x])

        report_title = st.text_input("보고서 제목 (선택)", placeholder="자동 생성됩니다")
        submitted = st.form_submit_button("🚀 분석 시작", type="primary")

    if submitted:
        if not competitors:
            st.error("비교할 동종사를 최소 1개 선택하세요.")
        else:
            with st.spinner("분석을 시작합니다..."):
                result = api_post("/analyze/run", json={
                    "my_company_id": my_company["id"],
                    "competitor_ids": [c["id"] for c in competitors],
                    "year": year,
                    "output_format": output_format,
                    "report_title": report_title or None,
                })

            if result:
                analysis_id = result["analysis_id"]
                st.success(f"분석 시작! (ID: {analysis_id})")
                st.info(result.get("message", ""))

                # 폴링으로 진행 상황 표시
                progress_bar = st.progress(0, text="분석 중...")
                for i in range(60):
                    time.sleep(5)
                    status = api_get(f"/analyze/status/{analysis_id}")
                    if status:
                        if status["status"] == "done":
                            progress_bar.progress(100, text="분석 완료!")
                            st.success("✅ 분석이 완료되었습니다! '보고서 다운로드' 메뉴에서 받으세요.")
                            break
                        elif status["status"] == "error":
                            progress_bar.empty()
                            st.error(f"오류 발생: {status.get('error', '알 수 없는 오류')}")
                            break
                        else:
                            progress_bar.progress(min(10 + i * 1.5, 90), text=f"분석 중... ({i*5}초 경과)")


# ─── 보고서 다운로드 ─────────────────────────────────────────────
elif page == "보고서 다운로드":
    st.title("📥 분석 보고서 다운로드")

    reports = api_get("/report/list") or []
    if not reports:
        st.info("생성된 보고서가 없습니다. '비교분석 실행' 메뉴에서 분석을 시작하세요.")
    else:
        for r in sorted(reports, key=lambda x: x["id"], reverse=True):
            status_icon = "✅" if r["status"] == "done" else "⏳"
            with st.expander(f"{status_icon} {r['title']} ({r['year']}년)"):
                col1, col2, col3 = st.columns(3)
                col1.write(f"**상태**: {r['status']}")
                col2.write(f"**생성일**: {r['created_at'][:10] if r['created_at'] else '-'}")
                col3.write(f"**파일 수**: {r['file_count']}")

                if r["status"] == "done":
                    dl_col1, dl_col2 = st.columns(2)
                    with dl_col1:
                        r_bytes = httpx.get(f"{API_BASE}/report/download/{r['id']}?format=docx", timeout=30)
                        if r_bytes.status_code == 200:
                            st.download_button(
                                "📄 Word 다운로드",
                                data=r_bytes.content,
                                file_name=f"esg_report_{r['id']}_{r['year']}.docx",
                                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            )
                    with dl_col2:
                        r_bytes = httpx.get(f"{API_BASE}/report/download/{r['id']}?format=pdf", timeout=30)
                        if r_bytes.status_code == 200:
                            st.download_button(
                                "📑 PDF 다운로드",
                                data=r_bytes.content,
                                file_name=f"esg_report_{r['id']}_{r['year']}.pdf",
                                mime="application/pdf",
                            )
