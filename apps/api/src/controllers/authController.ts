import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await authService.register(req.body.email, req.body.password);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const token = await authService.login(req.body.email, req.body.password);
    res.json({ token });
  } catch (err) {
    next(err);
  }
}
