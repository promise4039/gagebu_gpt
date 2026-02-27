import { createSeedCategories } from './seed';
import { CategoryStoreData, CategoryType, MajorCategory, MidCategory } from './types';

const STORAGE_KEY = 'categories_v01';
const EVENT_NAME = 'categories_v01_updated';

function emitChange() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

function sortData(data: CategoryStoreData): CategoryStoreData {
  return {
    majors: [...data.majors].sort((a, b) => a.order - b.order),
    mids: [...data.mids].sort((a, b) => a.order - b.order),
  };
}

export function readCategories(): CategoryStoreData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedCategories();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(raw) as CategoryStoreData;
    return sortData(parsed);
  } catch {
    const seed = createSeedCategories();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function writeCategories(data: CategoryStoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortData(data)));
  emitChange();
}

export function subscribeCategories(listener: () => void): () => void {
  const onCustom = () => listener();
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener(EVENT_NAME, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT_NAME, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

export function addMajor(type: CategoryType, name: string, icon: string): MajorCategory {
  const data = readCategories();
  const order = data.majors.filter(major => major.type === type).length;
  const major: MajorCategory = { id: crypto.randomUUID(), type, name, icon, order };
  writeCategories({ ...data, majors: [...data.majors, major] });
  return major;
}

export function updateMajor(majorId: string, patch: Pick<MajorCategory, 'name' | 'icon'>) {
  const data = readCategories();
  writeCategories({
    ...data,
    majors: data.majors.map(major => (major.id === majorId ? { ...major, ...patch } : major)),
  });
}

export function removeMajor(majorId: string): boolean {
  const data = readCategories();
  const hasMids = data.mids.some(mid => mid.majorId === majorId);
  if (hasMids) return false;
  writeCategories({ ...data, majors: data.majors.filter(major => major.id !== majorId) });
  return true;
}

export function addMid(majorId: string, name: string): MidCategory {
  const data = readCategories();
  const order = data.mids.filter(mid => mid.majorId === majorId).length;
  const mid: MidCategory = { id: crypto.randomUUID(), majorId, name, order };
  writeCategories({ ...data, mids: [...data.mids, mid] });
  return mid;
}

export function updateMid(midId: string, name: string) {
  const data = readCategories();
  writeCategories({ ...data, mids: data.mids.map(mid => (mid.id === midId ? { ...mid, name } : mid)) });
}

export function removeMid(midId: string) {
  const data = readCategories();
  writeCategories({ ...data, mids: data.mids.filter(mid => mid.id !== midId) });
}
