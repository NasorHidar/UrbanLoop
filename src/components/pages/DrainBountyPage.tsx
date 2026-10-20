/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { DrainHotspot, DrainStatus, RiskLevel } from '../../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Camera, 
  MapPin, 
  AlertTriangle, 
  CloudRain, 
  Sparkles, 
  Clock, 
  CheckSquare, 
  ArrowRight, 
  Upload, 
  Layers 
} from 'lucide-react';

export const DrainBountyPage: React.FC = () => {
  const {
    drainHotspots,
    submitDrainProof,
    verifyDrainClearing,
    role,
    t,
    lang,
    addToast,
  } = useUrbanLoop();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | DrainStatus>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<DrainHotspot | null>(drainHotspots[0] || null);

  // Submit Proof Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [targetHotspotId, setTargetHotspotId] = useState<string>(drainHotspots[0]?.id || '');
  const [collectorName, setCollectorName] = useState('Dhanmondi Civic Youth Squad');
  const [clearedBags, setClearedBags] = useState<number>(3);
  const [gpsTag, setGpsTag] = useState('23.7481° N, 90.3725° E (Accuracy: ±2.4m Verified)');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=400&q=80');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80');

  // Pre-Monsoon Checklist Statistics
  const totalSpots = drainHotspots.length;
  const clearedSpots = drainHotspots.filter((d) => d.status === 'cleared').length;
  const inReviewSpots = drainHotspots.filter((d) => d.status === 'in_review').length;
  const openSpots = drainHotspots.filter((d) => d.status === 'open').length;
  const readinessPct = Math.round((clearedSpots / totalSpots) * 100);

  // Filtered List
  const filteredHotspots = drainHotspots.filter((h) => {
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || h.riskLevel === riskFilter;
    return matchesStatus && matchesRisk;
  });

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHotspotId) return;

    submitDrainProof(targetHotspotId, {
      collectorName,
      beforePhotoUrl,
      afterPhotoUrl,
      gpsCoordinates: gpsTag,
      clearedBags: Number(clearedBags),
    });

    setShowSubmitModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Pre-Monsoon Risk Metric */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
              <CloudRain className="w-4 h-4" />
              <span>Drain2Value 2.0 · Monsoon Prevention Missions</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {lang === 'en' ? 'Drain Bounties & Chokepoint Clearance' : 'ড্রেন বাউন্টি ও প্রাক-বর্ষা প্রতিরোধ মিশন'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {lang === 'en'
                ? 'Prevent catastrophic urban waterlogging before seasonal cloudbursts. Citizens and collectors clear plastic waste from arterial sumps and earn verified Green Credits.'
                : 'বর্ষার আগেই শহরের জলাবদ্ধতা রোধে ড্রেন ও কালভার্টের মুখ থেকে প্লাস্টিক এবং পলি পরিষ্কার করুন। ভেরিফায়েড প্রমাণ জমা দিয়ে গ্রিন ক্রেডিট বাউন্টি অর্জন করুন।'}
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedHotspot) setTargetHotspotId(selectedHotspot.id);
              setShowSubmitModal(true);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>{t.buttons.submitProof}</span>
          </button>
        </div>

        {/* Pre-Monsoon Priority Checklist Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Ward 15 Pre-Monsoon Readiness Progress: {clearedSpots} of {totalSpots} Hotspots Secured</span>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-700">
              {readinessPct}% Monsoon Ready ({openSpots} bottlenecks remaining)
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all duration-500"
              style={{ width: `${readinessPct}%` }}
              title="Cleared Hotspots"
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${(inReviewSpots / totalSpots) * 100}%` }}
              title="In-Review Hotspots"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Problem Board & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Verified Problem Board */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Filter Missions:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses ({totalSpots})</option>
                <option value="open">Open Missions ({openSpots})</option>
                <option value="in_review">In-Review ({inReviewSpots})</option>
                <option value="cleared">Cleared ({clearedSpots})</option>
              </select>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Risk Levels</option>
                <option value="critical">Critical Risk</option>
                <option value="high">High Risk</option>
                <option value="moderate">Moderate Risk</option>
              </select>
            </div>
          </div>

          {/* Hotspot Mission Cards */}
          <div className="space-y-3">
            {filteredHotspots.map((spot) => {
              const isSelected = selectedHotspot?.id === spot.id;
              const isCleared = spot.status === 'cleared';
              const isInReview = spot.status === 'in_review';

              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedHotspot(spot)}
                  className={`bg-white border rounded-xl p-4 transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-rose-500 ring-2 ring-rose-200/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg font-mono font-bold text-xs shrink-0 ${
                        spot.riskLevel === 'critical'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : spot.riskLevel === 'high'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        #{spot.id}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {spot.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{spot.location}</span>
                          <span>·</span>
                          <span className="font-mono">{spot.coordinates.lat.toFixed(4)}° N, {spot.coordinates.lng.toFixed(4)}° E</span>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {spot.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                      {isCleared ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cleared & Verified</span>
                        </span>
                      ) : isInReview ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Proof In-Review</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold rounded-lg flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Open Bounty: {spot.bountyPoints} pts</span>
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 font-mono">
                        ~{spot.estimatedDebrisKg} kg debris estimated
                      </span>
                    </div>

                  </div>

                  {/* Actions Bar for the Card */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Reported {spot.reportedAgo}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isCleared && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetHotspotId(spot.id);
                            setShowSubmitModal(true);
                          }}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3 h-3 text-emerald-400" />
                          <span>Submit Proof</span>
                        </button>
                      )}

                      {/* Municipal / Planner Role: Instant Verification */}
                      {isInReview && (role === 'planner' || role === 'vendor') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            verifyDrainClearing(spot.id);
                          }}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve & Credit Bounty</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column (1 col): Selected Hotspot Details & Proof Inspection */}
        <div className="space-y-5">
          
          {selectedHotspot ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Mission Dossier #{selectedHotspot.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedHotspot.riskLevel === 'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : selectedHotspot.riskLevel === 'high'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {selectedHotspot.riskLevel} Risk
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedHotspot.title}
                </h3>
                <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedHotspot.location}</span>
                </div>
              </div>

              {/* Bounty Reward Card */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-900">
                  <span>Gross Civic Bounty:</span>
                  <span className="font-mono font-bold text-sm">{selectedHotspot.bountyPoints} Green Credits</span>
                </div>
                <div className="mt-1 pt-1 border-t border-emerald-200/60 text-[10px] text-emerald-800 font-mono flex justify-between">
                  <span>Wallet (95%): {Math.round(selectedHotspot.bountyPoints * 0.95)} pts</span>
                  <span>Tree Fund (5%): {Math.round(selectedHotspot.bountyPoints * 0.05)} pts</span>
                </div>
              </div>

              {/* Verification & Before/After Proof Section */}
              {selectedHotspot.proofSubmission ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Submitted Proof Dossier</span>
                    <span className="text-slate-500 font-mono text-[10px]">{selectedHotspot.proofSubmission.submittedAt}</span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <div><span className="font-medium">Collector:</span> {selectedHotspot.proofSubmission.collectorName}</div>
                    <div><span className="font-medium">GPS Verified:</span> {selectedHotspot.proofSubmission.gpsCoordinates}</div>
                    <div><span className="font-medium">Bags Cleared:</span> {selectedHotspot.proofSubmission.clearedBags} municipal sacks</div>
                  </div>

                  {/* Simulated Visual Before / After Verification Cards */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-lg overflow-hidden border border-slate-300 relative bg-slate-900 h-28 flex flex-col justify-end p-2 text-white">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      <span className="text-[10px] font-bold text-rose-300 uppercase z-20">BEFORE: Blocked Grate</span>
                      <span className="text-[9px] text-slate-300 z-20 font-mono">Plastic debris high</span>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-slate-300 relative bg-emerald-950 h-28 flex flex-col justify-end p-2 text-white">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      <span className="text-[10px] font-bold text-emerald-300 uppercase z-20">AFTER: Cleared Flow</span>
                      <span className="text-[9px] text-slate-300 z-20 font-mono">Runoff restored</span>
                    </div>
                  </div>

                  {selectedHotspot.status === 'in_review' && (
                    <button
                      onClick={() => verifyDrainClearing(selectedHotspot.id)}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Municipal Approval</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-2">
                  <p>No proof photos submitted yet for this hotspot.</p>
                  <button
                    onClick={() => {
                      setTargetHotspotId(selectedHotspot.id);
                      setShowSubmitModal(true);
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Claim & Submit Before/After Photo
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
              Select a drain hotspot from the problem board to view details.
            </div>
          )}

        </div>

      </div>

      {/* Submit Proof Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Submit Drain Clearing Verification
                </h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Drain Mission
                </label>
                <select
                  value={targetHotspotId}
                  onChange={(e) => setTargetHotspotId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {drainHotspots.map((d) => (
                    <option key={d.id} value={d.id}>
                      #{d.id} - {d.title} ({d.bountyPoints} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Collector / Civic Squad Name
                </label>
                <input
                  type="text"
                  required
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bags of Plastic Cleared
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={clearedBags}
                    onChange={(e) => setClearedBags(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verified GPS Coordinates
                  </label>
                  <input
                    type="text"
                    required
                    value={gpsTag}
                    onChange={(e) => setGpsTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Photo Verification Mock Previews */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Before Photo (Clogged)</span>
                  </label>
                  <div className="h-24 bg-slate-800 rounded-lg border border-slate-300 flex items-center justify-center text-slate-300 text-xs font-medium text-center p-2">
                    Blocked Culvert Frame Captured
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>After Photo (Cleared)</span>
                  </label>
                  <div className="h-24 bg-emerald-900 rounded-lg border border-slate-300 flex items-center justify-center text-emerald-100 text-xs font-medium text-center p-2">
                    De-Silted Free Flow Verified
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-snug">
                Bounty points are credited automatically once reviewed by the Ward 15 Municipal Urban Planner.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Confirm & Transmit Proof
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
