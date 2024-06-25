/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

const catchAsyncErrors =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
export default catchAsyncErrors;
