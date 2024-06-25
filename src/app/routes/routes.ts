import { Router } from 'express';
import authRouter from './users/auth.controller';
import usersRouter from './users/users.controller';
import branchRouter from './branch/branch.controller';

const api = Router().use(authRouter).use(usersRouter).use(branchRouter);

export default Router().use('/api/v1', api);
