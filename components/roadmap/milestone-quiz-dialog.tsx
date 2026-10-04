"use client";

import { useCallback, useEffect, useState } from "react";
import { BrainCircuit, Check, LoaderCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  generateMilestoneQuiz,
  type MilestoneQuizQuestion,
} from "@/app/actions/generate-milestone-quiz";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type QuizMilestone = {
  id: string;
  title: string;
};

type MilestoneQuizDialogProps = {
  milestone: QuizMilestone | null;
  onOpenChange: (open: boolean) => void;
  onPassed: (milestone: QuizMilestone) => void;
};

export function MilestoneQuizDialog({
  milestone,
  onOpenChange,
  onPassed,
}: MilestoneQuizDialogProps) {
  const [questions, setQuestions] = useState<MilestoneQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const loadQuiz = useCallback(async () => {
    if (!milestone) return;

    setIsLoading(true);
    setQuestions([]);
    setAnswers({});
    setScore(null);
    setError(null);

    try {
      const result = await generateMilestoneQuiz(milestone.title);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setQuestions(result.questions);
    } catch {
      setError("We couldn't prepare this knowledge check right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [milestone]);

  useEffect(() => {
    if (milestone) void loadQuiz();
  }, [loadQuiz, milestone]);

  function submitQuiz() {
    if (!milestone || questions.length !== 3 || Object.keys(answers).length !== 3) return;

    const nextScore = questions.reduce(
      (total, question, index) => total + (answers[index] === question.correctAnswer ? 1 : 0),
      0,
    );
    setScore(nextScore);

    if (nextScore >= 2) {
      toast.success(`Knowledge check passed — ${nextScore}/3!`, {
        description: "Great work. This milestone is now complete.",
        duration: 7_000,
      });
      onPassed(milestone);
      onOpenChange(false);
      return;
    }

    toast.warning("Almost there! Review the topic and try the quiz again.", {
      duration: 8_000,
    });
  }

  function retryAnswers() {
    setAnswers({});
    setScore(null);
  }

  return (
    <Dialog open={Boolean(milestone)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#c8ff65] text-[#17211b]">
            <BrainCircuit size={27} aria-hidden="true" />
          </div>
          <DialogTitle>Milestone knowledge check</DialogTitle>
          <DialogDescription>
            Answer at least 2 of 3 correctly to complete “{milestone?.title}”.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center" role="status">
            <LoaderCircle className="size-7 animate-spin text-[#3c7156] dark:text-[#c8ff65]" />
            <p className="font-bold">Preparing your three questions…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadQuiz()}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#173f2c] px-4 text-sm font-black text-white dark:bg-[#c8ff65] dark:text-[#17211b]"
            >
              <RotateCcw size={15} /> Try again
            </button>
          </div>
        )}

        {!isLoading && !error && questions.length === 3 && (
          <div className="mt-6 space-y-6">
            {questions.map((question, questionIndex) => (
              <fieldset key={`${questionIndex}-${question.question}`} className="space-y-3">
                <legend className="font-black leading-6">
                  {questionIndex + 1}. {question.question}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[questionIndex] === optionIndex;
                    return (
                      <button
                        key={`${optionIndex}-${option}`}
                        type="button"
                        onClick={() => {
                          if (score === null) {
                            setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
                          }
                        }}
                        aria-pressed={selected}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                          selected
                            ? "border-[#3c7156] bg-[#f0f7e7] text-[#173f2c] dark:border-[#c8ff65] dark:bg-[#c8ff65]/10 dark:text-[#c8ff65]"
                            : "border-black/10 hover:border-[#3c7156]/50 hover:bg-black/[.025] dark:border-white/10 dark:hover:border-[#c8ff65]/40 dark:hover:bg-white/5",
                        )}
                      >
                        <span className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-full border text-xs",
                          selected && "border-[#3c7156] bg-[#3c7156] text-white dark:border-[#c8ff65] dark:bg-[#c8ff65] dark:text-[#17211b]",
                        )}>
                          {selected ? <Check size={14} strokeWidth={3} /> : String.fromCharCode(65 + optionIndex)}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {score !== null && score < 2 ? (
              <div className="rounded-2xl bg-amber-500/10 p-4 text-center">
                <p className="font-black text-amber-800 dark:text-amber-200">Score: {score}/3</p>
                <button
                  type="button"
                  onClick={retryAnswers}
                  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#173f2c] px-5 text-sm font-black text-white dark:bg-[#c8ff65] dark:text-[#17211b]"
                >
                  <RotateCcw size={15} /> Retry quiz
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={Object.keys(answers).length !== 3}
                onClick={submitQuiz}
                className="min-h-12 w-full rounded-xl bg-[#173f2c] px-5 font-black text-white transition hover:bg-[#21573d] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#c8ff65] dark:text-[#17211b] dark:hover:bg-[#d5ff86]"
              >
                Check my answers
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
