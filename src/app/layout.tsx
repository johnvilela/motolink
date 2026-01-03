import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motolink",
  description: "Sistema de gestão da Motolink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="dark">{children}</body>
    </html>
  );
}
