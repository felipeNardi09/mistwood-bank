import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import 'dotenv/config';
import AppError from './models/appError';
import routes from './routes/routes';
import { Prisma } from '@prisma/client';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  throw new AppError(`Route ${req.originalUrl} does not exist`, 404);
});

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong';

  let errorMessage = err.message;
  //Se existir mais de um campo unico ehbem provavel que va quebrar;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (Array.isArray(err.meta?.target))
      errorMessage = `${err.meta.target.at(0).at(0).toUpperCase().concat(err.meta.target.at(0).slice(1))} already exists.`;
  }

  return res.status(err.statusCode).json({
    err,
    message: errorMessage,
    ...(process.env.NODE_ENV === 'production' ? null : { stack: err.stack })
  });
});

app.listen(process.env.PORT, function () {
  // eslint-disable-next-line no-console
  console.log(`App is running on port ${process.env.PORT}`);
});
