import { Card } from '@prisma/client';
import { addYears } from 'date-fns';
import AppError from 'src/app/models/appError';
import prisma from 'src/prisma/prisma-client';

export const registerCard = async (
  accountId: string,
  userId: string,
  type: 'CREDIT' | 'DEBIT'
) => {
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
      userId
    },
    select: {
      id: true,
      cards: true
    }
  });
  if (!account) throw new AppError('Provide a valid account', 400);

  if (account.cards.length >= 2)
    throw new AppError('An account can not have more than 2 cards', 403);

  if (type !== 'CREDIT' && type !== 'DEBIT')
    throw new AppError('Type must be equal to CREDIT or DEBIT', 400);

  const cardNumber = `5000${Math.floor(Math.random() * 899999999999) + 100000000000}`;

  const cvv = Math.floor(Math.random() * 899) + 100;

  const card: Card = await prisma.card.create({
    data: {
      cardNumber,
      type,
      accountId,
      expirationDate: addYears(Date.now(), 2),
      cvv,
      userId
    }
  });

  return card;
};
export const getCardsByAccountId = async (
  accountId: string,
  userId: string
) => {
  const cards = await prisma.card.findMany({
    where: {
      accountId,
      userId
    }
  });

  return cards;
};

export const getCardById = async (cardId: string, userId: string) => {
  const card = await prisma.card.findUnique({ where: { id: cardId, userId } });

  if (!card) throw new AppError('There is no card with provided id', 404);

  return card;
};
