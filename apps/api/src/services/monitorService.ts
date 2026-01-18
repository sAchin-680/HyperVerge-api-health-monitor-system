import prisma from '../utils/prisma';

export async function createMonitor(
  userId: string,
  data: { name: string; url: string; interval: number }
) {
  return prisma.monitor.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function getMonitors(userId: string) {
  return prisma.monitor.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateMonitor(
  userId: string,
  id: string,
  data: Partial<{ name: string; url: string; interval: number }>
) {
  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor || monitor.userId !== userId)
    throw { status: 404, message: 'Monitor not found' };
  return prisma.monitor.update({ where: { id }, data });
}

export async function deleteMonitor(userId: string, id: string) {
  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor || monitor.userId !== userId)
    throw { status: 404, message: 'Monitor not found' };
  await prisma.monitor.delete({ where: { id } });
}

export async function getMonitorResults(userId: string, id: string) {
  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor || monitor.userId !== userId)
    throw { status: 404, message: 'Monitor not found' };
  return prisma.checkResult.findMany({
    where: { monitorId: id },
    orderBy: { checkedAt: 'desc' },
  });
}
