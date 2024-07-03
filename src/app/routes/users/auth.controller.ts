import { NextFunction, Request, Response, Router } from 'express';
import { createUser, getCurrentUser, login } from './auth.service';
import validateToken from 'src/app/middlewares/auth';

const router = Router();

router.post(
  '/users/signup',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await createUser(req.body, next);

      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/users/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await login(req.body);

      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/users/current-user',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getCurrentUser(req.user.id);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
