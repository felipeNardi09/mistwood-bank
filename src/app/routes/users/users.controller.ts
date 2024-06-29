import { NextFunction, Request, Response, Router } from 'express';
import AppError from 'src/app/models/appError';
import catchAsyncErrors from 'src/utils/catchAsyncErrors';
import prisma from 'src/prisma/prisma-client';
import validateToken from '../../middlewares/auth';
import { User } from '@prisma/client';

const router = Router();

router.get(
  '/users',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const users: User[] = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const userData = users.map(user => {
      return { ...user, password: undefined };
    });

    res.status(200).json({ total: users.length, users: userData });
  })
);

router.get(
  '/users/:id',
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const user: User | null = await prisma.user.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!user)
      return next(new AppError('There is no user with the provided id', 404));

    const displayedUser = { ...user, password: undefined };

    return res.status(200).json({ user: displayedUser });
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
