import React, { useMemo, useState } from 'react';
import { useApp } from '../app/AppContext';
import { Tx } from '../domain/models';
import { BulkEntryModal } from '../components/BulkEntryModal';
import { SmartFilterBar, SmartFilterPeriod } from '../components/SmartFilterBar';

const fmt = new Intl.NumberFormat('ko-KR');
type FeeMode = 'free' | 'manual';
type TxType = 'income' | 'expense' | 'transfer';

type CategoryOption = {
  label: string;
  icon: string;
};

type CategoryMap = Record<TxType, CategoryOption[]>;

type AddTxDraft = {
  txType: TxType;
  categories: Record<TxType, string>;
  paymentMethodId: string;
  merchant: string;
  memoTags: string;
  excludeFromBudget: boolean;
  addFixedExpense: boolean;
};

type TxEditDraft = {
  cardId: string;
  category: string;
  amount: string;
  installments: number;
  feeMode: FeeMode;
  feeRate: string;
  memo: string;
};

const CATEGORY_OPTIONS: CategoryMap = {
  income: [
    { icon: '💼', label: '급여' },
    { icon: '🎁', label: '상여' },
    { icon: '🧧', label: '용돈' },
    { icon: '🏦', label: '금융수입' },
    { icon: '🧾', label: '기타' },
  ],
  expense: [
    { icon: '🍚', label: '식비' },
    { icon: '☕️', label: '카페' },
    { icon: '🍺', label: '술유흥' },
    { icon: '🧺', label: '생활' },
    { icon: '🛒', label: '온라인쇼핑' },
    { icon: '👕', label: '패션' },
    { icon: '💄', label: '뷰티' },
    { icon: '🚌', label: '교통' },
    { icon: '🚗', label: '자동차' },
    { icon: '🏠', label: '주거통신' },
    { icon: '🏥', label: '의료건강' },
    { icon: '💳', label: '금융' },
    { icon: '🎬', label: '문화여가' },
    { icon: '✈️', label: '여행숙박' },
    { icon: '📚', label: '교육학습' },
    { icon: '🧒', label: '자녀육아' },
    { icon: '🐶', label: '반려동물' },
    { icon: '🎀', label: '경조선물' },
  ],
  transfer: [
    { icon: '🔁', label: '내계좌이체' },
    { icon: '🏧', label: '이체' },
    { icon: '💳', label: '카드대금' },
    { icon: '🐷', label: '저축' },
    { icon: '💵', label: '현금' },
    { icon: '📈', label: '투자' },
    { icon: '🏦', label: '대출' },
    { icon: '🛡️', label: '보험' },
  ],
};

function formatDateTimeForRow(now: Date): string {
  return now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TransactionsPage() {
  const app = useApp();
  const [bulkOpen, setBulkOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [period, setPeriod] = useState<SmartFilterPeriod>('all');
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [paymentMethodPickerOpen, setPaymentMethodPickerOpen] = useState(false);
  const [amountInputMode, setAmountInputMode] = useState(false);
  const [amountText, setAmountText] = useState('0');
  const [addTxDraft, setAddTxDraft] = useState<AddTxDraft>({
    txType: 'expense',
    categories: {
      income: '',
      expense: '',
      transfer: '',
    },
    paymentMethodId: '',
    merchant: '',
    memoTags: '',
    excludeFromBudget: false,
    addFixedExpense: false,
  });
  const [dateTimeText] = useState(formatDateTimeForRow(new Date()));

  const rows = useMemo(() => {
    return [...app.tx].sort((a, b) => b.date.localeCompare(a.date));
  }, [app.tx]);

  const filteredRows = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const query = searchText.trim().toLowerCase();

    return rows.filter(t => {
      const dateMatches =
        period === 'all'
          ? true
          : period === 'this_month'
            ? t.date.startsWith(thisMonth)
            : t.date.startsWith(lastMonth);

      if (!dateMatches) return false;
      if (!query) return true;

      const withOptionalFields = t as Tx & {
        merchant?: string;
        raw?: string;
        original?: string;
      };
      const merchantField = withOptionalFields.merchant?.trim();
      const fallbackText = merchantField
        ? `${merchantField} ${t.memo}`
        : `${t.memo} ${withOptionalFields.original ?? ''} ${withOptionalFields.raw ?? ''}`;

      return fallbackText.toLowerCase().includes(query);
    });
  }, [period, rows, searchText]);

  const [editing, setEditing] = useState<Record<string, TxEditDraft>>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const checkedAll = filteredRows.length > 0 && filteredRows.every(t => checked.has(t.id));

  function toggle(id: string) {
    setChecked(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function startEdit(t: Tx) {
    setEditing(prev => ({
      ...prev,
      [t.id]: {
        cardId: t.cardId,
        category: t.category,
        amount: String(t.amount),
        installments: t.installments,
        feeMode: t.feeMode as FeeMode,
        feeRate: String(t.feeRate),
        memo: t.memo,
      }
    }));
  }

  function closeAddTx() {
    setAddTxOpen(false);
    setCategoryPickerOpen(false);
    setPaymentMethodPickerOpen(false);
    setAmountInputMode(false);
  }

  function selectCategory(type: TxType, category: string) {
    setAddTxDraft(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: category,
      },
    }));
    setCategoryPickerOpen(false);
  }

  function amountDisplayText() {
    const parsedAmount = Number(amountText.replaceAll(',', '').trim());
    if (!Number.isFinite(parsedAmount)) return '0원';
    return `${fmt.format(parsedAmount)}원`;
  }

  function selectedPaymentMethodName() {
    const selectedCard = app.cards.find(card => card.id === addTxDraft.paymentMethodId);
    return selectedCard?.name ?? '선택하세요';
  }

  function selectPaymentMethod(cardId: string) {
    setAddTxDraft(prev => ({
      ...prev,
      paymentMethodId: cardId,
    }));
    setPaymentMethodPickerOpen(false);
  }

  function cancelEdit(id: string) {
    setEditing(prev => {
      const cp = { ...prev };
      delete cp[id];
      return cp;
    });
  }

  async function saveEdit(t: Tx) {
    const d = editing[t.id];
    if (!d) return;
    const a = Number(String(d.amount).replaceAll(',', '').trim());
    if (!Number.isFinite(a) || a === 0) {
      alert('금액을 숫자로 넣어줘.');
      return;
    }
    const inst = Math.max(1, Math.floor(Number(d.installments)));
    const rate = d.feeMode === 'manual' ? Number(String(d.feeRate).replace(',', '.')) : 0;
    if (d.feeMode === 'manual' && (!Number.isFinite(rate) || rate < 0)) {
      alert('수수료율을 확인해줘.');
      return;
    }

    await app.upsertTx({
      ...t,
      cardId: d.cardId,
      category: d.category,
      categoryId: app.categoryIdByPath[d.category] ?? undefined,
      amount: a,
      installments: inst,
      feeMode: d.feeMode,
      feeRate: d.feeMode === 'manual' ? rate : 0,
      memo: String(d.memo ?? '').trim(),
    });
    cancelEdit(t.id);
  }

  async function deleteChecked() {
    if (checked.size === 0) return;
    if (!confirm(`선택한 ${checked.size}건을 삭제할까?`)) return;
    for (const id of Array.from(checked.values())) {
      await app.deleteTx(id);
      cancelEdit(id);
    }
    setChecked(new Set());
  }

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>거래</h2>
          <div className="row">
            <button className="btn primary" onClick={() => setBulkOpen(true)}>거래 내역 추가</button>
            <button className="btn danger" onClick={deleteChecked} disabled={checked.size === 0}>선택 삭제</button>
          </div>
        </div>

        <div className="divider" />

        <div className="smart-filter-wrap">
          <SmartFilterBar
            searchText={searchText}
            period={period}
            onSearchTextChange={setSearchText}
            onPeriodChange={setPeriod}
            onClear={() => {
              setSearchText('');
              setPeriod('all');
            }}
          />
        </div>

        <div className="divider" />

        {filteredRows.length === 0 ? (
          <p className="muted">조건에 맞는 거래가 없어.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      checked={checkedAll}
                      onChange={() => {
                        if (checkedAll) setChecked(new Set());
                        else setChecked(new Set(filteredRows.map(t => t.id)));
                      }}
                    />
                  </th>
                  <th style={{ width: 110 }}>날짜</th>
                  <th style={{ width: 180 }}>결제수단</th>
                  <th style={{ width: 200 }}>카테고리</th>
                  <th>메모</th>
                  <th className="right" style={{ width: 140 }}>금액</th>
                  <th style={{ width: 220 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(t => {
                  const card = app.cards.find(c => c.id === t.cardId);
                  const isEditing = !!editing[t.id];
                  const d = editing[t.id];
                  return (
                    <tr key={t.id}>
                      <td><input type="checkbox" checked={checked.has(t.id)} onChange={() => toggle(t.id)} /></td>
                      <td className="mono">{t.date}</td>
                      <td>
                        {isEditing ? (
                          <select value={d.cardId} onChange={e => setEditing(p => ({ ...p, [t.id]: { ...p[t.id], cardId: e.target.value } }))}>
                            {app.cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (card?.name ?? '(삭제됨)')}
                      </td>
                      <td>
                        {isEditing ? (
                          <select value={d.category} onChange={e => setEditing(p => ({ ...p, [t.id]: { ...p[t.id], category: e.target.value } }))}>
                            {app.categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : t.category}
                      </td>
                      <td className="muted">
                        {isEditing ? (
                          <input value={d.memo} onChange={e => setEditing(p => ({ ...p, [t.id]: { ...p[t.id], memo: e.target.value } }))} />
                        ) : t.memo}
                      </td>
                      <td className="right mono">
                        {isEditing ? (
                          <input value={d.amount} onChange={e => setEditing(p => ({ ...p, [t.id]: { ...p[t.id], amount: e.target.value } }))} inputMode="numeric" />
                        ) : (t.amount < 0 ? '-' : '') + fmt.format(Math.abs(t.amount)) + '원'}
                      </td>
                      <td className="right">
                        {isEditing ? (
                          <>
                            <button className="btn primary" onClick={() => saveEdit(t)}>저장</button>
                            <button className="btn" onClick={() => cancelEdit(t.id)}>취소</button>
                            <button className="btn danger" onClick={async () => { if (!confirm('삭제할까?')) return; await app.deleteTx(t.id); cancelEdit(t.id); }}>삭제</button>
                          </>
                        ) : (
                          <>
                            <button className="btn" onClick={() => startEdit(t)}>편집</button>
                            <button className="btn danger" onClick={async () => { if (!confirm('삭제할까?')) return; await app.deleteTx(t.id); }}>삭제</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="divider" />

        <div className="notice">
          단건 추가는 제거했고, “거래 내역 추가”에서 캘린더로 여러 건을 한 번에 입력하는 흐름이 기본이야.
        </div>
      </div>

      <button className="add-tx-fab" onClick={() => setAddTxOpen(true)} aria-label="Add Transaction">+</button>

      {addTxOpen && (
        <div className="addtx-overlay">
          <div className="addtx-sheet">
            <div className="addtx-head">
              <button className="btn" onClick={closeAddTx} aria-label="닫기">✕</button>
            </div>

            <div className="addtx-amount" onClick={() => setAmountInputMode(true)} role="button" tabIndex={0}>
              {amountInputMode ? (
                <input
                  autoFocus
                  inputMode="numeric"
                  value={amountText}
                  onChange={e => setAmountText(e.target.value)}
                  onBlur={() => setAmountInputMode(false)}
                />
              ) : (
                <>
                  <strong>{amountDisplayText()}</strong>
                  <span className="addtx-pencil">✎</span>
                </>
              )}
            </div>

            <div className="addtx-segment" role="tablist" aria-label="거래 분류">
              <button className={`tab ${addTxDraft.txType === 'income' ? 'active' : ''}`} onClick={() => setAddTxDraft(prev => ({ ...prev, txType: 'income' }))}>수입</button>
              <button className={`tab ${addTxDraft.txType === 'expense' ? 'active' : ''}`} onClick={() => setAddTxDraft(prev => ({ ...prev, txType: 'expense' }))}>지출</button>
              <button className={`tab ${addTxDraft.txType === 'transfer' ? 'active' : ''}`} onClick={() => setAddTxDraft(prev => ({ ...prev, txType: 'transfer' }))}>이체</button>
            </div>

            <div className="addtx-list">
              <button className="addtx-row" onClick={() => setCategoryPickerOpen(true)}>
                <span>카테고리</span>
                <span className="muted">{addTxDraft.categories[addTxDraft.txType] || '미분류'} ›</span>
              </button>

              <label className="addtx-row addtx-input-row">
                <span>거래처</span>
                <input value={addTxDraft.merchant} onChange={e => setAddTxDraft(prev => ({ ...prev, merchant: e.target.value }))} placeholder="입력" />
              </label>

              <button className="addtx-row" onClick={() => setPaymentMethodPickerOpen(true)}>
                <span>결제수단</span>
                <span className="muted">{selectedPaymentMethodName()} ›</span>
              </button>

              <button className="addtx-row" onClick={() => alert('Not implemented')}>
                <span>날짜·시간</span>
                <span className="muted">{dateTimeText} ›</span>
              </button>

              <label className="addtx-row addtx-input-row">
                <span>메모·태그</span>
                <input value={addTxDraft.memoTags} onChange={e => setAddTxDraft(prev => ({ ...prev, memoTags: e.target.value }))} placeholder="입력" />
              </label>

              <label className="addtx-row addtx-toggle-row">
                <span>예산에서 제외</span>
                <input type="checkbox" checked={addTxDraft.excludeFromBudget} onChange={e => setAddTxDraft(prev => ({ ...prev, excludeFromBudget: e.target.checked }))} />
              </label>

              <label className="addtx-row addtx-toggle-row">
                <span>고정 지출에 추가</span>
                <input type="checkbox" checked={addTxDraft.addFixedExpense} onChange={e => setAddTxDraft(prev => ({ ...prev, addFixedExpense: e.target.checked }))} />
              </label>
            </div>

            <div className="addtx-bottom">
              <button
                className="btn primary addtx-save"
                onClick={() => {
                  alert('Saved (v0.1)');
                  closeAddTx();
                }}
              >
                저장
              </button>
            </div>
          </div>

          {categoryPickerOpen && (
            <div className="category-picker-sheet" role="dialog" aria-label="카테고리 선택">
              <div className="category-picker-head">
                <h3>카테고리 선택</h3>
                <button className="btn" onClick={() => setCategoryPickerOpen(false)} aria-label="닫기">✕</button>
              </div>

              <div className="addtx-segment" role="tablist" aria-label="카테고리 타입">
                <button className={`tab ${addTxDraft.txType === 'income' ? 'active' : ''}`} onClick={() => setAddTxDraft(prev => ({ ...prev, txType: 'income' }))}>수입</button>
                <button className={`tab ${addTxDraft.txType === 'expense' ? 'active' : ''}`} onClick={() => setAddTxDraft(prev => ({ ...prev, txType: 'expense' }))}>지출</button>
                <button className={`tab ${addTxDraft.txType === 'transfer' ? 'active' : ''}`} onClick={() => setAddTxDraft(prev => ({ ...prev, txType: 'transfer' }))}>이체</button>
              </div>

              <div className="category-grid">
                {CATEGORY_OPTIONS[addTxDraft.txType].map(option => {
                  const isSelected = addTxDraft.categories[addTxDraft.txType] === option.label;
                  return (
                    <button
                      key={`${addTxDraft.txType}-${option.label}`}
                      className={`category-grid-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => selectCategory(addTxDraft.txType, option.label)}
                    >
                      <span className="icon" aria-hidden>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {paymentMethodPickerOpen && (
            <div className="payment-method-picker-sheet" role="dialog" aria-label="결제수단 선택">
              <div className="category-picker-head">
                <h3>결제수단 선택</h3>
                <button className="btn" onClick={() => setPaymentMethodPickerOpen(false)} aria-label="닫기">✕</button>
              </div>

              <div className="payment-method-list">
                {app.cards.map(card => {
                  const isSelected = addTxDraft.paymentMethodId === card.id;
                  return (
                    <button
                      key={card.id}
                      className={`payment-method-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => selectPaymentMethod(card.id)}
                    >
                      <span>{card.name}</span>
                      {isSelected && <span aria-hidden>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <BulkEntryModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  );
}
