"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { User } from "@prisma/client";
import { db } from "./db";
import env from "./env";
import bcrypt from "bcrypt";

const url = env.NEXT_PUBLIC_MQTT_BROKER_URL;

export type SessionUser = Omit<User, "password">;

export type Session = {
  user: SessionUser;
  expires: Date;
};

const secretKey = env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Session) {
  const { expires } = payload;
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);
}

export async function decrypt(input: string): Promise<Session> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as Session;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{
  error?: string;
  user?: SessionUser;
}> {
  // Verify credentials && get the user
  const { email, password } = data;
  const user = await db.user.findUnique({
    where: { email },
  });
  if (user) {
    const sessionUser: SessionUser = {
      ...user,
    };
  }
  if (!user) return { error: "Invalid email or password" };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { error: "Invalid email or password" };
  const expires = new Date(Date.now() + env.EXPIRY_TIME * 1_000);
  const session = await encrypt({ user, expires });

  cookies().set("session", session, { expires, httpOnly: true });
  return { user };
}

export async function logout() {
  // Destroy the session
  cookies().delete("session");
  redirect("/authentication");
}

export async function getServerSession() {
  try {
    const session = cookies().get("session")?.value;
    if (!session) return null;
    return await decrypt(session);
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 10 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}

