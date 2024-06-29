import { CardType } from '@prisma/client';

export interface Card {
  id: string;
  cardNumber: string;
  type: CardType;
  expirationDate: Date;
  cvv: number;
  accountId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
