// stateEvaluator.ts
import { prisma } from './db';

export async function evaluateState(
  monitorId: string,
  currentStatus: 'UP' | 'DOWN'
) {
  const lastCheck = await prisma.checkResult.findFirst({
    where: { monitorId },
    orderBy: { checkedAt: 'desc' },
    skip: 1,
  });
  if (!lastCheck) return 'NO_PREVIOUS';
  if (lastCheck.status === currentStatus) return 'NO_CHANGE';
  return 'STATE_CHANGED';
}
