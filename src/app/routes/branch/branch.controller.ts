import { Request, Response, NextFunction, Router } from 'express';
import AppError from 'src/app/models/appError';
import catchAsyncErrors from 'src/utils/catchAsyncErrors';
import prisma from 'src/prisma/prisma-client';
import validateToken from '../../middlewares/auth';

const router = Router();

router.post(
  '/branch/registration',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const name = req.body.name.trim();
    const address = req.body.address.trim();

    if (!name || !address)
      return next(new AppError('Enter the branch name and address', 400));

    const branch = await prisma.branch.create({
      data: {
        name,
        address
      }
    });

    return res.status(201).json({ branch });
  })
);

router.get(
  '/branch/all-branches',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const branches = await prisma.branch.findMany();

    res.status(200).json({ total: branches.length, branches });
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
