import { NextFunction, Request, Response } from 'express';
import * as monitorService from '../services/monitorService';

export async function createMonitor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const monitor = await monitorService.createMonitor(req.body);
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
    const monitors = await monitorService.getMonitors();
    res.json(monitors);
  } catch (err) {
    next(err);
  }
}

export async function getMonitor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id as string;
    const monitor = await monitorService.getMonitor(id);
    res.json(monitor);
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
    const id = req.params.id as string;
    const monitor = await monitorService.updateMonitor(id, req.body);
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
    const id = req.params.id as string;
    await monitorService.deleteMonitor(id);
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
    const id = req.params.id as string;
    const results = await monitorService.getMonitorResults(id);
    res.json(results);
  } catch (err) {
    next(err);
  }
}
