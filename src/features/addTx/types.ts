import { CategoryType } from '../categories/types';

export type AddTxDraft = {
  txType: CategoryType;
  amountText: string;
  merchant: string;
  paymentMethod: string;
  majorId: string;
  midId: string;
  memo: string;
  tags: string[];
  excludeFromBudget: boolean;
  addFixedExpense: boolean;
  dateTime: Date;
};
