"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, useAuth, useSignIn } from "@clerk/nextjs";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (isSignedIn) {
    router.push("/dashboard");
    return null;
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (strategy: "oauth_google") => {
    if (!signIn) return;

    setLoading(true);
    setError("");

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "OAuth sign in failed");
      setLoading(false);
    }
  };
  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex flex-col md:flex-row">
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-b dark:bg-gradient-to-br from-foreground to-primary dark:from-foreground dark:to-primary items-center justify-center p-8">
            <div className="flex flex-col min-h-screen items-center justify-center">
              <div className="max-w-md text-center md:text-left flex flex-col items-center justify-center">
                <div className="mb-8 flex flex-col items-center justify-center">
                  <Logo size={128} />
                  <h1 className="md:text-3xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Collybrix Tools
                  </h1>
                  <p className="text-lg text-white dark:text-primary-foreground/80">
                    Build, collaborate, and ship faster
                  </p>
                </div>
                <p className="text-white dark:text-primary-foreground/80 leading-relaxed text-center">
                  Your team's toolkit to stop configuring and start innovating.
                  Securely build, deploy, and scale the best web experiences.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full md:px-8 md:w-1/2 flex items-center justify-center p-4 md:p-8 h-screen pb-4">
            <div className="w-full max-w-md flex flex-col h-full">
              {/* Mobile branding */}
              <div className="md:hidden my-12 flex flex-col items-center justify-center">
                <Logo size={128} />
                <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Collybrix Tools
                </h1>
                <p className="text-lg text-primary-foreground/80 dark:text-muted-foreground">
                  Build, collaborate, and ship faster
                </p>
              </div>

              <div className="space-y-6 md:h-full md:flex md:flex-col md:justify-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Sign In
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your credentials to access your account
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignIn("oauth_google")}
                    disabled={loading}
                    className="h-10"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="sm:inline">Google</span>
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground uppercase tracking-wider">
                      Or use email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 font-medium"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
