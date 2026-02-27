# Tx Schema Extension + Rules Engine Spec (v1)

## 1) Tx schema extension spec

```ts
export type TxSource = 'manual' | 'csv_import';

export type TxConfidence = number; // 0.0 ~ 1.0

export type TxRuleTrace = {
  ruleId: string;
  ruleName?: string;
  priority: number;
  matchedConditions: Array<{
    type:
      | 'contains'
      | 'regex'
      | 'amount_range'
      | 'payment_method'
      | 'time_window';
    field: 'merchant' | 'memo' | 'amount' | 'cardId' | 'date';
    input: string | number;
    expected: string | { min?: number; max?: number };
    passed: boolean;
    weight: number;
    note?: string;
  }>;
  rawScore: number; // pre-normalized
  confidence: TxConfidence; // normalized 0~1
  appliedActions: Array<'set_category' | 'set_tags' | 'autofill_memo'>;
};

export type Tx = {
  id: string;
  date: string; // YYYY-MM-DD
  cardId: string;
  category: string; // legacy display fallback
  categoryId?: string; // normalized category id
  amount: number;
  installments: number;
  feeMode: 'free' | 'manual';
  feeRate: number;

  // extended fields
  merchant: string; // normalized merchant/payee text
  memo: string;
  tags: string[];
  source: TxSource;
  confidence: TxConfidence; // last classification confidence
  ruleId?: string; // last applied winning rule

  // optional-later fields (reserved for future transfer/split workflows)
  isTransfer?: boolean;
  status?: 'confirmed' | 'pending' | 'reconciled';
  linkedTxId?: string;
  split?: Array<{
    id: string;
    amount: number;
    categoryId: string;
    memo?: string;
    tags?: string[];
  }>;

  // optional runtime/debug metadata
  ruleTrace?: TxRuleTrace[];
};
```

### Field semantics
- `merchant`: classification의 1차 기준. CSV import 시 원문을 보존하고, normalize된 비교용 값은 matcher 내부에서 생성.
- `memo`: 사용자 입력/수정 가능한 설명. rule action으로 자동 채움 가능.
- `tags[]`: deduped lowercase 저장(표시 시 원본 포맷은 UI에서 보정 가능).
- `source`: 수동 입력과 CSV 유입을 분리해 규칙 회귀 검증 시 세그먼트 분석 가능.
- `confidence`: 최종 적용 규칙의 신뢰도. 0이면 rule miss(기본 카테고리 fallback).
- `ruleId`: 최종 적용된 규칙 ID. 추후 "왜 이렇게 분류됐는지" 추적 시작점.

---

## 2) IndexedDB migration plan

### Versioning strategy
- DB `version`을 `2 -> 3`으로 상향.
- 신규 object store: `category_rules`.
- 기존 `tx` store는 keyPath(`id`) 유지, 레코드 payload만 확장(암호화 blob 구조는 동일).

### Backward compatibility
1. **읽기 시 기본값 보강**
   - old tx 레코드 decrypt 후 아래 default 주입:
   - `merchant=''`, `source='manual'`, `confidence=0`, `ruleId=undefined`, `tags=[]`(없을 경우).
2. **쓰기 시 신규 스키마 고정**
   - 저장은 항상 확장 필드 포함하여 re-encrypt.
3. **점진 재저장(lazy migration)**
   - tx를 열거나 수정할 때 신스키마로 write-back.
   - 대량 마이그레이션 비용을 초기에 강제하지 않음.

### Rollback / backups
1. 앱 시작 시 `meta.schemaVersion` 확인.
2. `onupgradeneeded` 진입 직전 `exportRaw()` 기반 자동 백업 스냅샷 생성(메모리/다운로드 옵션).
3. 마이그레이션 실패 시:
   - 생성 중인 신규 store cleanup,
   - 마지막 성공 백업으로 `importRaw()` 복원,
   - `schemaVersion` 유지(다운그레이드 시도 없음).
4. 사용자 수동 복구를 위해 migration 이전/이후 백업 파일명을 구분:
   - `backup_pre_v3_<timestamp>.json`
   - `backup_post_v3_<timestamp>.json`

### Migration steps (numbered)
1. `DB_VERSION=3`으로 증가.
2. `onupgradeneeded`에서 `category_rules` store 생성 (`keyPath: 'id'`).
3. `meta`에 `schemaVersion: 3`, `migratedAt` 기록.
4. 앱 런타임 decode 계층에서 tx default 보강 로직 적용.
5. 첫 classify-on-save 시 tx를 신스키마로 재암호화 저장.
6. 배치 재분류 실행 시 legacy tx 전량 신스키마 정규화.

---

## 3) Rule model (CategoryRule) spec

```ts
export type RuleCondition =
  | {
      type: 'contains';
      field: 'merchant' | 'memo';
      value: string;
      caseSensitive?: boolean;
    }
  | {
      type: 'regex';
      field: 'merchant' | 'memo';
      pattern: string;
      flags?: string; // e.g. 'i'
    }
  | {
      type: 'amount_range';
      min?: number;
      max?: number;
      currency?: 'KRW';
    }
  | {
      type: 'payment_method';
      cardIds?: string[];
      payMethodTypes?: Array<'credit' | 'debit' | 'cash' | 'account' | 'transfer_spend' | 'transfer_nonspend'>;
    }
  | {
      type: 'time_window';
      weekdays?: number[]; // 0=Sun..6=Sat
      monthDays?: number[]; // 1..31
      hours?: { start: number; end: number }; // local hour
    };

export type RuleAction =
  | { type: 'set_category'; categoryId: string }
  | { type: 'set_tags'; mode: 'append' | 'replace'; tags: string[] }
  | { type: 'autofill_memo'; template: string }; // e.g. '{{merchant}} {{amount}}원'

export type CategoryRule = {
  id: string;
  enabled: boolean;
  priority: number; // high first
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
};
```

### Rule constraints
- `conditions`는 최소 1개.
- `actions`는 최소 1개이며 v1에서는 `set_category` 1개를 권장(없어도 기술적으로 허용 가능).
- 정렬 우선순위: `enabled=true` + `priority DESC` + `updatedAt DESC`.

---

## 4) Matcher algorithm v1

### Priority & specificity policy
1. 후보 규칙: `enabled`만.
2. 1차 정렬: `priority DESC`.
3. 동순위 tie-breaker: **specificity score** 높은 규칙 우선.
4. specificity 계산 예시:
   - `regex` +4
   - `contains` +2
   - `amount_range` +2 (min/max 모두 있으면 +3)
   - `payment_method` +2
   - `time_window` +1
5. 동일하면 `updatedAt DESC`(최근 수정 규칙 우선).

### Confidence score policy
- 조건별 weight를 합산해 0~1로 normalize.
- 기본 weight:
  - regex 0.40
  - contains 0.25
  - amount_range 0.15
  - payment_method 0.10
  - time_window 0.10
- 공식:
  - `raw = sum(weight of passed conditions)`
  - `max = sum(weight of rule conditions)`
  - `confidence = clamp(raw / max, 0, 1)`
- hard gating: `regex/contains` 중 하나도 없고 나머지 조건만 매치하면 max confidence 0.6 cap.

### Explainability (rule trace)
- matcher는 상위 N개 후보(기본 3개)에 대해 `TxRuleTrace` 생성.
- trace에는 다음 포함:
  - 어떤 조건이 어떤 입력값으로 평가되었는지,
  - pass/fail,
  - weight 기여도,
  - 최종 적용 action.
- 저장은 `tx.ruleTrace`(디버그 모드 또는 최근 1건만).

### Matching steps (pseudo)

```pseudo
function classifyTx(tx, rules):
  normalized = normalize(tx) // trim, lowercase, unicode normalize
  candidates = filter(rules, r => r.enabled)
  sorted = sort(candidates, by priority desc, specificity desc, updatedAt desc)

  traces = []
  best = null

  for rule in sorted:
    evals = evaluateConditions(rule.conditions, normalized)
    passedAll = every(evals, e => e.passed)
    conf = calcConfidence(rule.conditions, evals)

    trace = buildTrace(rule, evals, conf)
    traces.append(trace)

    if passedAll and (best is null or better(rule, best.rule)):
      best = { rule, conf, trace }

  if best is null:
    return {
      categoryId: tx.categoryId ?? DEFAULT_UNCATEGORIZED,
      tags: tx.tags,
      memo: tx.memo,
      confidence: 0,
      ruleId: undefined,
      traces: top(traces, 3)
    }

  applied = applyActions(tx, best.rule.actions)
  return {
    ...applied,
    confidence: best.conf,
    ruleId: best.rule.id,
    traces: top(traces, 3)
  }
```

---

## 5) classify-on-save pipeline

### When called
- 트랜잭션 생성/수정 시 `beforePersist(txDraft)` 단계에서 호출.
- CSV import는 row 단위로 호출 + 배치 요약(confidence 분포) 생성.

### How stored
1. draft normalize (`merchant`, `memo`, `tags`).
2. matcher 실행.
3. `categoryId/tags/memo`에 action 반영(사용자 수동 입력 우선 옵션 가능).
4. `confidence`, `ruleId`, `source` 저장.
5. `ruleTrace`는 debug 플래그/최근 변경 1건에 한해 저장(용량 보호).
6. encrypted write (`tx` store).

### Re-run batch workflow
- 진입점: `Reclassify All` (설정 화면).
- 대상: date range / source / confidence threshold 필터.
- 절차:
  1. 대상 tx decrypt stream.
  2. 현재 rule set으로 재분류.
  3. 기존 결과와 diff(`categoryId`,`tags`,`memo`,`ruleId`,`confidence`) 계산.
  4. dry-run preview(변경 건수/샘플) 제공.
  5. confirm 시 bulk write.
  6. 결과 리포트 저장(`reclassifyJob` 로그: startedAt, completedAt, affectedCount).

---

## 6) “Save as rule” UX contract

### Trigger
- 사용자가 분류 결과를 수동 수정(카테고리/태그/메모)한 직후 “이 패턴을 규칙으로 저장” 클릭.

### Inputs captured
- From tx context:
  - `merchant` (필수 후보)
  - `memo` 일부 토큰(선택)
  - `amount` 범위 제안(정확 금액 ± 허용치)
  - `cardId` 또는 pay method
  - `date` 기반 요일/월초월말 패턴(선택)
- From user decision:
  - target `categoryId`
  - tags append/replace 선택
  - memo autofill 여부
  - rule priority (basic/advanced)

### UX defaults
- 기본 rule 템플릿:
  - condition: `merchant contains <merchant>`
  - action: `set_category=<chosen>`
  - enabled=true, priority=100
- 저장 직후 현재 tx에 즉시 재적용 + confidence recalculation.
- 토스트: “규칙 저장됨. 과거 거래에도 적용할까요?” → 배치 재분류 CTA.

---

## Risks + mitigations

1. **오탐 분류(잘못된 자동 카테고리)**
   - Mitigation: confidence 임계치 미만(예: 0.55)은 제안만 하고 자동 반영 안 함.
2. **규칙 충돌/중복 증가**
   - Mitigation: rule 저장 시 유사 규칙 탐지(동일 contains+category) 및 병합 제안.
3. **마이그레이션 중 데이터 손상 우려**
   - Mitigation: pre/post 백업, 실패 시 atomic restore 경로 확보.
4. **배치 재분류 성능 저하**
   - Mitigation: chunk 처리(예: 500건), progress UI, idle callback 사용.
5. **설명가능성 로그로 저장공간 증가**
   - Mitigation: trace 저장 제한(최근 N건/디버그 모드), 기본은 메모리 계산만.
