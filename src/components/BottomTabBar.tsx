import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

type TabItem = { to: string; label: string };

const PRIMARY_TABS: TabItem[] = [
  { to: '/', label: '홈' },
  { to: '/transactions', label: '거래' },
  { to: '/analytics', label: '분석' },
  { to: '/plan', label: '플랜' },
  { to: '/billing', label: '청구' },
];

function Tab({ to, label }: TabItem) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}
      style={{ textDecoration: 'none' }}
      end={to === '/'}
    >
      {label}
    </NavLink>
  );
}

export function BottomTabBar() {
  const location = useLocation();
  const isMoreActive = location.pathname === '/more' || location.pathname.startsWith('/more/');

  return (
    <div className="bottom-nav">
      <div className="nav-inner">
        <div className="primary-tabs">
          {PRIMARY_TABS.map((t) => <Tab key={t.to} to={t.to} label={t.label} />)}
        </div>
        <Link to="/more" className={'tab more-tab' + (isMoreActive ? ' active' : '')} style={{ textDecoration: 'none' }}>
          더보기
        </Link>
      </div>
    </div>
  );
}
