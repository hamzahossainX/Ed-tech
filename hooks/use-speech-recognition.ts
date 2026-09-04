"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechAlternative = {
  transcript: string;
};

type SpeechResult = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechAlternative;
};

type SpeechResultEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechResult;
  };
};

type SpeechErrorEvent = {
  error: string;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type Options = {
  maxLength: number;
  onTranscript: (transcript: string) => void;
  onError: (message: string) => void;
};

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  const speechWindow = window as SpeechRecognitionWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function speechErrorMessage(error: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was blocked. Please allow microphone permission and try again.";
    case "audio-capture":
      return "No microphone was detected. Please check your audio input device.";
    case "no-speech":
      return "No speech was detected. Please try again and speak clearly.";
    case "network":
      return "Voice recognition is temporarily unavailable. Please check your connection.";
    default:
      return "Voice input could not start. Please type your learning goal instead.";
  }
}

export function useSpeechRecognition({ maxLength, onTranscript, onError }: Options) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognitionConstructor()));

    return () => {
      const recognition = recognitionRef.current;
      if (!recognition) return;

      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setIsSupported(false);
      onErrorRef.current(
        "Voice input is not supported in this browser. Try Chrome or Edge, or type your goal instead.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result?.isFinal) transcript += ` ${result[0]?.transcript ?? ""}`;
      }

      const normalizedTranscript = transcript.replace(/\s+/g, " ").trim();
      if (normalizedTranscript) {
        onTranscriptRef.current(normalizedTranscript.slice(0, maxLength));
      }
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        onErrorRef.current(speechErrorMessage(event.error));
      }
      setIsListening(false);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      onErrorRef.current("Voice input could not start. Please wait a moment and try again.");
    }
  }, [maxLength]);

  return {
    isListening,
    isSupported,
    toggleListening,
  };
}
