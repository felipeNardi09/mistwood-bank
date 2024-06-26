import { Router } from 'express';
import authRouter from './users/auth.controller';
import usersRouter from './users/users.controller';
import branchesRouter from './branch/branch.controller';
import accountsRouter from './account/account.controller';
import cardsRouter from './cards/card.controller';

const api = Router()
  .use(authRouter)
  .use(usersRouter)
  .use(branchesRouter)
  .use(accountsRouter)
  .use(cardsRouter);

export default Router().use('/api/v1', api);
