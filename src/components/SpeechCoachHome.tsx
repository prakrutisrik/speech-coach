"use client";

import { useState } from "react";
import { PromptBox } from "@/components/PromptBox";
import { Recorder } from "@/components/Recorder";
import { Results } from "@/components/Results";
import type { SpeechAnalysis } from "@/types/speech";
import { getRandomPrompt } from "@/data/prompts";

export function SpeechCoachHome({ initialPrompt }: { initialPrompt: string }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [results, setResults] = useState<SpeechAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choosePrompt = () => {
    setPrompt(getRandomPrompt());
    setResults(null);
    setError(null);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl flex-col gap-8 px-5 py-8 md:px-8 lg:py-12">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">
          Public speaking practice
        </p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-ink md:text-6xl">
          Speech Coach
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">
          Record a sixty-second answer, get a transcript, and review focused
          feedback on pacing, clarity, filler words, and structure.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-6">
          <PromptBox
            disabled={isLoading}
            onNewPrompt={choosePrompt}
            prompt={prompt}
          />
          <Recorder
            onError={setError}
            onLoadingChange={setIsLoading}
            onResults={setResults}
            onStartNewPrompt={() => {
              setResults(null);
              setError(null);
            }}
            prompt={prompt}
          />
        </div>

        <Results error={error} isLoading={isLoading} results={results} />
      </div>

      <section className="rounded-lg border border-ink/10 bg-white/65 p-6" id="mission">
        <h2 className="text-xl font-bold text-ink">Our Mission</h2>
        <p className="mt-2 max-w-3xl leading-7 text-ink/70">
          Speech Coach helps you practice clear, confident speaking with short
          prompts, fast transcripts, and focused feedback you can use on the next
          attempt.
        </p>
      </section>
    </main>
  );
}
