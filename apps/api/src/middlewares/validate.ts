import { z, ZodError } from 'zod';
import { NextFunction, Request, Response } from 'express';

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ error: err.issues });
      }
      next(err);
    }
  };
}
