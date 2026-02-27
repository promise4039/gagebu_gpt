# UX/IA Spec (BankSalad-like Household Ledger, No Bank Sync)

## IA map (final tabs + route mapping)

### Top-level tabs (mobile bottom navigation, max 5 fixed + 1 overflow)
1. **Home** (`/`)  
   - Existing page mapping: `DashboardPage` (keep route, evolve layout incrementally).
2. **Transactions** (`/transactions`)  
   - Existing page mapping: `TransactionsPage` (currently exists, not wired in `AppShell` routes).
3. **Analytics** (`/analytics`)  
   - Existing page mapping: `AnalyticsPage` (currently exists, not wired in `AppShell` routes).
4. **Plan** (`/plan`)  
   - Existing page mapping: `BudgetPage` (rename tab label only; keep component/page file).
5. **Billing** (`/billing`)  
   - Existing page mapping: `ReconcilePage` for statement/reconcile; optionally cross-link to `LoansPage` detail from this tab.
6. **More** (`/more`) *(overflow entry, not bottom-fixed on small width)*  
   - Existing page mapping: `SettingsPage`, `CardsPage`, `LoansPage` deep links.

### Incremental route mapping proposal (no big refactor)
- Keep current routes working for backward compatibility:
  - `/cards` → `CardsPage`
  - `/loans` → `LoansPage`
  - `/settings` → `SettingsPage`
- Add aliases and progressively migrate nav:
  - `/` → Home (`DashboardPage`)
  - `/transactions` → `TransactionsPage`
  - `/analytics` → `AnalyticsPage`
  - `/plan` and `/budget` → `BudgetPage` (parallel support during transition)
  - `/billing` and `/reconcile` → `ReconcilePage` (parallel support)
  - `/more/settings` → `SettingsPage`
  - `/more/cards` → `CardsPage`
  - `/more/loans` → `LoansPage`

### Information hierarchy principles
- **Core loop priority:** Fast Input → Auto Classification → Insights review.
- `Home` surfaces actionable summaries + alerts, not raw management tables.
- `Transactions` is the primary input and correction workspace.
- `Analytics/Plan/Billing` are secondary decision tabs.
- `Settings` is intentionally de-emphasized (in More).

---

## Screen-by-screen bullets

## 1) Home UX spec

### Primary jobs
- Understand “this month status” in 3 seconds.
- See what needs attention today (risk, anomalies, bills).
- Jump directly into corrective actions.

### Layout (mobile-first)
1. **Header row**
   - Left: month switcher (`2026.02` with prev/next chevron).
   - Right: lock button + optional quick search icon.
2. **Summary cards row** (horizontal snap carousel on <390px)
   - Card A: **Monthly Spend** (actual vs last month % delta).
   - Card B: **Monthly Income** (actual vs expected).
   - Card C: **Budget Remaining** (absolute + %).
3. **InsightSnapshot panel**
   - Cached snapshot timestamp (e.g., “updated 2m ago”).
   - 2–4 key bullets generated from local model/rules.
4. **Alerts feed** (priority sorted)
   - Budget risk, anomalies, upcoming bills.
   - Each alert has CTA chip (e.g., “Open filter”, “Reclassify”, “Mark paid”).
5. **Quick actions row**
   - `+ Add transaction`, `Review uncategorized`, `Reconcile bills`.

### Summary cards behavior
- KPI values are computed from local encrypted data only.
- Budget card color thresholds:
  - Green: remaining ≥ 30%
  - Amber: 10–29%
  - Red: <10%
- Tap actions:
  - Spend → open Transactions filtered to current month expenses.
  - Income → open Transactions filtered to income category.
  - Budget Remaining → open Plan tab for bucket drilldown.

### Alerts feed behavior
- Alert types:
  1) **Budget risk**: projected overspend based on run-rate.
  2) **Anomaly**: unusual merchant/amount relative to user history.
  3) **Upcoming bills**: expected payments in next 7/14 days.
- Each alert shows:
  - Severity icon + short reason.
  - **Rule explainability** snippet (“triggered because average 32k → current 112k”).
  - Confidence badge (`High/Med/Low`) for machine-learned alerts.

---

## 2) Transactions UX spec

### A. Quick Add flow

#### Entry points
- Global FAB `+` on Transactions and Home.
- Keyboard shortcut (desktop): `N`.

#### Flow steps
1. **FAB tap → Quick Add bottom sheet (70–85vh)**
2. **Amount keypad first-focus**
   - Custom numeric keypad with big keys (min 44x44dp tap area).
   - Toggle expense/income sign.
3. **Merchant autocomplete**
   - Recent merchants + fuzzy match suggestions.
4. **Category autocomplete**
   - Rule-based top suggestions first.
   - Shows confidence badge per suggestion.
   - “Why this?” reveals rule explainability (matched keyword/history).
5. **Optional fields collapsed by default**
   - Date, payment method, memo, installment.
6. **Save action**
   - Primary CTA: `Save`.
   - Secondary CTA: `Save & Add next`.
7. **Post-save toast**
   - “Saved • Category auto-classified (Medium confidence)” + undo.

#### Auto-classification behavior
- If confidence is **High**: auto-apply category, no interrupt.
- If **Medium**: apply with subtle badge + allow quick correction.
- If **Low**: leave as “Needs review” and pin to review queue/filter.

### B. Transaction list interactions

#### Default list presentation
- Group by date (Today / Yesterday / This week / older date headers).
- Sticky date headers.
- Row fields (left to right): merchant, category chip, memo preview, amount, confidence badge.

#### Swipe gestures (mobile)
- Swipe left: `Delete` (red) + `Split` (secondary).
- Swipe right: `Edit` + `Duplicate`.
- Haptic feedback at action threshold.

#### Multi-select mode
- Long press enters selection mode.
- Bulk actions: recategorize, delete, mark reviewed.

#### Edit interaction
- **Bottom sheet** for quick edit (category, amount, memo, tags).
- Escalate to full-screen modal only for advanced fields (installment plan, reconcile link).

### C. SmartFilterBar

#### Placement
- Sticky under page header.

#### Elements
1. Search input (merchant/memo/category).
2. Horizontal chips:
   - Date range, Account/Card, Category, Amount range, Confidence level, Has rule, Needs review.
3. Saved filters dropdown:
   - e.g., “Uncategorized”, “Large expenses > 100k”, “This month subscriptions”.
4. Active-filter count + clear all.

#### Behavior rules
- Any filter update in <150ms local response target.
- Saved filter can be pinned as “Quick chip” on Home alerts CTA.
- Confidence filter options: `High only`, `Med/Low`, `Needs manual review`.

---

## 3) Analytics / Plan / Billing / Settings UX specs

## Analytics (`/analytics`)
- Keep current chart-heavy structure, but add top switch:
  - `Spending`, `Cashflow`, `Category mix`, `Trends`.
- InsightSnapshot snippet fixed near top with link “View all assumptions”.
- Every chart drilldown CTA opens Transactions with prefilled SmartFilterBar.

## Plan (`/plan`)
- Keep Budget page mechanics.
- Rename to “Plan” in nav, but preserve budget terminology in content.
- Add per-bucket health indicators and monthly forecast risk labels.

## Billing (`/billing`)
- Keep existing Reconcile panel as core.
- Add top segment:
  - `Upcoming`, `Needs reconcile`, `Resolved`.
- Each statement discrepancy row includes explainability (“missing tx, amount mismatch, date shift”).

## Settings (`/more/settings`)
- Keep existing controls.
- Add explicit toggles for:
  - Local learning on/off.
  - Rule priority (manual rules over learned suggestions).
  - InsightSnapshot cache refresh policy (manual/periodic).

---

## 4) Component list + proposed layout (mobile-first)

## Navigation/Layout shell
- `BottomTabBar` (5 fixed tabs max, with More overflow).
- `TopAppBar` (screen title + contextual actions).
- `FABQuickAdd` (global add).
- `SafeAreaContainer` and `SheetScaffold` for bottom sheets.

## Home components
- `MonthSwitcher`
- `SummaryCard` x3
- `InsightSnapshotCard`
- `AlertsFeed`
- `AlertItem` (severity + explainability + CTA)
- `QuickActionRow`

## Transactions components
- `SmartFilterBar`
- `FilterChip`
- `SavedFilterMenu`
- `TransactionGroupHeader`
- `TransactionRow`
- `ConfidenceBadge`
- `QuickAddSheet`
- `NumericKeypad`
- `MerchantAutocomplete`
- `CategoryAutocomplete`
- `RuleExplainabilityPopover`
- `TransactionEditSheet`

## Shared interaction components
- `InlineUndoToast`
- `EmptyStateBlock`
- `SkeletonLoader`
- `LargeTapButton` (>=44dp height, preferred 48dp)

## Mobile layout/touch standards
- Minimum tap target: 44x44dp (preferred 48x48dp).
- Horizontal padding: 16dp baseline.
- Primary actions pinned within thumb zone (lower 40% viewport).
- Destructive actions require second-step confirmation or undo path.

---

## 5) UX acceptance criteria (DoD checklist, measurable)

## Home screen DoD
- [ ] Summary cards render within 1.5s from local cache on mid-tier mobile.
- [ ] At least 3 alert types supported (budget risk, anomaly, upcoming bills).
- [ ] Each alert shows reason text + CTA; anomaly alerts include confidence badge.
- [ ] Tapping card/alert navigates with pre-applied filters in Transactions or Billing.
- [ ] InsightSnapshot displays cache timestamp and can refresh without full app reload.

## Transactions screen DoD
- [ ] FAB opens Quick Add sheet in <=200ms.
- [ ] Amount entry can be completed with one hand (numeric keypad, no keyboard required).
- [ ] Merchant/category autocomplete returns suggestions in <=150ms after input.
- [ ] Auto-classification always exposes confidence badge and “Why this?” explainability.
- [ ] List supports date grouping + sticky headers + swipe actions on mobile.
- [ ] Edit sheet saves within <=300ms local commit and updates row in place.
- [ ] SmartFilterBar supports multi-chip filtering + saved filters + clear all.
- [ ] “Needs review” filter isolates low-confidence or uncategorized items.

## Analytics screen DoD
- [ ] Every major chart has at least one drilldown CTA to Transactions.
- [ ] InsightSnapshot appears above the fold on first load.
- [ ] Switching analytics mode does not reset selected month/date range.

## Plan screen DoD
- [ ] Bucket list shows budget, actual, remaining, and risk label.
- [ ] Over-budget buckets are visually distinct and sorted to top by default.
- [ ] Tapping bucket opens Transactions filtered to that bucket mapping.

## Billing/Reconcile screen DoD
- [ ] Users can view upcoming vs reconcile-needed statements via segmented control.
- [ ] Discrepancy rows provide machine-readable reason type + human explanation.
- [ ] “Mark resolved” action updates status without full page refresh.

## Settings screen DoD
- [ ] Local learning toggle updates behavior of new auto-classification suggestions.
- [ ] Rule priority settings apply immediately to next classification event.
- [ ] InsightSnapshot cache policy changes are persisted locally and survive app restart.

## Cross-screen quality gates
- [ ] No network dependency introduced; all flows work offline.
- [ ] No unencrypted sensitive payload stored outside existing encrypted storage path.
- [ ] Accessibility: interactive controls reachable with screen reader labels and 44dp targets.
- [ ] Incremental rollout possible with route aliases and feature flags, no hard page rewrite required.
