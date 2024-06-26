import { Request, Response, NextFunction, Router } from 'express';
import AppError from 'src/app/models/appError';
import catchAsyncErrors from 'src/utils/catchAsyncErrors';
import prisma from 'src/prisma/prisma-client';
import validateToken from '../../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post(
  '/account/registration',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.type !== 'CHECKING' && req.body.type !== 'SAVINGS')
      return next(
        new AppError('Type must be equal to SAVINGS or CHECKING', 400)
      );

    const branch = await prisma.branch.findUnique({
      where: { id: req.body.branchId }
    });

    if (!branch) return next(new AppError('Provide a valid branch', 404));

    const userAccounts = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        accounts: true
      }
    });

    if (userAccounts && userAccounts.accounts.length >= 2)
      return next(
        new AppError('You already own the maximum number of accounts', 400)
      );

    if (
      userAccounts &&
      req.body.type === 'CHECKING' &&
      userAccounts.accounts.some(account => account.type === 'CHECKING')
    )
      return next(
        new AppError('Users can have only one checking account', 400)
      );

    if (
      userAccounts &&
      req.body.type === 'SAVINGS' &&
      userAccounts.accounts.some(account => account.type === 'SAVINGS')
    )
      return next(new AppError('Users can have only one savings account', 400));

    const formattedAccountId = uuidv4().slice(0, 13).replace('-', '');

    const account = await prisma.account.create({
      data: {
        accountId: formattedAccountId,
        balance: 0,
        type: req.body.type,
        userId: req.user.id,
        branchId: branch.id
      }
    });

    return res.status(201).json({ account: account });
  })
);
//only admins can reach this route
router.get(
  '/account/all-accounts',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    //filter by user
    const accounts = await prisma.account.findMany();

    return res.status(200).json({ total: accounts.length, accounts });
  })
);

//find acc by id, only admins can reach this route
router.get(
  '/account/user/:id',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await prisma.account.findMany({
      where: {
        userId: req.params.id
      }
    });

    return res.status(200).json({ accounts });
  })
);

router.get(
  '/account/current-user-accounts',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await prisma.account.findMany({
      where: {
        userId: req.user.id
      }
    });

    return res.status(200).json({ total: accounts.length, accounts });
  })
);
//loans must be inactive for users to delete their account;
router.delete(
  '/account/delete/user-account/:accountId',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await prisma.account.findMany({
      where: {
        userId: req.user.id
      },
      select: {
        id: true
      }
    });

    if (!accounts.some(account => account.id === req.params.accountId))
      return next(
        new AppError('You can not perform this action, enter a valid id', 403)
      );

    const account = await prisma.account.findUnique({
      where: {
        id: req.params.accountId
      },
      select: {
        balance: true,
        cards: true
      }
    });

    if (account && account.balance)
      return next(
        new AppError('Your balance must be $0 to delete your account', 403)
      );

    if (account && account.cards.length !== 0)
      return next(new AppError('You still have active cards', 403));

    await prisma.account.delete({
      where: {
        id: req.params.accountId
      }
    });

    return res.status(204).json();
  })
);
//only admins can reach this route;
router.delete(
  '/account/delete/:id',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const account = await prisma.account.findUnique({
      where: {
        id: req.params.id
      },
      select: {
        id: true,
        balance: true,
        cards: true
      }
    });

    if (!account)
      return next(new AppError('There is no account with provided id', 404));

    if (account.balance !== 0)
      return next(new AppError('Balance must be 0 to delete an account', 400));

    if (account.cards.length)
      return next(
        new AppError(
          'To delete an account you can not have cards registered',
          400
        )
      );

    await prisma.account.delete({
      where: {
        id: account.id
      }
    });

    return res.status(204).json();
  })
);

export default router;
