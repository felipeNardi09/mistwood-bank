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

    const updatedAccount = await prisma.account.update({
      where: {
        id: account.id,
        userId: req.user.id
      },
      data: {
        balance: {
          increment: amount
        }
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

    return res.status(201).json({
      deposit,
      account: {
        ...updatedAccount,
        balanceBeforeTransaction: account.balance
      }
    });
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

    if (amount > account.balance)
      return next(new AppError('Insufficient funds', 400));

    const updatedAccount = await prisma.account.update({
      where: {
        id: account.id,
        userId: req.user.id
      },
      data: {
        balance: {
          decrement: amount
        }
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

    return res.status(201).json({
      withdrawal,
      account: {
        ...updatedAccount,
        balanceBeforeTransaction: account.balance
      }
    });
  })
);

router.post(
  '/transactions/withdrawal',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({});
  })
);
router.patch(
  '/transactions/transfer/:accountId',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { amount, destinationAccountId, description } = req.body;

    const formattedDescription = description.slice(0, 200);

    try {
      await prisma.$transaction(async instance => {
        const fromAccount = await instance.account.findUnique({
          where: {
            id: req.params.accountId,
            userId: req.user.id
          }
        });

        if (!fromAccount)
          return next(
            new AppError(
              'Origin account does not exist, provide a valid one',
              404
            )
          );

        if (amount > fromAccount.balance)
          return next(new AppError('Insufficient funds', 400));

        const destinationAccountUpdated = await instance.account.update({
          data: {
            balance: {
              increment: amount
            }
          },
          where: {
            id: destinationAccountId
          }
        });

        if (!destinationAccountUpdated)
          return next(
            new AppError(
              'Destination account id does not existe, provide a valid one',
              404
            )
          );

        const fromAccountUpdated = await instance.account.update({
          where: {
            id: fromAccount.id
          },
          data: {
            balance: {
              decrement: amount
            }
          }
        });

        const transfer: Transaction = await instance.transaction.create({
          data: {
            amount,
            destinationAccountId,
            description: formattedDescription,
            userId: req.user.id,
            type: 'TRANSFER',
            accountId: req.params.accountId
          }
        });

        return res.status(200).json({
          transfer,
          from: fromAccountUpdated,
          destination: destinationAccountUpdated
        });
      });
    } catch (error) {
      return next(new AppError('Invalid account id', 404));
    }
  })
);

//only admins can have access:
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
