import { Card, Loan } from '@prisma/client';

export interface AccountValidation {
  id: string;
  balance: number;
  cards: Card[];
  loans: Loan[];
}
