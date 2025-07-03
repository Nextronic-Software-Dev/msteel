"use server";

import { TInput, inputSchema } from "./schema";
import { CustomError, createSafeAction } from "../utils";
import { login } from "@/lib/auth";

const handler = async (data: TInput) => {
  const { user, error } = await login(data);
  if (error) throw new CustomError("Invalid email or password");
  return user;
};

export const signIn = createSafeAction({
  scheme: inputSchema,
  handler,
  auth: false,
});
