import { Router } from 'express';
import * as monitorController from '../controllers/monitorController';
import { validate } from '../middlewares/validate';
import { monitorSchema } from '../validators/monitor';

const router = Router();

// Public routes - no authentication required
router.get('/', monitorController.getMonitors);
router.post('/', validate(monitorSchema), monitorController.createMonitor);
router.get('/:id', monitorController.getMonitor);
router.patch(
  '/:id',
  validate(monitorSchema.partial()),
  monitorController.updateMonitor
);
router.delete('/:id', monitorController.deleteMonitor);
router.get('/:id/results', monitorController.getMonitorResults);

export default router;
