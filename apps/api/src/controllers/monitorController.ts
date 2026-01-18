import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as monitorService from '../services/monitorService';
import { monitorSchema } from '../validators/monitor';

export async function createMonitor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.userId;
    const monitor = await monitorService.createMonitor(userId, req.body);
    res.status(201).json(monitor);
  } catch (err) {
    next(err);
  }
}

export async function getMonitors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.userId;
    const monitors = await monitorService.getMonitors(userId);
    res.json(monitors);
  } catch (err) {
    next(err);
  }
}

export async function updateMonitor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const monitor = await monitorService.updateMonitor(userId, id, req.body);
    res.json(monitor);
  } catch (err) {
    next(err);
  }
}

export async function deleteMonitor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    await monitorService.deleteMonitor(userId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getMonitorResults(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const results = await monitorService.getMonitorResults(userId, id);
    res.json(results);
  } catch (err) {
    next(err);
  }
}
