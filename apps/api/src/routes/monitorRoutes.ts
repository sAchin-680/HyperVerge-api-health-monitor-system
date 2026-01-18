import { Router } from 'express';
import * as monitorController from '../controllers/monitorController';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { monitorSchema } from '../validators/monitor';

const router = Router();

router.use(authMiddleware);
router.get('/', monitorController.getMonitors);
router.post('/', validate(monitorSchema), monitorController.createMonitor);
router.patch(
  '/:id',
  validate(monitorSchema.partial()),
  monitorController.updateMonitor
);
router.delete('/:id', monitorController.deleteMonitor);
router.get('/:id/results', monitorController.getMonitorResults);

export default router;
