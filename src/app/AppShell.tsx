import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useApp } from './AppContext';
import { DashboardPage } from '../pages/DashboardPage';
import { CardsPage } from '../pages/CardsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoansPage } from '../pages/LoansPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { BudgetPage } from '../pages/BudgetPage';
import { ReconcilePage } from '../pages/ReconcilePage';
import { MorePage } from '../pages/MorePage';
import { BottomTabBar } from '../components/BottomTabBar';

export function AppShell() {
  const app = useApp();
  const [noticeOpen, setNoticeOpen] = useState(true);

  return (
    <>
      <div className="header">
        <div className="header-inner">
          <div className="h1">Secure Budget</div>
          <button className="btn danger" onClick={() => app.lock()}>잠금</button>
        </div>
      </div>

      <div className="app-body">
        <Routes>
          <Route path="/" element={<DashboardPage />} />

          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          <Route path="/plan" element={<BudgetPage />} />
          <Route path="/budget" element={<BudgetPage />} />

          <Route path="/billing" element={<ReconcilePage />} />
          <Route path="/reconcile" element={<ReconcilePage />} />

          <Route path="/more" element={<MorePage />} />
          <Route path="/more/settings" element={<SettingsPage />} />
          <Route path="/more/cards" element={<CardsPage />} />
          <Route path="/more/loans" element={<LoansPage />} />

          <Route path="/cards" element={<CardsPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>

        {noticeOpen ? (
          <div className="container" style={{ paddingTop: 0 }}>
            <div className="notice notice-dismissible">
              <button className="notice-close" aria-label="닫기" onClick={() => setNoticeOpen(false)}>×</button>
              ⚠️ 이 앱은 네트워크 전송이 CSP로 차단돼 있어. 그래도 “백업 파일”을 실수로 GitHub에 올리는 게 제일 위험해.
              레포에는 코드만 올리고, 백업은 개인 저장소로만 관리해.
            </div>
          </div>
        ) : null}
      </div>

      <BottomTabBar />
    </>
  );
}
