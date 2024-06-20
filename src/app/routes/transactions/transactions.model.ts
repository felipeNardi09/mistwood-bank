import { TransactionType } from '@prisma/client';

export interface Transactions {
  id: string;
  amount: number;
  type: TransactionType;
  date: Date;
  description?: string;
  accountId: string;
  destinationAccount: string;
  createdAt: Date;
  updatedAt: Date;
}
