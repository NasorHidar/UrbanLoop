import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEcoSplit,
  calculateContainerRefund,
  calculateMonsoonRiskReduction,
  calculateTreeFundProgress,
  evaluateFoodSafetyStatus,
  calculateCivicImpactTimeline,
} from './circularEconomy.ts';
import {
  calculateCompostBioChemistry,
  NATIVE_CANOPY_SPECIES,
} from './bioscienceCompostEngine.ts';

test('calculateEcoSplit accurately applies 95/5 split', () => {
  const result100 = calculateEcoSplit(100, 5);
  assert.equal(result100.walletPoints, 95);
  assert.equal(result100.treeFundPoints, 5);
  assert.equal(result100.grossPoints, 100);

  const result250 = calculateEcoSplit(250, 5);
  assert.equal(result250.treeFundPoints, 13);
  assert.equal(result250.walletPoints, 237);

  const zeroResult = calculateEcoSplit(0);
  assert.equal(zeroResult.walletPoints, 0);
  assert.equal(zeroResult.treeFundPoints, 0);
});

test('calculateContainerRefund handles deposit and green point math', () => {
  const res = calculateContainerRefund(10, 5, 5);
  assert.equal(res.totalContainers, 20);
  assert.equal(res.refundSGD, 2.0);
  assert.equal(res.refundBDT, 170);
  assert.equal(res.greenPoints, (10 * 5) + (5 * 8) + (5 * 6));
});

test('calculateMonsoonRiskReduction computes risk mitigation appropriately', () => {
  const zeroCleared = calculateMonsoonRiskReduction(0, 12, 50);
  assert.equal(zeroCleared.clearedPct, 0);
  assert.equal(zeroCleared.riskReductionPct, 0);
  assert.equal(zeroCleared.avoidedInundationSqM, 0);

  const fullCleared = calculateMonsoonRiskReduction(12, 12, 50);
  assert.equal(fullCleared.clearedPct, 100);
  assert.equal(fullCleared.riskReductionPct, 78);
  assert.equal(fullCleared.avoidedInundationSqM, 12 * 3200);
  assert(fullCleared.waterlogDurationHours < zeroCleared.waterlogDurationHours);
});

test('calculateTreeFundProgress monitors cycle towards next tree', () => {
  const progress4000 = calculateTreeFundProgress(4000, 500);
  assert.equal(progress4000.treesFunded, 8);
  assert.equal(progress4000.currentCyclePoints, 0);
  assert.equal(progress4000.progressToNextTreePct, 0);

  const progress4400 = calculateTreeFundProgress(4400, 500);
  assert.equal(progress4400.treesFunded, 8);
  assert.equal(progress4400.currentCyclePoints, 400);
  assert.equal(progress4400.progressToNextTreePct, 80);
  assert.equal(progress4400.pointsNeededForNextTree, 100);
});

test('evaluateFoodSafetyStatus strictly locks expired food for human consumption', () => {
  const now = 1000000;
  const futureExpiry = now + (60 * 60 * 1000);
  const activeStatus = evaluateFoodSafetyStatus(futureExpiry, now);
  assert.equal(activeStatus.isSafe, true);
  assert.equal(activeStatus.statusText, 'Available');
  assert.equal(activeStatus.canBridgeToBioCompost, false);

  const pastExpiry = now - 1000;
  const expiredStatus = evaluateFoodSafetyStatus(pastExpiry, now);
  assert.equal(expiredStatus.isSafe, false);
  assert.equal(expiredStatus.statusText, 'Expired (Locked)');
  assert.equal(expiredStatus.canBridgeToBioCompost, true);
});

test('calculateCompostBioChemistry computes C:N stoichiometry and methane avoidance', () => {
  const optimalMix = calculateCompostBioChemistry({
    foodWasteKg: 30, // 30 * 16 = 480
    bakeryWasteKg: 20, // 20 * 28 = 560
    brownBulkingKg: 15, // 15 * 80 = 1200 -> total 2240 / 65 = ~34.5
  });

  assert.equal(optimalMix.totalMassKg, 65);
  assert(optimalMix.blendedCnRatio > 20 && optimalMix.blendedCnRatio < 40);
  assert.equal(optimalMix.methaneAvoidedKgCO2e, +((30 + 20) * 1.25).toFixed(1));
  assert(optimalMix.projectedHumusYieldKg > 15);
  assert(NATIVE_CANOPY_SPECIES.length >= 4);
});

test('calculateCivicImpactTimeline generates accurate time series for daily, weekly, and monthly', () => {
  const daily = calculateCivicImpactTimeline('daily', 200, 4);
  assert.equal(daily.timeframe, 'daily');
  assert.equal(daily.series.length, 14);
  assert(daily.summary.totalFoodSavedKg > 0);
  assert(daily.summary.totalDrainsCleared > 0);
  assert.equal(daily.series[daily.series.length - 1].cumulativeFoodKg, daily.summary.totalFoodSavedKg);
  assert.equal(daily.series[daily.series.length - 1].cumulativeDrainsCleared, daily.summary.totalDrainsCleared);

  const weekly = calculateCivicImpactTimeline('weekly', 150, 2);
  assert.equal(weekly.timeframe, 'weekly');
  assert.equal(weekly.series.length, 8);
  assert(weekly.summary.totalMealsProvided > weekly.summary.totalFoodSavedKg);

  const monthly = calculateCivicImpactTimeline('monthly', 300, 5);
  assert.equal(monthly.timeframe, 'monthly');
  assert.equal(monthly.series.length, 6);
  assert(monthly.summary.floodRiskReductionPct > 0);
});
