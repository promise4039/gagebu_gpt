# QA Checklist — Migration & Transactions Core

## Pre-migration
- [ ] Export encrypted backup from current app build.
- [ ] Verify backup file opens with same password.
- [ ] Record current tx count and one sample per category.

## Migration validation
- [ ] Launch new build against legacy DB and confirm migration completes.
- [ ] Verify tx count unchanged post-migration.
- [ ] Verify add/edit/delete transaction works after migration.
- [ ] Verify rules CRUD still works after migration.

## Classification + explainability
- [ ] New tx save shows confidence + “Why this?”.
- [ ] Manual override persists after reload.
- [ ] Needs review badge is filterable.

## Performance smoke (large dataset)
- [ ] 10k dataset scroll remains smooth.
- [ ] Common SmartFilterBar interactions feel instant.
- [ ] Quick Add save updates list without full refresh.
