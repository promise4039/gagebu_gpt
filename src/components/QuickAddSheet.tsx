import React, { useEffect, useState } from 'react';

type QuickAddSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function QuickAddSheet({ open, onClose }: QuickAddSheetProps) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');

  useEffect(() => {
    if (!open) {
      setAmount('');
      setMerchant('');
    }
  }, [open]);

  function handleSave() {
    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      alert('금액을 입력해줘.');
      return;
    }

    alert('Saved (v0.1)');
    onClose();
  }

  return (
    <div className={'modal' + (open ? ' active' : '')} onClick={e => (e.target as HTMLElement).classList.contains('modal') && onClose()}>
      <div className="panel quick-add-sheet">
        <div className="panel-head">
          <h3>Quick Add</h3>
        </div>

        <div className="quick-add-form">
          <label>
            금액
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              inputMode="numeric"
              placeholder="예: 12000"
            />
          </label>

          <label>
            메모/가맹점
            <input
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              placeholder="예: 점심 식사"
            />
          </label>
        </div>

        <div className="quick-add-actions">
          <button className="btn primary" onClick={handleSave}>Save</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
