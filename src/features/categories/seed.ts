import { CategoryStoreData, CategoryType, MajorCategory, MidCategory } from './types';

const MAJOR_SEED: Record<CategoryType, Array<{ name: string; icon: string }>> = {
  income: [
    { name: '급여', icon: '💼' }, { name: '보너스', icon: '🎁' }, { name: '사업', icon: '🏪' }, { name: '이자', icon: '🏦' },
    { name: '배당', icon: '📈' }, { name: '환급', icon: '💰' }, { name: '용돈', icon: '🧧' }, { name: '기타수입', icon: '🧾' },
  ],
  expense: [
    { name: '식비', icon: '🍚' }, { name: '카페', icon: '☕️' }, { name: '교통', icon: '🚌' }, { name: '주거', icon: '🏠' },
    { name: '통신', icon: '📱' }, { name: '쇼핑', icon: '🛒' }, { name: '의료', icon: '🏥' }, { name: '여가', icon: '🎬' },
  ],
  transfer: [
    { name: '계좌이체', icon: '🔁' }, { name: '현금인출', icon: '🏧' }, { name: '저축', icon: '🐷' }, { name: '투자', icon: '📊' },
    { name: '대출상환', icon: '💳' }, { name: '보험', icon: '🛡️' }, { name: '카드대금', icon: '💵' }, { name: '기타이체', icon: '📦' },
  ],
};

function midsFor(name: string): string[] {
  return [`${name} A`, `${name} B`, `${name} C`];
}

export function createSeedCategories(): CategoryStoreData {
  const majors: MajorCategory[] = [];
  const mids: MidCategory[] = [];

  (Object.keys(MAJOR_SEED) as CategoryType[]).forEach(type => {
    MAJOR_SEED[type].forEach((major, majorIndex) => {
      const majorId = `${type}_major_${majorIndex + 1}`;
      majors.push({
        id: majorId,
        type,
        name: major.name,
        icon: major.icon,
        order: majorIndex,
      });
      midsFor(major.name).forEach((mid, midIndex) => {
        mids.push({
          id: `${majorId}_mid_${midIndex + 1}`,
          majorId,
          name: mid,
          order: midIndex,
        });
      });
    });
  });

  return { majors, mids };
}
