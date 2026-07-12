import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-73px)] w-full max-w-3xl px-5 py-8 md:px-8 lg:py-12">
      <section className="rounded-lg border border-ink/10 bg-white/85 p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-black text-ink">Account</h1>
        <p className="mt-4 text-ink/70">{user.email}</p>
      </section>
    </main>
  );
}