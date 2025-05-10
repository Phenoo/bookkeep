import { Metadata } from "next";
import { Toaster } from "sonner";
import { Toaster as MainToaster } from "@/components/ui/toaster";
import { ConvexClientProvider } from "@/provider/convex-provider";
import { UserSync } from "@/components/user-sync";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Business Management Dashboard",
  description: "Track sales and manage inventory across your business",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserSync />
            {children}
            <Toaster position="bottom-center" />
            <MainToaster />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
