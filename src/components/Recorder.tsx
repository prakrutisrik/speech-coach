"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechAnalysis } from "@/types/speech";
import { Timer } from "@/components/Timer";

const RECORDING_SECONDS = 60;

type RecorderProps = {
  onResults: (results: SpeechAnalysis) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onError: (message: string | null) => void;
  onStartNewPrompt: () => void;
  prompt: string;
};

export function Recorder({
  onResults,
  onLoadingChange,
  onError,
  onStartNewPrompt,
  prompt
}: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(RECORDING_SECONDS);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const startedAtRef = useRef(0);

  const analyzeTranscript = useCallback(
    async (transcript: string, durationSeconds: number) => {
      onLoadingChange(true);
      onError(null);

      try {
        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            transcript,
            duration: durationSeconds
          })
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to analyze speech.");
        }

        const analysis = payload as SpeechAnalysis;

        onResults(analysis);

        const saveResponse = await fetch("/api/speeches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt,
            durationSeconds,
            analysis
          })
        });

        if (!saveResponse.ok && saveResponse.status !== 401) {
          const savePayload = await saveResponse.json();
          onError(savePayload.error ?? "Analysis completed, but saving failed.");
        }
      } catch (error) {
        onError(
          error instanceof Error
            ? error.message
            : "Unable to analyze speech."
        );
      } finally {
        onLoadingChange(false);
      }
    },
    [onError, onLoadingChange, onResults, prompt]
  );

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();

    setIsRecording(false);

    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 1000)
    );

    if (!transcriptRef.current.trim()) {
      onError("No speech detected. Please try again.");
      return;
    }

    void analyzeTranscript(transcriptRef.current, durationSeconds);
  }, [analyzeTranscript, onError]);

  const startRecording = () => {
    onStartNewPrompt();
    onError(null);
    setSecondsRemaining(RECORDING_SECONDS);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError("Speech Recognition is not supported in this browser.");
      return;
    }

    transcriptRef.current = "";
    startedAtRef.current = Date.now();

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      transcriptRef.current = transcript.trim();
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        onError(event.error);
        setIsRecording(false);
      }
    };

    recognition.start();

    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          stopRecording();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRecording, stopRecording]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <section className="rounded-lg border border-ink/10 bg-white/85 p-6 shadow-panel">
      <div className="space-y-6">
        <Timer
          secondsRemaining={secondsRemaining}
          totalSeconds={RECORDING_SECONDS}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-md bg-sea px-5 py-3 font-semibold text-white transition hover:bg-sea/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isRecording}
            onClick={startRecording}
            type="button"
          >
            Start recording
          </button>

          <button
            className="rounded-md bg-coral px-5 py-3 font-semibold text-white transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isRecording}
            onClick={stopRecording}
            type="button"
          >
            Stop recording
          </button>
        </div>
      </div>
    </section>
  );
}