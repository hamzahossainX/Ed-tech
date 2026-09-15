"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BotMessageSquare,
  ChevronDown,
  CornerDownLeft,
  LoaderCircle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { chatWithMentor, type MentorChatMessage } from "@/app/actions/chat-with-mentor";
import type { RecoverableRoadmap } from "@/lib/roadmap-storage";

type Props = {
  roadmap: RecoverableRoadmap;
};

const SUGGESTED_QUESTIONS = [
  "How should I approach the first milestone?",
  "What's the most important concept to master?",
  "Can you break down the timeline for me?",
  "What should I learn before starting?",
];

export function MentorChat({ roadmap }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MentorChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend(messageText?: string) {
    const text = (messageText ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: MentorChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const roadmapContext = JSON.stringify({
        title: roadmap.title,
        description: roadmap.description,
        estimatedDuration: roadmap.estimatedDuration,
        milestones: roadmap.milestones.map((m) => ({
          position: m.position,
          title: m.title,
          description: m.description,
          duration: m.duration,
          isCompleted: m.isCompleted,
          resources: m.resourceLinks.map((r) => r.title),
        })),
      });

      const result = await chatWithMentor(text, roadmapContext, messages);

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.reply },
        ]);
      } else {
        toast.error(result.error, { duration: 8_000 });
        // Remove the user message on failure so they can retry.
        setMessages(messages);
      }
    } catch {
      toast.error("Something went wrong. Please try again.", { duration: 8_000 });
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClearChat() {
    setMessages([]);
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Mentor Chat"
            className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full border border-[#3c7156]/30 bg-gradient-to-br from-[#3c7156] to-[#1a3a28] text-white shadow-[0_8px_32px_rgba(60,113,86,.4)] transition-all hover:scale-110 hover:shadow-[0_12px_40px_rgba(60,113,86,.55)] active:scale-95 dark:border-[#a9e950]/25 dark:from-[#2a5a3e] dark:to-[#0f2618] dark:shadow-[0_8px_32px_rgba(169,233,80,.2)] sm:size-16"
          >
            <BotMessageSquare className="size-6 sm:size-7" />
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#C6F85E] text-[9px] font-black text-[#17211b]">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/95 shadow-[0_24px_80px_rgba(23,33,27,.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#111512]/95 dark:shadow-[0_24px_80px_rgba(0,0,0,.5)] sm:bottom-6 sm:right-6"
            style={{ height: "min(580px, calc(100vh - 3rem))" }}
          >
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-black/8 bg-gradient-to-r from-[#3c7156]/10 to-transparent px-4 py-3 dark:border-white/8 dark:from-[#a9e950]/8">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#3c7156] to-[#1a3a28] text-white dark:from-[#a9e950]/20 dark:to-[#a9e950]/5 dark:text-[#a9e950]">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">AI Mentor</h3>
                  <p className="text-[10px] font-semibold text-black/40 dark:text-white/40">
                    Ask about your roadmap
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    aria-label="Clear chat"
                    className="grid size-8 place-items-center rounded-lg text-black/30 transition hover:bg-black/5 hover:text-black/60 dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white/60"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="grid size-8 place-items-center rounded-lg text-black/30 transition hover:bg-black/5 hover:text-black/60 dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white/60"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div
              ref={scrollAreaRef}
              className="focus-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                  <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#3c7156]/15 to-[#C6F85E]/10 dark:from-[#a9e950]/10 dark:to-[#3c7156]/10">
                    <BotMessageSquare className="size-7 text-[#3c7156] dark:text-[#a9e950]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      Hi! I&apos;m your AI mentor for
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-[#3c7156] dark:text-[#a9e950]">
                      &ldquo;{roadmap.title}&rdquo;
                    </p>
                    <p className="mx-auto mt-2 max-w-[280px] text-xs leading-5 text-black/45 dark:text-white/45">
                      Ask me anything about your learning path — milestones, strategies, resources, or career guidance.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => handleSend(question)}
                        disabled={isLoading}
                        className="rounded-xl border border-black/8 bg-white px-3 py-2.5 text-left text-xs font-medium text-black/60 transition hover:border-[#3c7156]/30 hover:bg-[#3c7156]/5 hover:text-[#3c7156] disabled:opacity-50 dark:border-white/8 dark:bg-white/[.03] dark:text-white/50 dark:hover:border-[#a9e950]/30 dark:hover:bg-[#a9e950]/5 dark:hover:text-[#a9e950]"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={`${index}-${msg.role}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#3c7156] text-white dark:bg-[#a9e950]/90 dark:text-[#17211b]"
                            : "border border-black/8 bg-black/[.03] text-black/75 dark:border-white/8 dark:bg-white/[.04] dark:text-white/75"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm prose-slate max-w-none dark:prose-invert prose-headings:text-[#3c7156] dark:prose-headings:text-[#a9e950] prose-strong:text-black/80 dark:prose-strong:text-white/85 prose-a:text-[#3c7156] dark:prose-a:text-[#a9e950] prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center gap-2 rounded-2xl border border-black/8 bg-black/[.03] px-4 py-3 dark:border-white/8 dark:bg-white/[.04]">
                        <LoaderCircle className="size-4 animate-spin text-[#3c7156] dark:text-[#a9e950]" />
                        <span className="text-xs font-medium text-black/40 dark:text-white/40">
                          Thinking...
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Scroll-to-bottom indicator */}
            {messages.length > 3 && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="absolute bottom-[4.5rem] z-10 grid size-7 place-items-center rounded-full border border-black/10 bg-white/90 text-black/40 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-black/60 dark:border-white/10 dark:bg-[#111512]/90 dark:text-white/40 dark:hover:text-white/60"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
            )}

            {/* Input */}
            <footer className="shrink-0 border-t border-black/8 bg-white/80 p-3 backdrop-blur-sm dark:border-white/8 dark:bg-[#111512]/80">
              <div className="flex items-end gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 transition-colors focus-within:border-[#3c7156]/40 dark:border-white/10 dark:bg-white/[.04] dark:focus-within:border-[#a9e950]/40">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your roadmap..."
                  disabled={isLoading}
                  rows={1}
                  className="min-h-[36px] max-h-[100px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-black/80 outline-none placeholder:text-black/30 disabled:opacity-50 dark:text-white/85 dark:placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#3c7156] text-white transition hover:bg-[#2a5a3e] disabled:opacity-30 dark:bg-[#a9e950] dark:text-[#17211b] dark:hover:bg-[#b8f560]"
                >
                  <CornerDownLeft className="size-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[9px] font-medium text-black/25 dark:text-white/20">
                AI responses are based on your roadmap context
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
