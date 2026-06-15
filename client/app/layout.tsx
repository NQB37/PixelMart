import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Pixel Mart",
  description: "Tech E-Commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={cn("dark", "h-full", "antialiased", "font-sans", geist.variable)}>
      <body className='min-h-full flex flex-col'>{children}</body>
    </html>
  );
}
