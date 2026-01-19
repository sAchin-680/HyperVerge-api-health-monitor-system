import prisma from '../utils/prisma';

export async function createMonitor(data: {
  name: string;
  url: string;
  interval: number;
  method?: string;
  timeout?: number;
  expectedStatus?: number;
  headers?: Record<string, string>;
  body?: string;
}) {
  return prisma.monitor.create({
    data: {
      ...data,
      // No auth - userId is optional
    },
  });
}

export async function getMonitors() {
  return prisma.monitor.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMonitor(id: string) {
  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor) throw { status: 404, message: 'Monitor not found' };
  return monitor;
}

export async function updateMonitor(
  id: string,
  data: Partial<{
    name: string;
    url: string;
    interval: number;
    method: string;
    timeout: number;
    expectedStatus: number;
    headers: Record<string, string>;
    body: string;
  }>
) {
  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor) throw { status: 404, message: 'Monitor not found' };
  return prisma.monitor.update({ where: { id }, data });
}

export async function deleteMonitor(id: string) {
  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor) throw { status: 404, message: 'Monitor not found' };
  await prisma.monitor.delete({ where: { id } });
}

export async function getMonitorResults(id: string) {
  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor) throw { status: 404, message: 'Monitor not found' };
  return prisma.checkResult.findMany({
    where: { monitorId: id },
    orderBy: { checkedAt: 'desc' },
    take: 100,
  });
}
