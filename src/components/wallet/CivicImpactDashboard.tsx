/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Civic Impact Dashboard - Recharts Interactive Visualization
 * Visualizes kilograms of food saved and total drains cleared over time
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Utensils,
  Waves,
  Calendar,
  Sparkles,
  Award,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Download,
  Info,
  Droplets,
  CloudRain,
  Share2,
} from 'lucide-react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import {
  calculateCivicImpactTimeline,
  CivicImpactPoint,
} from '../../utils/circularEconomy';

type TimeframeType = 'daily' | 'weekly' | 'monthly';
type ChartModeType = 'combined' | 'food' | 'drains' | 'cumulative';
type SectorFilterType = 'all' | 'lake' | 'satmasjid' | 'residential';

export const CivicImpactDashboard: React.FC = () => {
  const { totalFoodRescuedKg, drainsClearedCount, lang, addToast } = useUrbanLoop();

  const [timeframe, setTimeframe] = useState<TimeframeType>('daily');
  const [chartMode, setChartMode] = useState<ChartModeType>('combined');
  const [sectorFilter, setSectorFilter] = useState<SectorFilterType>('all');
  const [hoveredPoint, setHoveredPoint] = useState<CivicImpactPoint | null>(null);

  // Sector multiplier weights for realistic localized breakdown
  const sectorMultiplier = useMemo(() => {
    switch (sectorFilter) {
      case 'lake':
        return 0.38;
      case 'satmasjid':
        return 0.42;
      case 'residential':
        return 0.20;
      case 'all':
      default:
        return 1.0;
    }
  }, [sectorFilter]);

  // Compute dataset synchronized with live state
  const dashboardData = useMemo(() => {
    const raw = calculateCivicImpactTimeline(timeframe, totalFoodRescuedKg, drainsClearedCount);
    if (sectorFilter === 'all') return raw;

    const scaledSeries = raw.series.map((pt) => ({
      ...pt,
      foodSavedKg: +(pt.foodSavedKg * sectorMultiplier).toFixed(1),
      cumulativeFoodKg: +(pt.cumulativeFoodKg * sectorMultiplier).toFixed(1),
      drainsCleared: Math.max(0, Math.round(pt.drainsCleared * sectorMultiplier)),
      cumulativeDrainsCleared: Math.max(0, Math.round(pt.cumulativeDrainsCleared * sectorMultiplier)),
      mealsProvided: Math.round(pt.mealsProvided * sectorMultiplier),
      co2OffsetKg: +(pt.co2OffsetKg * sectorMultiplier).toFixed(1),
      stormWaterFlowLps: Math.round(pt.stormWaterFlowLps * sectorMultiplier),
    }));

    return {
      ...raw,
      series: scaledSeries,
      summary: {
        totalFoodSavedKg: +(raw.summary.totalFoodSavedKg * sectorMultiplier).toFixed(1),
        totalDrainsCleared: Math.max(0, Math.round(raw.summary.totalDrainsCleared * sectorMultiplier)),
        totalMealsProvided: Math.round(raw.summary.totalMealsProvided * sectorMultiplier),
        totalCo2OffsetKg: +(raw.summary.totalCo2OffsetKg * sectorMultiplier).toFixed(1),
        peakFoodDayKg: +(raw.summary.peakFoodDayKg * sectorMultiplier).toFixed(1),
        peakDrainsDay: Math.max(0, Math.round(raw.summary.peakDrainsDay * sectorMultiplier)),
        floodRiskReductionPct: Math.round(raw.summary.floodRiskReductionPct * sectorMultiplier),
      },
    };
  }, [timeframe, totalFoodRescuedKg, drainsClearedCount, sectorFilter, sectorMultiplier]);

  const { series, summary } = dashboardData;

  const handleExportData = () => {
    try {
      const header = 'Period,Food_Saved_Kg,Cumulative_Food_Kg,Drains_Cleared,Cumulative_Drains_Cleared,Meals_Provided,CO2_Mitigated_Kg\n';
      const rows = series
        .map(
          (p) =>
            `"${p.period}",${p.foodSavedKg},${p.cumulativeFoodKg},${p.drainsCleared},${p.cumulativeDrainsCleared},${p.mealsProvided},${p.co2OffsetKg}`
        )
        .join('\n');
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `urbanloop-civic-impact-${timeframe}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(
        lang === 'en' ? 'Data Exported' : 'ডাটা এক্সপোর্ট সম্পন্ন',
        lang === 'en' ? 'Civic impact time-series saved as CSV.' : 'নাগরিক প্রভাব ডাটা CSV আকারে ডাউনলোড হয়েছে।',
        'success'
      );
    } catch {
      addToast('Export Error', 'Could not generate download file.', 'warning');
    }
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt: CivicImpactPoint = payload[0]?.payload;

    return (
      <div className="bg-slate-900 text-white rounded-xl shadow-xl p-3.5 border border-slate-700 text-xs min-w-[210px] pointer-events-none z-50">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{label}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
            Ward 15
          </span>
        </div>

        <div className="space-y-2">
          {/* Food Rescued */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span className="text-[11px] font-medium text-slate-300">Food Rescued:</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-emerald-300">{pt?.foodSavedKg} kg</span>
              <span className="text-[10px] text-slate-400 block font-sans">
                ~{pt?.mealsProvided} meals
              </span>
            </div>
          </div>

          {/* Drains Cleared */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
              <span className="text-[11px] font-medium text-slate-300">Drains Cleared:</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-sky-300">{pt?.drainsCleared} drains</span>
              <span className="text-[10px] text-slate-400 block font-sans">
                +{pt?.stormWaterFlowLps} L/s flow
              </span>
            </div>
          </div>

          {/* Cumulative Trajectory */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Cumulative:</span>
            <span className="text-slate-200">
              {pt?.cumulativeFoodKg} kg · {pt?.cumulativeDrainsCleared} drains
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-emerald-400/90 font-mono">
            <span>GHG Mitigated:</span>
            <span>{pt?.co2OffsetKg} kg CO2e</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* Header & Controls Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Real-Time Environmental Accountability · Recharts Visualizer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>{lang === 'en' ? 'Civic Impact Dashboard' : 'নাগরিক প্রভাব ড্যাশবোর্ড'}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Synchronized
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {lang === 'en'
              ? 'Tracking kilograms of edible surplus rescued from landfills alongside preventive stormwater drains unclogged to preempt urban monsoon waterlogging in Dhaka Ward 15.'
              : 'ঢাকা ১৫ নং ওয়ার্ডে বর্জ্যে অপচয় রোধকৃত খাবারের পরিমাণ (কেজি) এবং বর্ষায় জলাবদ্ধতা প্রতিরোধে ড্রেন পরিষ্কারের নাগরিক অগ্রগতি মনিটর করুন।'}
          </p>
        </div>

        {/* Global Toolbar: Timeframe & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                timeframe === 'daily'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'Daily (14D)' : 'দৈনিক'}
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                timeframe === 'weekly'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'Weekly (8W)' : 'সাপ্তাহিক'}
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                timeframe === 'monthly'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'Monsoon Season' : 'মাসিক'}
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportData}
            title="Download CSV dataset"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Kilograms of Food Saved */}
        <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white border border-emerald-200 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>Food Saved</span>
            </span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              +28% Trend
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {summary.totalFoodSavedKg.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700">kg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Provides ~{summary.totalMealsProvided.toLocaleString()} community meals
          </p>
          <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-900 font-medium">
            <span>Peak Day:</span>
            <span className="font-mono font-bold">{summary.peakFoodDayKg} kg</span>
          </div>
        </div>

        {/* KPI 2: Total Drains Cleared */}
        <div className="p-4 bg-gradient-to-br from-sky-500/10 via-sky-50 to-white border border-sky-200 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-sky-800 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-sky-600" />
              <span>Drains Cleared</span>
            </span>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">
              Active Flow
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {summary.totalDrainsCleared}
            </span>
            <span className="text-xs font-bold text-sky-700">Hotspots</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Prevented ~{(summary.totalDrainsCleared * 3200).toLocaleString()} m² flood spread
          </p>
          <div className="mt-2.5 pt-2 border-t border-sky-100 flex items-center justify-between text-[10px] text-sky-900 font-medium">
            <span>Risk Reduction:</span>
            <span className="font-mono font-bold text-sky-700">{summary.floodRiskReductionPct}%</span>
          </div>
        </div>

        {/* KPI 3: Carbon Landfill Methane Avoided */}
        <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-50 to-white border border-amber-200 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-amber-600" />
              <span>GHG Avoided</span>
            </span>
            <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
              CO2e Offset
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {summary.totalCo2OffsetKg.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-700">kg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Diverted organic waste from Matuail landfill
          </p>
          <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-[10px] text-amber-900 font-medium">
            <span>Tree Equivalent:</span>
            <span className="font-mono font-bold text-amber-700">
              ~{(summary.totalCo2OffsetKg / 25).toFixed(0)} Mature Trees
            </span>
          </div>
        </div>

        {/* KPI 4: Civic Reward Generated */}
        <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-indigo-50 to-white border border-indigo-200 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-indigo-800 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Civic Split Value</span>
            </span>
            <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
              95 / 5
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {(summary.totalFoodSavedKg * 4 + summary.totalDrainsCleared * 220).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-indigo-700">pts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            5% auto-channeled into Ward 15 Tree Fund
          </p>
          <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center justify-between text-[10px] text-indigo-900 font-medium">
            <span>Physical Delivery:</span>
            <span className="font-mono font-bold text-indigo-700">100% Verified</span>
          </div>
        </div>

      </div>

      {/* Sub-Filters: Chart Mode & Ward Sector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5" />
            <span>View:</span>
          </span>
          <button
            onClick={() => setChartMode('combined')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              chartMode === 'combined'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Dual-Axis Combined
          </button>
          <button
            onClick={() => setChartMode('food')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              chartMode === 'food'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Food Saved (kg)
          </button>
          <button
            onClick={() => setChartMode('drains')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              chartMode === 'drains'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Drains Cleared
          </button>
          <button
            onClick={() => setChartMode('cumulative')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              chartMode === 'cumulative'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Cumulative Progress
          </button>
        </div>

        {/* Sector Filter */}
        <div className="flex items-center gap-1.5 text-xs shrink-0">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Sector:</span>
          </span>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value as SectorFilterType)}
            className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Ward 15 Sectors</option>
            <option value="lake">Dhanmondi Lake & Waterfront</option>
            <option value="satmasjid">Satmasjid Commercial Corridor</option>
            <option value="residential">Residential Road Grid (8A - 27)</option>
          </select>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 relative">
        
        {/* Chart Legend Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/60 text-xs">
          <div className="flex items-center gap-4">
            {(chartMode === 'combined' || chartMode === 'food' || chartMode === 'cumulative') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block shadow-xs"></span>
                <span className="font-semibold text-slate-700">
                  {chartMode === 'cumulative' ? 'Cumulative Food Saved (kg)' : 'Food Saved (kg)'}
                </span>
              </div>
            )}
            {(chartMode === 'combined' || chartMode === 'drains' || chartMode === 'cumulative') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block shadow-xs"></span>
                <span className="font-semibold text-slate-700">
                  {chartMode === 'cumulative' ? 'Cumulative Drains Cleared' : 'Drains Cleared (Count)'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Left Axis: Food (kg)</span>
            </span>
            {chartMode === 'combined' && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                <span>Right Axis: Drains</span>
              </span>
            )}
          </div>
        </div>

        {/* The Recharts Chart Render */}
        <div className="w-full h-[340px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'combined' ? (
              <ComposedChart
                data={series}
                margin={{ top: 15, right: 20, bottom: 20, left: 10 }}
              >
                <defs>
                  <linearGradient id="foodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="drainsBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="period"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#059669"
                  fontSize={11}
                  tickLine={false}
                  unit=" kg"
                  domain={[0, 'auto']}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  tickLine={false}
                  unit=" dr"
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  yAxisId="left"
                  y={25}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Ward 15 Daily Food Target (25kg)',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="foodSavedKg"
                  name="Food Saved (kg)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#foodAreaGrad)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="drainsCleared"
                  name="Drains Cleared"
                  fill="url(#drainsBarGrad)"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </ComposedChart>
            ) : chartMode === 'food' ? (
              <AreaChart
                data={series}
                margin={{ top: 15, right: 20, bottom: 20, left: 10 }}
              >
                <defs>
                  <linearGradient id="pureFoodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} dy={8} />
                <YAxis stroke="#059669" fontSize={11} tickLine={false} unit=" kg" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="foodSavedKg"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#pureFoodGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="mealsProvided"
                  stroke="#0d9488"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Meals Provided"
                />
              </AreaChart>
            ) : chartMode === 'drains' ? (
              <BarChart
                data={series}
                margin={{ top: 15, right: 20, bottom: 20, left: 10 }}
              >
                <defs>
                  <linearGradient id="pureDrainsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.65} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} dy={8} />
                <YAxis stroke="#0284c7" fontSize={11} tickLine={false} unit=" drains" />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="drainsCleared"
                  name="Drains Cleared"
                  fill="url(#pureDrainsGrad)"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
                <Line
                  type="monotone"
                  dataKey="stormWaterFlowLps"
                  stroke="#0369a1"
                  strokeWidth={2}
                  name="Flow Capacity"
                />
              </BarChart>
            ) : (
              <ComposedChart
                data={series}
                margin={{ top: 15, right: 20, bottom: 20, left: 10 }}
              >
                <defs>
                  <linearGradient id="cumFoodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} dy={8} />
                <YAxis
                  yAxisId="left"
                  stroke="#4f46e5"
                  fontSize={11}
                  tickLine={false}
                  unit=" kg"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  tickLine={false}
                  unit=" dr"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="cumulativeFoodKg"
                  name="Cumulative Food (kg)"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fill="url(#cumFoodGrad)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativeDrainsCleared"
                  name="Cumulative Drains"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0284c7' }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Milestone Indicator & Benchmarks */}
        <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Ward 15 Municipal Standard:</strong> Active clearing keeps runoff capacity above 90% during cloudburst events.
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span>Food Benchmark: <strong>25 kg/day</strong></span>
            <span>·</span>
            <span>Drain Benchmark: <strong>3 culverts/day</strong></span>
          </div>
        </div>
      </div>

      {/* Sector Breakdown & Operational Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        
        {/* Stream 1: Food Rescue Stream Breakdown */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>Food Streams Saved</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              Surplus2Serve
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Cooked Meals & Banquets</span>
                <span className="font-mono font-bold">48% · {(summary.totalFoodSavedKg * 0.48).toFixed(1)} kg</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Fresh Market Produce</span>
                <span className="font-mono font-bold">32% · {(summary.totalFoodSavedKg * 0.32).toFixed(1)} kg</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Bakery & Packaged Goods</span>
                <span className="font-mono font-bold">20% · {(summary.totalFoodSavedKg * 0.20).toFixed(1)} kg</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stream 2: Drain Interception Types */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-sky-600" />
              <span>Drain Culverts Unclogged</span>
            </span>
            <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-bold">
              Drain2Value 2.0
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Primary Stormwater Culverts</span>
                <span className="font-mono font-bold">52% · {Math.round(summary.totalDrainsCleared * 0.52)} units</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '52%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Lake Sluice Grates</span>
                <span className="font-mono font-bold">30% · {Math.round(summary.totalDrainsCleared * 0.30)} units</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Street Gutter Inflow Chutes</span>
                <span className="font-mono font-bold">18% · {Math.round(summary.totalDrainsCleared * 0.18)} units</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stream 3: Civic Verification & Bio-Bridge */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bio-Compost & Tree Link</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
              Urban Canopy
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-start gap-2">
              <Droplets className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Expired edible food safely diverted to aerobic microbial digesters produced <span className="font-bold text-slate-900 font-mono">142 kg</span> of organic fertilizer for Dhanmondi Lake saplings.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                95/5 auto-split channeled <span className="font-bold text-indigo-800 font-mono">4,400+ points</span> directly into sponsoring 8 native deep-root shade trees.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
