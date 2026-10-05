"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREFERRED_VOICE_NAMES = [
  "natural",
  "neural",
  "aria",
  "jenny",
  "samantha",
  "google us english",
  "daniel",
  "alex",
];

function selectEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const candidates = englishVoices.length ? englishVoices : voices;

  return [...candidates].sort((left, right) => {
    const leftName = left.name.toLowerCase();
    const rightName = right.name.toLowerCase();
    const leftPreference = PREFERRED_VOICE_NAMES.findIndex((name) => leftName.includes(name));
    const rightPreference = PREFERRED_VOICE_NAMES.findIndex((name) => rightName.includes(name));
    const leftScore = leftPreference < 0 ? PREFERRED_VOICE_NAMES.length : leftPreference;
    const rightScore = rightPreference < 0 ? PREFERRED_VOICE_NAMES.length : rightPreference;

    if (leftScore !== rightScore) return leftScore - rightScore;
    if (left.localService !== right.localService) return left.localService ? -1 : 1;
    return left.name.localeCompare(right.name);
  })[0];
}

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;

    const synthesis = window.speechSynthesis;
    const updateVoices = () => {
      voicesRef.current = synthesis.getVoices();
    };

    setIsSupported(true);
    updateVoices();
    synthesis.addEventListener("voiceschanged", updateVoices);

    return () => {
      synthesis.removeEventListener("voiceschanged", updateVoices);
      if (utteranceRef.current) synthesis.cancel();
      utteranceRef.current = null;
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback((text: string) => {
    if (
      !("speechSynthesis" in window)
      || !("SpeechSynthesisUtterance" in window)
      || !text.trim()
    ) {
      return false;
    }

    const synthesis = window.speechSynthesis;
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    const voice = selectEnglishVoice(voicesRef.current.length
      ? voicesRef.current
      : synthesis.getVoices());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      utteranceRef.current = null;
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    synthesis.speak(utterance);
    return true;
  }, []);

  return { isSupported, isSpeaking, speakText, stopSpeaking };
}
