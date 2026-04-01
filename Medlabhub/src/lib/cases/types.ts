export type Department =
  | "Microbiology"
  | "Molecular Biology / Genetics"
  | "Clinical Chemistry"
  | "Hematology"
  | "Immunology / Serology"
  | "Blood Bank / Immunohematology"
  | "Histopathology / Cytology";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type SimulatorMode = "learning" | "exam" | "faculty";

export interface CaseQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index into options
  hint?: string;
}

export interface LabCase {
  id: string;
  title: string;
  department: Department;
  difficulty: Difficulty;
  patientAge: number;
  patientGender: "Male" | "Female" | "Child" | "Neonate";
  clinicalPresentation: string;
  history: string;
  sampleType: string;
  laboratoryFindings: string[];
  questions: CaseQuestion[];
  explanation: string;
  reference: string;
}
