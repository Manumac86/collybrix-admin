import type React from "react";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
} from "@clerk/nextjs";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

import {
  Geist,
  Geist_Mono,
  Source_Serif_4,
  Geist as V0_Font_Geist,
  Geist_Mono as V0_Font_Geist_Mono,
  Source_Serif_4 as V0_Font_Source_Serif_4,
} from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

// Initialize fonts
const _geist = V0_Font_Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const _sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const sourceSerif4 = Source_Serif_4({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collybrix Admin",
  description: "Manage your projects, revenue, and contacts",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`font-sans antialiased bg-background text-foreground`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SignedOut>
              <div className="flex flex-col gap-16 min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
                <div className="flex flex-col gap-2 items-center">
                  <Logo size={128} />
                  <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Collybrix Tools
                  </h1>
                </div>
                <div className="text-center space-y-6 p-8 max-w-md">
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Welcome to Collybrix Admin Tools
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Manage your projects, track revenue, and collaborate with
                    your team.
                  </p>
                  <div className="pt-4">
                    <SignInButton mode="modal">
                      <Button size="lg">Sign In to Continue</Button>
                    </SignInButton>
                  </div>
                </div>
              </div>
            </SignedOut>
            <SignedIn>{children}</SignedIn>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
