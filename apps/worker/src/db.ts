// db.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectDb() {
  try {
    await prisma.$connect();
  } catch (err) {
    console.error('DB connection error:', err);
    throw err;
  }
}
