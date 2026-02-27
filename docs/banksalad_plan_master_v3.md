# BankSalad-Style Gagebu — SSOT v3

이 문서는 **가계부 앱의 단일 진실 소스(SSOT)** 로, 제품/UX/개발의 공통 기준을 정의한다.

## 1) Product North Star
- Bank sync 없이도 빠른 입력과 자동 분류로 리뷰 부담을 줄인다.
- 핵심 루프: **Fast Input → Auto Classification → Insights-driven Review**.
- 오프라인 우선 + 로컬 암호화 보안을 기본값으로 유지한다.

## 2) IA (Final)
- Home
- Transactions
- Analytics
- Plan
- Billing
- More (Settings/Cards/Loans)

## 3) Routing Strategy (Incremental)
- Canonical:
  - `/`, `/transactions`, `/analytics`, `/plan`, `/billing`, `/more`
- Alias (backward compatibility):
  - `/budget` → Plan
  - `/reconcile` → Billing
  - `/cards`, `/loans`, `/settings` 유지
  - `/more/cards`, `/more/loans`, `/more/settings`

## 4) UX Principles
- 한 손 조작 가능한 큰 터치 영역(최소 44px).
- 자동 분류에는 항상 **confidence badge**를 표시한다.
- 추천/분류 결과에는 **rule explainability**를 제공한다.
- Insight 카드/요약은 **InsightSnapshot cache** 기반으로 빠르게 표시한다.

## 5) Incremental Delivery Rules
- 페이지 전체 리라이트 금지(점진적 교체).
- 기존 라우트와 데이터 모델 호환 유지.
- MVP 수준에서도 “입력 속도”와 “분류 수정 속도”를 우선 최적화.

## 6) Epics
1. Project Setup & Docs
2. Navigation / IA Shell
3. Transactions Quick Add + List UX
4. Home Summary + Alerts
5. Analytics/Plan/Billing drilldown alignment
6. Rule learning + explainability polish

## 7) Definition of Done (global)
- 오프라인 동작/로컬 암호화 회귀 없음.
- 핵심 탭 라우팅 직접 접근 가능(hash 라우팅 포함).
- 저신뢰 분류는 명확히 리뷰 큐로 노출.
- 주요 KPI/인사이트는 캐시 timestamp와 함께 표시.
