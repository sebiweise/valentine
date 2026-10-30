import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { env } from "@/env";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "♥♥♥",
  description: "Will you be my Valentine?",
  icons: {
    icon: "/favicon.png",
  },
};

interface Props {
  children: ReactNode;
}

export default async function RootLayout({
  children,
}: Readonly<Props>) {
  // The nonce-based CSP from proxy.ts only works for pages rendered per
  // request. The static export instead gets a hash-based CSP from
  // scripts/postbuild.mjs.
  if (env.NEXT_OUTPUT !== "export") {
    await connection();
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
