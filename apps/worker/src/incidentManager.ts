// incidentManager.ts
import { prisma } from './db';

export async function handleIncident(
  monitorId: string,
  newStatus: 'up' | 'down'
) {
  const activeIncident = await prisma.incident.findFirst({
    where: { monitorId, resolvedAt: null },
  });
  if (newStatus === 'down' && !activeIncident) {
    await prisma.incident.create({
      data: {
        monitorId,
        startedAt: new Date(),
      },
    });
    return 'INCIDENT_CREATED';
  }
  if (newStatus === 'up' && activeIncident) {
    await prisma.incident.update({
      where: { id: activeIncident.id },
      data: {
        resolvedAt: new Date(),
      },
    });
    return 'INCIDENT_RESOLVED';
  }
  return 'NO_ACTION';
}
