import type { Metadata } from "next";
import "@slep-colchagua/design-system";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salidas Pedagogicas | SLEP Colchagua",
  description: "Gestion institucional de salidas pedagogicas para establecimientos SLEP Colchagua.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
