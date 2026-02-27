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
  dateTimeISO: string;
};

export type AddTxPayload = {
  txType: CategoryType;
  amount: number;
  merchant: string;
  paymentMethod: string;
  categoryPath: string;
  majorId: string;
  midId: string;
  memo: string;
  tags: string[];
  excludeFromBudget: boolean;
  addFixedExpense: boolean;
  dateTimeISO: string;
};
