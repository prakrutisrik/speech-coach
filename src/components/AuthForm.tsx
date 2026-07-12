"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    console.log("Submitted");
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      console.log("Created client");

      console.log("Calling signUp...");
      if (isSignup) {
        const origin = window.location.origin;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=/dashboard`
          }
        });

        if (signUpError) {
          throw signUpError;
        }
        console.log(data, signUpError);

        if (data.user) {
          setMessage(
            data.session
              ? "Account created. Redirecting to your dashboard..."
              : "Account created. Check your email to confirm your account."
          );
        }

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          throw signInError;
        }

        const next = searchParams.get("redirectedFrom") ?? "/dashboard";
        router.push(next);
        router.refresh();
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Authentication failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md flex-col justify-center px-5 py-10">
      <section className="rounded-lg border border-ink/10 bg-white/85 p-6 shadow-panel">
        <h1 className="text-3xl font-black text-ink">
          {isSignup ? "Create your account" : "Log in"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          {isSignup
            ? "Save your speeches and track improvement over time."
            : "Welcome back. Your dashboard is waiting."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Email</span>
            <input
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3 text-ink outline-none transition focus:border-sea"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Password</span>
            <input
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-3 text-ink outline-none transition focus:border-sea"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <p className="rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-md border border-sea/30 bg-sea/10 px-3 py-2 text-sm text-sea">
              {message}
            </p>
          ) : null}

          <button
            className="w-full rounded-md bg-sea px-5 py-3 font-semibold text-white transition hover:bg-sea/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Working..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/65">
          {isSignup ? "Already have an account?" : "New to Speech Coach?"}{" "}
          <Link
            className="font-semibold text-sea transition hover:text-coral"
            href={isSignup ? "/login" : "/signup"}
          >
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </section>
    </main>
  );
}
