import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
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

export default function RootLayout({
  children,
}: Readonly<Props>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
