import { Request, Response, NextFunction } from 'express';
import prisma from 'src/prisma/prisma-client';
import AppError from '../models/appError';

export const roleRestriction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      }
    });

    if (!user) throw new AppError('Login to perform this action', 401);

    if (user.role !== 'ADMIN')
      throw new AppError(
        'You do not have permission to perform this action',
        403
      );

    next();
  } catch (error) {
    next(error);
  }
};
