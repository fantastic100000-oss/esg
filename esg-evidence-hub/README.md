# ESG Evidence Hub (MVP)

ESG 공시 데이터, Raw Data, 증빙데이터, 검증보고서, 지속가능경영보고서, ESG위원회 자료,
GRI 기준을 하나의 플랫폼에서 연결 관리하는 프로토타입입니다. 백엔드/외부 API 없이 브라우저
`localStorage`에 모든 데이터를 저장하며, 파일은 실제로 업로드하지 않고 메타데이터만 기록합니다.

## 실행

```bash
npm install
npm run dev
```

## 기술 스택

React + TypeScript + Vite + Tailwind CSS v4, react-router-dom(해시 라우팅), Recharts.
엑셀 업로드/다운로드는 취약점이 보고된 xlsx 계열 라이브러리 대신 자체 CSV 파서로 구현했습니다
(엑셀에서 그대로 열리는 CSV 포맷).

## 데이터 모델 및 관계

```
지속가능경영보고서 ─┐
ESG위원회(안건) ────┼─(파일 메타데이터로 연결)──> 공시데이터 ──> Raw Data
                    │                              │
                    │                              ├──> 증빙데이터 (Raw Data 근거자료)
                    │                              ├──> 검증보고서 (증빙데이터와 별도 보관)
                    │                              └──> GRI Standards (N:M)
```

핵심 객체: `SustainabilityReport`, `ESGCommittee`(+`CommitteeAgendaItem`), `DisclosureData`,
`RawDataRow`, `EvidenceDocument`, `AssuranceReport`, `GRIStandard`, `Folder`, `FileMetadata`,
`DashboardConfig` — 전체 정의는 `src/types/index.ts` 참고.

## 아키텍처

- `src/repositories` — `localStorage` 기반 제네릭 Repository. `Repository<T>` 인터페이스만
  구현하면 되므로, 추후 실제 API/DB로 교체할 때 이 레이어만 바꾸면 됩니다.
- `src/services` — Raw Data 자동 재계산(`disclosureService`), GRI 매핑(`griMappingService`),
  Data Lineage 조립(`lineageService`), 전역 검색(`searchService`), 대시보드 지표 계산(`dashboardService`).
- `src/lib/AppDataContext.tsx` — 모든 엔티티를 React 상태로 로드/새로고침하는 컨텍스트.
  화면은 Repository/Service로 직접 쓰기 작업을 수행한 뒤 `refresh()`를 호출합니다.
- `src/data/sampleData.ts` — 2024~2026년, 4개 사업장 샘플 데이터 생성기.

## 주요 화면

- **Dashboard**: 연도 선택, 카드 추가/삭제/순서 변경/차트 유형 선택 (localStorage에 저장)
- **지속가능경영보고서 / ESG위원회**: 폴더-파일 트리 공용 컴포넌트, 위원회 안건-ESG데이터 연결
- **ESG 데이터**: 공시데이터 목록 → 상세(공시정보 / Raw Data 그리드 / 증빙데이터 / 검증보고서 /
  GRI 매핑 / Data Lineage)
- **GRI Standards**: 카드/테이블 뷰, 상세 모달(관련 공시항목·Raw Data·증빙·보고서 반영 여부)
- **Settings**: 대시보드 카드, ESG 카테고리·담당부서·사업장·문서유형·검증상태값·공시항목 관리,
  GRI/전체 데이터 초기화

## 참고

- Raw Data 그리드에서 행 추가/삭제/직접 수정이 가능하며, 환산값 합계가 공시값에 자동 반영됩니다.
- "복사/붙여넣기"는 탭 구분 텍스트(엑셀 셀 범위 복사와 호환)로 동작합니다.
- "사업장별 엑셀"이라는 표현은 사용하지 않았으며, Raw Data의 근거는 "증빙데이터"로,
  검증보고서는 증빙데이터와 별도 객체로 구분해 관리합니다.
