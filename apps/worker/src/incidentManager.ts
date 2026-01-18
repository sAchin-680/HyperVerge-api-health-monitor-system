// incidentManager.ts
import { prisma } from './db';

export async function handleIncident(
  monitorId: string,
  newStatus: 'UP' | 'DOWN'
) {
  const activeIncident = await prisma.incident.findFirst({
    where: { monitorId, resolvedAt: null },
  });
  if (newStatus === 'DOWN' && !activeIncident) {
    await prisma.incident.create({
      data: {
        monitorId,
        startedAt: new Date(),
        currentStatus: 'OPEN',
      },
    });
    return 'INCIDENT_CREATED';
  }
  if (newStatus === 'UP' && activeIncident) {
    await prisma.incident.update({
      where: { id: activeIncident.id },
      data: {
        resolvedAt: new Date(),
        currentStatus: 'RESOLVED',
      },
    });
    return 'INCIDENT_RESOLVED';
  }
  return 'NO_ACTION';
}
