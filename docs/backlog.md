# Backlog (SSOT v3)

## Epics
- EPIC 0 — Project Setup & Docs
- EPIC 1 — Baseline Transaction UX Hardening
- EPIC 2 — Tx Schema Extension + IndexedDB Migration
- EPIC 3 — Rules Engine v1
- EPIC 4 — Classify-on-save + Save-as-rule
- EPIC 5 — Insights Snapshot (Monthly)
- EPIC 6 — Stabilization & Release

## First 4 PR sequence (recommended)
1. **PR #1: Docs + SSOT wiring**
   - add `docs/banksalad_plan_master_v3.md`
   - add this backlog doc
   - link SSOT from README
2. **PR #2: Tx schema + DB v3 scaffold**
   - extend `Tx` fields (merchant/memo/tags/source/confidence/ruleId)
   - bump IndexedDB version and add stores:
     - `category_rules`
     - `insight_snapshots`
   - read-path defaults for backward compatibility
3. **PR #3: Merchant normalization utility**
   - add normalization utility and apply before tx save
   - preserve raw text in original input field(s)
4. **PR #4: CategoryRule model + matcher core v1**
   - define rule condition/action types
   - add matcher with priority/specificity/confidence
   - expose rule trace for explainability

## Notes
- Detailed specs for PR #2~#4 are in `docs/tx-rules-engine-spec.md`.
