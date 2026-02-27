import React from 'react';

export type SmartFilterPeriod = 'all' | 'this_month' | 'last_month';

type SmartFilterBarProps = {
  searchText: string;
  period: SmartFilterPeriod;
  onSearchTextChange: (value: string) => void;
  onPeriodChange: (value: SmartFilterPeriod) => void;
  onClear: () => void;
};

export function SmartFilterBar({
  searchText,
  period,
  onSearchTextChange,
  onPeriodChange,
  onClear,
}: SmartFilterBarProps) {
  return (
    <div className="smart-filter-bar" role="region" aria-label="거래 필터">
      <input
        value={searchText}
        onChange={e => onSearchTextChange(e.target.value)}
        placeholder="가맹점/메모 검색"
        aria-label="검색어"
      />

      <div className="smart-filter-period" role="group" aria-label="기간 선택">
        <button
          className={`btn ${period === 'all' ? 'primary' : ''}`}
          onClick={() => onPeriodChange('all')}
          type="button"
        >
          All
        </button>
        <button
          className={`btn ${period === 'this_month' ? 'primary' : ''}`}
          onClick={() => onPeriodChange('this_month')}
          type="button"
        >
          This month
        </button>
        <button
          className={`btn ${period === 'last_month' ? 'primary' : ''}`}
          onClick={() => onPeriodChange('last_month')}
          type="button"
        >
          Last month
        </button>
      </div>

      <button className="btn" onClick={onClear} type="button">Clear</button>
    </div>
  );
}
