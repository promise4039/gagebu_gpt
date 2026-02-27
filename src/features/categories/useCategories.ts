import { useSyncExternalStore } from 'react';
import { readCategories, subscribeCategories } from './storage';
import { CategoryStoreData, CategoryType, MajorCategory, MidCategory } from './types';

export type CategoryView = CategoryStoreData & {
  majorsByType: Record<CategoryType, MajorCategory[]>;
  midsByMajorId: Record<string, MidCategory[]>;
};

function buildView(data: CategoryStoreData): CategoryView {
  const majorsByType: Record<CategoryType, MajorCategory[]> = { income: [], expense: [], transfer: [] };
  const midsByMajorId: Record<string, MidCategory[]> = {};

  data.majors.forEach(major => {
    majorsByType[major.type].push(major);
  });
  data.mids.forEach(mid => {
    midsByMajorId[mid.majorId] = midsByMajorId[mid.majorId] ?? [];
    midsByMajorId[mid.majorId].push(mid);
  });

  return { ...data, majorsByType, midsByMajorId };
}

export function useCategories(): CategoryView {
  const snapshot = useSyncExternalStore(subscribeCategories, readCategories, readCategories);
  return buildView(snapshot);
}
