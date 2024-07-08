import { NextFunction, Request, Response, Router } from 'express';
import validateToken from '../../middlewares/auth';
import {
  getLoansByAccount,
  requestLoan,
  updateLoanStatus
} from './loan.service';

const router = Router();

router.post(
  '/loans/request/:accountId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loan = await requestLoan(
        req.params.accountId,
        req.user.id,
        req.body
      );

      res.status(201).json(loan);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/loans/:accountId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loans = await getLoansByAccount(
        req.params.accountId,
        req.user.id,
        req.query.status === 'PENDING' ||
          req.query.status === 'APPROVED' ||
          req.query.status === 'REJECTED'
          ? req.query.status
          : undefined,
        typeof req.query.offset === 'string' ? req.query.offset : undefined,
        typeof req.query.limit === 'string' ? req.query.limit : undefined
      );
      return res.status(200).json(loans);
    } catch (error) {
      next(error);
    }
  }
);
//this route can only be accessed by admins
router.patch(
  '/loans/:accountId/:loanId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loan = await updateLoanStatus(
        req.body.status,
        req.params.loanId,
        req.params.accountId,
        req.user.id
      );

      return res.status(200).json(loan);
    } catch (error) {
      next(error);
    }
  }
);
export default router;
