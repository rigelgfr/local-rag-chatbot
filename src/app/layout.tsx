import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/custom-ui/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ALVA AI Assistant",
  description: "Simple chat interface for AI assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} h-screen flex flex-col bg-white dark:bg-black-2 overflow-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <Toaster position="bottom-right" richColors />

          <Header size="full" />

          <main className="flex-1 overflow-hidden">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
