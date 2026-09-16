# 설계관리 PMS

OP-702 설계관리절차서 기반의 설계관리 웹 시스템. 상세 설계는 [docs/DESIGN.md](docs/DESIGN.md) 참고.

## 스택

- Next.js (App Router) + TypeScript + Tailwind — Vercel 배포
- Firebase (Auth / Firestore / Storage)
- GitHub 저장소 + Vercel 자동배포

## 최초 설정

1. `npm install`
2. Firebase 콘솔에서 프로젝트 생성 → Authentication(이메일/비밀번호 로그인 방식 활성화), Firestore, Storage 활성화
3. `.env.local.example`을 `.env.local`로 복사하고 Firebase 웹앱 설정값 채우기
4. (선택) Firebase CLI로 보안 규칙 배포: `firebase deploy --only firestore:rules,storage`
5. 초기 관리자 계정은 Firebase 콘솔 Authentication에서 직접 생성 후, 앱에 로그인하면 `users` 컬렉션에 문서가 자동 생성됨 → `/masters/users`에서 역할을 `CEO`로 지정
6. (선택) 대시보드 날씨 위젯: [공공데이터포털](https://www.data.go.kr)에서 "기상청_단기예보 ((구)_동네예보) 조회서비스" API 신청 → 발급받은 서비스키(디코딩된 값)를 `.env.local`의 `WEATHER_SERVICE_KEY`에 입력 (Vercel 배포 시 Environment Variables에도 동일하게 등록)

## 로컬 실행

```
npm run dev   # http://localhost:8001
```

## 진행 단계

- Phase 0 — 설계 완료
- Phase 1 (현재) — Next.js+Firebase 스캐폴딩, 로그인, 공통 마스터(제품/규격/외주업체/부품/사용자) CRUD
- Phase 2 이후 로드맵은 [docs/DESIGN.md](docs/DESIGN.md#5-단계적-개발-로드맵) 참고
