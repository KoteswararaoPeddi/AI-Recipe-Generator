import type { Metadata } from "next";
import {  Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight:["300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Koti | Frontend Developer",
  description:
    "Frontend Developer specializing in React, Next.js, TypeScript, and modern web technologies. Explore my projects, skills, and professional experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full scroll-smooth scroll-pt-20 antialiased`}>
      <body className="min-h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
