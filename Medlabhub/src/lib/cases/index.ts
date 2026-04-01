import { LabCase } from "./types";
import { microbiologyCases } from "./microbiologyCases";
import { hematologyCases } from "./hematologyCases";
import { chemistryCases } from "./chemistryCases";
import { immunologyCases } from "./immunologyCases";
import { bloodBankCases } from "./bloodBankCases";
import { histopathologyCases } from "./histopathologyCases";
import { molecularCases } from "./molecularCases";

export type { LabCase, Department, Difficulty, SimulatorMode, CaseQuestion } from "./types";

export const allCases: LabCase[] = [
  ...microbiologyCases,
  ...hematologyCases,
  ...chemistryCases,
  ...immunologyCases,
  ...bloodBankCases,
  ...histopathologyCases,
  ...molecularCases,
];

export const departments = [
  "Microbiology",
  "Hematology",
  "Clinical Chemistry",
  "Immunology / Serology",
  "Blood Bank / Immunohematology",
  "Histopathology / Cytology",
  "Molecular Biology / Genetics",
] as const;
