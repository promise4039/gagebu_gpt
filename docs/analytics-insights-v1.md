# Analytics & Insights v1 Spec (No Bank Sync)

## 1) Metric Definitions (v1)

### Common transaction filters (applied to all v1 metrics)
- Include transaction if all are true:
  - Transaction date is within target period (month/week).
  - Transaction is not logically deleted.
  - Transaction category nature is **not** `transfer`.
  - Transaction/card flags do **not** indicate non-spend transfer/card-bill settlement (e.g., `transfer_nonspend`, card-bill payment option).
- Amount sign convention:
  - `amount > 0`: expense.
  - `amount < 0`: income (absolute value used in aggregates).

---

### M1. Monthly spend / income / net
- **Monthly Spend(y,m)** = `Σ amount` for filtered transactions where `amount > 0`.
- **Monthly Income(y,m)** = `Σ abs(amount)` for filtered transactions where `amount < 0`.
- **Monthly Net(y,m)** = `Monthly Income(y,m) - Monthly Spend(y,m)`.

Notes:
- Monthly net is household cashflow proxy, not balance-sheet net worth.

---

### M2. Category share + Top N
- Expense category amount:
  - **CatSpend(y,m,c)** = `Σ amount` for filtered transactions where `amount > 0 AND category = c`.
- **CategoryShare(y,m,c)** = `CatSpend(y,m,c) / Monthly Spend(y,m)` (if denominator > 0).
- **TopNCategories(y,m,N)** = categories sorted by `CatSpend` desc, first N.

Recommended default:
- N = 3 for small cards (mobile).
- Group tail categories into “기타(Other)” when rendering pie/stack.

---

### M3. MoM delta (overall + by category)
- Define prior month `prev(y,m)`.
- Overall spend MoM:
  - **MoMΔSpendAbs(y,m)** = `Monthly Spend(y,m) - Monthly Spend(prev)`.
  - **MoMΔSpendPct(y,m)** = `MoMΔSpendAbs(y,m) / Monthly Spend(prev)` if prev > 0 else `null`.
- Overall income MoM (same formula family).
- Category spend MoM:
  - **MoMΔCatAbs(y,m,c)** = `CatSpend(y,m,c) - CatSpend(prev,c)`.
  - **MoMΔCatPct(y,m,c)** = `MoMΔCatAbs / CatSpend(prev,c)` if prev > 0 else `null`.

Policy:
- If previous value is 0 and current > 0, classify as `NEW_SPEND` instead of infinite %.

---

### M4. Fixed vs variable spend
Classify expense transaction into fixed/variable via precedence:
1. Explicit tag (`fixed`, `variable`) on transaction.
2. Matched user rule (merchant/category/tag regex).
3. Recurrence-driven fallback (if recognized recurring candidate and variance small => fixed-like).
4. Default by category heuristic (rent/utilities/insurance/tuition/telecom => fixed-like; food/leisure/shopping => variable).

Metrics:
- **FixedSpend(y,m)** = `Σ expense amount where class=fixed`.
- **VariableSpend(y,m)** = `Σ expense amount where class=variable`.
- **FixedRatio(y,m)** = `FixedSpend / Monthly Spend` (if spend > 0).

---

### M5. Recurring candidates (subscription-like)
Detect merchant-level recurring candidates using trailing 90 days (or 6 months if available):
- Group by normalized merchant key.
- Candidate if all true:
  - At least 3 occurrences.
  - Inter-arrival periodicity near 7/14/30/31 days (`|actual - period| <= tolerance`, e.g., 3 days for monthly).
  - Amount consistency: coefficient of variation <= 0.2, or median absolute deviation under threshold.

Recurring score (0~1, weighted):
- Periodicity score 50%
- Amount consistency 30%
- Recentness score 20%

Output fields:
- expected next date, expected amount range, confidence score, first seen date.

---

## 2) Insight Cards (v1)

Each card includes: **title / trigger / required fields / CTA**.

1. **이번 달 지출 급증**
   - Trigger: `MoMΔSpendPct >= +0.20` and current month spend >= minimum floor.
   - Fields: current spend, prev spend, delta %, delta amount.
   - CTA: `지출 상위 카테고리 보기`.

2. **이번 달 지출 감소**
   - Trigger: `MoMΔSpendPct <= -0.15`.
   - Fields: current spend, prev spend, saved amount.
   - CTA: `절감 원인 확인`.

3. **식비가 크게 늘었어요**
   - Trigger: category-specific `MoMΔCatPct >= +0.25` and category in TopN.
   - Fields: category name, delta %, delta amount.
   - CTA: `해당 카테고리 내역 보기`.

4. **새로운 대형 지출 카테고리 등장**
   - Trigger: previous month category spend = 0 and current >= threshold.
   - Fields: category, current amount.
   - CTA: `예산 설정하기`.

5. **상위 3개 카테고리가 지출의 대부분**
   - Trigger: `Top3Share >= 0.65`.
   - Fields: top3 categories and share.
   - CTA: `카테고리별 절감 팁 보기`.

6. **고정비 비중이 높아요**
   - Trigger: `FixedRatio >= 0.60`.
   - Fields: fixed spend, fixed ratio.
   - CTA: `고정비 점검 체크리스트`.

7. **변동비가 빠르게 증가 중**
   - Trigger: variable spend MoM >= +20%.
   - Fields: variable current/prev, delta.
   - CTA: `변동비 내역 정렬 보기`.

8. **이번 달 흑자/적자 알림**
   - Trigger: `Monthly Net < 0` (적자) or `>= 0` with meaningful surplus.
   - Fields: income, spend, net.
   - CTA: `다음 달 목표 설정`.

9. **신규 정기결제 후보 감지**
   - Trigger: recurring score >= 0.75 and first detected this month.
   - Fields: merchant, estimated cycle, expected amount.
   - CTA: `정기결제로 확정/태그`.

10. **정기결제 결제일 임박**
    - Trigger: expected next date within 3 days.
    - Fields: merchant, expected date, amount range.
    - CTA: `캘린더/알림 켜기`.

11. **정기결제 금액 인상 의심**
    - Trigger: recurring merchant latest amount > historical median by >15%.
    - Fields: last amount, median, increase %.
    - CTA: `내역 확인`.

12. **잠재 중복 결제 감지**
    - Trigger: same merchant + similar amount within 1~3 days (excluding split tags).
    - Fields: two transactions (date/amount).
    - CTA: `중복 여부 체크`.

13. **주말 소비 편중**
    - Trigger: weekend spend share >= 45% and > baseline.
    - Fields: weekend share, weekday share.
    - CTA: `요일별 분석 보기`.

14. **소액 빈번 결제 많음**
    - Trigger: count of expenses below small threshold exceeds percentile baseline.
    - Fields: count, total amount, avg amount.
    - CTA: `소액 지출 묶어 보기`.

15. **예산 초과 위험 카테고리**
    - Trigger: month progress vs spend pace projects over budget by >10%.
    - Fields: budget, spent so far, projected month-end.
    - CTA: `예산 조정`.

16. **수입 변동성 경고**
    - Trigger: last 3 months income CV above threshold.
    - Fields: monthly income series, CV.
    - CTA: `안전마진 목표 설정`.

17. **무지출(또는 저지출) 연속일**
    - Trigger: streak >= 3 days with no expense transactions.
    - Fields: streak length, estimated saved amount.
    - CTA: `챌린지 유지`.

18. **환불/역거래 반영 안내**
    - Trigger: refund-like negative expense in current month.
    - Fields: refund amount, affected category.
    - CTA: `순지출 다시 보기`.

Mobile prioritization:
- Display max 3 cards in primary rail + “더보기” list.
- Ranking score = impact (amount) × urgency (time) × confidence (detection quality).

---

## 3) InsightSnapshot Cache Design

### Precompute units
Per **month (required)** and **week (lightweight optional)**:

- Monthly core aggregates:
  - spend, income, net
  - tx counts (expense/income)
  - fixed/variable spend + ratios
- Monthly category aggregates:
  - amount, share, rank, MoM delta
- Merchant recurring aggregates:
  - occurrence count, interval stats, amount stats, recurring score, expected next date
- Data quality counters:
  - uncategorized count, unclassified fixed/variable count

Weekly (optional for cards like weekend bias, streak trends):
- week spend/income/net
- weekday/weekend splits

### Update rules
1. **On transaction add/edit/delete** (near-real-time):
   - Recompute impacted month snapshot(s): tx month and previous month (for MoM).
   - If merchant or amount/date changed, recompute recurring summary for that merchant over trailing window.
   - Mark affected insight cards dirty.
2. **On rule/tag/category mapping change**:
   - Recompute fixed/variable + category-related snapshot for affected months (at least current + previous 2 months).
3. **Nightly recompute (optional but recommended)**:
   - Rebuild last 6 months snapshots to heal drift and catch late edits.

### Minimal storage schema

`insight_snapshot_month`
- `month_key` (PK, `YYYY-MM`)
- `spend`, `income`, `net`
- `expense_tx_count`, `income_tx_count`
- `fixed_spend`, `variable_spend`, `fixed_ratio`
- `top_categories_json` (name, amount, share, rank; top N + other)
- `mom_json` (overall deltas)
- `updated_at`

`insight_snapshot_category_month`
- `month_key`
- `category_id`
- `spend`
- `share`
- `rank`
- `mom_abs`, `mom_pct`
- PK: (`month_key`, `category_id`)

`insight_recurring_merchant`
- `merchant_key` (PK)
- `window_start`, `window_end`
- `occurrence_count`
- `period_days_estimate`
- `amount_median`, `amount_cv`
- `recurring_score`
- `expected_next_date`
- `last_seen_at`

`insight_card_state` (optional presentation cache)
- `card_type`
- `scope_key` (e.g., `2026-02`, `merchant:netflix`)
- `score`
- `payload_json`
- `status` (`new`, `seen`, `dismissed`)
- `generated_at`
- PK: (`card_type`, `scope_key`)

---

## 4) Performance Constraints & Indexing

### Complexity targets
- Per-month aggregate recompute: **O(k)** where `k = tx in that month`.
- Category/MoM derivation from snapshot: **O(C)** where C = category count.
- Merchant recurring recompute (single merchant): **O(r log r)** for sorting by date, where r = merchant tx in trailing window.
- Initial backfill (last 12 months): **O(N)** over selected transactions + grouping cost.

Target response times (mobile-friendly):
- Load dashboard insights from cache: p95 < 120ms local DB read.
- Incremental update after tx write: p95 < 200ms for single-month recompute (excluding UI render).

### Indexing suggestions
For `transactions` table:
- Composite: `(date, category)`
- Composite: `(date, amount)`
- Composite: `(merchant_normalized, date)`
- Optional partial index for expenses: `(date)` where `amount > 0`
- Optional partial index for income: `(date)` where `amount < 0`

For snapshots:
- `insight_snapshot_month(month_key PK)`
- `insight_snapshot_category_month(month_key, rank)` for top-N fetch
- `insight_recurring_merchant(recurring_score DESC)` for candidate cards

---

## 5) Definition of Done (Analytics v1)
- [ ] Metric formulas are implemented with transfer/card-bill exclusion and validated against sample fixtures.
- [ ] Monthly summary card shows spend/income/net and matches aggregate query.
- [ ] Category share + Top N exposed in API/state and rendered in mobile card/list.
- [ ] MoM overall + category deltas available for current month and previous month.
- [ ] Fixed vs variable classification pipeline works with tag > rule > recurrence > heuristic precedence.
- [ ] Recurring candidate detection emits score + next expected date.
- [ ] At least 10 insight card types implemented with trigger + payload + CTA.
- [ ] Snapshot tables populated incrementally on tx CRUD; nightly recompute job (or command) available.
- [ ] Dashboard reads from snapshot cache (not raw full-scan) for default period.
- [ ] p95 latency targets met on representative dataset (e.g., 50k tx local).
