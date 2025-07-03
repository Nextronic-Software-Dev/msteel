import { z } from "zod";

export const inputSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters long",
  }),
  email: z.string().email({
    message: "Invalid email",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

export type TInput = z.infer<typeof inputSchema>;
