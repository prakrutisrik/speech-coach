import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOverallScore, getPaceScore } from "@/lib/speeches";
import type { SpeechAnalysis } from "@/types/speech";

type SaveSpeechPayload = {
  prompt?: string;
  durationSeconds?: number;
  analysis?: SpeechAnalysis;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to save speeches." },
        { status: 401 }
      );
    }

    const payload = (await request.json()) as SaveSpeechPayload;

    if (!payload.prompt || !payload.analysis?.transcript) {
      return NextResponse.json(
        { error: "Prompt and analysis are required." },
        { status: 400 }
      );
    }

    const analysis = payload.analysis;
    const paceScore = getPaceScore(analysis.metrics.wordsPerMinute);
    const overallScore = getOverallScore(analysis);

    const { data, error } = await supabase
      .from("speeches")
      .insert({
        user_id: user.id,
        prompt: payload.prompt,
        transcript: analysis.transcript,
        analysis,
        overall_score: overallScore,
        clarity_score: analysis.scores.clarity,
        confidence_score: analysis.scores.confidence,
        structure_score: analysis.scores.structure,
        pace_score: paceScore,
        filler_word_count: analysis.metrics.fillerWords,
        duration_seconds: payload.durationSeconds ?? 60
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save speech analysis."
      },
      { status: 500 }
    );
  }
}