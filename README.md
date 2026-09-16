# 설계관리 PMS

OP-702 설계관리절차서 기반의 설계관리 웹 시스템. 상세 설계는 [docs/DESIGN.md](docs/DESIGN.md) 참고.

## 스택

- Next.js (App Router) + TypeScript + Tailwind — Vercel 배포
- Firebase (Auth / Firestore / Storage)
- GitHub 저장소 + Vercel 자동배포

## 로컬 실행

```
npm run dev   # http://localhost:8001
```

(1단계 스캐폴딩 이전이므로 아직 실행 불가 — Phase 1에서 추가 예정)

## 진행 단계

Phase 0 설계 완료 → Phase 1(스캐폴딩) 진행 예정. 로드맵은 [docs/DESIGN.md](docs/DESIGN.md#5-단계적-개발-로드맵) 참고.
