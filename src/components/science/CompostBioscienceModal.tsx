/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * UrbanLoop Bioscience Modal: Microbial Composting Stoichiometry & Native Tree Sequestration
 */

import React, { useState } from 'react';
import { 
  calculateCompostBioChemistry, 
  NATIVE_CANOPY_SPECIES 
} from '../../utils/bioscienceCompostEngine';
import { 
  Microscope, 
  Flame, 
  Leaf, 
  Sparkles, 
  ShieldCheck, 
  Droplets, 
  Info, 
  X, 
  ChevronRight, 
  FlaskConical 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CompostBioscienceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [foodWasteKg, setFoodWasteKg] = useState<number>(45);
  const [bakeryWasteKg, setBakeryWasteKg] = useState<number>(25);
  const [brownBulkingKg, setBrownBulkingKg] = useState<number>(20);
  const [activeTab, setActiveTab] = useState<'compost' | 'canopy'>('compost');

  if (!isOpen) return null;

  const analysis = calculateCompostBioChemistry({
    foodWasteKg,
    bakeryWasteKg,
    brownBulkingKg,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-emerald-400 p-5 sm:p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Bioscience & Microbial Stoichiometry Lab
              </h3>
              <p className="text-xs text-slate-500">
                Thermodynamic composting phases & native tree bio-sequestration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('compost')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'compost'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Aerobic C:N Stoichiometry</span>
          </button>
          <button
            onClick={() => setActiveTab('canopy')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'canopy'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>Native Tree Bio-Profiles</span>
          </button>
        </div>

        {activeTab === 'compost' ? (
          <div className="space-y-4">
            
            {/* Sliders Area */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Input Biochemical Feedstock (kg)
              </span>

              {/* Slider 1: Food Waste (Greens) */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>Nitrogen-Rich Greens (Produce & Cooked Meals - C:N ~16:1)</span>
                  <span className="font-mono text-emerald-700">{foodWasteKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={foodWasteKg}
                  onChange={(e) => setFoodWasteKg(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Bakery starches */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>Bakery & Starches (Bread, Grain Mash - C:N ~28:1)</span>
                  <span className="font-mono text-amber-700">{bakeryWasteKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bakeryWasteKg}
                  onChange={(e) => setBakeryWasteKg(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Carbon Browns */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>Carbon Bulking Material (Dry Leaves, Sawdust - C:N ~80:1)</span>
                  <span className="font-mono text-sky-700">{brownBulkingKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brownBulkingKg}
                  onChange={(e) => setBrownBulkingKg(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Results Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Blended C:N Ratio
                </span>
                <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                  {analysis.blendedCnRatio} : 1
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  Target: 25-30:1 (Optimal)
                </span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Methane Avoided
                </span>
                <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                  {analysis.methaneAvoidedKgCO2e} kg
                </div>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  $CO_2$e GHG Offset
                </span>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                  Humus Compost Yield
                </span>
                <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                  {analysis.projectedHumusYieldKg} kg
                </div>
                <span className="text-[10px] text-sky-700 block mt-0.5">
                  Stabilized Bio-Fertilizer
                </span>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                  Pathogen Kill Rate
                </span>
                <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                  {analysis.pathogenKillEfficiencyPct}%
                </div>
                <span className="text-[10px] text-indigo-700 block mt-0.5">
                  Thermal Sanitation
                </span>
              </div>

            </div>

            {/* Thermal Phase Explanation */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl flex items-start gap-3">
              <Flame className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 leading-relaxed">
                <span className="font-bold">Active Microbial Phase: {analysis.currentPhase}</span>
                <p className="mt-1 text-slate-700">
                  Thermophilic heating above 55°C is achieved through rapid aerobic microbial respiration by Bacillus and Actinobacteria. This natural exothermic process hydrolyzes complex organic starches into nutrient-dense humus and destroys foul odor-causing pathogens without synthetic chemicals.
                </p>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Urban Canopy Native Botanical Species
            </span>
            <div className="space-y-2.5">
              {NATIVE_CANOPY_SPECIES.map((spec) => (
                <div
                  key={spec.scientificName}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-emerald-300 transition-all text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{spec.speciesName}</span>
                      <span className="italic text-slate-500 ml-2 text-xs">({spec.scientificName})</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-xs bg-emerald-100 px-2 py-0.5 rounded-lg">
                      +{spec.annualCarbonKg} kg $CO_2$/yr
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    {spec.biomeRole}
                  </p>

                  <div className="pt-1.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                    <span>Root Depth: {spec.rootDepthMeters}m</span>
                    <span>Storm Retention: {spec.waterRetentionLitersPerRainEvent} L/cloudburst</span>
                    <span className="text-emerald-700 font-semibold">Erosion Reduction: {spec.soilErosionReductionPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
