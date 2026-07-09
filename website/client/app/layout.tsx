import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@website/shared/ui";
import { ThemeProvider } from "next-themes";
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
      className={cn("h-full", "antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className='min-h-full flex flex-col' suppressHydrationWarning>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem={false}
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
