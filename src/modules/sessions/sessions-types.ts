import { z } from "zod/v4";

export const createSessionSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type CreateSessionDTO = z.infer<typeof createSessionSchema>;
