import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as userService from '../services/userService';

export const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await userService.register(req.body.email, req.body.password);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const token = await userService.login(req.body.email, req.body.password);
    res.json({ token });
  } catch (err) {
    next(err);
  }
}
