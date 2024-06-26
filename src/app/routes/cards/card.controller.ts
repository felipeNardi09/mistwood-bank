import { Request, Response, NextFunction, Router } from 'express';
import AppError from 'src/app/models/appError';
import catchAsyncErrors from 'src/utils/catchAsyncErrors';
import prisma from 'src/prisma/prisma-client';
import validateToken from '../../middlewares/auth';
import { addYears } from 'date-fns';
import { Card } from '@prisma/client';

const router = Router();

router.post(
  '/cards/:accountId/registration',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const account = await prisma.account.findUnique({
      where: {
        id: req.params.accountId,
        userId: req.user.id
      },
      select: {
        id: true,
        accountId: true,
        cards: true
      }
    });
    if (!account) return next(new AppError('Provide a valid account', 400));

    if (account.cards.length >= 2)
      return next(
        new AppError('An account can not have more than 2 cards', 403)
      );

    if (req.body.type !== 'CREDIT' && req.body.type !== 'DEBIT')
      return next(new AppError('Type must be equal to CREDIT or DEBIT', 400));

    const cardNumber = `5000${Math.floor(Math.random() * 899999999999) + 100000000000}`;
    const cvv = Math.floor(Math.random() * 899) + 100;

    const card: Card = await prisma.card.create({
      data: {
        cardNumber,
        type: req.body.type,
        expirationDate: addYears(Date.now(), 2),
        cvv,
        accountId: account.id
      }
    });
    res.status(201).json({ card });
  })
);

export default router;
