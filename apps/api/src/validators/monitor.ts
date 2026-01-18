import { z } from 'zod';

export const monitorSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  interval: z.number().int().min(1),
});
