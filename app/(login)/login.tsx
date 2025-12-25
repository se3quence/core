"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleIcon, Loader2, Plus } from "lucide-react";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" }
  );

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background p-4 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        {/* Main Grid Container */}
        <div className="relative border border-border bg-card shadow-sm">
          {/* ------------------------------------------------------------------
              Corner Icons
          ------------------------------------------------------------------ */}
          <Plus
            className="absolute -top-3 -left-3 size-6 text-muted-foreground/40 z-20"
            strokeWidth={1}
          />
          <Plus
            className="absolute -top-3 -right-3 size-6 text-muted-foreground/40 z-20"
            strokeWidth={1}
          />
          <Plus
            className="absolute -bottom-3 -left-3 size-6 text-muted-foreground/40 z-20"
            strokeWidth={1}
          />
          <Plus
            className="absolute -bottom-3 -right-3 size-6 text-muted-foreground/40 z-20"
            strokeWidth={1}
          />

          {/* ------------------------------------------------------------------
              Row 1: Header
          ------------------------------------------------------------------ */}
          <div className="relative flex flex-col items-center justify-center border-b border-border p-6 md:p-8 text-center">
            <Plus
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 size-6 text-muted-foreground/40 z-20 hidden md:block"
              strokeWidth={1}
            />

            <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-primary/10 md:mb-4 md:size-10">
              <CircleIcon className="size-5 text-primary md:size-6" />
            </div>

            {/* Responsive Text: Larger on mobile now (text-2xl) */}
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>

            {/* Responsive Text: text-sm on mobile is much more readable than xs */}
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {mode === "signin"
                ? "Enter credentials to access dashboard"
                : "Enter details to get started"}
            </p>
          </div>

          {/* ------------------------------------------------------------------
              Row 2: Content
          ------------------------------------------------------------------ */}
          <div className="grid md:grid-cols-2">
            {/* Left Column: Form */}
            <div className="relative p-6 md:p-8 md:border-r border-border">
              <form
                className="flex flex-col gap-4"
                action={formAction}
              >
                <input
                  type="hidden"
                  name="redirect"
                  value={redirect || ""}
                />
                <input
                  type="hidden"
                  name="priceId"
                  value={priceId || ""}
                />
                <input
                  type="hidden"
                  name="inviteId"
                  value={inviteId || ""}
                />

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    {/* Label: text-sm is standard for mobile legibility */}
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      defaultValue={state.email}
                      required
                      maxLength={50}
                      // Key Change: text-base prevents iOS zoom, md:text-sm scales it back down for desktop elegance
                      className="h-10 bg-background/50 border-border text-xs md:text-sm"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium"
                      >
                        Password
                      </Label>
                      {mode === "signin" && (
                        <Link
                          href="/forgot-password"
                          className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-primary"
                        >
                          Forgot?
                        </Link>
                      )}
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      defaultValue={state.password}
                      required
                      minLength={8}
                      maxLength={100}
                      // Key Change: text-base prevents iOS zoom
                      className="h-10 bg-background/50 border-border text-base md:text-sm"
                    />
                  </div>

                  {state?.error && (
                    <div className="text-sm font-medium text-destructive">
                      {state.error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="mt-2 w-full text-sm md:text-sm"
                    size="lg" // Larger touch target for mobile
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Wait
                      </>
                    ) : mode === "signin" ? (
                      "Sign In"
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </div>

                <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full text-sm md:text-sm"
                    type="button"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-sm md:text-sm"
                    type="button"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"></path>
                    </svg>
                    Apple
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Column: Image */}
            <div className="relative hidden md:flex flex-col items-center justify-center bg-muted/20 p-8">
              <div className="relative aspect-square w-full max-w-[280px]">
                <Image
                  src="https://ui.shadcn.com/placeholder.svg"
                  alt="Illustration"
                  fill
                  className="object-contain dark:invert"
                />
              </div>
              <div className="mt-8 text-center">
                <h3 className="text-xl font-medium">Secure & Scalable</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Built with modern architecture for reliability.
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------
              Row 3: Footer
          ------------------------------------------------------------------ */}
          <div className="relative border-t border-border p-6 md:p-8">
            <Plus
              className="absolute -top-3 left-1/2 -translate-x-1/2 size-6 text-muted-foreground/40 z-20 hidden md:block"
              strokeWidth={1}
            />

            <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
              {/* Footer text increased to text-sm for better mobile reading */}
              <div className="text-sm text-muted-foreground">
                {mode === "signin" ? (
                  <>
                    No account?{" "}
                    <Link
                      href={`/sign-up${
                        redirect ? `?redirect=${redirect}` : ""
                      }`}
                      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Have an account?{" "}
                    <Link
                      href={`/sign-in${
                        redirect ? `?redirect=${redirect}` : ""
                      }`}
                      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>

              {/* Links increased from text-[10px] to text-xs */}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <Link
                  href="#"
                  className="hover:text-foreground"
                >
                  Terms
                </Link>
                <Link
                  href="#"
                  className="hover:text-foreground"
                >
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
