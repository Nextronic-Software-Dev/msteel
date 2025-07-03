import {  getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (session) redirect("/");
  return <>{children}</>;
}
