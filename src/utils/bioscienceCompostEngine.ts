/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * UrbanLoop Bioscience & Microbial Composting Stoichiometry Engine
 * Adheres to Science Skills (biochemical calculations, microbial phases, methane offsets)
 */

export interface CompostMixInput {
  foodWasteKg: number; // Nitrogen-rich greens (C:N ~ 15:1)
  bakeryWasteKg: number; // Balanced starches (C:N ~ 28:1)
  brownBulkingKg: number; // Carbon-rich dry leaves / sawdust (C:N ~ 80:1)
}

export interface CompostAnalysisResult {
  totalMassKg: number;
  blendedCnRatio: number;
  cnRating: 'Optimal' | 'Too High (Slow Degradation)' | 'Too Low (Nitrogen Odor Risk)';
  idealBrownsToAddKg: number;
  methaneAvoidedKgCO2e: number;
  projectedHumusYieldKg: number;
  currentPhase: 'Mesophilic (20-40°C)' | 'Thermophilic Sanitizing (50-65°C)' | 'Maturation & Curing (Humic Phase)';
  pathogenKillEfficiencyPct: number;
}

/**
 * Calculates biochemical Carbon-to-Nitrogen (C:N) ratio and aerobic compost yield
 */
export function calculateCompostBioChemistry(input: CompostMixInput): CompostAnalysisResult {
  const fw = Math.max(0, input.foodWasteKg);
  const bw = Math.max(0, input.bakeryWasteKg);
  const br = Math.max(0, input.brownBulkingKg);
  const totalMassKg = fw + bw + br;

  if (totalMassKg === 0) {
    return {
      totalMassKg: 0,
      blendedCnRatio: 25,
      cnRating: 'Optimal',
      idealBrownsToAddKg: 0,
      methaneAvoidedKgCO2e: 0,
      projectedHumusYieldKg: 0,
      currentPhase: 'Mesophilic (20-40°C)',
      pathogenKillEfficiencyPct: 99.4,
    };
  }

  // Weight-averaged C:N estimation: Food Greens = 16, Bakery = 28, Browns = 80
  const totalCarbonScore = (fw * 16) + (bw * 28) + (br * 80);
  const blendedCnRatio = +(totalCarbonScore / totalMassKg).toFixed(1);

  let cnRating: CompostAnalysisResult['cnRating'] = 'Optimal';
  let idealBrownsToAddKg = 0;

  if (blendedCnRatio < 22) {
    cnRating = 'Too Low (Nitrogen Odor Risk)';
    // Calculate brown bulking needed to reach 28:1
    idealBrownsToAddKg = Math.max(0, Math.round(((28 * totalMassKg) - totalCarbonScore) / (80 - 28)));
  } else if (blendedCnRatio > 38) {
    cnRating = 'Too High (Slow Degradation)';
  }

  // Methane avoidance: 1.25 kg CO2e avoided per kg food diverted from anaerobic ditch/landfill rotting
  const methaneAvoidedKgCO2e = +((fw + bw) * 1.25).toFixed(1);

  // Humus conversion: Aerobic microbial reduction yields ~30% stabilized organic fertilizer
  const projectedHumusYieldKg = +(totalMassKg * 0.32).toFixed(1);

  // Biological sanitation phase: reaches thermophilic 58°C when C:N is optimal
  const isThermophilic = blendedCnRatio >= 22 && blendedCnRatio <= 35;
  const currentPhase = isThermophilic 
    ? 'Thermophilic Sanitizing (50-65°C)' 
    : blendedCnRatio > 35 
    ? 'Maturation & Curing (Humic Phase)' 
    : 'Mesophilic (20-40°C)';

  const pathogenKillEfficiencyPct = isThermophilic ? 99.8 : 94.5;

  return {
    totalMassKg,
    blendedCnRatio,
    cnRating,
    idealBrownsToAddKg,
    methaneAvoidedKgCO2e,
    projectedHumusYieldKg,
    currentPhase,
    pathogenKillEfficiencyPct,
  };
}

export interface TreeSpeciesBioProfile {
  speciesName: string;
  scientificName: string;
  family: string;
  annualCarbonKg: number;
  rootDepthMeters: number;
  waterRetentionLitersPerRainEvent: number;
  biomeRole: string;
  soilErosionReductionPct: number;
}

export const NATIVE_CANOPY_SPECIES: TreeSpeciesBioProfile[] = [
  {
    speciesName: 'Neem (Margosa)',
    scientificName: 'Azadirachta indica',
    family: 'Meliaceae',
    annualCarbonKg: 24.5,
    rootDepthMeters: 4.5,
    waterRetentionLitersPerRainEvent: 320,
    biomeRole: 'Antimicrobial foliage, air particulate particulate capture & lake soil anchor.',
    soilErosionReductionPct: 74,
  },
  {
    speciesName: 'Krishnachura (Flamboyant)',
    scientificName: 'Delonix regia',
    family: 'Fabaceae',
    annualCarbonKg: 32.0,
    rootDepthMeters: 3.8,
    waterRetentionLitersPerRainEvent: 450,
    biomeRole: 'Extensive canopy shade (reduces asphalt urban heat island by 3.2°C).',
    soilErosionReductionPct: 68,
  },
  {
    speciesName: 'Chatim (Scholar Tree)',
    scientificName: 'Alstonia scholaris',
    family: 'Apocynaceae',
    annualCarbonKg: 28.0,
    rootDepthMeters: 5.2,
    waterRetentionLitersPerRainEvent: 520,
    biomeRole: 'Waterlogging-tolerant deep taproot, stabilizes saturated wetland soil.',
    soilErosionReductionPct: 82,
  },
  {
    speciesName: 'Jarul (Pride of India)',
    scientificName: 'Lagerstroemia speciosa',
    family: 'Lythraceae',
    annualCarbonKg: 21.0,
    rootDepthMeters: 3.5,
    waterRetentionLitersPerRainEvent: 290,
    biomeRole: 'Monsoon canal bank stabilization and heavy silt interception.',
    soilErosionReductionPct: 79,
  },
];
