import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@website/shared/ui";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TanStackProvider from "@/providers/tanstackQuery";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html
      lang='en'
      className={cn(
        "dark",
        "h-full",
        "antialiased",
        "font-sans",
        geist.variable,
      )}
    >
      <body className='min-h-full flex flex-col' suppressHydrationWarning>
        <TanStackProvider>
          <ToastContainer
            position='top-right'
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='dark'
          />
          {children}
        </TanStackProvider>
      </body>
    </html>
  );
}
