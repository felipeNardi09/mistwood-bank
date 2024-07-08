import AppError from 'src/app/models/appError';
import { RegisterBranchInput } from './register-branch-input.model';
import prisma from 'src/prisma/prisma-client';

export const registerBranch = async (input: RegisterBranchInput) => {
  const name = input.name.trim();
  const address = input.address.trim();

  if (!name || !address)
    throw new AppError('Enter the branch name and address', 400);

  const branch = await prisma.branch.create({
    data: {
      name,
      address
    }
  });

  return branch;
};

export const getAllBranches = async () => {
  const branches = await prisma.branch.findMany();

  return branches;
};

export const getBranchById = async (id: string) => {
  const branch = await prisma.branch.findUnique({
    where: {
      id
    }
  });

  if (!branch) throw new AppError('There is no branch with provided id', 404);

  return branch;
};
