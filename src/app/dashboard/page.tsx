import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { transcriptPreview } from "@/lib/speeches";
import type { SpeechRow } from "@/types/speech";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: speeches, error } = await supabase
    .from("speeches")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (speeches ?? []) as SpeechRow[];

  return (
    <main className="mx-auto min-h-[calc(100vh-73px)] w-full max-w-6xl space-y-6 px-5 py-8 md:px-8 lg:py-12">
      <section className="rounded-lg border border-ink/10 bg-white/85 p-6 shadow-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-coral">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black text-ink">
              Hello, {user.email}
            </h1>
          </div>
          <Link
            className="rounded-md bg-sea px-5 py-3 text-center font-semibold text-white transition hover:bg-sea/90"
            href="/"
          >
            Start New Speech
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white/85 p-6 shadow-panel">
        <h2 className="text-xl font-bold text-ink">Previous Speeches</h2>
        {error ? (
          <p className="mt-3 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
            {error.message}
          </p>
        ) : null}
        {!error && rows.length === 0 ? (
          <p className="mt-4 text-ink/65">You haven&apos;t completed any speeches yet.</p>
        ) : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {rows.map((speech) => (
            <article
              className="rounded-lg border border-ink/10 bg-white p-4"
              key={speech.id}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-sea">
                {new Date(speech.created_at).toLocaleDateString()}
              </p>
              <h3 className="mt-2 text-lg font-bold text-ink">{speech.prompt}</h3>
              <p className="mt-2 text-sm text-ink/65">
                {transcriptPreview(speech.transcript)}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">
                  Overall Score:{" "}
                  <span className="text-sea">{speech.overall_score}/10</span>
                </p>
                <Link
                  className="rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-ink transition hover:border-sea hover:text-sea"
                  href={`/speeches/${speech.id}`}
                >
                  Open analysis
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white/85 p-6 shadow-panel">
        <h2 className="text-xl font-bold text-ink">Account/Profile</h2>
        <p className="mt-2 text-ink/65">{user.email}</p>
      </section>
    </main>
  );
}