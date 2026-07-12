import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const fillerPatterns = [
  /\bum+\b/gi,
  /\buh+\b/gi,
  /\blike\b/gi,
  /\byou know\b/gi,
  /\bactually\b/gi,
  /\bbasically\b/gi,
  /\bkind of\b/gi,
  /\bsort of\b/gi
];

type Scores = {
  clarity: number;
  confidence: number;
  structure: number;
};

type AnalysisResponse = {
  transcript: string;
  metrics: {
    fillerWords: number;
    wordsPerMinute: number;
    repetitions: number;
    averageSentenceLength: number;
  };
  scores: Scores;
  feedback: string[];
};

function getWords(transcript: string) {
  return transcript
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function countFillers(transcript: string) {
  return fillerPatterns.reduce((count, pattern) => {
    const matches = transcript.match(pattern);
    return count + (matches?.length ?? 0);
  }, 0);
}

function countRepeatedPhrases(words: string[]) {
  let repetitions = 0;
  const seen = new Map<string, number>();

  for (let size = 2; size <= 3; size += 1) {
    for (let index = 0; index <= words.length - size; index += 1) {
      const phrase = words.slice(index, index + size).join(" ");
      seen.set(phrase, (seen.get(phrase) ?? 0) + 1);
    }
  }

  for (const occurrences of seen.values()) {
    if (occurrences > 1) {
      repetitions += occurrences - 1;
    }
  }

  return repetitions;
}

function averageSentenceLength(transcript: string, words: string[]) {
  const sentences = transcript
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return words.length;
  }

  return Math.round(words.length / sentences.length);
}

function localMetrics(transcript: string, durationSeconds: number) {
  const words = getWords(transcript);
  const minutes = Math.max(durationSeconds, 1) / 60;

  return {
    fillerWords: countFillers(transcript),
    wordsPerMinute: Math.round(words.length / minutes),
    repetitions: countRepeatedPhrases(words),
    averageSentenceLength: averageSentenceLength(transcript, words)
  };
}

function fallbackAnalysis(transcript: string, durationSeconds: number): AnalysisResponse {
  const metrics = localMetrics(transcript, durationSeconds);
  const fillerPenalty = Math.min(metrics.fillerWords, 5);
  const pacingPenalty =
    metrics.wordsPerMinute < 100 || metrics.wordsPerMinute > 175 ? 2 : 0;
  const repetitionPenalty = Math.min(metrics.repetitions, 3);

  return {
    transcript,
    metrics,
    scores: {
      clarity: Math.max(1, 8 - fillerPenalty - pacingPenalty),
      confidence: Math.max(1, 7 - fillerPenalty),
      structure: Math.max(1, 8 - repetitionPenalty)
    },
    feedback: [
      metrics.fillerWords > 0
        ? "Pause silently when you need a moment instead of using filler words."
        : "Your transcript had very few obvious filler words.",
      metrics.wordsPerMinute > 175
        ? "Slow your pace slightly so key points have time to land."
        : metrics.wordsPerMinute < 100
          ? "Add a little more energy and pace to keep listeners engaged."
          : "Your speaking pace is in a comfortable conversational range.",
      metrics.averageSentenceLength > 24
        ? "Break long thoughts into shorter sentences for clearer delivery."
        : "Your sentence length is easy to follow."
    ]
  };
}

function normalizeScore(value: unknown) {
  const score = Number(value);
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(10, Math.max(1, Math.round(score)));
}

async function analyzeWithGEMINI(
  genai: GoogleGenAI,
  transcript: string,
  durationSeconds: number
): Promise<AnalysisResponse> {
  const metrics = localMetrics(transcript, durationSeconds);

  const responseClient = (genai as any).responses;
  if (typeof responseClient?.create !== "function") {
    return fallbackAnalysis(transcript, durationSeconds);
  }

  const completion = await responseClient.create({
    model: "gemini-2.5-pro",
    input: JSON.stringify({
      task: `
Return ONLY valid JSON.

Do not use markdown.
Do not use bullet points.
Do not wrap the JSON in \`\`\`.

Return exactly:

{
  "scores":{
    "clarity":8,
    "confidence":8,
    "structure":8
  },
  "feedback":[
    "...",
    "...",
    "..."
  ]
}
`
    })
  });

const raw = completion.output?.[0]?.content?.[0]?.text ?? "{}";

console.log("========== GEMINI RAW ==========");
console.log(raw);
console.log("================================");

const parsed = JSON.parse(raw) as Partial<AnalysisResponse>;
  return {
    transcript,
    metrics,
    scores: {
      clarity: normalizeScore(parsed.scores?.clarity),
      confidence: normalizeScore(parsed.scores?.confidence),
      structure: normalizeScore(parsed.scores?.structure)
    },
    feedback:
      Array.isArray(parsed.feedback) && parsed.feedback.length > 0
        ? parsed.feedback.map(String).slice(0, 5)
        : fallbackAnalysis(transcript, durationSeconds).feedback
  };
}

export async function POST(request: Request) {
  console.log("POST /api/transcribe hit");

  try {
    const body = await request.json();

    const transcript = body.transcript ?? "";
    const duration = Number(body.duration ?? 60);

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "Transcript is required." },
        { status: 400 }
      );
    }

    const durationSeconds =
      Number.isFinite(duration) ? duration : 60;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const demoTranscript =
        "Demo transcript: I would explain the topic with a clear opening, a few specific examples, and a concise closing point.";
      return NextResponse.json(fallbackAnalysis(demoTranscript, durationSeconds));
    }

    const genai = new GoogleGenAI({ apiKey });

    const analysis = await analyzeWithGEMINI(genai, transcript, durationSeconds);
    return NextResponse.json(analysis);
  } catch (error) {
  console.error("FULL ERROR:");
  console.error(error);

  return NextResponse.json(
    {
      error: String(error)
    },
    { status: 500 }
  );
}
}