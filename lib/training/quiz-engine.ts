import type { TrainingQuestionType } from "@prisma/client";

export type QuizQuestion = {
  id: string;
  type: TrainingQuestionType;
  prompt: string;
  /** For MULTIPLE_CHOICE / IMAGE_RECOGNITION / SCENARIO_RESPONSE / OPERATIONAL_DECISION /
   *  ALLERGEN_IDENTIFICATION / PACKING_VERIFICATION. */
  options?: { id: string; label: string; correct?: boolean; imageUrl?: string }[];
  /** For TRUE_FALSE. */
  correctBoolean?: boolean;
  /** For PROCESS_ORDERING — the canonical, ordered list of step IDs. */
  correctOrder?: string[];
  /** Explanation shown after answering. */
  explanation?: string;
  /** Optional image attached to the prompt. */
  imageUrl?: string;
};

export type QuizDefinition = {
  questions: QuizQuestion[];
  passingScore: number;
};

export type QuizAnswer = {
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  booleanAnswer?: boolean;
  orderedIds?: string[];
};

export type QuizGrade = {
  score: number;
  passed: boolean;
  perQuestion: { questionId: string; correct: boolean }[];
};

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

export function gradeQuiz(definition: QuizDefinition, answers: QuizAnswer[]): QuizGrade {
  if (definition.questions.length === 0) {
    return { score: 100, passed: true, perQuestion: [] };
  }
  const answerByQ = new Map(answers.map((a) => [a.questionId, a]));
  let correctCount = 0;
  const perQuestion = definition.questions.map((q) => {
    const a = answerByQ.get(q.id);
    let correct = false;
    if (!a) {
      correct = false;
    } else {
      switch (q.type) {
        case "TRUE_FALSE":
          correct = a.booleanAnswer === q.correctBoolean;
          break;
        case "PROCESS_ORDERING":
          correct = Array.isArray(q.correctOrder) && Array.isArray(a.orderedIds)
            && arraysEqual(q.correctOrder, a.orderedIds);
          break;
        case "MULTIPLE_CHOICE":
        case "IMAGE_RECOGNITION":
        case "SCENARIO_RESPONSE":
        case "OPERATIONAL_DECISION":
        case "PACKING_VERIFICATION":
        case "ALLERGEN_IDENTIFICATION":
        default: {
          const correctOption = q.options?.find((o) => o.correct);
          correct = !!correctOption && a.selectedOptionId === correctOption.id;
          break;
        }
      }
    }
    if (correct) correctCount += 1;
    return { questionId: q.id, correct };
  });
  const score = Math.round((correctCount / definition.questions.length) * 100);
  return { score, passed: score >= definition.passingScore, perQuestion };
}
