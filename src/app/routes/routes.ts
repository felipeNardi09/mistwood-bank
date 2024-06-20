import { Router } from 'express';
import authRouter from './users/auth.controller';

const api = Router().use(authRouter);

export default Router().use('/api/v1', api);
