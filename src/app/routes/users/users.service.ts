import { User } from '@prisma/client';
import AppError from 'src/app/models/appError';
import prisma from 'src/prisma/prisma-client';

export const getAllUsers = async (
  offset: string | undefined,
  limit: string | undefined,
  name: string | undefined,
  email: string | undefined
) => {
  const users: User[] = await prisma.user.findMany({
    where: {
      isActive: true,
      name: {
        contains: name,
        mode: 'insensitive'
      },
      email: {
        equals: email
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip: Number(offset) || 0,
    take: Number(limit) || 10
  });

  const userData = users.map(user => {
    return { ...user, password: undefined };
  });
  return userData;
};

export const getUserById = async (id: string) => {
  const user: User | null = await prisma.user.findUnique({
    where: {
      id
    }
  });

  if (!user) throw new AppError('There is no user with provided id', 404);

  return { ...user, password: undefined };
};
