/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { FoodCategory, FoodOffer } from '../../types';
import { generateSafePackingInstructions } from '../../services/geminiService';
import { evaluateFoodSafetyStatus } from '../../utils/circularEconomy';
import { 
  UtensilsCrossed, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Recycle, 
  MapPin, 
  PlusCircle, 
  Search, 
  Filter, 
  AlertTriangle 
} from 'lucide-react';

export const SurplusServePage: React.FC = () => {
  const {
    foodOffers,
    postFoodOffer,
    claimFoodOffer,
    simulateFoodExpiry,
    bridgeExpiredFoodToCompost,
    setCurrentRoute,
    role,
    t,
    lang,
    addToast,
  } = useUrbanLoop();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'claimed' | 'expired'>('all');

  // Form State for Vendor Listing
  const [showPostForm, setShowPostForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('cooked');
  const [vendorName, setVendorName] = useState('Dhanmondi Bistro & Banquet');
  const [vendorLocation, setVendorLocation] = useState('Road 27, Ward 15');
  const [portions, setPortions] = useState<number>(20);
  const [timerMinutes, setTimerMinutes] = useState<number>(60);
  const [guidelines, setGuidelines] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Periodic clock ticker to keep countdowns dynamic
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // AI Safe Packing Guidelines Generator
  const handleGenerateSafePacking = async () => {
    if (!itemName.trim()) {
      addToast(
        lang === 'en' ? 'Item Name Required' : 'খাবারের নাম প্রদান করুন',
        lang === 'en' ? 'Please enter food name first.' : 'দয়া করে আগে খাবারের নাম লিখুন।',
        'warning'
      );
      return;
    }
    setIsGeneratingAi(true);
    try {
      const generated = await generateSafePackingInstructions(itemName, category, portions);
      setGuidelines(generated);
      addToast(
        lang === 'en' ? 'Guidelines Generated' : 'প্যাকিং নির্দেশনা তৈরি সম্পন্ন',
        lang === 'en' ? 'Physical handling guidelines auto-filled into form.' : 'নিরাপদ হ্যান্ডলিং নির্দেশনা ফর্মে যুক্ত হয়েছে।',
        'success'
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Submit Vendor Listing
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    postFoodOffer({
      itemName,
      category,
      vendorName,
      vendorLocation,
      latitude: 23.7460 + (Math.random() - 0.5) * 0.006,
      longitude: 90.3740 + (Math.random() - 0.5) * 0.006,
      quantityDisplay: `${portions} packaged meal trays`,
      portions: Number(portions),
      preparedTimeAgo: 'Just prepared',
      expiresAt: Date.now() + (timerMinutes * 60 * 1000),
      safeHandlingGuidelines: guidelines || 'Keep covered in thermal containers. Temperature check upon physical handover.',
    });

    // Reset Form
    setItemName('');
    setGuidelines('');
    setShowPostForm(false);
  };

  // Filtered List
  const filteredOffers = foodOffers.filter((offer) => {
    const matchesSearch = 
      offer.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    
    let matchesStatus = true;
    if (statusFilter === 'available') matchesStatus = offer.status === 'available';
    if (statusFilter === 'claimed') matchesStatus = offer.status === 'claimed' || offer.status === 'collected';
    if (statusFilter === 'expired') matchesStatus = offer.status === 'expired_locked' || offer.status === 'bridged_compost';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Compliance Disclaimer Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Surplus2Serve · Upstream Food Rescue Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {lang === 'en' ? 'Rescue Unsold Food Before Expiry' : 'উদ্বৃত্ত খাবার মেয়াদ শেষের আগেই উদ্ধার করুন'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {lang === 'en'
                ? 'Connecting restaurants, bakeries, and markets with verified NGOs to feed community relief centers. Items past deadline automatically bridge to Bio-Compost recycling to prevent clogged drains.'
                : 'রেস্তোরাঁ ও কাঁচাবাজারের নিরাপদ উদ্বৃত্ত খাবার ভেরিফায়েড এনজিওদের সাথে যুক্ত করে মানুষের মুখে পৌঁছানো হয়। সময় পার হলে তা স্বয়ংক্রিয়ভাবে বায়ো-কম্পোস্ট রিসাইক্লিংয়ে স্থানান্তরিত হয়।'}
            </p>
          </div>

          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>{showPostForm ? 'Close Form' : t.buttons.postFood}</span>
          </button>
        </div>

        {/* Strict Anti-Hallucination & Food Safety Compliance Notice */}
        <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-300 rounded-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Strict Safety Compliance Protocol:</span>{' '}
            AI does NOT certify, guarantee, or lab-test food safety. All listings rely exclusively on rigorous countdown timers, temperature containment standards, and physical handover inspections by recipient NGOs. If a timer reaches zero, the listing is permanently locked for human consumption.
          </div>
        </div>
      </div>

      {/* Vendor Listing Form (Collapsible or toggleable) */}
      {showPostForm && (
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'en' ? 'Vendor Surplus Food Listing Form' : 'ভেন্ডর উদ্বৃত্ত খাদ্য তালিকাভুক্তি ফর্ম'}</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">Ward 15 Dispatch Gate</span>
          </div>

          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'en' ? 'Surplus Food Item Name' : 'খাদ্য সামগ্রীর নাম'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Pilaf & Lentil Stew Trays"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'en' ? 'Food Category' : 'খাবারের ধরন'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FoodCategory)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="cooked">Cooked Hot Meals (ভাত/তরকারি/বিরিয়ানি)</option>
                  <option value="bakery">Bakery & Breads (পাউরুটি/কেক)</option>
                  <option value="produce">Fresh Produce & Fruits (শাকসবজি/ফল)</option>
                  <option value="dairy">Dairy & Chilled (দুধ/মিষ্টি)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'en' ? 'Portions / Quantity' : 'পরিমাণ / প্লেট'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={portions}
                  onChange={(e) => setPortions(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'en' ? 'Strict Countdown Expiry Window (Minutes)' : 'সর্বোচ্চ সময়সীমা (মিনিট)'}
                </label>
                <select
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value={30}>30 Minutes (Critical Fast Dispatch)</option>
                  <option value={60}>60 Minutes (Standard Hot Food)</option>
                  <option value={90}>90 Minutes (Insulated Bakery/Dry)</option>
                  <option value={120}>120 Minutes (Whole Produce)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'en' ? 'Vendor / Establishment Name' : 'রেস্তোরাঁ / প্রতিষ্ঠানের নাম'}
                </label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'en' ? 'Pickup Address' : 'সংগ্রহের ঠিকানা'}
                </label>
                <input
                  type="text"
                  required
                  value={vendorLocation}
                  onChange={(e) => setVendorLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

            </div>

            {/* AI Safe Packing Assistance */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Gemini Assistant: Safe Packing & Hygiene Protocol</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSafePacking}
                  disabled={isGeneratingAi || !itemName}
                  className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>{t.buttons.generateAiPacking}</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Safe handling instructions (e.g. keep above 60°C in food-grade insulated container with lid lock)..."
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPostForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Publish Surplus Offer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search meals, bakery, vendor...' : 'খাবার বা ভেন্ডর খুঁজুন...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Food Types</option>
            <option value="cooked">Cooked Meals</option>
            <option value="bakery">Bakery & Grains</option>
            <option value="produce">Fresh Fruits & Greens</option>
            <option value="dairy">Dairy & Chilled</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available (Claimable)</option>
            <option value="claimed">Claimed by NGO</option>
            <option value="expired">Expired / Bridged</option>
          </select>
        </div>
      </div>

      {/* Food Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOffers.map((offer) => {
          const safety = evaluateFoodSafetyStatus(offer.expiresAt, now);
          const isExpired = !safety.isSafe || offer.status === 'expired_locked' || offer.status === 'bridged_compost';
          const isClaimed = offer.status === 'claimed' || offer.status === 'collected';
          const isBridged = offer.status === 'bridged_compost';

          // Countdown calculations
          const remainingMs = Math.max(0, offer.expiresAt - now);
          const minutes = Math.floor(remainingMs / 60000);
          const seconds = Math.floor((remainingMs % 60000) / 1000);

          return (
            <div
              key={offer.id}
              className={`bg-white rounded-xl border transition-all shadow-sm flex flex-col justify-between ${
                isBridged
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : isExpired
                  ? 'border-amber-400 bg-amber-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-4 space-y-3">
                
                {/* Header: Item & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                      {offer.id} · {offer.category.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                      {offer.itemName}
                    </h3>
                  </div>

                  {/* Status Indicator */}
                  {isBridged ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Bridged to Compost
                    </span>
                  ) : isExpired ? (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  ) : isClaimed ? (
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded">
                      Claimed by NGO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                      Available
                    </span>
                  )}
                </div>

                {/* Vendor Details */}
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div className="font-semibold text-slate-800">{offer.vendorName}</div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{offer.vendorLocation}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Quantity: {offer.quantityDisplay} ({offer.portions} portions)
                  </div>
                </div>

                {/* Live Countdown Timer Bar */}
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  isExpired 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : remainingMs < 15 * 60 * 1000
                    ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold">
                      {isExpired ? 'Consumption Safe Window:' : 'Time Until Spoil Window:'}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-sm tabular-nums">
                    {isExpired ? (
                      <span className="text-rose-700 uppercase text-xs">EXPIRED (00:00)</span>
                    ) : (
                      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                    )}
                  </div>
                </div>

                {/* Safe Handling Guidelines */}
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  <span className="font-semibold text-slate-700">Protocol: </span>
                  {offer.safeHandlingGuidelines}
                </div>

                {/* Expired Warning Message */}
                {isExpired && !isBridged && (
                  <div className="text-[11px] text-amber-900 bg-amber-100/90 p-2 rounded-lg border border-amber-300 leading-snug">
                    <span className="font-bold">Diverted from human food: </span>
                    Consumption safety timer reached zero. Ready to bridge to aerobic bio-compost passport.
                  </div>
                )}

                {/* Bridged Success Message */}
                {isBridged && (
                  <div className="text-[11px] text-emerald-900 bg-emerald-100/90 p-2 rounded-lg border border-emerald-300 leading-snug">
                    <span className="font-bold">Compost Passport Active: </span>
                    Batch #{offer.bridgedBatchId || 'UL-BIO'} created. Redirected away from city drains.
                  </div>
                )}
              </div>

              {/* Action Buttons Section */}
              <div className="p-4 pt-0 border-t border-slate-100 space-y-2 mt-2">
                
                {/* Available State: NGO can Claim, Vendor can test Expiry */}
                {!isExpired && !isClaimed && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => claimFoodOffer(offer.id)}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.buttons.claimFood}</span>
                    </button>
                    
                    <button
                      onClick={() => simulateFoodExpiry(offer.id)}
                      className="w-full py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      {t.buttons.simulateExpiry}
                    </button>
                  </div>
                )}

                {/* Claimed State: Waiting for physical pickup */}
                {isClaimed && !isExpired && (
                  <div className="py-2 px-3 bg-sky-50 border border-sky-200 rounded-lg text-center">
                    <div className="text-xs font-bold text-sky-900">
                      Dispatched for Collection
                    </div>
                    <div className="text-[11px] text-sky-700 mt-0.5">
                      {offer.claimedByNgo}
                    </div>
                  </div>
                )}

                {/* Expired State: Prominent Send to Bio-Compost Passport Button (The Circular Bridge!) */}
                {isExpired && !isBridged && (
                  <button
                    onClick={() => {
                      const newBatchId = bridgeExpiredFoodToCompost(offer.id);
                      setCurrentRoute('recycling-passport');
                    }}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Recycle className="w-4 h-4 text-amber-200" />
                    <span>{t.buttons.sendToCompost}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Bridged State: Quick Jump to Passport View */}
                {isBridged && (
                  <button
                    onClick={() => setCurrentRoute('recycling-passport')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View in Recycling Passport</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
