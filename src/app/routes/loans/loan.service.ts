import { Loan } from '@prisma/client';
import AppError from 'src/app/models/appError';
import prisma from 'src/prisma/prisma-client';

interface RequestLoanInput {
  amount: number;
  interestRate: number;
}

export const requestLoan = async (
  accountId: string,
  userId: string,
  input: RequestLoanInput
) => {
  const { amount, interestRate } = input;

  if (!amount || !interestRate)
    throw new AppError('Provide the amount and the interest rate', 400);

  if (typeof amount !== 'number' || typeof interestRate !== 'number')
    throw new AppError('The amount and interest rate must be numbers', 400);

  if (interestRate < 0 || interestRate > 5)
    throw new AppError(
      'The intereset rate must be a decimal between 0 and 5',
      400
    );

  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
      userId
    },
    select: {
      id: true,
      userId: true,
      loans: true
    }
  });

  if (!account) throw new AppError('Provide a valid account', 404);

  const isInvalidRequest = account.loans.some(
    loan => loan.status === 'PENDING'
  );

  if (isInvalidRequest)
    throw new AppError(
      'You already have a pending loan, wait for the answer',
      422
    );

  const loan: Loan = await prisma.loan.create({
    data: {
      amount,
      interestRate,
      status: 'PENDING',
      accountId: account.id,
      userId: account.userId
    }
  });
  return loan;
};

export const getLoansByAccount = async (
  accountId: string,
  userId: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
  offset: string | undefined,
  limit: string | undefined
) => {
  if (
    status !== 'PENDING' &&
    status !== 'APPROVED' &&
    status !== 'REJECTED' &&
    undefined
  )
    throw new AppError('Status must be PENDING, APPROVED or REJECTED', 422);

  const loans: Loan[] = await prisma.loan.findMany({
    where: {
      accountId,
      userId,
      status: status || undefined
    },
    skip: Number(offset) || 0,
    take: Number(limit) || 5
  });

  return loans;
};

export const updateLoanStatus = async (
  status: 'APPROVED' | 'REJECTED',
  loanId: string,
  accountId: string,
  userId: string
) => {
  if (status !== 'APPROVED' && status !== 'REJECTED')
    throw new AppError('To update the loan enter APPROVED or REJECTED', 400);

  const account = await prisma.account.findUnique({
    where: {
      id: accountId
    },
    select: {
      id: true,
      loans: true
    }
  });

  if (!account) throw new AppError('There is account with provided id', 404);

  const loan = account.loans.find(loan => loan.id === loanId);

  if (!loan) throw new AppError('There is no loan with provided id', 404);

  if (loan.status === 'APPROVED' || loan.status === 'REJECTED')
    throw new AppError('Loan status is up to date', 403);

  const updatedLoan = await prisma.loan.update({
    where: {
      id: loanId,
      accountId,
      userId
    },
    data: {
      status
    }
  });

  await prisma.account.update({
    where: {
      id: accountId,
      userId
    },
    data: {
      balance: {
        increment: status === 'APPROVED' ? loan.amount : 0
      }
    }
  });

  return updatedLoan;
};
