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
    const numberOfAccounts = await prisma.account.count({
      where: { userId: req.user.id }
    });

    if (numberOfAccounts > 2)
      return next(new AppError('Users can have a maximum of 3 accounts', 400));

    const branch = await prisma.branch.findUnique({
      where: { id: req.body.branchId }
    });

    if (!branch) return next(new AppError('Provide a valid branch', 404));

    if (req.body.type !== 'CHECKING' && req.body.type !== 'SAVINGS')
      return next(
        new AppError('Type must be equal to SAVINGS or CHECKING', 400)
      );
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

router.get(
  '/acoount/all-accounts',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await prisma.account.findMany();

    res.status(200).json(accounts);
  })
);

router.get(
  '/branch/:id',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const branch = await prisma.branch.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!branch)
      return next(new AppError('There is no branch with provided id', 404));

    res.status(200).json(branch);
  })
);

export default router;
