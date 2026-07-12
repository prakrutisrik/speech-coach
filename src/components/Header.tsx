"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export function Header() {
  const { user, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);

    try {
      await signOut();
    } catch (signOutError) {
      setError(
        signOutError instanceof Error ? signOutError.message : "Unable to log out."
      );
    }
  }

  return (
    <header className="border-b border-ink/10 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link className="text-lg font-black text-ink" href="/">
          Speech Coach
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm font-semibold text-ink/70">
          {!user ? (
            <>
              <Link className="transition hover:text-sea" href="/#mission">
                Our Mission
              </Link>
              <Link className="transition hover:text-sea" href="/login">
                Log In
              </Link>
              <Link
                className="rounded-md bg-sea px-3 py-2 text-white transition hover:bg-sea/90"
                href="/signup"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link className="transition hover:text-sea" href="/dashboard">
                Dashboard
              </Link>
              <Link className="transition hover:text-sea" href="/profile">
                Profile
              </Link>
              <button
                className="rounded-md border border-ink/15 px-3 py-2 transition hover:border-coral hover:text-coral"
                onClick={() => void handleSignOut()}
                type="button"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </nav>
      {error ? (
        <p className="mx-auto w-full max-w-6xl px-5 pb-3 text-sm font-semibold text-coral md:px-8">
          {error}
        </p>
      ) : null}
    </header>
  );
}