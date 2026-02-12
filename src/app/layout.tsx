import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Sistema Motolink",
  description: "Sistema de gestão interna da Motolink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="dark">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
