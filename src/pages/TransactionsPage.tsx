import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../app/AppContext';
import { Tx } from '../domain/models';
import { BulkEntryModal } from '../components/BulkEntryModal';
import { SmartFilterBar, SmartFilterPeriod } from '../components/SmartFilterBar';
import { AddTxSheet } from '../features/addTx/AddTxSheet';

const fmt = new Intl.NumberFormat('ko-KR');
type FeeMode = 'free' | 'manual';

type TxEditDraft = {
  cardId: string;
  category: string;
  amount: string;
  installments: number;
  feeMode: FeeMode;
  feeRate: string;
  memo: string;
};

export function TransactionsPage() {
  const app = useApp();
  const [bulkOpen, setBulkOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [period, setPeriod] = useState<SmartFilterPeriod>('all');
  const [addTxOpen, setAddTxOpen] = useState(false);

  const rows = useMemo(() => [...app.tx].sort((a, b) => b.date.localeCompare(a.date)), [app.tx]);
  const filteredRows = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const query = searchText.trim().toLowerCase();

    return rows.filter(t => {
      const dateMatches = period === 'all' ? true : period === 'this_month' ? t.date.startsWith(thisMonth) : t.date.startsWith(lastMonth);
      if (!dateMatches) return false;
      if (!query) return true;
      const withOptional = t as Tx & { merchant?: string; raw?: string; original?: string };
      const fallback = `${withOptional.merchant ?? ''} ${t.memo} ${withOptional.original ?? ''} ${withOptional.raw ?? ''}`;
      return fallback.toLowerCase().includes(query);
    });
  }, [period, rows, searchText]);

  const [editing, setEditing] = useState<Record<string, TxEditDraft>>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const checkedAll = filteredRows.length > 0 && filteredRows.every(t => checked.has(t.id));

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
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
      },
    }));
  }

  function cancelEdit(id: string) {
    setEditing(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function saveEdit(t: Tx) {
    const d = editing[t.id];
    if (!d) return;
    const amount = Number(d.amount.replaceAll(',', '').trim());
    if (!Number.isFinite(amount) || amount === 0) return;
    await app.upsertTx({ ...t, cardId: d.cardId, category: d.category, amount, memo: d.memo });
    cancelEdit(t.id);
  }

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>거래</h2>
          <div className="row">
            <Link to="/categories" className="btn">카테고리 관리</Link>
            <button className="btn primary" onClick={() => setBulkOpen(true)}>거래 내역 추가</button>
          </div>
        </div>

        <div className="divider" />
        <SmartFilterBar searchText={searchText} period={period} onSearchTextChange={setSearchText} onPeriodChange={setPeriod} onClear={() => { setSearchText(''); setPeriod('all'); }} />
        <div className="divider" />

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: 44 }}><input type="checkbox" checked={checkedAll} onChange={() => checkedAll ? setChecked(new Set()) : setChecked(new Set(filteredRows.map(t => t.id)))} /></th>
                <th>날짜</th><th>결제수단</th><th>카테고리</th><th>메모</th><th className="right">금액</th><th style={{ width: 180 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(t => {
                const card = app.cards.find(c => c.id === t.cardId);
                const d = editing[t.id];
                const isEditing = Boolean(d);
                return (
                  <tr key={t.id}>
                    <td><input type="checkbox" checked={checked.has(t.id)} onChange={() => toggle(t.id)} /></td>
                    <td className="mono">{t.date}</td>
                    <td>{isEditing ? <select value={d.cardId} onChange={event => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], cardId: event.target.value } }))}>{app.cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select> : (card?.name ?? '-')}</td>
                    <td>{isEditing ? <input value={d.category} onChange={event => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], category: event.target.value } }))} /> : t.category}</td>
                    <td>{isEditing ? <input value={d.memo} onChange={event => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], memo: event.target.value } }))} /> : t.memo}</td>
                    <td className="right">{isEditing ? <input value={d.amount} onChange={event => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], amount: event.target.value } }))} /> : `${fmt.format(t.amount)}원`}</td>
                    <td className="right">{isEditing ? <><button className="btn primary" onClick={() => saveEdit(t)}>저장</button><button className="btn" onClick={() => cancelEdit(t.id)}>취소</button></> : <button className="btn" onClick={() => startEdit(t)}>편집</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button className="add-tx-fab" onClick={() => setAddTxOpen(true)} aria-label="Add Transaction">+</button>
      <AddTxSheet open={addTxOpen} onClose={() => setAddTxOpen(false)} />
      <BulkEntryModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  );
}
