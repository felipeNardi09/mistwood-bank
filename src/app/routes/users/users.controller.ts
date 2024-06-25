import { NextFunction, Request, Response, Router } from 'express';
import AppError from 'src/app/models/appError';
import catchAsyncErrors from 'src/app/utils/catchAsyncErrors';
import prisma from 'src/prisma/prisma-client';
import validateToken from './auth';

const router = Router();

router.get(
  '/users',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const userData = users.map(user => {
      return { ...user, password: undefined };
    });

    res.status(200).json({ userData });
  })
);

router.get(
  '/users/:id',
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            id: true,
            accountNumber: true,
            balance: true
          }
        }
      }
    });

    if (!user)
      return next(new AppError('There is no user with the provided id', 404));

    return res.status(200).json({ user });
  })
);

//remove later
router.delete(
  '/users/delete',
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    await prisma.user.deleteMany();

    return res.status(203).json({ message: 'You deleted all the users' });
  })
);

export default router;
