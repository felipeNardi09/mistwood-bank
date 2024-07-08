import { NextFunction, Request, Response, Router } from 'express';
import catchAsyncErrors from 'src/utils/catchAsyncErrors';
import validateToken from '../../middlewares/auth';
import {
  deleteAccountById,
  deleteCurrentLoggedUserAccountByAccountId,
  getAccountByUserId,
  getAllAccounts,
  getLoggedUserAccounts,
  registerAccount
} from './account.service';

const router = Router();

router.post(
  '/account/registration',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await registerAccount(req.body, req.user.id);
      return res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  }
);
//only admins can reach this route
router.get(
  '/account',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const accounts = await getAllAccounts(
      typeof req.query.offset === 'string' ? req.query.offset : undefined,
      typeof req.query.limit === 'string' ? req.query.limit : undefined
    );

    return res.status(200).json(accounts);
  })
);
router.get(
  '/account/current-user-accounts',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accounts = await getLoggedUserAccounts(req.user.id);

      return res.status(200).json(accounts);
    } catch (error) {
      next(error);
    }
  }
);

//only admins can reach this route
router.get(
  '/account/:userId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accounts = await getAccountByUserId(req.params.userId);

      return res.status(200).json(accounts);
    } catch (error) {
      next(error);
    }
  }
);

//loans must be inactive for users to delete their account;
router.delete(
  '/account/delete/user-account/:accountId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteCurrentLoggedUserAccountByAccountId(
        req.user.id,
        req.params.accountId
      );

      return res.status(204).json();
    } catch (error) {
      next(error);
    }
  }
);
//only admins can reach this route;
router.delete(
  '/account/delete/:id',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteAccountById(req.params.id);
      return res.status(204).json();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
