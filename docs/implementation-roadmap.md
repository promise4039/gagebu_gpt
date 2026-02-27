# BankSalad-like Household Ledger Incremental Plan

## PR Plan (ordered list)

1. **PR#1 — Transaction schema + migration foundation**
   - Define normalized `Transaction` domain model for manual entry (no bank sync).
   - Add migration runner (`schemaVersion`, idempotent migration steps, rollback-safe checkpoints).
   - Add indexes for expected access paths (date range, category, merchant text, card/account id).
   - Add encrypted persistence compatibility test fixtures for pre-migration snapshots.
   - **Exit criteria**: app opens old local DB without data loss and writes new transaction records under v2 schema.

2. **PR#2 — Rules CRUD skeleton**
   - Add rule entities (`Rule`, `RuleCondition`, `RuleAction`, `RulePriority`, `enabled`).
   - Build Rules page shell with list/create/edit/delete/toggle enabled.
   - Add repository methods and validation (duplicate/invalid conditions blocked).
   - Keep classification detached (no auto-apply yet), but persist full rule definitions.
   - **Exit criteria**: user can create/update/delete/reorder rules and data survives reload/export-import.

3. **PR#3 — classify-on-save + confidence/rule explainability UI**
   - Execute matching rules when a transaction is saved/edited.
   - Store `classificationMeta` (`source: rule|manual|fallback`, `ruleId`, `confidence`, `matchedSignals`).
   - Show explainability pill in transaction row/detail (`Applied rule: X`, confidence score).
   - Add manual override behavior that locks classification until user clears override.
   - **Exit criteria**: each saved transaction has visible classification reason and deterministic result ordering.

4. **PR#4 — SmartFilterBar + Quick Add v1**
   - SmartFilterBar: fast chips for period/category/card/amount-range + free text.
   - Quick Add modal/input: date, amount, merchant, memo, account/card with keyboard-first UX.
   - Wire quick-add save path into classify-on-save pipeline from PR#3.
   - Persist recent filter presets locally for fast revisit.
   - **Exit criteria**: user can add a transaction in <= 3 interactions and filter 10k+ records smoothly.

---

## 6-Week Phase Table (week-by-week)

| Week | Phase | Milestone | Main Deliverables |
|---|---|---|---|
| 1 | Data Foundation | Schema contract frozen | Tx v2 type definition, migration design doc, fixture snapshots |
| 2 | Data Foundation | **PR#1 merged** | Migration runner + indexes + backward compatibility checks |
| 3 | Rule Platform | Rule model/API baseline | Rules storage, validation rules, UI skeleton scaffolding |
| 4 | Rule Platform | **PR#2 merged** | Rules CRUD end-to-end with persistence and ordering |
| 5 | Intelligent UX | Classification loop online | classify-on-save pipeline + explainability metadata + UI badges |
| 6 | Intelligent UX | **PR#3 + PR#4 merged (or PR#4 behind flag)** | Confidence UI, SmartFilterBar, Quick Add v1, perf pass for large datasets |

> Stretch if capacity allows in week 6: release gate + usability polish + instrumentation for rule-hit analytics.

---

## Backlog (with DoD + suggested components/files)

- **[B1] Transaction schema v2 introduction**
  - Suggested files/components:
    - `src/domain/transactions/types.ts`
    - `src/storage/db/schema.ts`
    - `src/storage/db/migrations/v2.ts`
  - DoD:
    - New fields finalized (`merchantNormalized`, `categoryId`, `classificationMeta`, timestamps).
    - Type-safe mapper from old records -> new records.
    - Unit tests cover missing/legacy field defaults.

- **[B2] Migration engine hardening**
  - Suggested files/components:
    - `src/storage/db/migrate.ts`
    - `src/storage/db/migrations/index.ts`
    - `src/storage/db/__tests__/migrate.test.ts`
  - DoD:
    - Migrations are ordered, idempotent, and resumable.
    - Failed migration leaves previous stable version readable.
    - Snapshot tests verify encrypted payload round-trip after migration.

- **[B3] Rules domain model + repository**
  - Suggested files/components:
    - `src/domain/rules/types.ts`
    - `src/domain/rules/validate.ts`
    - `src/storage/repositories/ruleRepository.ts`
  - DoD:
    - Supports condition groups (AND baseline, OR extensibility point).
    - Priority and enabled flags persisted.
    - Validation errors surfaced with user-friendly messages.

- **[B4] Rules CRUD UI skeleton**
  - Suggested files/components:
    - `src/features/rules/RulesPage.tsx`
    - `src/features/rules/RuleForm.tsx`
    - `src/features/rules/RuleList.tsx`
  - DoD:
    - Create/edit/delete/toggle/reorder works locally.
    - Unsaved-change guard on form navigation.
    - Empty and error states defined.

- **[B5] Classification engine on save**
  - Suggested files/components:
    - `src/features/transactions/classifyOnSave.ts`
    - `src/domain/rules/evaluateRule.ts`
    - `src/domain/rules/scoreConfidence.ts`
  - DoD:
    - Deterministic winner rule (priority > specificity > createdAt).
    - Confidence score produced for every auto classification.
    - Manual override suppresses reclassification unless explicitly reset.

- **[B6] Explainability UI**
  - Suggested files/components:
    - `src/features/transactions/TransactionListItem.tsx`
    - `src/features/transactions/TransactionDetailPanel.tsx`
    - `src/features/transactions/ClassificationBadge.tsx`
  - DoD:
    - Displays rule name/id + matched signals + confidence.
    - Tooltip/help text explains score semantics.
    - Accessibility labels and keyboard focus states validated.

- **[B7] SmartFilterBar**
  - Suggested files/components:
    - `src/features/transactions/SmartFilterBar.tsx`
    - `src/features/transactions/filterState.ts`
    - `src/features/transactions/useFilteredTransactions.ts`
  - DoD:
    - Supports date, category, method/card, amount, text search chips.
    - Filter state URL/hash or local state persistence defined.
    - 10k transaction filter interaction under target latency budget.

- **[B8] Quick Add v1**
  - Suggested files/components:
    - `src/features/transactions/QuickAdd.tsx`
    - `src/features/transactions/quickAddSchema.ts`
    - `src/features/transactions/useQuickAdd.ts`
  - DoD:
    - Keyboard-first flow (open, submit, repeat) works reliably.
    - Validation and inline error hints complete.
    - Save path reuses same domain command as full form.

- **[B9] Performance and indexing pass**
  - Suggested files/components:
    - `src/storage/db/indexes.ts`
    - `src/features/transactions/useVirtualizedList.ts`
    - `src/perf/bench/txFilter.bench.ts`
  - DoD:
    - Query plans measured for common filter combinations.
    - Virtualized rendering enabled for long lists.
    - Benchmarks documented and checked into repo.

- **[B10] QA + regression harness**
  - Suggested files/components:
    - `src/storage/db/__tests__/migration-regression.test.ts`
    - `src/features/transactions/__tests__/classify-flow.test.tsx`
    - `e2e/quick-add-filter.spec.ts`
  - DoD:
    - Golden fixtures for migration and classification outputs.
    - Smoke e2e for Quick Add -> classify -> filter loop.
    - CI test matrix includes Chromium UI smoke + unit suite.

---

## Risk / Test Checklist

### 1) Migration safety
- Risks:
  - Corrupting local encrypted records during schema upgrade.
  - Partial migration due to tab close/power loss.
  - Legacy records missing required fields.
- Test strategy:
  - Pre/post migration fixture comparisons for multiple legacy versions.
  - Fault-injection test (throw mid-migration, rerun to verify resume/idempotency).
  - Backup/restore rehearsal before migration path in QA script.

### 2) Performance with large transaction dataset
- Risks:
  - Slow filter recomputation at 10k/50k rows.
  - Reclassification overhead on save/edit bursts.
  - IndexedDB query inefficiency due to missing compound indexes.
- Test strategy:
  - Synthetic dataset benchmarks (1k/10k/50k) with timing thresholds.
  - React render profiling for filter chip toggles and list scroll.
  - Track p95 latency for quick add save and filtered list update.

### 3) UI regressions
- Risks:
  - Rule explainability cluttering list layout.
  - SmartFilterBar interactions breaking keyboard navigation.
  - Quick Add introducing inconsistent validation messages.
- Test strategy:
  - Visual regression snapshots on transaction list/detail and rules pages.
  - Accessibility checks (tab order, aria labels, focus trap in modal).
  - End-to-end smoke: add tx -> classified badge -> apply filters -> edit -> persist after reload.
