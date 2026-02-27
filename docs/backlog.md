# Backlog — Epics, PR Sequence, and Issue Bodies

## PR Sequence (discoverable)
1. PR#1 Tx schema + migration
2. PR#2 Rules CRUD skeleton
3. PR#3 classify-on-save + confidence/rule explainability UI
4. PR#4 SmartFilterBar + Quick Add v1

## Epics
- Epic 0 — Project Setup & Docs
- Epic 4 — Transactions UX Core (A)
- Epic 5 — Analytics & InsightSnapshot (C)
- Epic 6 — Home Redesign (A + C)
- Epic 7 — Performance & Quality

---

## EPIC 0 — Project Setup & Docs

### Issue: [Docs] Add SSOT v3 to repo
**Labels:** docs, epic

**Goal:** Add the SSOT master plan to `docs/` and link it from README.

**Scope (In):**
- Add `docs/banksalad_plan_master_v3.md`
- Add a short section in README: “Roadmap / SSOT” with link
- Add `docs/backlog.md` listing epics + PR sequence

**Scope (Out):** No code changes.

**Acceptance Criteria (DoD):**
- [ ] SSOT v3 exists in repo under `docs/`
- [ ] README links to SSOT
- [ ] Epics + first 4 PRs are listed somewhere discoverable

---

## EPIC 4 — Transactions UX Core (A)

### Issue: [Feature] SmartFilterBar v1 (chips + search + clear all)
**Labels:** feature, ux, epic

**Goal:** Implement the Transactions sticky filter bar.

**Scope (In):**
- Search input (merchant/memo/category text)
- Chips: Date range, Payment method/account, Category, Amount range, Confidence, Has rule/Needs review
- Clear-all + active filter count

**Scope (Out):** Saved filters can be stubbed in v1.

**Acceptance Criteria (DoD):**
- [ ] Filter updates feel instant (<150ms target on typical datasets)
- [ ] URL state or local state persists while navigating back/forward
- [ ] Filtered view drives batch actions later

### Issue: [Feature] Quick Add sheet v1 (keypad-first)
**Labels:** feature, ux

**Goal:** Implement Quick Add bottom sheet per UX spec.

**Scope (In):**
- FAB entry on Home + Transactions
- Numeric keypad first-focus, expense/income toggle
- Merchant autocomplete (recent + fuzzy match)
- Category suggestions (from rules; show confidence badge)
- Save + Save&AddNext + undo toast

**Acceptance Criteria (DoD):**
- [ ] Sheet opens <=200ms
- [ ] Save commits locally <=300ms and updates list
- [ ] Confidence + “Why this?” visible for suggested category

### Issue: [Feature] Transaction row UI (confidence + explainability)
**Labels:** feature, ux

**Goal:** Display confidence badge + rule explainability entry point in list rows.

**Scope (In):**
- Date grouping + sticky headers
- Row shows merchant, category chip, memo preview, amount, confidence badge
- “Why this?” popover reads ruleTrace

**Acceptance Criteria (DoD):**
- [ ] Rows update in place after edit/classification
- [ ] “Needs review” visually distinct and filterable

### Issue: [Feature] Tx edit sheet v1 (fast correction)
**Labels:** feature, ux

**Goal:** Bottom-sheet edit for amount/category/memo/tags with minimal friction.

**Scope (In):**
- Edit sheet on row tap or swipe action
- Quick category change, memo/tags
- Hook “Save as rule” CTA (if enabled)

**Acceptance Criteria (DoD):**
- [ ] Category correction possible in <=2 steps
- [ ] Saves without full page refresh

---

## EPIC 5 — Analytics & InsightSnapshot (C)

### Issue: [Tech] InsightSnapshot monthly cache store + update rules
**Labels:** tech, analytics, epic

**Goal:** Precompute monthly aggregates for fast Home/Analytics.

**Scope (In):**
- Snapshot schema per month: totals, category sums, top merchants
- Update triggers for Tx add/edit/delete; optional manual rebuild

**Acceptance Criteria (DoD):**
- [ ] Home/Analytics can load above-the-fold from snapshot
- [ ] Snapshot updates correctly after Tx changes

### Issue: [Feature] Analytics v1: MoM delta cards + drilldown
**Labels:** feature, analytics

**Goal:** Show month-over-month changes with drilldown to filtered Transactions.

**Scope (In):**
- 3–5 cards: overall spend delta, top category delta, top merchant delta(optional)
- Drilldown opens Transactions with SmartFilterBar prefilled

**Acceptance Criteria (DoD):**
- [ ] Cards match snapshot sums
- [ ] Drilldown applies correct filters

### Issue: [Feature] Recurring candidates detector v1
**Labels:** feature, analytics

**Goal:** Detect subscription-like patterns.

**Scope (In):**
- Heuristic detection: interval tolerance + amount tolerance + confidence
- Output list with CTA to tag fixed/subscription

**Acceptance Criteria (DoD):**
- [ ] Candidates list stable across reloads
- [ ] Users can confirm candidate and create tag/rule

---

## EPIC 6 — Home Redesign (A + C)

### Issue: [Feature] Home summary cards v1 + month switcher
**Labels:** feature, ux

**Goal:** Home above-the-fold should explain monthly status quickly.

**Scope (In):**
- Month switcher
- Summary cards: spend/income/budget remaining
- Quick actions row

**Acceptance Criteria (DoD):**
- [ ] Home cards render from cache within 1.5s target
- [ ] Tapping cards navigates with correct filters

### Issue: [Feature] Alerts feed v1 (budget risk/anomaly/upcoming bills)
**Labels:** feature, analytics, ux

**Goal:** Implement alerts feed with explainability + CTA.

**Scope (In):**
- Budget risk, anomaly, upcoming bills alerts
- Human explanation + optional confidence + CTA chips

**Acceptance Criteria (DoD):**
- [ ] At least 3 alert types show
- [ ] Each alert has explanation + optional confidence
- [ ] CTA deep-links to Transactions/Billing with filters

---

## EPIC 7 — Performance & Quality

### Issue: [Tech] List virtualization + indexing for large datasets
**Labels:** tech, performance

**Goal:** Keep scrolling/filtering responsive for 10k+ tx.

**Scope (In):**
- Virtualized TransactionList
- Indexes for common queries (date/category/merchant)

**Acceptance Criteria (DoD):**
- [ ] Scroll remains smooth on large dataset
- [ ] Filtering remains within target range

### Issue: [Tech] Migration safety checklist + basic regression tests
**Labels:** tech, test

**Goal:** Prevent data-loss regressions during DB migrations.

**Scope (In):**
- Backup/export reminder before migration (or automatic encrypted backup)
- Automated tests for DB upgrade, Tx read/write, Rule store CRUD
- Manual QA checklist in `docs/qa_checklist.md`

**Acceptance Criteria (DoD):**
- [ ] At least one automated test covers DB upgrade
- [ ] Manual QA checklist exists in `docs/qa_checklist.md`
