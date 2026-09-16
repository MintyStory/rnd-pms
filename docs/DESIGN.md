# 설계관리 PMS 시스템 설계 문서

> 근거 문서: `OP-702설계관리절차서.docx` (설계 및 개발 절차서, ISO 13485 기반 의료기기 설계관리 프로세스)
> 상태: Draft v0.1 — 1단계(설계) 산출물. 구현 전 검토/확정 필요.

## 1. 목적 및 범위

OP-702 절차서에 정의된 설계관리 프로세스(개발계획 → 입력 → 출력 → 검토 → 검증 → 유효성확인 → 이관 → 변경관리 → DHF)를 웹 시스템으로 전산화한다. 기존에 Word 양식(F702-1~8)으로 작성하던 문서를 웹에서 직접 구조화된 폼으로 입력·검토·승인할 수 있게 하고, 여러 문서에서 반복되는 정보(프로젝트 기본정보, 조직/담당자, 규격, 부품/자재, 외주업체 등)는 공통 마스터 데이터로 분리하여 한 번 입력하면 관련 문서 전체에서 재사용되도록 한다.

## 2. 절차서 분석 요약

### 2.1 8개 관리 문서(양식)

| 양식번호 | 문서명 | 절차서 근거 | 주요 내용 |
|---|---|---|---|
| F702-1 | 개발 계획서 | 5.2 | 일정, 업무분장, 책임/권한, 자원, 규제요구사항, 출력물 목록 |
| F702-2 | 개발 입력서 | 6장 | 기능/성능/사용적합성/안전요구, 적용규격, 위험관리계획 연계, 고객/마케팅 요구 |
| F702-3 | 개발 출력서 | 7장 | 부품/원자재 목록, 도면, 제조공정, 제품사양, 검증계획 |
| F702-4 | 설계검토회의록 | 8장 | 검토기준, 검토문서목록, 요구사항 충족 증거, 다음단계 진행여부, 수정사항 |
| F702-5 | 검증 및 유효성확인 계획서 | 9.2.1 | 제품, 프로토콜 목적, 절차/명세, 적용규격, 모델선정근거, 시설/장비, 샘플크기 |
| F702-6 | 검증 및 유효성확인 보고서 | 9.2.3, 10장 | 검증/유효성확인 결과, 부합여부, 불일치 시 설계변경 트리거 |
| F702-7 | 설계변경요청서 | 12장 | 변경사유, 중요성 판단(품질관리팀장), 영향평가, 변경범위 |
| F702-8 | 설계 및 개발 이관보고서 | 11장 | 이관대상 문서, 이관받는 자/일자, 제품표준서·공정도·BOM 등 |

### 2.2 프로젝트(개발과제) 유형 (5.1)

신규개발 / 중대한변경 / 사소한변경 / 모델추가 / 기술적변경 — 유형에 따라 요구되는 문서 세트와 검토 깊이가 달라진다.

### 2.3 조직 및 권한 (4장)

| 역할 | 권한 |
|---|---|
| CEO(대표이사) | 개발타당성검토 승인, F702-8 승인, 부서간 이견 최종결정 |
| 개발팀장 | 문서 검토, 담당자 지정, 검토회의 운영, 이관 전 문서 승인 |
| 품질책임자 | 모든 설계이관 문서 승인 |
| 영업부 | 고객 소통, 설계검토회의 팀장(8.1) |
| 개발팀 | 문서 작성, 설계 수행 |
| 생산팀 | 샘플 제공, 이관 시 생산 업무 |
| 품질관리팀 | 밸리데이션, 검증활동, 검사기준 초안, 변경 중요성 판단(12.2) |

이 역할 체계를 그대로 사용자 role/권한 모델로 사용한다.

### 2.4 문서 공통 헤더 (표지)

모든 양식은 "개정번호 / 개정일자 / DCO No / 개정사유 / 작성 / 검토 / 승인" 개정이력 블록을 공유한다 → 공통 컴포넌트 + 공통 스키마로 처리.

## 3. 데이터 모델

### 3.1 설계 원칙

- **공통 마스터**와 **문서(양식) 인스턴스**를 분리한다. 마스터는 여러 프로젝트/문서에서 참조(ID)로 재사용하고, 문서에는 그 시점의 스냅샷이 아니라 참조를 저장하되 승인 시점 값은 `revisionHistory`에 고정한다.
- 문서 인스턴스는 모두 동일한 공통 헤더(개정이력, 작성/검토/승인, 상태)를 갖고, `formType`별 `content`만 다르다.
- 프로젝트(개발과제)가 최상위 단위이며, 8개 문서는 모두 프로젝트에 속한다.

### 3.2 공통 마스터 데이터 (여러 문서에서 재사용)

- **users** — 담당자/조직 (이름, 부서, role, 이메일)
- **products** — 제품/제품군 (모델추가·기술변경 시 기존 제품 참조)
- **standards** — 관련 규격/법규 (ISO 14155, MEDDEV 2.7.1 등) — F702-2 입력서, 관련문서(14장)에서 공용
- **vendors** — 외주/협력업체 (9.2.2 외주생산, 11장 이관 대상)
- **components** — 부품/원자재 마스터 (BOM) — F702-3 출력서, F702-8 이관보고서에서 공용
- **riskItems** (참조용) — OP-711 위험관리절차서와 연계되는 위험관리 항목 (1단계에서는 링크/파일첨부 수준으로만 처리, 상세 모델은 OP-711 별도 분석 필요)

### 3.3 Firestore 컬렉션 스키마 (초안)

```
users/{uid}
  name, email, dept, role: 'CEO'|'개발팀장'|'품질책임자'|'영업부'|'개발팀'|'생산팀'|'품질관리팀'

products/{productId}
  name, category, spec, createdAt

standards/{standardId}
  code, title, region, note

vendors/{vendorId}
  name, type('외주생산'|'외주시험'|'자문'), contact

components/{componentId}
  name, spec, unit, vendorId(ref), note

projects/{projectId}
  name, type: '신규개발'|'중대한변경'|'사소한변경'|'모델추가'|'기술적변경'
  productId(ref), teamLeadId(ref), status, startDate, targetDate
  createdAt, updatedAt

documents/{docId}
  projectId(ref), formType: 'F702-1'..'F702-8'
  version(number), status: 'draft'|'in_review'|'approved'|'obsolete'
  authorId(ref), reviewerIds[](ref), approverId(ref), approvedAt
  revisionHistory: [{ rev, date, dcoNo, reason, author, reviewer, approver }]
  content: { ...formType별 구조화 필드 }
  linkedStandardIds[], linkedComponentIds[], linkedVendorIds[]
  attachments: [{ name, storagePath, uploadedBy, uploadedAt }]
  createdAt, updatedAt

changeRequests/{crId}   (F702-7 전용 인덱스: 영향평가 추적)
  projectId(ref), sourceDocId(ref), description, importance, impactAssessment
  status: 'requested'|'assessed'|'approved'|'rejected'
```

`content` 필드는 formType별로 2.1절 표에 정리된 항목을 그대로 구조화한다 (세부 필드 정의는 4단계 상세 설계에서 폼별로 확정).

### 3.4 문서 상태 워크플로우

```
draft(초안) → in_review(검토중) → approved(승인)
                    ↓ 수정필요
              revision_requested → draft
approved → obsolete (개정으로 폐기, 새 버전 draft 생성)
F702-8(이관보고서)만: approved → transferred
```

검토/승인 주체는 2.3절 권한 매핑을 따른다 (예: F702-8은 품질책임자+CEO 승인 필요).

### 3.5 설계이력파일(DHF)

별도 데이터 모델이 아니라, 프로젝트 하나에 속한 모든 `documents` + `revisionHistory`를 시간순으로 모아 보여주는 **집계 뷰(읽기 전용 리포트 페이지)**로 구현한다 (13장 요건: "추적 가능하고 식별 가능해야 함" → 문서별 버전/승인이력이 그대로 추적 근거가 됨).

## 4. 기술 아키텍처

- **프론트엔드**: Next.js(App Router) + TypeScript + Tailwind — Vercel 배포
- **백엔드/데이터**: Firebase (Firestore: 데이터, Firebase Auth: 로그인, Firebase Storage: 도면/첨부파일)
- **저장소/배포**: GitHub 저장소 + Vercel GitHub 연동 (main 브랜치 push → production 배포, PR → preview 배포)
- **로컬 개발**: `next dev -p 8001` → `http://localhost:8001`
- **접근제어**: Firestore Security Rules에서 `users/{uid}.role`을 기준으로 컬렉션별 read/write 제한 (2.3절 권한 매핑 그대로 반영)

## 5. 단계적 개발 로드맵

- **Phase 0 (완료)** — 절차서 분석, 설계 문서 확정 (본 문서)
- **Phase 1 (완료)** — 프로젝트 스캐폴딩: Next.js+Firebase 초기화, GitHub 저장소, Vercel 연동, 로그인, 공통 마스터(users/products/standards/vendors/components) CRUD 화면
- **Phase 2 (완료)** — 프로젝트(개발과제) 생성/관리 + F702-1 개발계획서 입력
- **Phase 3 (완료)** — F702-2 입력서 / F702-3 출력서 / F702-4 검토회의록. 문서 공통 로직(개정이력 누적, 상태/검토자/승인자, 저장 UI)을 `useDocumentRecord` 훅 + 공용 컴포넌트로 추출해 4개 양식이 공유. 규격/부품/사용자/프로젝트 내 문서를 체크박스로 연결하는 `LinkedItemsSelect`로 마스터 데이터 재사용 구현. F702-3에는 Firebase Storage 기반 도면 첨부 추가
- **Phase 4 (완료)** — F702-5 검증·유효성확인 계획서, F702-6 보고서(불부합 시 F702-7 연계), F702-7 변경요청(12.5 영향평가), F702-8 이관보고서. F702-7/8은 문서에 `approvals: {role,name,date}[]`를 저장하는 역할기반 승인 게이트(`ApprovalGate`)를 적용 — F702-7은 품질관리팀, F702-8은 CEO+품질책임자 모두 승인해야 상태를 "승인"으로 바꿀 수 있음(4.1/4.3/12.2 권한 매핑). 단, 이 게이트는 클라이언트 UI 단 검증이며 Firestore 규칙은 여전히 로그인 사용자 전체 쓰기 허용이라 완전한 서버측 강제는 아님 — 실사용 전 규칙에 역할 검사 추가 필요(6절 참고)
- **Phase 5** — DHF 통합 뷰(프로젝트별 전체 이력/추적성), 문서 PDF 출력
- **Phase 6 (고도화)** — 알림, 대시보드, 변경이력 diff, 감사로그

## 6. 미확정 사항 (구현 전 확인 필요)

- F702-1~8 실제 양식(빈 서식) 원본 파일이 없어, 폼 필드는 절차서 본문 요구사항 기반으로 추정 설계함 — 실제 양식 입수 시 필드 재검증 필요
- 전자결재(서명) 방식: 로그인 계정 기반 승인 클릭으로 갈음할지, 실제 서명 이미지/2차 인증이 필요한지
- OP-711 위험관리절차서 연계 범위 (1단계는 파일첨부/링크 수준으로 최소화)
- 다국어(사용자설명서 다국어 번역본, 7.3절) 지원 필요 여부
- F702-7/8 승인 게이트의 서버측(Firestore 규칙) 강제 — 현재는 UI에서만 역할을 확인하므로, API를 직접 호출하면 우회 가능. `users/{uid}.role`을 `get()`으로 조회해 `approvals` 필드 쓰기를 역할별로 제한하는 규칙 보강 필요
