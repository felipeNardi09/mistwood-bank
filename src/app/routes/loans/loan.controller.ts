import { Request, Response, NextFunction, Router } from 'express';
import AppError from 'src/app/models/appError';
import catchAsyncErrors from 'src/utils/catchAsyncErrors';
import prisma from 'src/prisma/prisma-client';
import validateToken from '../../middlewares/auth';
import { Account, Loan } from '@prisma/client';

const router = Router();

router.post(
  '/loans/request/:accountId',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { amount, interestRate } = req.body;

    if (!amount || !interestRate)
      return next(
        new AppError('Provide the amount and the interest rate', 400)
      );

    const account: Account | null = await prisma.account.findUnique({
      where: {
        id: req.params.accountId,
        userId: req.user.id
      }
    });

    if (!account) return next(new AppError('Provide a valid account', 404));

    if (typeof amount !== 'number' || typeof interestRate !== 'number')
      return next(
        new AppError('The amount and interest rate must be numbers', 400)
      );

    if (interestRate < 0 || interestRate > 5)
      return next(
        new AppError(
          'The intereset rate must be a decimal between 0 and 5',
          400
        )
      );

    const loan: Loan = await prisma.loan.create({
      data: {
        amount,
        interestRate,
        status: 'PENDING',
        accountId: req.params.accountId,
        userId: req.user.id
      }
    });

    res.status(201).json({ loan });
  })
);
//filter and sort loans
router.get(
  '/loans/:accountId',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const loans: Loan[] = await prisma.loan.findMany({
      where: {
        accountId: req.params.accountId,
        userId: req.user.id
      }
    });

    return res.status(200).json({ loans });
  })
);
//this route can only be accessed by admins
router.patch(
  '/loans/:accountId/:loanId',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

    if (status !== 'APPROVED' && status !== 'REJECTED')
      return next(
        new AppError('To update the loan enter APPROVED or REJECTED', 400)
      );

    let loan: Loan | null = await prisma.loan.findUnique({
      where: {
        id: req.params.loanId
      }
    });

    if (!loan)
      return next(new AppError('There is no loan with provided id', 404));

    if (loan.status === 'APPROVED' || loan.status === 'REJECTED')
      return next(new AppError('Loan status is up to date', 403));

    loan = await prisma.loan.update({
      where: {
        id: req.params.loanId,
        accountId: req.params.accountId,
        userId: req.user.id
      },
      data: {
        status
      }
    });

    if (loan.status === 'APPROVED') {
      const account: Account | null = await prisma.account.findUnique({
        where: {
          id: req.params.accountId
        }
      });

      if (account) {
        const newBalance = (account.balance += loan.amount);

        await prisma.account.update({
          where: {
            id: account.id
          },
          data: {
            balance: newBalance
          }
        });

        return res.status(200).json({ loan, account });
      }
    }

    return res.status(200).json({ loan });
  })
);
export default router;
