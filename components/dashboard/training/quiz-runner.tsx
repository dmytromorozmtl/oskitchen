"use client";

import { useMemo, useState, useTransition } from "react";

import { submitQuizAction } from "@/actions/training";
import { Button } from "@/components/ui/button";

export type QuizQuestionView = {
  id: string;
  prompt: string;
  options?: { id: string; label: string }[];
  type?: string;
};

export function QuizRunner({
  quizId,
  assignmentId,
  questions,
}: {
  quizId: string;
  assignmentId?: string | null;
  questions: QuizQuestionView[];
}) {
  const initial = useMemo(
    () => Object.fromEntries(questions.map((q) => [q.id, ""])),
    [questions],
  );
  const [answers, setAnswers] = useState<Record<string, string>>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  function submit() {
    const formData = new FormData();
    formData.append("quizId", quizId);
    if (assignmentId) formData.append("assignmentId", assignmentId);
    const payload = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
    formData.append("answersJson", JSON.stringify(payload));
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        await submitQuizAction(formData);
        setResult("Submitted. Score is recorded in your activity log.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submission failed.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-lg border p-3">
          <p className="text-sm font-medium">
            {idx + 1}. {q.prompt}
          </p>
          {q.options ? (
            <ul className="mt-2 space-y-1">
              {q.options.map((opt) => (
                <li key={opt.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === opt.id}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                    />
                    {opt.label}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">(Open-ended question type — manager review required.)</p>
          )}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button type="button" onClick={submit} disabled={isPending}>
          {isPending ? "Submitting…" : "Submit quiz"}
        </Button>
        {result ? <p className="text-xs text-emerald-700">{result}</p> : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
