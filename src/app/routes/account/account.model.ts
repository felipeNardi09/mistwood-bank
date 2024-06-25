import { AccountType, Transaction } from '@prisma/client';
import { Loan } from '../loans/loan.models';
import { Card } from '../cards/card.model';

export interface Account {
  id: string;
  accountId: string;
  balance: number;
  type: AccountType;
  userId: string;
  branchId: string;
  transferFromAccount: Transaction[];
  transferToAccount: Transaction[];
  loans: Loan[];
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}
