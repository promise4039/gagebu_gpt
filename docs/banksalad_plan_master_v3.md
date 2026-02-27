# BankSalad-Style Gagebu — SSOT v3

이 문서는 BankSalad 스타일 가계부(은행 연동 없음)의 단일 진실원본(SSOT) v3입니다.

## Product principles
- Offline-first: 모든 핵심 동작은 네트워크 없이 수행
- Local encryption: IndexedDB + WebCrypto 기반 레코드 단위 암호화 유지
- Explainable automation: 자동 분류는 항상 근거(rule trace) 제공
- User-in-control: 자동 분류보다 수동 수정 우선, "Save as rule"로 학습

---

## Epics (v3)

### EPIC 0 — Project Setup & Docs
- SSOT 문서 저장 및 README 링크
- 백로그/PR 시퀀스 문서화

### EPIC 1 — Baseline Transaction UX Hardening
- 거래 입력/수정 UX 정합성 개선
- 수동 수정 플로우에서 필드 검증/기본값 일관화

### EPIC 2 — Tx Schema Extension + IndexedDB Migration
- Tx 확장 필드 도입: `merchant`, `memo`, `tags`, `source`, `confidence`, `ruleId`
- DB 버전 업 + 신규 store scaffold (`category_rules`, `insight_snapshots`)
- merchant normalization 유틸 도입

### EPIC 3 — Rules Engine v1
- CategoryRule 모델 및 CRUD
- 매처 우선순위/특이도/신뢰도 정책
- explainability trace 생성

### EPIC 4 — Classify-on-save + Save-as-rule
- 저장 시점 자동 분류 파이프라인
- 사용자 수정값 기반 "규칙으로 저장" UX
- 배치 재분류(dry-run + apply)

### EPIC 5 — Insights Snapshot (Monthly)
- 월별 인사이트 스냅샷 생성/보관
- 분류 정확도/신뢰도 분포 관찰 지표

### EPIC 6 — Stabilization & Release
- 마이그레이션 회귀 테스트
- 성능/용량/복구 시나리오 검증

---

## Architecture alignment
- Data model: `src/domain/models.ts`
- Storage boundary: `src/storage/db.ts`, `src/storage/secureStore.ts`
- Domain utilities: `src/domain/*`
- Docs contract: `docs/tx-rules-engine-spec.md`

---

## Milestone gates
1. **M1 (Schema-ready)**: EPIC 2 완료, 구버전 데이터 무손실 업그레이드.
2. **M2 (Rule-ready)**: EPIC 3 완료, 단일 트랜잭션 분류/근거 출력 가능.
3. **M3 (Workflow-ready)**: EPIC 4 완료, 저장 시 자동 분류 + 규칙 저장 가능.
4. **M4 (Ops-ready)**: EPIC 5~6 완료, 인사이트 스냅샷 + 안정화.

---

## Dependencies (high-level)
- EPIC 2 depends on EPIC 0
- EPIC 3 depends on EPIC 2
- EPIC 4 depends on EPIC 3
- EPIC 5 depends on EPIC 2/3
- EPIC 6 depends on all previous epics

---

## Definition of done (program-level)
- 빌드가 통과하고(`npm run build`) 타입 에러가 없음
- 기존 사용자 DB가 앱 시작 시 오류 없이 업그레이드됨
- 자동 분류 결과에 `confidence` + `ruleId` + trace 근거가 남음
- 사용자 수정→"Save as rule"→재분류 루프가 동작함
