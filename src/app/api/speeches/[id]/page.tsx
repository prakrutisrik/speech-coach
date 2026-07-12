import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Results } from "@/components/Results";
import { createClient } from "@/lib/supabase/server";
import type { SpeechRow } from "@/types/speech";

export default async function SpeechDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase.from("speeches").select("*").eq("id", id).single();

  if (!data) {
    notFound();
  }

  const speech = data as SpeechRow;

  return (
    <main className="mx-auto min-h-[calc(100vh-73px)] w-full max-w-6xl space-y-6 px-5 py-8 md:px-8 lg:py-12">
      <Link className="text-sm font-semibold text-sea transition hover:text-coral" href="/dashboard">
        Back to dashboard
      </Link>
      <section className="rounded-lg border border-ink/10 bg-white/85 p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">
          Speech Analysis
        </p>
        <h1 className="mt-2 text-3xl font-black text-ink">{speech.prompt}</h1>
        <p className="mt-2 text-sm text-ink/65">
          {new Date(speech.created_at).toLocaleString()}
        </p>
      </section>
      <Results error={null} isLoading={false} results={speech.analysis} />
    </main>
  );
}