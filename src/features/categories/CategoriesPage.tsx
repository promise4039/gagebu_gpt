import React, { useMemo, useState } from 'react';
import { addMajor, addMid, removeMajor, removeMid, updateMajor, updateMid } from './storage';
import { CategoryType } from './types';
import { useCategories } from './useCategories';

const TYPE_LABEL: Record<CategoryType, string> = {
  income: '수입',
  expense: '지출',
  transfer: '이체',
};

export function CategoriesPage() {
  const [type, setType] = useState<CategoryType>('expense');
  const [selectedMajorId, setSelectedMajorId] = useState<string>('');
  const categories = useCategories();

  const majors = categories.majorsByType[type] ?? [];
  const selectedMajor = useMemo(
    () => majors.find(major => major.id === selectedMajorId) ?? majors[0],
    [majors, selectedMajorId],
  );
  const mids = selectedMajor ? categories.midsByMajorId[selectedMajor.id] ?? [] : [];

  React.useEffect(() => {
    if (!selectedMajor && majors.length > 0) {
      setSelectedMajorId(majors[0].id);
    }
  }, [majors, selectedMajor]);

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>카테고리 관리</h2>
          <button
            className="btn"
            onClick={() => {
              const name = window.prompt('대분류 이름');
              if (!name?.trim()) return;
              const icon = window.prompt('이모지', '📌') ?? '📌';
              const major = addMajor(type, name.trim(), icon);
              setSelectedMajorId(major.id);
            }}
          >
            + 대분류
          </button>
        </div>

        <div className="addtx-segment" role="tablist" aria-label="카테고리 구분">
          {(['income', 'expense', 'transfer'] as CategoryType[]).map(item => (
            <button key={item} className={`tab ${type === item ? 'active' : ''}`} onClick={() => setType(item)}>{TYPE_LABEL[item]}</button>
          ))}
        </div>

        <div className="category-grid">
          {majors.map(major => {
            const selected = selectedMajor?.id === major.id;
            const midCount = categories.midsByMajorId[major.id]?.length ?? 0;
            return (
              <button key={major.id} className={`category-grid-item ${selected ? 'selected' : ''}`} onClick={() => setSelectedMajorId(major.id)}>
                <span className="icon">{major.icon}</span>
                <span>{major.name}</span>
                <small className="muted">중분류 {midCount}개</small>
              </button>
            );
          })}
        </div>

        {selectedMajor && (
          <div style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>{selectedMajor.icon} {selectedMajor.name}</strong>
              <div className="row">
                <button className="btn" onClick={() => {
                  const name = window.prompt('대분류 이름', selectedMajor.name);
                  if (!name?.trim()) return;
                  const icon = window.prompt('이모지', selectedMajor.icon) ?? selectedMajor.icon;
                  updateMajor(selectedMajor.id, { name: name.trim(), icon });
                }}>편집</button>
                <button className="btn danger" onClick={() => {
                  const ok = removeMajor(selectedMajor.id);
                  if (!ok) {
                    window.alert('중분류가 있어 삭제할 수 없어요. 중분류를 먼저 삭제해 주세요.');
                    return;
                  }
                  window.alert('대분류를 삭제했어요.');
                }}>삭제</button>
              </div>
            </div>

            <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
              <strong>중분류 관리</strong>
              <button className="btn" onClick={() => {
                const name = window.prompt('중분류 이름');
                if (!name?.trim()) return;
                addMid(selectedMajor.id, name.trim());
              }}>+ 중분류</button>
            </div>

            <div className="chip-wrap" style={{ marginTop: 10 }}>
              {mids.map(mid => (
                <span key={mid.id} className="chip">
                  {mid.name}
                  <button
                    className="chip-x"
                    onClick={() => {
                      const nextName = window.prompt('중분류 이름', mid.name);
                      if (nextName === null) return;
                      if (nextName.trim().length === 0) {
                        if (window.confirm('삭제할까요?')) removeMid(mid.id);
                        return;
                      }
                      updateMid(mid.id, nextName.trim());
                    }}
                  >
                    ✎
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
