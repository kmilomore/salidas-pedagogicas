import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Salidas Pedagogicas | SLEP Colchagua",
  description: "Gestion institucional de salidas pedagogicas para establecimientos SLEP Colchagua.",
  icons: {
    icon: "/SLEPCOLCHAGUA.webp",
    shortcut: "/SLEPCOLCHAGUA.webp",
    apple: "/SLEPCOLCHAGUA.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
