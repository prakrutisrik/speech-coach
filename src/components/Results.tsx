"use client";

import type { SpeechAnalysis } from "@/types/speech";

export type { SpeechAnalysis };

type ResultsProps = {
  results: SpeechAnalysis | null;
  isLoading: boolean;
  error: string | null;
};

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      <p className="text-sm font-medium text-ink/60">{label}</p>
      <p className="mt-2 text-3xl font-bold text-sea">{value}/10</p>
    </div>
  );
}

export function Results({ results, isLoading, error }: ResultsProps) {
  if (isLoading) {
    return (
      <section className="rounded-lg border border-ink/10 bg-white/85 p-6 shadow-panel">
        <p className="text-lg font-semibold text-ink">Analyzing your recording...</p>
        <p className="mt-2 text-sm text-ink/65">
          Transcribing audio, checking pacing, and preparing feedback.
        </p>
      </section>
    );
  }

  if (error && !results) {
    return (
      <section className="rounded-lg border border-coral/30 bg-white/85 p-6 shadow-panel">
        <p className="text-lg font-semibold text-coral">Something went wrong</p>
        <p className="mt-2 text-sm text-ink/70">{error}</p>
      </section>
    );
  }

  if (!results) {
    return (
      <section className="rounded-lg border border-dashed border-ink/20 bg-white/55 p-6">
        <p className="text-sm font-medium text-ink/60">
          Your transcript, metrics, scores, and feedback will appear here after
          recording.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-lg border border-ink/10 bg-white/85 p-6 shadow-panel">
      {error ? (
        <p className="rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      ) : null}
      <div>
        <h2 className="text-xl font-bold text-ink">Results dashboard</h2>
        <p className="mt-1 text-sm text-ink/65">
          Review the numbers, then focus on one coaching note for the next round.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ScoreCard label="Clarity" value={results.scores.clarity} />
        <ScoreCard label="Confidence" value={results.scores.confidence} />
        <ScoreCard label="Structure" value={results.scores.structure} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-ink p-4 text-white">
          <p className="text-sm text-white/65">Filler words</p>
          <p className="mt-2 text-3xl font-bold">{results.metrics.fillerWords}</p>
        </div>
        <div className="rounded-lg bg-sea p-4 text-white">
          <p className="text-sm text-white/70">Words per minute</p>
          <p className="mt-2 text-3xl font-bold">{results.metrics.wordsPerMinute}</p>
        </div>
        <div className="rounded-lg bg-amberline p-4 text-ink">
          <p className="text-sm text-ink/65">Repeated phrases</p>
          <p className="mt-2 text-3xl font-bold">
            {results.metrics.repetitions ?? 0}
          </p>
        </div>
        <div className="rounded-lg bg-coral p-4 text-white">
          <p className="text-sm text-white/70">Avg. sentence length</p>
          <p className="mt-2 text-3xl font-bold">
            {results.metrics.averageSentenceLength ?? 0}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sea">
          Transcript
        </h3>
        <p className="mt-3 rounded-lg bg-white p-4 leading-7 text-ink/80">
          {results.transcript}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sea">
          Coaching feedback
        </h3>
        <ul className="mt-3 space-y-3">
          {results.feedback.map((item) => (
            <li
              className="rounded-lg border border-ink/10 bg-white p-4 text-ink/80"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
