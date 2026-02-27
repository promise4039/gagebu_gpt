# BankSalad-Style Gagebu — SSOT v3

본 문서는 **가계부 앱의 단일 진실 원천(SSOT)** 입니다.

## Product North Star
- 은행 연동 없이도 빠르고 신뢰 가능한 가계부 기록/분석 경험 제공
- 모바일 우선 UX
- 로컬 저장 + 암호화 기본

## EPIC 0 — Project Setup & Docs
### 목표
- 계획 문서를 저장소에서 바로 탐색 가능하게 만들고, 실행 순서를 명확히 한다.

### 핵심 산출물
- `docs/banksalad_plan_master_v3.md` (본 문서)
- `docs/backlog.md` (에픽/PR 순서)
- README 내 Roadmap/SSOT 링크

### 완료 조건 (DoD)
- [ ] SSOT 문서가 `docs/`에 존재
- [ ] README에서 SSOT 링크 가능
- [ ] Epics + 첫 4개 PR 순서가 문서화

---

## EPIC 3 — Rules CRUD (B)

### 3.1 Rules Manager UI (CRUD skeleton)
**Goal:** Settings에서 규칙 생성/수정/삭제/활성화/우선순위 제어

**In Scope**
- 규칙 목록(우선순위 정렬)
- Create/Edit/Delete
- Enabled 토글
- 우선순위 제어(Up/Down 또는 DnD)
- (선택) Test Rule 샌드박스

**Out of Scope**
- 정교한 매칭엔진 완성은 후속 이슈

**DoD**
- [ ] DB 저장/새로고침 유지
- [ ] 우선순위 저장/표시 일치
- [ ] 규칙 0건에서도 안정 동작

### 3.2 Rule model + matcher v1 (contains/regex + confidence + trace)
**Goal:** 규칙 매칭 결과에 explainability(trace) 포함

**In Scope**
- 조건: contains keyword, regex (옵션: 금액 범위/결제수단)
- 결과: `ruleId`, `confidence(0..1)`, `ruleTrace`

**DoD**
- [ ] 동일 입력 => 동일 결과
- [ ] 우선순위 준수
- [ ] UI 노출 가능한 trace 품질

### 3.3 classify-on-save pipeline
**Goal:** 거래 저장 시 자동 분류

**In Scope**
- Tx create/update 시 matcher 실행
- confidence high/medium 자동 제안 적용
- low confidence는 검토 필요 상태로 표시

**DoD**
- [ ] 저장 시 분류 파이프라인 실행
- [ ] confidence badge + Why this? 제공
- [ ] 수동 수정과 파이프라인 공존

### 3.4 Save as rule from Tx edit
**Goal:** 사용자 수정 결과를 1~2탭으로 규칙화

**In Scope**
- Tx 편집 시 `Save as rule` CTA
- merchant 중심 prefill (+ 선택 조건)

**DoD**
- [ ] 수정 후 2탭 이내 규칙 생성
- [ ] 유사 거래 자동 분류 확인

### 3.5 Re-run classification (batch)
**Goal:** 필터/월 단위 재분류

**In Scope**
- Transactions 화면에 `Re-run classification`
- 진행 상태 표시 (UI freeze 방지)

**DoD**
- [ ] batch 재분류 일관 반영
- [ ] chunk 처리로 반응성 유지

---

## Dependency Notes
- Rules UI는 `category_rules` 저장소 스키마가 선행되어야 함.
- classify-on-save는 matcher v1 이후 연결.
- batch 재분류는 classify-on-save 파이프라인 공통 로직 재사용.

## Delivery Principles
- 모바일 우선: 한 화면에서 핵심 판단 가능
- Explainable AI-lite: 자동 분류는 항상 근거 제시
- 안전성: 수동 편집 우선, 자동화는 보조
