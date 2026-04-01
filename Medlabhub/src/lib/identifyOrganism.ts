import { organismDatabase, type Organism } from "./organismData";

interface IdentificationInput {
  gramStain: string;
  cellShape: string;
  arrangement: string;
  motility: string;
  oxygen: string;
  catalase: string;
  oxidase: string;
  biochemicalTests: string[];
  colonyColor: string;
  hemolysis: string;
}

interface ScoredOrganism {
  organism: Organism;
  confidence: number;
  matchedTraits: string[];
}

export function identifyOrganisms(input: IdentificationInput): ScoredOrganism[] {
  const results: ScoredOrganism[] = [];

  for (const organism of organismDatabase) {
    let score = 0;
    let maxScore = 0;
    const matched: string[] = [];

    // Gram stain (high weight)
    if (input.gramStain) {
      maxScore += 25;
      if (organism.gramStain === input.gramStain) {
        score += 25;
        matched.push("Gram stain");
      }
    }

    // Cell shape
    if (input.cellShape) {
      maxScore += 20;
      if (organism.shape === input.cellShape) {
        score += 20;
        matched.push("Cell shape");
      }
    }

    // Arrangement
    if (input.arrangement) {
      maxScore += 10;
      if (organism.arrangement.toLowerCase().includes(input.arrangement.toLowerCase())) {
        score += 10;
        matched.push("Arrangement");
      }
    }

    // Oxygen requirement
    if (input.oxygen) {
      maxScore += 10;
      if (organism.oxygen === input.oxygen) {
        score += 10;
        matched.push("Oxygen requirement");
      }
    }

    // Motility
    if (input.motility) {
      maxScore += 5;
      const isMotile = input.motility === "Motile";
      const orgMotile = organism.characteristics.motility.toLowerCase().includes("motile") && !organism.characteristics.motility.toLowerCase().includes("non-motile");
      if (isMotile === orgMotile) {
        score += 5;
        matched.push("Motility");
      }
    }

    // Catalase
    if (input.catalase) {
      maxScore += 10;
      if (organism.characteristics.catalase === input.catalase) {
        score += 10;
        matched.push("Catalase");
      }
    }

    // Oxidase
    if (input.oxidase) {
      maxScore += 10;
      if (organism.characteristics.oxidase === input.oxidase) {
        score += 10;
        matched.push("Oxidase");
      }
    }

    // Hemolysis
    if (input.hemolysis) {
      maxScore += 10;
      const hemoMap: Record<string, string[]> = {
        "Alpha (α)": ["Alpha", "alpha"],
        "Beta (β)": ["Beta", "beta"],
        "Gamma (γ)": ["Gamma", "gamma", "none", "None"],
      };
      const keywords = hemoMap[input.hemolysis] || [];
      if (organism.characteristics.hemolysis && keywords.some((k) => organism.characteristics.hemolysis!.includes(k))) {
        score += 10;
        matched.push("Hemolysis");
      }
    }

    // Biochemical tests bonus
    if (input.biochemicalTests.length > 0) {
      for (const test of input.biochemicalTests) {
        maxScore += 3;
        const testLower = test.toLowerCase();
        let matched2 = false;

        if (testLower.includes("coagulase") && organism.characteristics.coagulase === "Positive") {
          matched2 = true;
        } else if (testLower.includes("urease") && organism.characteristics.urease === "Positive") {
          matched2 = true;
        } else if (testLower.includes("indole") && organism.characteristics.indole === "Positive") {
          matched2 = true;
        } else if (testLower.includes("h2s") && organism.characteristics.h2s === "Positive") {
          matched2 = true;
        } else if (testLower.includes("lactose") && organism.characteristics.lactoseFermenter === true) {
          matched2 = true;
        } else if (testLower.includes("bile esculin") && organism.labIdentification.some((l) => l.toLowerCase().includes("bile esculin"))) {
          matched2 = true;
        } else if (testLower.includes("camp") && organism.labIdentification.some((l) => l.toLowerCase().includes("camp"))) {
          matched2 = true;
        } else if (testLower.includes("pyr") && organism.labIdentification.some((l) => l.toLowerCase().includes("pyr"))) {
          matched2 = true;
        } else if (testLower.includes("optochin") && organism.labIdentification.some((l) => l.toLowerCase().includes("optochin"))) {
          matched2 = true;
        } else if (testLower.includes("bacitracin") && organism.labIdentification.some((l) => l.toLowerCase().includes("bacitracin"))) {
          matched2 = true;
        } else if (testLower.includes("novobiocin") && organism.labIdentification.some((l) => l.toLowerCase().includes("novobiocin"))) {
          matched2 = true;
        } else if (testLower.includes("hippurate") && organism.labIdentification.some((l) => l.toLowerCase().includes("hippurate"))) {
          matched2 = true;
        } else if (testLower.includes("quellung") && organism.labIdentification.some((l) => l.toLowerCase().includes("quellung"))) {
          matched2 = true;
        } else if (testLower.includes("dnase") && organism.labIdentification.some((l) => l.toLowerCase().includes("dnase"))) {
          matched2 = true;
        } else if (testLower.includes("mannitol") && organism.labIdentification.some((l) => l.toLowerCase().includes("mannitol"))) {
          matched2 = true;
        } else {
          // Generic match against lab identification
          const keyword = testLower.split(" ")[0];
          if (organism.labIdentification.some((l) => l.toLowerCase().includes(keyword))) {
            score += 2;
            matched.push(test);
          }
        }

        if (matched2) {
          score += 3;
          matched.push(test);
        }
      }
    }

    if (maxScore === 0) continue;

    const confidence = Math.round((score / maxScore) * 100);
    if (confidence > 20) {
      results.push({ organism, confidence, matchedTraits: matched });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
}
