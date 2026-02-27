# BankSalad-Style Gagebu — SSOT v3

이 문서는 **offline-first + local encryption** 원칙을 유지하면서, BankSalad 스타일 UX를 작은 PR 단위로 안전하게 확장하기 위한 Single Source of Truth(SSOT)다.

## Product Guardrails
- **No bank sync**: 수동/반자동 입력 중심.
- **Offline-first**: 네트워크 없이 핵심 기능 동작.
- **Local encryption**: IndexedDB + WebCrypto(AES-GCM) 레코드 단위 암호화 유지.
- **Incremental rollout**: 작은 PR, 데이터 안전 우선.

## First 4 PR Slices (2-week execution focus)
1. **PR#1 Tx schema + migration**
   - Tx v2 스키마, migration runner, 하위 호환/복구 안전성 확보.
2. **PR#2 Rules CRUD skeleton**
   - 규칙 저장소/검증 + 기본 CRUD UI.
3. **PR#3 classify-on-save + confidence/explainability UI**
   - 저장 시 자동 분류, confidence, “Why this?” 표시.
4. **PR#4 SmartFilterBar + Quick Add v1**
   - sticky 필터 바 + keypad-first 빠른 입력.

> PR#1~#4는 MVP 고도화를 위한 핵심 선행 축이며, 이후 Home/Analytics 리디자인의 기반이 된다.

## 6-Week Phase Plan
| Week | Phase | Milestone |
|---|---|---|
| 1 | Data Foundation | Tx schema contract + migration spec freeze |
| 2 | Data Foundation | PR#1 merge (migration + safety checks) |
| 3 | Rule Platform | Rule model/repository + CRUD scaffold |
| 4 | Rule Platform | PR#2 merge |
| 5 | Intelligent UX | classify-on-save + explainability rollout |
| 6 | Intelligent UX | PR#3/PR#4 merge + perf/QA gate |

## Epic Map
- **Epic 0 — Project Setup & Docs**
  - SSOT 문서화, README 링크, 백로그 가시화.
- **Epic 4 — Transactions UX Core (A)**
  - SmartFilterBar, Quick Add, Tx row explainability, Tx edit sheet.
- **Epic 5 — Analytics & InsightSnapshot (C)**
  - 월 스냅샷 캐시, MoM 카드, recurring detector.
- **Epic 6 — Home Redesign (A + C)**
  - Home summary cards, month switcher, alerts feed.
- **Epic 7 — Performance & Quality**
  - 대용량 리스트 성능, 인덱싱, migration 회귀 테스트.

## Issue Pack (copy-paste ready)
아래 이슈 본문은 `docs/backlog.md`에서 그대로 사용 가능하도록 정리했다.
- [Docs] Add SSOT v3 to repo
- [Feature] SmartFilterBar v1 (chips + search + clear all)
- [Feature] Quick Add sheet v1 (keypad-first)
- [Feature] Transaction row UI (confidence + explainability)
- [Feature] Tx edit sheet v1 (fast correction)
- [Tech] InsightSnapshot monthly cache store + update rules
- [Feature] Analytics v1: MoM delta cards + drilldown
- [Feature] Recurring candidates detector v1
- [Feature] Home summary cards v1 + month switcher
- [Feature] Alerts feed v1 (budget risk/anomaly/upcoming bills)
- [Tech] List virtualization + indexing for large datasets
- [Tech] Migration safety checklist + basic regression tests

## Quality Gates (must-pass)
- Migration path on legacy fixtures: no data loss.
- 10k+ tx dataset: filtering/scrolling responsive.
- Confidence + explainability UI: keyboard/a11y 점검 완료.
- Quick Add save latency and UI update target 충족.
