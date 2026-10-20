/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { SPONSOR_AUDIT_DATA } from '../../data/seedData';
import { calculateTreeFundProgress } from '../../utils/circularEconomy';
import { CivicImpactDashboard } from '../wallet/CivicImpactDashboard';
import { 
  Wallet, 
  Leaf, 
  TreePine, 
  Ticket, 
  Building, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck, 
  Coins, 
  Clock, 
  Sparkles, 
  Gift 
} from 'lucide-react';

export const GreenWalletPage: React.FC = () => {
  const {
    walletBalance,
    treeFundPointsPool,
    transactions,
    vouchers,
    plantedTrees,
    donatePointsForTree,
    redeemVoucher,
    setCurrentRoute,
    t,
    lang,
    addToast,
  } = useUrbanLoop();

  // Voluntary Donation Slider State
  const [donatePoints, setDonatePoints] = useState<number>(500);
  const [selectedTreePlot, setSelectedTreePlot] = useState<string>('Dhanmondi Lake Walkway 8/A Waterfront');

  // Redemptions History State
  const [activeRedeemedVoucher, setActiveRedeemedVoucher] = useState<{
    title: string;
    code: string;
    merchant: string;
  } | null>(null);

  const treeProgress = calculateTreeFundProgress(treeFundPointsPool, 500);

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const success = donatePointsForTree(donatePoints, selectedTreePlot);
    if (success) {
      // If full tree planted, reset slider
      setDonatePoints(500);
    }
  };

  const handleRedeemClick = (voucherId: string) => {
    const res = redeemVoucher(voucherId);
    if (res.success && res.code) {
      const v = vouchers.find((item) => item.id === voucherId);
      if (v) {
        setActiveRedeemedVoucher({
          title: v.title,
          code: res.code,
          merchant: v.merchant,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Wallet Balance */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <Wallet className="w-4 h-4" />
              <span>Urban Canopy · Local Green Wallet & Tree Fund</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {lang === 'en' ? 'Civic Green Credits & Urban Afforestation' : 'গ্রিন ক্রেডিট ওয়ালেট ও নগর বৃক্ষরোপণ তহবিল'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {lang === 'en'
                ? 'Every civic action transparently channels 95% of rewards to your personal wallet and 5% directly to the Ward 15 Tree Fund. Redeem points for community discounts or sponsor trees.'
                : 'প্রতিটি নাগরিক কাজের ৯৫% পয়েন্ট সরাসরি আপনার ওয়ালেটে এবং ৫% ওয়ার্ড বৃক্ষরোপণ তহবিলে জমা হয়। পয়েন্ট দিয়ে স্থানীয় দোকানে ডিসকাউন্ট পান অথবা সরাসরি গাছ লাগান।'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentRoute('map')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>View Funded Trees on Map ({plantedTrees.length})</span>
            </button>
          </div>
        </div>

        {/* Balance Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
          
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
              <span>Spendable Wallet Balance</span>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {walletBalance}
              </span>
              <span className="text-xs font-bold text-emerald-700 font-sans">Green Points</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Redeemable for local market & food vouchers
            </p>
          </div>

          <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-xl">
            <div className="flex items-center justify-between text-sky-800 text-xs font-semibold mb-1">
              <span>Ward 15 Communal Tree Fund</span>
              <TreePine className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {treeFundPointsPool}
              </span>
              <span className="text-xs font-bold text-sky-700 font-sans">Points Pool</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Funded {treeProgress.treesFunded} native deep-root trees to date
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between text-slate-700 text-xs font-semibold mb-1">
              <span>Micro-Contribution Rule</span>
              <ShieldCheck className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                95 / 5
              </span>
              <span className="text-xs font-bold text-slate-600 font-sans">Split Ratio</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Transparent auto-deduction on every earned point
            </p>
          </div>

        </div>
      </div>

      {/* Recharts Civic Impact Dashboard */}
      <CivicImpactDashboard />

      {/* 2-Column Core Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Voluntary Tree Donation Card */}
        <div className="bg-white border-2 border-emerald-600/40 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TreePine className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                Voluntary Tree Donation & Afforestation
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              500 Points = 1 Native Tree
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Directly convert your civic green credits into deep-root native trees (Neem, Krishnachura, Bakul, Chatim) along Dhanmondi Lake and arterial medians. Increases soil water absorption during cloudbursts and creates urban shade canopy.
          </p>

          <form onSubmit={handleDonate} className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <span>Points to Donate:</span>
                <span className="font-mono font-bold text-emerald-700">{donatePoints} Green Points</span>
              </div>
              <input
                type="range"
                min="50"
                max={Math.max(500, walletBalance)}
                step="50"
                value={donatePoints}
                onChange={(e) => setDonatePoints(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>50 pts (Micro-seed)</span>
                <span>500 pts (1 Full Tree)</span>
                <span>1,000 pts (2 Trees)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Afforestation Plot in Ward 15
              </label>
              <select
                value={selectedTreePlot}
                onChange={(e) => setSelectedTreePlot(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="Dhanmondi Lake Walkway 8/A Waterfront">Dhanmondi Lake Walkway 8/A Waterfront</option>
                <option value="Road 27 Central Island Green Buffer">Road 27 Central Island Green Buffer</option>
                <option value="Satmasjid Road School Zone Median">Satmasjid Road School Zone Median</option>
                <option value="Kalabagan Park Perimeter Bio-Corridor">Kalabagan Park Perimeter Bio-Corridor</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
              <span className="text-emerald-900 font-medium">Equates to:</span>
              <span className="font-bold text-emerald-800 font-mono">
                {donatePoints >= 500 ? `${(donatePoints / 500).toFixed(1)} Planted Trees` : `${((donatePoints / 500) * 100).toFixed(0)}% towards next tree`}
              </span>
            </div>

            <button
              type="submit"
              disabled={walletBalance < donatePoints}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Leaf className="w-4 h-4 text-emerald-300" />
              <span>Plant Tree in Ward 15 Now</span>
            </button>
          </form>
        </div>

        {/* Right Card: Earnings & Transparent 95/5 Auto-Deduction Log */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-700" />
              <h3 className="text-base font-bold text-slate-900">
                Earnings & Auto-Deduction Ledger
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">95/5 Split Verified</span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-md mt-0.5 ${
                      isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isCredit ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 leading-snug">
                        {tx.description}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {tx.timestamp} · ID: {tx.id}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-mono font-bold ${
                      isCredit ? 'text-emerald-700' : 'text-slate-800'
                    }`}>
                      {isCredit ? `+${tx.walletPoints}` : `-${tx.walletPoints}`} pts
                    </div>
                    {isCredit && tx.treeFundPoints > 0 && (
                      <div className="text-[10px] font-mono text-emerald-600">
                        ({tx.treeFundPoints} to Tree Fund)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Voucher Redemption Store */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-600" />
              <span>Civic Partner Voucher Redemption Store</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Spend your wallet credits on local grocery discounts, restaurant meals, and plant nursery kits.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            Available: {walletBalance} pts
          </span>
        </div>

        {/* Active Redeemed Voucher Display */}
        {activeRedeemedVoucher && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
            <div>
              <div className="text-xs font-bold text-emerald-900 uppercase">
                Voucher Redeemed Successfully!
              </div>
              <div className="text-sm font-semibold text-emerald-800 mt-0.5">
                {activeRedeemedVoucher.title} at {activeRedeemedVoucher.merchant}
              </div>
              <div className="text-xs text-emerald-700 mt-1">
                Show digital code at checkout counter: <span className="font-mono font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-300 ml-1">{activeRedeemedVoucher.code}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveRedeemedVoucher(null)}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* Voucher Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {vouchers.map((vouch) => {
            const canAfford = walletBalance >= vouch.costPoints;
            return (
              <div
                key={vouch.id}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    {vouch.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug mt-1">
                    {vouch.title}
                  </h4>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">
                    {vouch.discountValue}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {vouch.merchant}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="font-mono font-bold text-xs text-slate-800">
                    {vouch.costPoints} pts
                  </div>
                  <button
                    onClick={() => handleRedeemClick(vouch.id)}
                    disabled={!canAfford}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sponsor Transparency Audit Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-700" />
              <span>Sponsor Funding & Output Audit Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent corporate funds injected, utilization rates, and verified physical deliverables.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Audited Q3 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Sponsor Entity</th>
                <th className="py-2.5 px-3">Grant Program</th>
                <th className="py-2.5 px-3 text-right">Committed BDT</th>
                <th className="py-2.5 px-3 text-right">Utilized BDT</th>
                <th className="py-2.5 px-3 text-right">Utilization %</th>
                <th className="py-2.5 px-3">Verified Deliverables</th>
                <th className="py-2.5 px-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SPONSOR_AUDIT_DATA.map((sp) => (
                <tr key={sp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{sp.sponsorName}</td>
                  <td className="py-3 px-3">{sp.grantTitle}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                    ৳{(sp.committedBDT / 100000).toFixed(1)} Lakh
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    ৳{(sp.utilizedBDT / 100000).toFixed(1)} Lakh
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                    {sp.utilizationPct}%
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {sp.verifiedOutputs.foodKgRescued}kg food · {sp.verifiedOutputs.plasticKgRecycled}kg plastic · {sp.verifiedOutputs.drainsCleared} drains · {sp.verifiedOutputs.treesPlanted} trees
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {sp.auditorStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
