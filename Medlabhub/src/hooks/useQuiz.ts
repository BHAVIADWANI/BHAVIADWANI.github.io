import { useState, useCallback } from "react";
import { organismDatabase, type Organism } from "@/lib/organismData";
import { getDepartmentQuestions, type Department, type DepartmentQuestion } from "@/lib/departmentQuestions";

export type QuestionType =
  | "identify-by-traits"
  | "name-the-disease"
  | "gram-stain"
  | "biochemical"
  | "resistance"
  | "virulence"
  | "culture"
  | "department";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  clues: string[];
  options: string[];
  correctAnswer: string;
  explanation: string;
  organism?: Organism;
  category?: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedAnswer: string | null;
  isRevealed: boolean;
  score: number;
  answered: number;
  isComplete: boolean;
  department: Department;
}

const QUESTION_COUNT = 15;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffleArray(arr).slice(0, n);
}

function pickDistractors(correct: string, pool: string[], count = 3): string[] {
  const filtered = pool.filter((p) => p !== correct);
  return pick(filtered, count);
}

function generateMicrobiologyQuestion(organism: Organism, allOrganisms: Organism[]): QuizQuestion {
  const types: QuestionType[] = [
    "identify-by-traits",
    "gram-stain",
    "biochemical",
    "name-the-disease",
  ];

  if (organism.virulenceFactors?.length) types.push("virulence");
  if (organism.cultureConditions) types.push("culture");
  if (organism.resistance.acquired.length > 0 || organism.resistance.intrinsic.length > 0) types.push("resistance");

  const type = types[Math.floor(Math.random() * types.length)];
  const allNames = allOrganisms.map((o) => o.name);

  switch (type) {
    case "identify-by-traits": {
      const clues = [
        `Gram stain: ${organism.gramStain}`,
        `Shape: ${organism.shape}`,
        `Oxygen requirement: ${organism.oxygen}`,
        `Catalase: ${organism.characteristics.catalase}`,
        `Oxidase: ${organism.characteristics.oxidase}`,
      ];
      if (organism.characteristics.hemolysis) clues.push(`Hemolysis: ${organism.characteristics.hemolysis}`);
      if (organism.characteristics.coagulase) clues.push(`Coagulase: ${organism.characteristics.coagulase}`);
      if (organism.characteristics.sporeForming !== undefined) clues.push(`Spore-forming: ${organism.characteristics.sporeForming ? "Yes" : "No"}`);

      const distractors = pickDistractors(organism.name, allNames);
      return {
        id: `${organism.id}-${type}-${Math.random()}`,
        type,
        prompt: "Identify this organism based on the following characteristics:",
        clues: pick(clues, Math.min(5, clues.length)),
        options: shuffleArray([organism.name, ...distractors]),
        correctAnswer: organism.name,
        explanation: `${organism.name} is a ${organism.gramStain.toLowerCase()} ${organism.shape.toLowerCase()} that is ${organism.characteristics.catalase.toLowerCase()} catalase and ${organism.characteristics.oxidase.toLowerCase()} oxidase.`,
        organism,
      };
    }

    case "gram-stain": {
      const distractors = pickDistractors(
        organism.gramStain,
        ["Gram Positive", "Gram Negative", "Variable", "Not Applicable"]
      );
      return {
        id: `${organism.id}-${type}-${Math.random()}`,
        type,
        prompt: `What is the Gram stain result for ${organism.name}?`,
        clues: [],
        options: shuffleArray([organism.gramStain, ...distractors]),
        correctAnswer: organism.gramStain,
        explanation: `${organism.name} is ${organism.gramStain}. It is a ${organism.shape.toLowerCase()} found in ${organism.habitat.toLowerCase()}.`,
        organism,
      };
    }

    case "biochemical": {
      const tests = [
        { name: "Catalase", value: organism.characteristics.catalase },
        { name: "Oxidase", value: organism.characteristics.oxidase },
      ];
      if (organism.characteristics.coagulase) tests.push({ name: "Coagulase", value: organism.characteristics.coagulase });
      if (organism.characteristics.urease) tests.push({ name: "Urease", value: organism.characteristics.urease });
      if (organism.characteristics.indole) tests.push({ name: "Indole", value: organism.characteristics.indole });

      const test = tests[Math.floor(Math.random() * tests.length)];
      const distractors = pickDistractors(test.value, ["Positive", "Negative", "Variable"]);
      return {
        id: `${organism.id}-${type}-${Math.random()}`,
        type,
        prompt: `What is the ${test.name} test result for ${organism.name}?`,
        clues: [],
        options: shuffleArray([test.value, ...distractors]),
        correctAnswer: test.value,
        explanation: `${organism.name} is ${test.name} ${test.value.toLowerCase()}.`,
        organism,
      };
    }

    case "name-the-disease": {
      if (organism.diseases.length === 0) {
        return generateMicrobiologyQuestion(organism, allOrganisms);
      }
      const disease = organism.diseases[Math.floor(Math.random() * organism.diseases.length)];
      const distractors = pickDistractors(organism.name, allNames);
      return {
        id: `${organism.id}-${type}-${Math.random()}`,
        type,
        prompt: `Which organism is most commonly associated with "${disease}"?`,
        clues: [],
        options: shuffleArray([organism.name, ...distractors]),
        correctAnswer: organism.name,
        explanation: `${organism.name} is a well-known cause of ${disease.toLowerCase()}.${organism.clinicalSignificance ? " " + organism.clinicalSignificance : ""}`,
        organism,
      };
    }

    case "virulence": {
      const factor = organism.virulenceFactors![Math.floor(Math.random() * organism.virulenceFactors!.length)];
      const distractors = pickDistractors(organism.name, allNames);
      return {
        id: `${organism.id}-${type}-${Math.random()}`,
        type,
        prompt: `Which organism produces the virulence factor: "${factor}"?`,
        clues: [],
        options: shuffleArray([organism.name, ...distractors]),
        correctAnswer: organism.name,
        explanation: `${factor} is a virulence factor of ${organism.name}.`,
        organism,
      };
    }

    case "culture": {
      const distractors = pickDistractors(organism.name, allNames);
      const snippet = organism.cultureConditions!.length > 100
        ? organism.cultureConditions!.slice(0, 100) + "…"
        : organism.cultureConditions!;
      return {
        id: `${organism.id}-${type}-${Math.random()}`,
        type,
        prompt: `Identify the organism from this culture description: "${snippet}"`,
        clues: [],
        options: shuffleArray([organism.name, ...distractors]),
        correctAnswer: organism.name,
        explanation: `${organism.name}: ${organism.cultureConditions}`,
        organism,
      };
    }

    case "resistance": {
      const allResistance = [...organism.resistance.intrinsic, ...organism.resistance.acquired];
      if (allResistance.length === 0) return generateMicrobiologyQuestion(organism, allOrganisms);
      const drug = allResistance[Math.floor(Math.random() * allResistance.length)];
      const distractors = pickDistractors(organism.name, allNames);
      return {
        id: `${organism.id}-${type}-${Math.random()}`,
        type,
        prompt: `Which organism has resistance to "${drug}"?`,
        clues: [],
        options: shuffleArray([organism.name, ...distractors]),
        correctAnswer: organism.name,
        explanation: `${organism.name} shows resistance to ${drug}. Mechanism: ${organism.resistance.mechanism}`,
        organism,
      };
    }

    default:
      return generateMicrobiologyQuestion(organism, allOrganisms);
  }
}

function convertDepartmentQuestion(dq: DepartmentQuestion): QuizQuestion {
  return {
    id: dq.id,
    type: "department",
    prompt: dq.prompt,
    clues: dq.clues,
    options: dq.options,
    correctAnswer: dq.correctAnswer,
    explanation: dq.explanation,
    category: dq.category,
  };
}

export function useQuiz() {
  const [state, setState] = useState<QuizState | null>(null);

  const startQuiz = useCallback((department: Department = "microbiology") => {
    let questions: QuizQuestion[];

    if (department === "microbiology") {
      const selected = pick(organismDatabase.filter((o) => o.pathogenic), QUESTION_COUNT);
      questions = selected.map((org) => generateMicrobiologyQuestion(org, organismDatabase));
    } else {
      const deptQuestions = getDepartmentQuestions(department, QUESTION_COUNT);
      questions = deptQuestions.map(convertDepartmentQuestion);
    }

    setState({
      questions,
      currentIndex: 0,
      selectedAnswer: null,
      isRevealed: false,
      score: 0,
      answered: 0,
      isComplete: false,
      department,
    });
  }, []);

  const selectAnswer = useCallback((answer: string) => {
    setState((prev) => {
      if (!prev || prev.isRevealed) return prev;
      const isCorrect = answer === prev.questions[prev.currentIndex].correctAnswer;
      return {
        ...prev,
        selectedAnswer: answer,
        isRevealed: true,
        score: prev.score + (isCorrect ? 1 : 0),
        answered: prev.answered + 1,
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const nextIdx = prev.currentIndex + 1;
      if (nextIdx >= prev.questions.length) {
        return { ...prev, isComplete: true };
      }
      return {
        ...prev,
        currentIndex: nextIdx,
        selectedAnswer: null,
        isRevealed: false,
      };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState(null);
  }, []);

  return { state, startQuiz, selectAnswer, nextQuestion, resetQuiz };
}
