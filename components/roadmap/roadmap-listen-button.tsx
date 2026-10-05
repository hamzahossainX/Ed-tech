"use client";

import { Square, Volume2 } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";

type RoadmapListenButtonProps = {
  text: string;
};

export function RoadmapListenButton({ text }: RoadmapListenButtonProps) {
  const { isSupported, isSpeaking, speakText, stopSpeaking } = useSpeechSynthesis();

  function toggleSpeech() {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    speakText(text);
  }

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      disabled={!isSupported}
      aria-pressed={isSpeaking}
      aria-label={isSpeaking ? "Stop reading roadmap summary" : "Listen to roadmap summary"}
      title={isSupported ? undefined : "Text-to-speech is not supported by this browser"}
      className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-[#3c7156]/20 bg-[#f0f7e7] px-3 py-2 text-xs font-black text-[#28583f] transition hover:-translate-y-0.5 hover:border-[#3c7156]/40 hover:bg-[#e5f2db] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#a9e950]/20 dark:bg-[#a9e950]/10 dark:text-[#c8ff65] dark:hover:border-[#a9e950]/40 dark:hover:bg-[#a9e950]/15"
    >
      {isSpeaking ? <Square className="size-3.5" fill="currentColor" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
      {isSpeaking ? "Stop" : "Listen"}
    </button>
  );
}
