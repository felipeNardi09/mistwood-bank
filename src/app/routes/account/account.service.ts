import { Account } from '@prisma/client';
import AppError from 'src/app/models/appError';
import prisma from 'src/prisma/prisma-client';
import { RegisterAccountInput } from './register-account-input.model';
import { AccountValidation } from './validate-account';

const validateBeforeDelete = (account: AccountValidation) => {
  if (account.balance)
    throw new AppError('To delete your account the balance must be 0', 405);

  if (account.cards.length)
    throw new AppError(
      'You must deactivate your cards before deleting your account',
      405
    );
  if (account.loans.some(loan => loan.status === 'APPROVED'))
    throw new AppError(
      'Please settle your debt before deactivating your account',
      405
    );
};

export const getAllAccounts = async (
  offset: string | undefined,
  limit: string | undefined
) => {
  const accounts: Account[] = await prisma.account.findMany({
    select: {
      id: true,
      balance: true,
      type: true,
      userId: true,
      branchId: true,
      createdAt: true,
      updatedAt: true
    },
    skip: Number(offset) || 0,
    take: Number(limit) || 10
  });

  return accounts;
};

export const registerAccount = async (
  input: RegisterAccountInput,
  id: string
) => {
  const { type, branchId } = input;

  if (type !== 'CHECKING' && type !== 'SAVINGS')
    throw new AppError('Type must be equal to SAVINGS or CHECKING', 422);

  const branch = await prisma.branch.findUnique({
    where: { id: branchId }
  });

  if (!branch) throw new AppError('Provide a valid branch', 404);

  const userAccounts = await prisma.user.findUnique({
    where: {
      id
    },
    select: {
      accounts: true
    }
  });

  if (
    userAccounts &&
    type === 'CHECKING' &&
    userAccounts.accounts.some(account => account.type === 'CHECKING')
  )
    throw new AppError('Users can have only one checking account', 400);

  if (
    userAccounts &&
    type === 'SAVINGS' &&
    userAccounts.accounts.some(account => account.type === 'SAVINGS')
  )
    throw new AppError('Users can have only one savings account', 400);

  const account = await prisma.account.create({
    data: {
      balance: 0,
      type,
      userId: id,
      branchId: branch.id
    }
  });

  return account;
};

export const getLoggedUserAccounts = async (id: string) => {
  const accounts = await prisma.account.findMany({
    where: {
      userId: id
    }
  });

  return accounts;
};

export const getAccountByUserId = async (id: string) => {
  const accounts = await prisma.account.findMany({
    where: {
      userId: id
    }
  });

  return accounts;
};

export const deleteCurrentLoggedUserAccountByAccountId = async (
  userId: string,
  accountId: string
) => {
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
      userId
    },
    select: {
      id: true,
      balance: true,
      loans: true,
      cards: true
    }
  });

  if (!account)
    throw new AppError(
      'You can not perform this action, provide a valid account id',
      403
    );

  validateBeforeDelete(account);

  await prisma.account.delete({
    where: {
      id: account.id
    }
  });
};

export const deleteAccountById = async (id: string) => {
  const account = await prisma.account.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      balance: true,
      cards: true,
      loans: true
    }
  });

  if (!account) throw new AppError('There ir no account with provided id', 404);

  validateBeforeDelete(account);

  await prisma.account.delete({
    where: {
      id: account.id
    }
  });
};
