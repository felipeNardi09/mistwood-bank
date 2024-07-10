import { NextFunction, Request, Response, Router } from 'express';
import validateToken from '../../middlewares/auth';
import {
  deposit,
  getTransactionsByAccount,
  transfer,
  withdrawal
} from './transactions.service';

const router = Router();

router.post(
  '/transactions/deposit/:accountId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const { amount } = req.body;

    try {
      const depositInfo = await deposit(
        amount,
        req.params.accountId,
        req.user.id
      );

      return res.status(201).json(depositInfo);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/transactions/withdrawal/:accountId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const withdraw = await withdrawal(
        req.body.amount,
        req.params.accountId,
        req.user.id
      );

      return res.status(201).json(withdraw);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/transactions/transfer/:accountId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transference = await transfer(
        req.body.amount,
        req.params.accountId,
        req.user.id,
        req.body.destinationAccountId,
        req.body.description
      );

      return res.status(201).json(transference);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/transactions/:accountId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await getTransactionsByAccount(
        req.params.accountId,
        req.user.id
      );

      return res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  }
);
export default router;
