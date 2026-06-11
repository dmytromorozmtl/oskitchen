"use client";

import { useMemo, useState } from "react";
import { Award, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FORBIDDEN_CLAIMS_TRAINING_CERTIFICATION_PLEDGE,
  FORBIDDEN_CLAIMS_TRAINING_QUIZ,
} from "@/lib/marketing/forbidden-claims-training-content";
import {
  FORBIDDEN_CLAIMS_TRAINING_CERTIFICATION_TEST_ID,
  FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD,
  FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT,
  FORBIDDEN_CLAIMS_TRAINING_QUIZ_TEST_ID,
} from "@/lib/marketing/forbidden-claims-training-policy";
import { gradeQuiz, type QuizAnswer, type QuizGrade } from "@/lib/training/quiz-engine";

type Phase = "quiz" | "result";

/** Blueprint P1-84 — interactive forbidden claims quiz + certification. */
export function ForbiddenClaimsTrainingQuiz() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grade, setGrade] = useState<QuizGrade | null>(null);
  const [certName, setCertName] = useState("");
  const [certRole, setCertRole] = useState("Sales / GTM");

  const answeredCount = useMemo(
    () => FORBIDDEN_CLAIMS_TRAINING_QUIZ.questions.filter((q) => answers[q.id]).length,
    [answers],
  );

  function submitQuiz() {
    const payload: QuizAnswer[] = FORBIDDEN_CLAIMS_TRAINING_QUIZ.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id],
    }));
    const result = gradeQuiz(FORBIDDEN_CLAIMS_TRAINING_QUIZ, payload);
    setGrade(result);
    setPhase("result");
  }

  function resetQuiz() {
    setAnswers({});
    setGrade(null);
    setPhase("quiz");
  }

  const correctCount = grade
    ? grade.perQuestion.filter((entry) => entry.correct).length
    : 0;
  const passed = grade?.passed ?? false;

  return (
    <div className="space-y-8">
      {phase === "quiz" ? (
        <Card
          className="border-border/80 bg-card/90 shadow-sm"
          data-testid={FORBIDDEN_CLAIMS_TRAINING_QUIZ_TEST_ID}
        >
          <CardHeader>
            <CardTitle className="text-lg">Certification quiz</CardTitle>
            <CardDescription>
              {FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT} questions · pass ≥
              {FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD}/{FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {FORBIDDEN_CLAIMS_TRAINING_QUIZ.questions.map((question, index) => (
              <fieldset
                key={question.id}
                className="rounded-xl border border-border/70 p-4"
                data-testid={`forbidden-claims-question-${question.id}`}
              >
                <legend className="px-1 text-sm font-medium">
                  {index + 1}. {question.prompt}
                </legend>
                <ul className="mt-3 space-y-2">
                  {question.options?.map((option) => (
                    <li key={option.id}>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="radio"
                          name={question.id}
                          className="mt-1"
                          checked={answers[question.id] === option.id}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            ))}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {answeredCount}/{FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT} answered
              </p>
              <Button
                type="button"
                onClick={submitQuiz}
                disabled={answeredCount < FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT}
              >
                Submit quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {phase === "result" && grade ? (
        <div className="space-y-6">
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                {passed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" aria-hidden />
                )}
                <CardTitle className="text-lg">
                  {passed ? "Certification passed" : "Below pass threshold"}
                </CardTitle>
              </div>
              <CardDescription>
                Score: {correctCount}/{FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT} ({grade.score}%)
                — need ≥{FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD}/
                {FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {FORBIDDEN_CLAIMS_TRAINING_QUIZ.questions.map((question, index) => {
                  const result = grade.perQuestion.find((entry) => entry.questionId === question.id);
                  return (
                    <li key={question.id} className="rounded-lg border border-border/60 px-3 py-2">
                      <span className="font-medium">
                        {index + 1}. {result?.correct ? "Correct" : "Review"}
                      </span>
                      {question.explanation ? (
                        <p className="mt-1 text-xs text-muted-foreground">{question.explanation}</p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <Button type="button" variant="outline" onClick={resetQuiz}>
                Retake quiz
              </Button>
            </CardContent>
          </Card>

          {passed ? (
            <Card
              className="border-emerald-500/30 bg-emerald-500/5 shadow-sm"
              data-testid={FORBIDDEN_CLAIMS_TRAINING_CERTIFICATION_TEST_ID}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-700" aria-hidden />
                  <CardTitle className="text-lg">Certification record</CardTitle>
                </div>
                <CardDescription>
                  Complete for sales ops tracker — re-certify quarterly or after verify-claims
                  failure on main.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cert-name">Name</Label>
                    <Input
                      id="cert-name"
                      value={certName}
                      onChange={(event) => setCertName(event.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cert-role">Role</Label>
                    <Input
                      id="cert-role"
                      value={certRole}
                      onChange={(event) => setCertRole(event.target.value)}
                      placeholder="Sales / Solutions / CS"
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-border/80 bg-background/80 p-4 text-sm">
                  <p className="font-semibold">OS Kitchen — Forbidden Claims Certification</p>
                  <p className="mt-2 text-muted-foreground">
                    {certName || "[Name]"} · {certRole} · {new Date().toLocaleDateString()}
                  </p>
                  <p className="mt-2">
                    Quiz score: {correctCount}/{FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT} · Policy:{" "}
                    forbidden-claims-training-p1-84-v1
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                    {FORBIDDEN_CLAIMS_TRAINING_CERTIFICATION_PLEDGE.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  SKIPPED ≠ PASS · verify claims before GTM copy
                </Badge>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
