import React from 'react';
import { Link } from 'react-router-dom';

const items = [
  {
    title: '설정',
    description: '예산/자동 잠금, 카테고리, 백업/복원 설정',
    to: '/more/settings',
  },
  {
    title: '계좌/카드',
    description: '결제수단과 청구기간 규칙 관리',
    to: '/more/cards',
  },
  {
    title: '대출/카드',
    description: '대출 상환 일정 및 카드 청구 상세 확인',
    to: '/more/loans',
  },
];

export function MorePage() {
  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>더보기</h2>
        <p className="muted">관리/설정 화면은 더보기에서 접근해.</p>
        <div className="divider" />
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 10 }}>
          {items.map((item) => (
            <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{item.title}</strong>
                  <span className="muted">열기 →</span>
                </div>
                <p className="muted" style={{ marginBottom: 0 }}>{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
