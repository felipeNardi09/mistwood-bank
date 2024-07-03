import { NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { parseISO } from 'date-fns';
import AppError from 'src/app/models/appError';
import prisma from 'src/prisma/prisma-client';
import generateToken from './token.utils';
import { RegisterInput } from './register-input.model';
import { User } from '@prisma/client';
import { LoginInput } from './login-input.model';

const checkEmailUniqueness = async (email: string) => {
  const existingEmail = await prisma.user.findUnique({
    where: { email }
  });

  if (existingEmail) throw new AppError('Email already in use', 422);
};

export const createUser = async (input: RegisterInput, next: NextFunction) => {
  const name = input.name.trim();
  const email = input.email.trim();
  const password = input.password.trim();
  const { confirmPassword, dateOfBirth } = input;

  if (!name) throw new AppError('Enter your name', 422);

  if (!email) throw new AppError('Enter your email', 422);

  if (!password) throw new AppError('Enter your password', 422);

  if (!dateOfBirth) throw new AppError('Enter your date of birth', 422);

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$/.test(password))
    throw new AppError(
      'Password must contain from 8 to 12 chacacters, at least an uppercase letter, a lowercase and a number.',
      400
    );

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth))
    return next(new AppError('Date must be yyyy-mm-dd', 400));

  await checkEmailUniqueness(email);

  if (password !== confirmPassword)
    return next(new AppError('Passwords must match', 400));

  const formatedDate = parseISO(dateOfBirth);

  const hashedPass = await bcrypt.hash(password, 12);

  const user: User = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPass,
      dateOfBirth: formatedDate
    }
  });

  const token = generateToken(user.id);

  const displayedUser = { ...user, password: undefined };
  return { user: displayedUser, token };
};

export const login = async (userPayload: LoginInput) => {
  const email = userPayload.email.trim();
  const password = userPayload.password.trim();

  const user: User | null = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (user) {
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = generateToken(user.id);

      const displayedUser = { ...user, password: undefined };

      return { user: displayedUser, token };
    }
  }

  throw new AppError('Email or password is invalid', 403);
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  const displayedUser = { ...user, password: undefined };

  return displayedUser;
};
