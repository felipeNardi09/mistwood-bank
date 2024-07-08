import { NextFunction, Request, Response, Router } from 'express';
import catchAsyncErrors from 'src/utils/catchAsyncErrors';
import validateToken from '../../middlewares/auth';
import {
  getAllBranches,
  getBranchById,
  registerBranch
} from './branch.service';

const router = Router();

router.post(
  '/branch/registration',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branch = await registerBranch(req.body);
      return res.status(201).json(branch);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/branch/all-branches',
  validateToken,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branches = await getAllBranches();

      res.status(200).json(branches);
    } catch (error) {
      next(error);
    }
  })
);

router.get(
  '/branch/:id',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branch = await getBranchById(req.params.id);
      res.status(200).json(branch);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
