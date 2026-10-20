/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * UrbanLoop Core Circular Economy Calculation Engine
 * Pure logic functions decoupled for deterministic verification
 */

export interface EcoSplitResult {
  grossPoints: number;
  walletPoints: number;
  treeFundPoints: number;
  ratePct: number;
}

/**
 * Calculates 95/5 micro eco-contribution split for earned civic points
 */
export function calculateEcoSplit(grossPoints: number, contributionPct = 5): EcoSplitResult {
  const safeGross = Math.max(0, Math.floor(grossPoints));
  const rate = Math.min(50, Math.max(1, contributionPct));
  const treeFundPoints = Math.round((safeGross * rate) / 100);
  const walletPoints = safeGross - treeFundPoints;

  return {
    grossPoints: safeGross,
    walletPoints,
    treeFundPoints,
    ratePct: rate,
  };
}

export interface ContainerReturnResult {
  totalContainers: number;
  refundSGD: number;
  refundBDT: number;
  greenPoints: number;
}

/**
 * Calculates deposit return and civic reward points based on Singapore 2026 Proposed Pilot Model
 * Standard deposit: S$0.10 per container (~8.50 BDT equivalent) + 5 civic points per unit
 */
export function calculateContainerRefund(
  petSmall: number,
  petLarge: number,
  cans: number
): ContainerReturnResult {
  const s = Math.max(0, Math.floor(petSmall || 0));
  const l = Math.max(0, Math.floor(petLarge || 0));
  const c = Math.max(0, Math.floor(cans || 0));
  const totalContainers = s + l + c;

  // Deposit of 0.10 SGD per verified container
  const refundSGD = +(totalContainers * 0.10).toFixed(2);
  // Equivalent in BDT (~85 BDT per SGD)
  const refundBDT = Math.round(refundSGD * 85);
  // Points: 5 points per small, 8 points per large, 6 points per can
  const greenPoints = (s * 5) + (l * 8) + (c * 6);

  return {
    totalContainers,
    refundSGD,
    refundBDT,
    greenPoints,
  };
}

export interface MonsoonRiskResult {
  clearedHotspots: number;
  totalHotspots: number;
  clearedPct: number;
  riskReductionPct: number;
  waterlogDurationHours: number;
  avoidedInundationSqM: number;
}

/**
 * Computes ward flood risk mitigation metrics based on preventive drain clearing
 */
export function calculateMonsoonRiskReduction(
  clearedHotspots: number,
  totalHotspots: number,
  rainfallMm: number = 50
): MonsoonRiskResult {
  const total = Math.max(1, totalHotspots);
  const cleared = Math.min(total, Math.max(0, clearedHotspots));
  const clearedPct = Math.round((cleared / total) * 100);

  // Risk reduction formula weighted by clearing percentage
  const baselineRiskReduction = clearedPct * 0.78;
  const riskReductionPct = Math.min(92, Math.max(0, Math.round(baselineRiskReduction)));

  // Waterlogging hours calculation (base 7.5 hrs under intense rain without clearing)
  const baseWaterlog = rainfallMm > 60 ? 8.5 : 5.0;
  const waterlogDurationHours = +(Math.max(0.4, baseWaterlog * (1 - (clearedPct * 0.0085)))).toFixed(1);

  // Inundation area avoided (approx 3,200 sq meters per cleared arterial drain)
  const avoidedInundationSqM = cleared * 3200;

  return {
    clearedHotspots: cleared,
    totalHotspots: total,
    clearedPct,
    riskReductionPct,
    waterlogDurationHours,
    avoidedInundationSqM,
  };
}

export interface TreeFundProgressResult {
  totalPoints: number;
  pointsPerTree: number;
  treesFunded: number;
  currentCyclePoints: number;
  progressToNextTreePct: number;
  pointsNeededForNextTree: number;
}

/**
 * Tracks communal and individual tree planting progress
 */
export function calculateTreeFundProgress(
  totalPoints: number,
  pointsPerTree = 500
): TreeFundProgressResult {
  const pts = Math.max(0, totalPoints);
  const target = Math.max(50, pointsPerTree);
  const treesFunded = Math.floor(pts / target);
  const currentCyclePoints = pts % target;
  const progressToNextTreePct = Math.min(100, Math.round((currentCyclePoints / target) * 100));
  const pointsNeededForNextTree = target - currentCyclePoints;

  return {
    totalPoints: pts,
    pointsPerTree: target,
    treesFunded,
    currentCyclePoints,
    progressToNextTreePct,
    pointsNeededForNextTree,
  };
}

export interface FoodSafetyStatusResult {
  isSafe: boolean;
  minutesRemaining: number;
  statusText: 'Available' | 'Expiring Soon' | 'Expired (Locked)';
  canBridgeToBioCompost: boolean;
}

/**
 * Strict physical timeline verification - No AI certification
 */
export function evaluateFoodSafetyStatus(
  expiryTimestampMs: number,
  nowTimestampMs: number
): FoodSafetyStatusResult {
  const diffMs = expiryTimestampMs - nowTimestampMs;
  const minutesRemaining = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMs <= 0) {
    return {
      isSafe: false,
      minutesRemaining: 0,
      statusText: 'Expired (Locked)',
      canBridgeToBioCompost: true,
    };
  }

  if (minutesRemaining < 30) {
    return {
      isSafe: true,
      minutesRemaining,
      statusText: 'Expiring Soon',
      canBridgeToBioCompost: false,
    };
  }

  return {
    isSafe: true,
    minutesRemaining,
    statusText: 'Available',
    canBridgeToBioCompost: false,
  };
}

export interface CivicImpactPoint {
  period: string;
  foodSavedKg: number;
  cumulativeFoodKg: number;
  drainsCleared: number;
  cumulativeDrainsCleared: number;
  mealsProvided: number;
  co2OffsetKg: number;
  stormWaterFlowLps: number;
}

export interface CivicImpactDashboardData {
  timeframe: 'daily' | 'weekly' | 'monthly';
  series: CivicImpactPoint[];
  summary: {
    totalFoodSavedKg: number;
    totalDrainsCleared: number;
    totalMealsProvided: number;
    totalCo2OffsetKg: number;
    peakFoodDayKg: number;
    peakDrainsDay: number;
    floodRiskReductionPct: number;
  };
}

/**
 * Computes historical and live-synchronized civic impact series
 * incorporating active food rescues and cleared drain counts.
 */
export function calculateCivicImpactTimeline(
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily',
  liveFoodRescuedKg: number = 220,
  liveDrainsCleared: number = 3
): CivicImpactDashboardData {
  const safeLiveFood = Math.max(0, liveFoodRescuedKg);
  const safeLiveDrains = Math.max(0, liveDrainsCleared);

  let rawPoints: { period: string; food: number; drains: number }[] = [];

  if (timeframe === 'daily') {
    // 14 days series leading up to today
    rawPoints = [
      { period: 'Oct 07', food: 14.5, drains: 1 },
      { period: 'Oct 08', food: 18.0, drains: 2 },
      { period: 'Oct 09', food: 12.2, drains: 1 },
      { period: 'Oct 10', food: 22.8, drains: 3 },
      { period: 'Oct 11', food: 19.5, drains: 2 },
      { period: 'Oct 12', food: 16.0, drains: 1 },
      { period: 'Oct 13', food: 25.4, drains: 4 },
      { period: 'Oct 14', food: 20.1, drains: 2 },
      { period: 'Oct 15', food: 28.6, drains: 3 },
      { period: 'Oct 16', food: 24.0, drains: 2 },
      { period: 'Oct 17', food: 31.5, drains: 4 },
      { period: 'Oct 18', food: 29.0, drains: 3 },
      { period: 'Oct 19', food: 35.2, drains: 5 },
      { period: 'Today (Live)', food: Math.max(26.5, safeLiveFood * 0.12), drains: Math.max(2, safeLiveDrains) },
    ];
  } else if (timeframe === 'weekly') {
    // 8 weeks series
    rawPoints = [
      { period: 'W34 (Late Aug)', food: 95.0, drains: 8 },
      { period: 'W35 (Sep Early)', food: 112.5, drains: 11 },
      { period: 'W36 (Sep Mid)', food: 130.0, drains: 14 },
      { period: 'W37 (Sep Late)', food: 148.2, drains: 16 },
      { period: 'W38 (Oct Early)', food: 165.8, drains: 19 },
      { period: 'W39 (Oct 08)', food: 182.0, drains: 21 },
      { period: 'W40 (Oct 15)', food: 210.4, drains: 24 },
      { period: 'Current Week', food: Math.max(120.0, safeLiveFood * 0.55), drains: Math.max(12, safeLiveDrains * 3) },
    ];
  } else {
    // Monthly 2026 Season
    rawPoints = [
      { period: 'May 2026', food: 320.0, drains: 25 },
      { period: 'Jun 2026 (Monsoon Start)', food: 480.5, drains: 42 },
      { period: 'Jul 2026 (Peak Monsoon)', food: 640.0, drains: 58 },
      { period: 'Aug 2026', food: 590.2, drains: 51 },
      { period: 'Sep 2026', food: 710.8, drains: 64 },
      { period: 'Oct 2026 (Current)', food: Math.max(450.0, safeLiveFood * 1.8), drains: Math.max(38, safeLiveDrains * 8) },
    ];
  }

  let cumFood = 0;
  let cumDrains = 0;
  let peakFood = 0;
  let peakDrains = 0;

  const series: CivicImpactPoint[] = rawPoints.map((pt) => {
    cumFood += pt.food;
    cumDrains += pt.drains;
    if (pt.food > peakFood) peakFood = pt.food;
    if (pt.drains > peakDrains) peakDrains = pt.drains;

    return {
      period: pt.period,
      foodSavedKg: +pt.food.toFixed(1),
      cumulativeFoodKg: +cumFood.toFixed(1),
      drainsCleared: pt.drains,
      cumulativeDrainsCleared: cumDrains,
      mealsProvided: Math.round(pt.food * 2.2),
      co2OffsetKg: +(pt.food * 2.5).toFixed(1),
      stormWaterFlowLps: pt.drains * 450, // 450 liters/sec flow restored per cleared drain
    };
  });

  const totalFoodSavedKg = +cumFood.toFixed(1);
  const totalDrainsCleared = cumDrains;
  const totalMealsProvided = Math.round(totalFoodSavedKg * 2.2);
  const totalCo2OffsetKg = +(totalFoodSavedKg * 2.5).toFixed(1);
  const floodRiskReductionPct = Math.min(94, Math.round(totalDrainsCleared * 1.2));

  return {
    timeframe,
    series,
    summary: {
      totalFoodSavedKg,
      totalDrainsCleared,
      totalMealsProvided,
      totalCo2OffsetKg,
      peakFoodDayKg: +peakFood.toFixed(1),
      peakDrainsDay: peakDrains,
      floodRiskReductionPct,
    },
  };
}
