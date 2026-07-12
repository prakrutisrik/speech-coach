export type SpeechAnalysis = {
  transcript: string;
  metrics: {
    fillerWords: number;
    wordsPerMinute: number;
    repetitions?: number;
    averageSentenceLength?: number;
  };
  scores: {
    clarity: number;
    confidence: number;
    structure: number;
  };
  feedback: string[];
};

export type SpeechRow = {
  id: string;
  user_id: string;
  created_at: string;
  prompt: string;
  transcript: string;
  analysis: SpeechAnalysis;
  overall_score: number;
  clarity_score: number;
  confidence_score: number;
  structure_score: number;
  pace_score: number;
  filler_word_count: number;
  duration_seconds: number;
};