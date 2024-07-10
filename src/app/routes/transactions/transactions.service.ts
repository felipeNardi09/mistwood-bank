import { Account, PrismaClient, Transaction } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import AppError from 'src/app/models/appError';
import prisma from 'src/prisma/prisma-client';

const verifyTransactionAmount = (amount: number) => {
  if (typeof amount !== 'number' || amount <= 0)
    throw new AppError('Enter a number greater than 0', 422);
};

const verifyAccountExistance = async (
  instance: Omit<
    PrismaClient<never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  accountId: string,
  userId: string | undefined
) => {
  const account: Account | null = await instance.account.findUnique({
    where: {
      id: accountId,
      userId
    }
  });

  if (!account) throw new AppError('There is no account with provided id', 404);

  return account;
};

const generateTransaction = async (
  amount: number,
  accountId: string,
  userId: string,
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'
) => {
  return await prisma.transaction.create({
    data: {
      amount,
      accountId: accountId,
      userId,
      type
    }
  });
};

export const deposit = async (
  amount: number,
  accountId: string,
  userId: string
) => {
  verifyTransactionAmount(amount);

  const account = await verifyAccountExistance(prisma, accountId, userId);

  const updatedAccount = await prisma.account.update({
    where: {
      id: account.id,
      userId: account.userId
    },
    data: {
      balance: {
        increment: amount
      }
    }
  });

  const deposit = await generateTransaction(
    amount,
    account.id,
    account.userId,
    'DEPOSIT'
  );

  const accountInfo = {
    ...updatedAccount,
    balanceBeforeTransaction: account.balance
  };

  return { deposit, account: accountInfo };
};

export const withdrawal = async (
  amount: number,
  accountId: string,
  userId: string
) => {
  verifyTransactionAmount(amount);

  const account = await verifyAccountExistance(prisma, accountId, userId);

  if (amount > account.balance) throw new AppError('Insufficient funds', 400);

  const updatedAccount = await prisma.account.update({
    where: {
      id: account.id,
      userId: account.userId
    },
    data: {
      balance: {
        decrement: amount
      }
    }
  });

  const withdrawal = await generateTransaction(
    amount,
    accountId,
    userId,
    'WITHDRAWAL'
  );

  const accountInfo = {
    ...updatedAccount,
    balanceBeforeTransaction: account.balance
  };

  return { withdrawal, account: accountInfo };
};

export const transfer = async (
  amount: number,
  fromAccountId: string,
  userId: string,
  destinationAccountId: string,
  description: string | undefined
) => {
  const formattedDescription = description
    ? description.slice(0, 200)
    : undefined;

  return await prisma.$transaction(async instance => {
    const fromAccount = await verifyAccountExistance(
      instance,
      fromAccountId,
      userId
    );

    if (amount > fromAccount.balance)
      throw new AppError('Insufficient funds', 400);

    const destinationAccount = await verifyAccountExistance(
      instance,
      destinationAccountId,
      undefined
    );

    const fromAccountUpdated = await instance.account.update({
      where: {
        id: fromAccount.id
      },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    const destinationAccountUpdated = await instance.account.update({
      where: {
        id: destinationAccount.id
      },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    const transfer: Transaction = await instance.transaction.create({
      data: {
        amount,
        type: 'TRANSFER',
        description: formattedDescription,
        accountId: fromAccount.id,
        destinationAccountId: destinationAccount.id,
        userId: fromAccount.userId
      }
    });

    return { transfer, fromAccountUpdated, destinationAccountUpdated };
  });
};

export const getTransactionsByAccount = async (
  accountId: string,
  userId: string
) => {
  const transactions: Transaction[] = await prisma.transaction.findMany({
    where: {
      accountId,
      userId
    }
  });
  return transactions;
};
