"use client";

import React, { useEffect, useState } from "react";
import { Session } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

const SessionContext = React.createContext<{
  session: Session;
  pageName: string;
  setPageName: any;
} | null>(null);

// export default SessionContext;

export function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error(`useSession must be used within a App SessionContext`);
  }
  return context;
}

type SessionProviderProps = {
  children: React.ReactNode;
  session: Session;
};

export default function SessionProvider({
  children,
  session,
}: SessionProviderProps) {
  const router = useRouter();
  const [pageName, setPageName] = useState("Dashboard");
  useEffect(() => {
    if (!session) router.push("/authentication");
  }, [router, session]);
  const pathname = usePathname();

  return (
    <SessionContext.Provider value={{ session, pageName, setPageName }}>
      {children}
    </SessionContext.Provider>
  );
}
