import { Request, Response, NextFunction, Router } from 'express';
import AppError from 'src/app/models/appError';
import catchAsyncErrors from 'src/utils/catchAsyncErrors';
import prisma from 'src/prisma/prisma-client';
import validateToken from '../../middlewares/auth';
import { Account, Transaction } from '@prisma/client';

const router = Router();

router.post(
  '/transactions/deposit/:accountId',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0)
      return next(new AppError('Enter a number greater than 0', 400));

    const account: Account | null = await prisma.account.findUnique({
      where: {
        id: req.params.accountId,
        userId: req.user.id
      }
    });

    if (!account)
      return next(new AppError('There is no account with provided id', 404));

    const newBalance = (account.balance += amount);

    await prisma.account.update({
      where: {
        id: account.id,
        userId: req.user.id
      },
      data: {
        balance: newBalance
      }
    });

    const deposit: Transaction = await prisma.transaction.create({
      data: {
        amount,
        accountId: account.id,
        userId: req.user.id,
        type: 'DEPOSIT'
      }
    });

    return res.status(201).json({ deposit, account });
  })
);

router.post(
  '/transactions/withdrawal/:accountId',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0)
      return next(new AppError('Enter a number greater than 0', 400));

    const account: Account | null = await prisma.account.findUnique({
      where: {
        id: req.params.accountId,
        userId: req.user.id
      }
    });

    if (!account)
      return next(new AppError('There is no account with provided id', 404));

    if (account.balance < amount)
      return next(new AppError('Insufficient funds', 400));

    const newBalance = (account.balance -= amount);

    await prisma.account.update({
      where: {
        id: account.id,
        userId: req.user.id
      },
      data: {
        balance: newBalance
      }
    });

    const withdrawal: Transaction = await prisma.transaction.create({
      data: {
        amount,
        accountId: account.id,
        userId: req.user.id,
        type: 'WITHDRAWAL'
      }
    });

    return res.status(201).json({ withdrawal, account });
  })
);

router.post(
  '/transactions/withdrawal',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({});
  })
);

router.get(
  '/transactions/:accountId',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const transactions: Transaction[] = await prisma.transaction.findMany({
      where: {
        accountId: req.params.accountId,
        userId: req.user.id
      }
    });

    return res.status(200).json({ transactions });
  })
);
export default router;
