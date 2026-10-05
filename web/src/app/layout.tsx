import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/utils/react-query-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Nextronic | Supervision des tôles",
    template: "%s | Nextronic",
  },
  description: "Plateforme de supervision, de mesure et de traçabilité des tôles traitées.",
  applicationName: "Nextronic",
  keywords: ["Nextronic", "tôles", "mesure", "production", "traçabilité"],
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ReactQueryProvider>
            {children}
            <Toaster theme="system" richColors closeButton />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
