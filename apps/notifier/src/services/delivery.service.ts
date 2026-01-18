import prisma from '../../../../packages/db/index';

export interface DeliveryLog {
  alertId: string;
  type: string;
  target: string;
  status: 'success' | 'failed';
  message?: string;
  error?: string;
  attempt?: number;
}

export async function logDelivery(data: DeliveryLog) {
  try {
    await prisma.delivery.create({
      data: {
        alertId: data.alertId,
        type: data.type,
        target: data.target,
        status: data.status,
        message: data.message,
        error: data.error,
        attempt: data.attempt || 1,
      },
    });
  } catch (err) {
    console.error('[DELIVERY LOG ERROR]', err);
    // Don't throw - we don't want delivery logging failures to break the notification flow
  }
}

export { prisma };
