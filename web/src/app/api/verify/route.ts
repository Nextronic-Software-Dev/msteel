import env from "@/lib/env";
import { NextResponse } from "next/server";
import * as nodemailer from "nodemailer";

const user = env.NEXT_PUBLIC_EMAIL_USER;
const pass = env.NEXT_PUBLIC_EMAIL_PASS;
const service = env.NEXT_PUBLIC_EMAIL_SERVICE_PROVIDER;

const transporter = nodemailer.createTransport({
  service: service,
  auth: {
    user: user,
    pass: pass,
  },
});
export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    await transporter.sendMail({
      from: "noreply@mqttbroker.com",
      to,
      subject,
      html,
    });

    return NextResponse.json(
      { message: "Email envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
