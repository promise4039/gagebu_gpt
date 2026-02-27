export type CategoryType = 'income' | 'expense' | 'transfer';

export type MajorCategory = {
  id: string;
  type: CategoryType;
  name: string;
  icon: string;
  order: number;
};

export type MidCategory = {
  id: string;
  majorId: string;
  name: string;
  order: number;
};

export type CategoryStoreData = {
  majors: MajorCategory[];
  mids: MidCategory[];
};
