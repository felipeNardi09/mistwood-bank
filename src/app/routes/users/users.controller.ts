import { NextFunction, Request, Response, Router } from 'express';
import validateToken from '../../middlewares/auth';
import { getAllUsers, getUserById } from './users.service';
import { roleRestriction } from 'src/app/middlewares/roleVerification';

const router = Router();

router.get(
  '/users',
  validateToken,
  roleRestriction,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await getAllUsers(
        typeof req.query.offset === 'string' ? req.query.offset : undefined,
        typeof req.query.limit === 'string' ? req.query.limit : undefined,
        typeof req.query.name === 'string' ? req.query.name : undefined,
        typeof req.query.email === 'string' ? req.query.email : undefined
      );

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/users/:id',
  roleRestriction,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getUserById(req.params.id);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
