import { CardType } from '@prisma/client';

export interface Card {
  id: string;
  cardNumber: number;
  type: CardType;
  expirationDate: Date;
  cvv: number;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}
