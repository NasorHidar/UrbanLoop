/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { WasteType, WasteBatch } from '../../types';
import { calculateContainerRefund } from '../../utils/circularEconomy';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Recycle, 
  Calculator, 
  Coins, 
  Leaf, 
  FileCheck2, 
  Layers, 
  Sparkles, 
  Info 
} from 'lucide-react';

export const RecyclingPassportPage: React.FC = () => {
  const {
    wasteBatches,
    advanceBatchStep,
    processContainerReturn,
    role,
    t,
    lang,
    addToast,
  } = useUrbanLoop();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<WasteBatch | null>(wasteBatches[0] || null);

  // Container Return Reverse Vending Simulator State
  const [smallPetCount, setSmallPetCount] = useState<number>(10);
  const [largePetCount, setLargePetCount] = useState<number>(4);
  const [canCount, setCanCount] = useState<number>(6);
  const [generatedVendingReceipt, setGeneratedVendingReceipt] = useState<{
    code: string;
    total: number;
    sgd: number;
    bdt: number;
    points: number;
  } | null>(null);

  // Filtered Batches
  const filteredBatches = wasteBatches.filter((b) => {
    const matchesSearch = 
      b.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sourceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || b.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Calculate live simulator output
  const returnCalc = calculateContainerRefund(smallPetCount, largePetCount, canCount);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (returnCalc.totalContainers <= 0) return;

    const res = processContainerReturn(smallPetCount, largePetCount, canCount);
    setGeneratedVendingReceipt({
      code: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
      total: returnCalc.totalContainers,
      sgd: res.refundSGD,
      bdt: returnCalc.refundBDT,
      points: res.greenPoints,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
              <QrCode className="w-4 h-4" />
              <span>Drain2Value 2.0 · Proof-of-Recycling Passport</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {lang === 'en' ? 'Verifiable Waste Batch Passports' : 'যাচাইযোগ্য বর্জ্য রিসাইক্লিং পাসপোর্ট'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {lang === 'en'
                ? 'Immutable multi-step tracking from supplier handover to mechanical flaking and aerobic composting. Rewards remain pending until industrial recyclers verify the final shred.'
                : 'বর্জ্য সরবরাহকারী থেকে শুরু করে মেকানিক্যাল শ্রেডিং ও কম্পোস্টিং পর্যন্ত ৪-ধাপের ভেরিফিকেশন। রিসাইক্লিং নিশ্চিত না হওয়া পর্যন্ত রিওয়ার্ড পয়েন্ট পেন্ডিং থাকে।'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Authorized Role:</span>
            <span className="text-xs font-bold px-2.5 py-1 bg-sky-50 text-sky-900 rounded-lg border border-sky-200">
              {role === 'vendor' ? 'Supplier (Step 1)' : role === 'collector' ? 'Collector (Step 2)' : role === 'ngo' ? 'Relief Node' : 'Recycler Hub & URP Planner'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Batch Tracker on Left (2 cols), Container Return Simulator on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Passport Batch Explorer & 4-Step Verification Stepper */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Batch ID (e.g. UL-PL802)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Waste Streams</option>
                <option value="plastic_pet">PET Bottles (প্লাস্টিক)</option>
                <option value="hdpe_rigid">HDPE Rigid Caps</option>
                <option value="bio_compost">Bio-Compost (জৈব বর্জ্য)</option>
              </select>
            </div>
          </div>

          {/* Active Batches List */}
          <div className="space-y-3">
            {filteredBatches.map((batch) => {
              const isSelected = selectedBatch?.batchId === batch.batchId;
              const isVerified = batch.currentStep === 4;

              return (
                <div
                  key={batch.batchId}
                  onClick={() => setSelectedBatch(batch)}
                  className={`bg-white border rounded-xl p-4 transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-sky-500 ring-2 ring-sky-200/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg font-mono font-bold text-xs ${
                        batch.type === 'bio_compost' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-sky-100 text-sky-900 border border-sky-200'
                      }`}>
                        #{batch.batchId}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {batch.title}
                        </h3>
                        <div className="text-xs text-slate-500">
                          {batch.sourceName} · {batch.weightKg} kg verified weight
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isVerified ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified Recycled</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Step {batch.currentStep} of 4: {batch.status}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-Step Interactive Horizontal Stepper */}
                  <div className="pt-4">
                    <div className="grid grid-cols-4 gap-2">
                      {batch.chainHistory.map((stepItem, idx) => {
                        const stepNum = stepItem.step;
                        const isDone = batch.currentStep >= stepNum;
                        const isCurrent = batch.currentStep === stepNum;

                        return (
                          <div key={stepNum} className="flex flex-col items-center text-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                            </div>
                            <span className={`text-[10px] leading-tight font-semibold ${
                              isCurrent ? 'text-sky-700' : isDone ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              {stepItem.label}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-full">
                              {stepItem.timestamp}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress Bar Line */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300"
                        style={{ width: `${(batch.currentStep / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Verification & Reward Status Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="text-slate-600">
                      {isVerified ? (
                        <span className="text-emerald-700 font-semibold font-mono">
                          ✓ Credited {batch.creditedPoints} points (95% to wallet, 5% to Ward Tree Fund)
                        </span>
                      ) : (
                        <span className="text-amber-800 font-mono">
                          ⏳ {batch.pendingPoints} Points Pending Industrial Recycler Step 4 Verification
                        </span>
                      )}
                    </div>

                    {/* Advance Step Action Button */}
                    {!isVerified && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          advanceBatchStep(batch.batchId);
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <span>
                          {batch.currentStep === 3
                            ? 'Recycler Hub: Confirm Industrial Flake (Step 4)'
                            : `Advance to Step ${batch.currentStep + 1}`}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column (1 col): Reverse Vending & Container Return Simulator */}
        <div className="space-y-5">
          
          <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-lg">
            
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Calculator className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Reverse Vending Kiosk Simulator
                </h3>
                <span className="text-[11px] text-slate-500">Deposit Return Scheme</span>
              </div>
            </div>

            {/* Singapore 2026 Proposed Pilot Disclaimer */}
            <div className="my-3 p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <Info className="w-3.5 h-3.5 text-sky-700" />
                <span>Proposed Pilot Model Notice:</span>
              </div>
              Simulating the 2026 Singapore Beverage Container Return Scheme framework (S$0.10 deposit refund per eligible container + civic green points). Prototyping civic circularity, not a legally binding statute.
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              
              {/* Input 1: Small PET */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Small PET Bottles (&lt;1 Litre)</span>
                  <span className="font-mono text-sky-700">{smallPetCount} units</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={smallPetCount}
                  onChange={(e) => setSmallPetCount(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Input 2: Large PET */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Large PET Bottles (&gt;1 Litre)</span>
                  <span className="font-mono text-sky-700">{largePetCount} units</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={largePetCount}
                  onChange={(e) => setLargePetCount(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Input 3: Aluminum Cans */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Aluminum Beverage Cans</span>
                  <span className="font-mono text-sky-700">{canCount} units</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={canCount}
                  onChange={(e) => setCanCount(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Real-time Calculated Summary Strip */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Total Containers:</span>
                  <span className="font-mono font-bold text-slate-900">{returnCalc.totalContainers} units</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Deposit Refund (SGD $0.10/ea):</span>
                  <span className="font-mono font-bold text-emerald-700">${returnCalc.refundSGD} SGD (~{returnCalc.refundBDT} BDT)</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-600">Earnable Green Credits:</span>
                  <span className="font-mono font-extrabold text-slate-900">+{returnCalc.greenPoints} pts</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  *Auto 95/5 split applies: {Math.round(returnCalc.greenPoints * 0.95)} to wallet, {Math.round(returnCalc.greenPoints * 0.05)} to Ward Tree Fund.
                </div>
              </div>

              <button
                type="submit"
                disabled={returnCalc.totalContainers === 0}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Coins className="w-4 h-4 text-emerald-300" />
                <span>Claim Deposit & Print Digital Tag</span>
              </button>
            </form>

            {/* Generated Reverse Vending Passport Voucher */}
            {generatedVendingReceipt && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-700" />
                    Digital Return Receipt
                  </span>
                  <span className="font-mono text-[10px] text-emerald-800">
                    {generatedVendingReceipt.code}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800 leading-snug">
                  Processed {generatedVendingReceipt.total} containers at Satmasjid Kiosk. Deposit refunded to wallet.
                </div>
                <div className="pt-1 flex items-center justify-between font-mono font-bold text-emerald-900 text-[11px]">
                  <span>Refund: ${generatedVendingReceipt.sgd} SGD</span>
                  <span>+{generatedVendingReceipt.points} Pts</span>
                </div>
              </div>
            )}

          </div>

          {/* Recycler Facility Capabilities Info */}
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm text-xs space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Recycle className="w-4 h-4" />
              <span>Bengal Eco-Cycle Hub Capabilities</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Equipped with high-throughput optical NIR sorters, food-grade flake washing lines, and multi-chamber aerobic bio-digesters for unconsumed organic slurries.
            </p>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-mono text-[10px] text-slate-400">
              <span>Recycling Rate: 94.2%</span>
              <span>Zero-Landfill Target</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
