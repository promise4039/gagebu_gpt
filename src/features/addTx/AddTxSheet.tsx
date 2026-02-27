import React, { useMemo, useState } from 'react';
import { useCategories } from '../categories/useCategories';
import { AddTxDraft, AddTxPayload } from './types';
import { CategoryType } from '../categories/types';

const PAYMENT_METHODS = ['현금', '체크카드', '신용카드', '계좌이체', '기타'];

type PickerType = 'none' | 'category' | 'payment' | 'datetime';

type BuildPayloadResult = {
  payload: AddTxPayload | null;
  errorMessage: string | null;
};

function makeInitialDraft(): AddTxDraft {
  return {
    txType: 'expense',
    amountText: '0',
    merchant: '',
    paymentMethod: '',
    majorId: '',
    midId: '',
    memo: '',
    tags: [],
    excludeFromBudget: false,
    addFixedExpense: false,
    dateTimeISO: new Date().toISOString(),
  };
}

function formatDateTime(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hours = date.getHours();
  const ampm = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${yy}년 ${mm}월 ${dd}일 | ${ampm} ${String(hour12).padStart(2, '0')}:${minute}`;
}

function parseDateFromISO(dateTimeISO: string): Date {
  const parsed = new Date(dateTimeISO);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

function buildAddTxPayload(draft: AddTxDraft, categoryPath: string): BuildPayloadResult {
  const amount = Number(draft.amountText.replaceAll(',', '').trim());
  // 금액 정책: 0 이하(음수/0)는 저장하지 않는다.
  if (!Number.isFinite(amount) || amount <= 0) {
    return { payload: null, errorMessage: '금액은 0보다 큰 값을 입력해 주세요.' };
  }
  if (!draft.majorId || !draft.midId || !categoryPath) {
    return { payload: null, errorMessage: '카테고리를 선택해 주세요.' };
  }
  if (!draft.paymentMethod) {
    return { payload: null, errorMessage: '결제수단을 선택해 주세요.' };
  }

  return {
    payload: {
      txType: draft.txType,
      amount,
      merchant: draft.merchant.trim(),
      paymentMethod: draft.paymentMethod,
      categoryPath,
      majorId: draft.majorId,
      midId: draft.midId,
      memo: draft.memo.trim(),
      tags: draft.tags,
      excludeFromBudget: draft.excludeFromBudget,
      addFixedExpense: draft.addFixedExpense,
      dateTimeISO: draft.dateTimeISO,
    },
    errorMessage: null,
  };
}

function getRecentDates(): Array<{ label: string; value: string }> {
  return Array.from({ length: 14 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx);
    const value = d.toISOString().slice(0, 10);
    const label = idx === 0 ? '오늘' : idx === 1 ? '어제' : `${d.getMonth() + 1}/${d.getDate()}`;
    return { label, value };
  });
}

export function AddTxSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: (payload: AddTxPayload) => Promise<boolean>;
}) {
  const categories = useCategories();
  const [activePicker, setActivePicker] = useState<PickerType>('none');
  const [tagInput, setTagInput] = useState('');
  const [draft, setDraft] = useState<AddTxDraft>(makeInitialDraft());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const majors = categories.majorsByType[draft.txType] ?? [];
  const selectedMajor = majors.find(major => major.id === draft.majorId) ?? majors[0];
  const mids = selectedMajor ? categories.midsByMajorId[selectedMajor.id] ?? [] : [];
  const selectedMid = mids.find(mid => mid.id === draft.midId);
  const categoryLabel = selectedMajor && selectedMid ? `${selectedMajor.name} > ${selectedMid.name}` : '선택하세요';
  const categoryPath = selectedMajor && selectedMid ? `${selectedMajor.name}/${selectedMid.name}` : '';

  function handleCloseSheet() {
    setActivePicker('none');
    setErrorMessage(null);
    onClose();
  }

  function resetDraftState() {
    setDraft(makeInitialDraft());
    setTagInput('');
    setErrorMessage(null);
    setActivePicker('none');
  }

  React.useEffect(() => {
    if (!open) return;
    if (!selectedMajor && majors[0]) {
      setDraft(prev => ({ ...prev, majorId: majors[0].id, midId: '' }));
    }
  }, [open, selectedMajor, majors]);

  const amountDisplay = useMemo(() => {
    const n = Number(draft.amountText.replaceAll(',', ''));
    if (!Number.isFinite(n)) return '0원';
    return `${new Intl.NumberFormat('ko-KR').format(n)}원`;
  }, [draft.amountText]);

  if (!open) return null;

  const dates = getRecentDates();
  const minuteStep = Array.from({ length: 12 }, (_, idx) => String(idx * 5).padStart(2, '0'));

  return (
    <div className="addtx-overlay">
      <div className="addtx-sheet">
        <div className="addtx-head"><button className="btn" onClick={handleCloseSheet}>✕</button></div>
        <div className="addtx-amount"><input value={draft.amountText} onChange={event => setDraft(prev => ({ ...prev, amountText: event.target.value }))} /></div>
        <div className="muted" style={{ textAlign: 'center' }}>{amountDisplay}</div>

        <div className="addtx-segment">
          {(['income', 'expense', 'transfer'] as CategoryType[]).map(type => (
            <button key={type} className={`tab ${draft.txType === type ? 'active' : ''}`} onClick={() => setDraft(prev => ({ ...prev, txType: type, majorId: '', midId: '' }))}>
              {type === 'income' ? '수입' : type === 'expense' ? '지출' : '이체'}
            </button>
          ))}
        </div>

        <div className="addtx-list">
          <button className="addtx-row" onClick={() => setActivePicker('category')}><span>카테고리</span><span className="muted">{categoryLabel} ›</span></button>
          <label className="addtx-row addtx-input-row"><span>거래처</span><input value={draft.merchant} onChange={event => setDraft(prev => ({ ...prev, merchant: event.target.value }))} /></label>
          <button className="addtx-row" onClick={() => setActivePicker('payment')}><span>결제수단</span><span className="muted">{draft.paymentMethod || '선택하세요'} ›</span></button>
          <button className="addtx-row" onClick={() => setActivePicker('datetime')}><span>날짜·시간</span><span className="muted">{formatDateTime(parseDateFromISO(draft.dateTimeISO))} ›</span></button>
          <div className="addtx-row" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
            <span>메모·태그</span>
            <input value={draft.memo} onChange={event => setDraft(prev => ({ ...prev, memo: event.target.value }))} placeholder="메모" />
            <div className="row" style={{ marginTop: 8 }}>
              <input value={tagInput} onChange={event => setTagInput(event.target.value)} placeholder="태그" />
              <button className="btn" onClick={() => {
                const next = tagInput.trim();
                if (!next || draft.tags.includes(next)) return;
                setDraft(prev => ({ ...prev, tags: [...prev.tags, next] }));
                setTagInput('');
              }}>+추가</button>
            </div>
            <div className="chip-wrap">
              {draft.tags.map(tag => <span key={tag} className="chip">{tag}<button className="chip-x" onClick={() => setDraft(prev => ({ ...prev, tags: prev.tags.filter(item => item !== tag) }))}>×</button></span>)}
            </div>
          </div>
          <label className="addtx-row addtx-toggle-row"><span>예산에서 제외</span><input type="checkbox" checked={draft.excludeFromBudget} onChange={event => setDraft(prev => ({ ...prev, excludeFromBudget: event.target.checked }))} /></label>
          <label className="addtx-row addtx-toggle-row"><span>고정 지출에 추가</span><input type="checkbox" checked={draft.addFixedExpense} onChange={event => setDraft(prev => ({ ...prev, addFixedExpense: event.target.checked }))} /></label>
        </div>

        <div className="addtx-bottom">
          {errorMessage && <p className="addtx-error">{errorMessage}</p>}
          <button className="btn primary addtx-save" onClick={async () => {
          const { payload, errorMessage: nextError } = buildAddTxPayload(draft, categoryPath);
          if (!payload) {
            setErrorMessage(nextError);
            return;
          }
          const saved = onSave ? await onSave(payload) : true;
          if (!saved) {
            setErrorMessage('거래 저장에 실패했습니다. 다시 시도해 주세요.');
            return;
          }
          resetDraftState();
          handleCloseSheet();
        }}>저장</button>
        </div>
      </div>

      {activePicker === 'category' && (
        <div className="category-picker-sheet">
          <div className="category-picker-head"><h3>카테고리 선택</h3><button className="btn" onClick={() => setActivePicker('none')}>✕</button></div>
          <div className="category-grid">
            {majors.map(major => (
              <button key={major.id} className={`category-grid-item ${selectedMajor?.id === major.id ? 'selected' : ''}`} onClick={() => setDraft(prev => ({ ...prev, majorId: major.id, midId: '' }))}>
                <span className="icon">{major.icon}</span><span>{major.name}</span>
              </button>
            ))}
          </div>
          <div className="chip-wrap" style={{ marginTop: 12 }}>
            {mids.map(mid => (
              <button key={mid.id} className={`chip ${draft.midId === mid.id ? 'active' : ''}`} onClick={() => {
                setDraft(prev => ({ ...prev, majorId: selectedMajor?.id ?? '', midId: mid.id }));
                setActivePicker('none');
              }}>{mid.name}</button>
            ))}
          </div>
        </div>
      )}

      {activePicker === 'payment' && (
        <div className="payment-method-picker-sheet">
          <div className="category-picker-head"><h3>결제수단 선택</h3><button className="btn" onClick={() => setActivePicker('none')}>✕</button></div>
          <div className="payment-method-list">
            {PAYMENT_METHODS.map(item => <button key={item} className={`payment-method-item ${draft.paymentMethod === item ? 'selected' : ''}`} onClick={() => { setDraft(prev => ({ ...prev, paymentMethod: item })); setActivePicker('none'); }}>{item}</button>)}
          </div>
        </div>
      )}

      {activePicker === 'datetime' && (
        <DateWheelSheet
          initial={parseDateFromISO(draft.dateTimeISO)}
          dates={dates}
          minutes={minuteStep}
          onClose={() => setActivePicker('none')}
          onApply={date => {
            setDraft(prev => ({ ...prev, dateTimeISO: date.toISOString() }));
            setActivePicker('none');
          }}
        />
      )}
    </div>
  );
}

function DateWheelSheet({
  initial,
  dates,
  minutes,
  onClose,
  onApply,
}: {
  initial: Date;
  dates: Array<{ label: string; value: string }>;
  minutes: string[];
  onClose: () => void;
  onApply: (date: Date) => void;
}) {
  const initHours = initial.getHours();
  const [dateValue, setDateValue] = useState(initial.toISOString().slice(0, 10));
  const [ampm, setAmpm] = useState(initHours < 12 ? '오전' : '오후');
  const [hour12, setHour12] = useState(String((initHours % 12) || 12));
  const [minute, setMinute] = useState(String(Math.round(initial.getMinutes() / 5) * 5).padStart(2, '0'));

  return (
    <div className="datetime-picker-sheet">
      <div className="category-picker-head"><h3>날짜·시간</h3><button className="btn" onClick={onClose}>✕</button></div>
      <div className="datetime-picker-list">
        <select value={dateValue} onChange={event => setDateValue(event.target.value)}>{dates.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        <div className="datetime-wheel-row">
          <select className="datetime-picker-input" value={ampm} onChange={event => setAmpm(event.target.value)}><option>오전</option><option>오후</option></select>
          <select className="datetime-picker-input" value={hour12} onChange={event => setHour12(event.target.value)}>{Array.from({ length: 12 }, (_, idx) => String(idx + 1)).map(item => <option key={item}>{item}</option>)}</select>
          <select className="datetime-picker-input" value={minute} onChange={event => setMinute(event.target.value)}>{minutes.map(item => <option key={item}>{item}</option>)}</select>
        </div>
      </div>
      <button className="btn primary" onClick={() => {
        const [y, m, d] = dateValue.split('-').map(Number);
        const hourNum = Number(hour12);
        const hh = ampm === '오후' ? (hourNum % 12) + 12 : hourNum % 12;
        const next = new Date(y, m - 1, d, hh, Number(minute));
        onApply(next);
      }}>적용</button>
    </div>
  );
}
