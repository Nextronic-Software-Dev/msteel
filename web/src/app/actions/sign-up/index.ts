"use server";

import { db } from "@/lib/db";
import { TInput, inputSchema } from "./schema";
import bcrypt from "bcrypt";
import { createSafeAction } from "../utils";
import { emailTemplate } from "@/lib/utils";
import env from "@/lib/env";

const url = env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";
const isEmailVerificationRequired: boolean =
  env.NEXT_PUBLIC_IS_EMAIL_VERIFICATION_REQUIRED === "true";
function generateCode(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const handler = async (data: TInput) => {
  const password = await bcrypt.hash(data.password, 12);
  const code = generateCode(4);
  const user = await db.user.create({
    data: {
      ...data,
      password,
    },
  });
  if (user && isEmailVerificationRequired) {
    const emailContent = emailTemplate(user, code);

    await fetch(`${url}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: user.email,
        subject: "Your Mqtt broker platform verification code",
        html: emailContent,
      }),
    });
  }
  return user;
};

export const signUp = createSafeAction({ scheme: inputSchema, handler });
