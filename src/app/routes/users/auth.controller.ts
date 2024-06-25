import bcrypt from 'bcrypt';
import { parseISO } from 'date-fns';
import { NextFunction, Request, Response, Router } from 'express';
import AppError from 'src/app/models/appError';
import catchAsyncErrors from 'src/app/utils/catchAsyncErrors';
import prisma from 'src/prisma/prisma-client';
import generateToken from './token.utils';

const router = Router();

router.post(
  '/users/signup',
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { password, confirmPassword, dateOfBirth } = req.body;

    const name = req.body.name.trim();
    const email = req.body.email.trim();

    if (!name || !email || !password || !confirmPassword || !dateOfBirth)
      return next(new AppError('Fill all the fields', 400));

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$/.test(password))
      return next(
        new AppError(
          'Your password must contain from 8 to 12 chacacters, at least an uppercase letter, a lowercase and a number.',
          400
        )
      );

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth))
      return next(new AppError('Date must be yyyy-mm-dd', 400));

    if (password !== confirmPassword)
      return next(new AppError('Passwords must match', 400));

    const formatedDate = parseISO(dateOfBirth);

    const hashedPass = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPass, dateOfBirth: formatedDate },
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
        dateOfBirth: true
      }
    });

    const token = generateToken(user.id);

    return res.status(201).json({ user, token });
  })
);

router.post(
  '/users/login',
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email || !req.body.password)
      return next(
        new AppError('You must provide your e-mail and password', 400)
      );

    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email
      }
    });

    if (!user || !(await bcrypt.compare(req.body.password, user?.password)))
      return next(new AppError('Invalid e-mail and/or password', 404));

    const displayedUser = { ...user, password: undefined };

    const token = generateToken(user.id);

    return res.status(201).json({ user: displayedUser, token });
  })
);

export default router;
