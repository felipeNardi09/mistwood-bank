import { LoanStatus } from '@prisma/client';

export interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  status: LoanStatus;
  accountId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
