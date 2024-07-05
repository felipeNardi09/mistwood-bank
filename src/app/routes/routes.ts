import { Router } from 'express';
import authRouter from './auth/auth.controller';
import usersRouter from './users/users.controller';
import branchesRouter from './branch/branch.controller';
import accountsRouter from './account/account.controller';
import cardsRouter from './cards/card.controller';
import loansRouter from './loans/loan.controller';
import transactionsRouter from './transactions/transactions.controller';

const api = Router()
  .use(authRouter)
  .use(usersRouter)
  .use(branchesRouter)
  .use(accountsRouter)
  .use(cardsRouter)
  .use(loansRouter)
  .use(transactionsRouter);

export default Router().use('/api/v1', api);
