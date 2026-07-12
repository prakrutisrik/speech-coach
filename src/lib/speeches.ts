import type { SpeechAnalysis, SpeechRow } from "@/types/speech";

export function getPaceScore(wordsPerMinute: number) {
  if (wordsPerMinute >= 120 && wordsPerMinute <= 160) {
    return 10;
  }

  if (wordsPerMinute >= 100 && wordsPerMinute <= 180) {
    return 8;
  }

  if (wordsPerMinute >= 80 && wordsPerMinute <= 200) {
    return 6;
  }

  return 4;
}

export function getOverallScore(analysis: SpeechAnalysis) {
  const paceScore = getPaceScore(analysis.metrics.wordsPerMinute);
  return Math.round(
    (analysis.scores.clarity +
      analysis.scores.confidence +
      analysis.scores.structure +
      paceScore) /
      4
  );
}

export function transcriptPreview(transcript: string, length = 140) {
  if (transcript.length <= length) {
    return transcript;
  }

  return `${transcript.slice(0, length).trim()}...`;
}

export function toSpeechAnalysis(row: SpeechRow): SpeechAnalysis {
  return row.analysis;
}
