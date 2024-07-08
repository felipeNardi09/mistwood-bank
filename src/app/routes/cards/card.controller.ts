import { NextFunction, Request, Response, Router } from 'express';
import validateToken from '../../middlewares/auth';
import { getCardById, getCardsByAccountId, registerCard } from './card.service';

const router = Router();

router.post(
  '/cards/:accountId/registration',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await registerCard(
        req.params.accountId,
        req.user.id,
        req.body.type
      );
      res.status(201).json({ card });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/cards/card/:cardId',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await getCardById(req.params.cardId, req.user.id);
      return res.status(200).json(card);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/cards/:accountId/',
  validateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cards = await getCardsByAccountId(
        req.params.accountId,
        req.user.id
      );
      return res.status(201).json(cards);
    } catch (error) {
      next(error);
    }
  }
);
export default router;
