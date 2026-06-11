import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Morg - AI Code Analysis",
  description: "Get your project summary in seconds with AI-powered code analysis",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(0, 0, 0, 0.9)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
