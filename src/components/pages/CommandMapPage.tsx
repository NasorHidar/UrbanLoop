/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useUrbanLoop } from '../../context/UrbanLoopContext';
import { 
  UtensilsCrossed, 
  Trash2, 
  AlertOctagon, 
  Leaf, 
  MapPin, 
  ExternalLink, 
  Filter, 
  Droplets, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Compass, 
  Maximize2 
} from 'lucide-react';

type FilterType = 'all' | 'food' | 'hubs' | 'drains' | 'trees';

export const CommandMapPage: React.FC = () => {
  const {
    foodOffers,
    drainHotspots,
    plantedTrees,
    totalFoodRescuedKg,
    totalPlasticRecycledKg,
    drainsClearedCount,
    setCurrentRoute,
    t,
    lang,
    role,
  } = useUrbanLoop();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedPin, setSelectedPin] = useState<{
    type: 'food' | 'hub' | 'drain' | 'tree';
    id: string;
    title: string;
    subtitle: string;
    details: string;
    status: string;
    coords: { lat: number; lng: number };
    metric?: string;
    actionRoute?: any;
    actionLabel?: string;
  } | null>(null);

  // Waste Hubs static locations in Ward 15
  const wasteHubs = [
    {
      id: 'HUB-01',
      title: 'Bengal Eco-Cycle Central Processing Facility',
      subtitle: 'Central Optical Sorter & Mechanical Flaker',
      details: 'Accepts high-grade PET, HDPE caps, and sorted organic slurries for industrial recycling.',
      status: 'Active · 98% Uptime',
      coords: { lat: 23.7445, lng: 90.3705 },
      metric: 'Capacity: 1,500 kg/day',
    },
    {
      id: 'WCP-01',
      title: 'Satmasjid Road Civic Drop-off Point',
      subtitle: 'Collection Station #01',
      details: 'Reverse vending deposit kiosks and bulk waste aggregation bays.',
      status: 'Operating 08:00 - 20:00',
      coords: { lat: 23.7465, lng: 90.3718 },
      metric: 'Bales Ready: 45 kg',
    },
    {
      id: 'WCP-02',
      title: 'Dhanmondi Lake 8/A Sorting Kiosk',
      subtitle: 'Collection Station #02',
      details: 'Neighborhood lakeside drop-off point for citizen plastic bottles and cans.',
      status: 'Operating 07:00 - 19:00',
      coords: { lat: 23.7420, lng: 90.3755 },
      metric: 'Collected Today: 22 kg',
    },
    {
      id: 'WCP-03',
      title: 'Mirpur Road Community Bin Station',
      subtitle: 'Collection Station #03',
      details: 'High-density commercial thoroughfare collection kiosk.',
      status: 'Operating 24/7 Monitored',
      coords: { lat: 23.7405, lng: 90.3805 },
      metric: 'Recycling Passports: 18 issued',
    },
  ];

  // Map coordinate conversion to CSS percentages for SVG / Canvas placement
  // Dhanmondi Ward 15 Bounds: lat 23.737 to 23.753, lng 90.368 to 90.382
  const minLat = 23.7370;
  const maxLat = 23.7535;
  const minLng = 90.3675;
  const maxLng = 90.3825;

  const getPinPos = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Invert Y because latitude goes up north while CSS top goes down
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return {
      left: `${Math.min(94, Math.max(6, x))}%`,
      top: `${Math.min(92, Math.max(8, y))}%`,
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>{t.pilotWard}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-mono">23.746° N, 90.374° E</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {lang === 'en' ? 'Live Command Map & Pilot Overview' : 'লাইভ কমান্ড ম্যাপ ও পাইলট ওভারভিউ'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {t.hero.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {lang === 'en' ? 'Viewing as:' : 'বর্তমান ভূমিকা:'}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
              {t.roles[role]}
            </span>
          </div>
        </div>

        {/* Live Impact Counters Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold mb-1">
              <UtensilsCrossed className="w-4 h-4" />
              <span>{t.stats.foodRescued}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {Math.round(totalFoodRescuedKg)}
              </span>
              <span className="text-xs font-medium text-slate-600">{t.stats.kg}</span>
            </div>
          </div>

          <div className="p-3.5 bg-sky-50/70 border border-sky-200/60 rounded-xl">
            <div className="flex items-center gap-2 text-sky-800 text-xs font-semibold mb-1">
              <Trash2 className="w-4 h-4" />
              <span>{t.stats.plasticRecycled}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {Math.round(totalPlasticRecycledKg)}
              </span>
              <span className="text-xs font-medium text-slate-600">{t.stats.kg}</span>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50/70 border border-rose-200/60 rounded-xl">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold mb-1">
              <AlertOctagon className="w-4 h-4" />
              <span>{t.stats.drainsCleared}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {drainsClearedCount}
              </span>
              <span className="text-xs font-medium text-slate-600">/ 12 {t.stats.count}</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold mb-1">
              <Leaf className="w-4 h-4" />
              <span>{t.stats.treesPlanted}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {plantedTrees.length}
              </span>
              <span className="text-xs font-medium text-slate-600">{t.stats.trees}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 px-2">
          <Filter className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Map Layer Filter:' : 'ম্যাপ ফিল্টার:'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.mapFilters.all}
          </button>
          <button
            onClick={() => setActiveFilter('food')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'food'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{t.mapFilters.food}</span>
            <span className="font-mono text-[10px] ml-0.5 opacity-90">({foodOffers.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('hubs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'hubs'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.mapFilters.hubs}</span>
            <span className="font-mono text-[10px] ml-0.5 opacity-90">({wasteHubs.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('drains')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'drains'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{t.mapFilters.drains}</span>
            <span className="font-mono text-[10px] ml-0.5 opacity-90">({drainHotspots.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('trees')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'trees'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>{t.mapFilters.trees}</span>
            <span className="font-mono text-[10px] ml-0.5 opacity-90">({plantedTrees.length})</span>
          </button>
        </div>
      </div>

      {/* Stylized Interactive Ward Map Area */}
      <div className="relative w-full h-[540px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl select-none">
        
        {/* Background Ward Grid & Cartography Blueprint */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Dhanmondi Lake Vector Polygon */}
            <path
              d="M 280,120 Q 320,200 480,240 T 640,340 T 780,480 Q 720,500 580,410 T 420,310 T 260,180 Z"
              fill="#0284c7"
              opacity="0.35"
            />
            {/* Lake Tributary Channel */}
            <path
              d="M 480,240 Q 560,160 620,80"
              stroke="#38bdf8"
              strokeWidth="12"
              fill="none"
              opacity="0.3"
            />

            {/* Arterial Road Lines */}
            {/* Satmasjid Road (North-South Main) */}
            <line x1="22%" y1="0%" x2="28%" y2="100%" stroke="#475569" strokeWidth="10" />
            <line x1="22%" y1="0%" x2="28%" y2="100%" stroke="#f8fafc" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
            
            {/* Road 27 (East-West Main) */}
            <line x1="0%" y1="28%" x2="100%" y2="24%" stroke="#475569" strokeWidth="8" />
            <line x1="0%" y1="28%" x2="100%" y2="24%" stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.6" />

            {/* Road 8/A Waterfront */}
            <line x1="15%" y1="56%" x2="85%" y2="52%" stroke="#334155" strokeWidth="6" />

            {/* Mirpur Road Border */}
            <line x1="88%" y1="0%" x2="94%" y2="100%" stroke="#475569" strokeWidth="10" />
          </svg>
        </div>

        {/* Map Cartographic Labels */}
        <div className="absolute top-4 left-6 pointer-events-none">
          <div className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
            WARD 15 PILOT SECTOR · DHAKA SOUTH
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Satmasjid Rd · Road 27 · Dhanmondi Lake Basin
          </div>
        </div>

        <div className="absolute bottom-4 left-6 pointer-events-none hidden sm:block">
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 backdrop-blur-sm">
            <span>Projection: WGS84</span>
            <span>·</span>
            <span>Scale 1:5,000</span>
            <span>·</span>
            <span className="text-emerald-400">Live Telemetry Active</span>
          </div>
        </div>

        {/* PINS RENDERING */}

        {/* 1. Surplus Food Pins (Orange) */}
        {(activeFilter === 'all' || activeFilter === 'food') &&
          foodOffers.map((offer) => {
            const pos = getPinPos(offer.latitude, offer.longitude);
            const isExpired = offer.status === 'expired_locked' || offer.status === 'bridged_compost';
            return (
              <button
                key={offer.id}
                onClick={() =>
                  setSelectedPin({
                    type: 'food',
                    id: offer.id,
                    title: offer.itemName,
                    subtitle: `${offer.vendorName} · ${offer.vendorLocation}`,
                    details: offer.safeHandlingGuidelines,
                    status: offer.status === 'available' ? 'Available for NGO Collection' : offer.status,
                    coords: { lat: offer.latitude, lng: offer.longitude },
                    metric: `${offer.quantityDisplay} (${offer.portions} portions)`,
                    actionRoute: 'surplus-serve',
                    actionLabel: lang === 'en' ? 'Open in Surplus2Serve Portal' : 'খাদ্য উদ্ধার পোর্টালে দেখুন',
                  })
                }
                style={{ left: pos.left, top: pos.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 focus:outline-none"
                aria-label={`Surplus Food Offer: ${offer.itemName}`}
              >
                <div className={`p-2 rounded-full shadow-lg transition-transform group-hover:scale-125 border ${
                  isExpired 
                    ? 'bg-amber-900/80 border-amber-600 text-amber-200'
                    : 'bg-amber-500 border-white text-slate-900 ring-2 ring-amber-400/40 animate-bounce'
                }`}>
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl border border-slate-700 pointer-events-none z-30">
                  <div className="font-bold truncate text-amber-400">{offer.itemName}</div>
                  <div className="text-slate-300 text-[10px] truncate">{offer.vendorName}</div>
                  <div className="text-slate-400 font-mono text-[9px] mt-1">{offer.quantityDisplay}</div>
                </div>
              </button>
            );
          })}

        {/* 2. Waste Hubs & Collection Points (Blue) */}
        {(activeFilter === 'all' || activeFilter === 'hubs') &&
          wasteHubs.map((hub) => {
            const pos = getPinPos(hub.coords.lat, hub.coords.lng);
            return (
              <button
                key={hub.id}
                onClick={() =>
                  setSelectedPin({
                    type: 'hub',
                    id: hub.id,
                    title: hub.title,
                    subtitle: hub.subtitle,
                    details: hub.details,
                    status: hub.status,
                    coords: hub.coords,
                    metric: hub.metric,
                    actionRoute: 'recycling-passport',
                    actionLabel: lang === 'en' ? 'View Proof-of-Recycling Batches' : 'রিসাইক্লিং পাসপোর্ট দেখুন',
                  })
                }
                style={{ left: pos.left, top: pos.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 focus:outline-none"
                aria-label={`Waste Hub: ${hub.title}`}
              >
                <div className="p-2 rounded-full bg-sky-500 border border-white text-white shadow-lg transition-transform group-hover:scale-125 ring-2 ring-sky-400/40">
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl border border-slate-700 pointer-events-none z-30">
                  <div className="font-bold text-sky-400 truncate">{hub.title}</div>
                  <div className="text-slate-300 text-[10px]">{hub.subtitle}</div>
                  <div className="text-slate-400 font-mono text-[9px] mt-1">{hub.metric}</div>
                </div>
              </button>
            );
          })}

        {/* 3. Blocked Drain Hotspots (Red) */}
        {(activeFilter === 'all' || activeFilter === 'drains') &&
          drainHotspots.map((drain) => {
            const pos = getPinPos(drain.coordinates.lat, drain.coordinates.lng);
            const isCleared = drain.status === 'cleared';
            const isInReview = drain.status === 'in_review';
            return (
              <button
                key={drain.id}
                onClick={() =>
                  setSelectedPin({
                    type: 'drain',
                    id: drain.id,
                    title: drain.title,
                    subtitle: `${drain.location} · Risk: ${drain.riskLevel.toUpperCase()}`,
                    details: drain.description,
                    status: drain.status.toUpperCase(),
                    coords: drain.coordinates,
                    metric: `Bounty: ${drain.bountyPoints} pts · ~${drain.estimatedDebrisKg}kg debris`,
                    actionRoute: 'drain-bounty',
                    actionLabel: lang === 'en' ? 'Open in Drain Bounty Missions' : 'ড্রেন বাউন্টি মিশনে দেখুন',
                  })
                }
                style={{ left: pos.left, top: pos.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 focus:outline-none"
                aria-label={`Drain Hotspot: ${drain.title}`}
              >
                <div className={`p-2 rounded-full border shadow-lg transition-transform group-hover:scale-125 ${
                  isCleared
                    ? 'bg-slate-700 border-emerald-400 text-emerald-400'
                    : isInReview
                    ? 'bg-amber-600 border-white text-white animate-pulse'
                    : 'bg-rose-600 border-white text-white ring-2 ring-rose-500/40'
                }`}>
                  {isCleared ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertOctagon className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl border border-slate-700 pointer-events-none z-30">
                  <div className={`font-bold truncate ${isCleared ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {drain.title}
                  </div>
                  <div className="text-slate-300 text-[10px] truncate">{drain.location}</div>
                  <div className="text-amber-300 font-mono text-[9px] mt-1">Bounty: {drain.bountyPoints} pts</div>
                </div>
              </button>
            );
          })}

        {/* 4. Planted Trees (Green Leaf Icons - funded by users!) */}
        {(activeFilter === 'all' || activeFilter === 'trees') &&
          plantedTrees.map((tree) => {
            const pos = getPinPos(tree.coordinates.lat, tree.coordinates.lng);
            return (
              <button
                key={tree.id}
                onClick={() =>
                  setSelectedPin({
                    type: 'tree',
                    id: tree.id,
                    title: `${tree.speciesName} (${tree.scientificName})`,
                    subtitle: `${tree.locationName} · Planted: ${tree.plantedDate}`,
                    details: `Funded by: ${tree.fundedBy}. Absorbing estimated ${tree.carbonOffsetKgYr} kg CO2/year and stabilizing lake embankment soil.`,
                    status: `Status: ${tree.healthStatus}`,
                    coords: tree.coordinates,
                    metric: `Points Drawn: ${tree.pointsDrawn} pts`,
                    actionRoute: 'green-wallet',
                    actionLabel: lang === 'en' ? 'View Tree Fund & Plant More' : 'বৃক্ষ তহবিল দেখুন ও গাছ লাগান',
                  })
                }
                style={{ left: pos.left, top: pos.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 focus:outline-none"
                aria-label={`Planted Tree: ${tree.speciesName}`}
              >
                <div className="p-2 rounded-full bg-emerald-600 border border-white text-white shadow-lg transition-transform group-hover:scale-125 ring-2 ring-emerald-400/50">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl border border-slate-700 pointer-events-none z-30">
                  <div className="font-bold text-emerald-400 truncate">{tree.speciesName}</div>
                  <div className="text-slate-300 text-[10px] truncate">{tree.locationName}</div>
                  <div className="text-slate-400 text-[9px] mt-1">{tree.fundedBy}</div>
                </div>
              </button>
            );
          })}

        {/* Selected Pin Detail Drawer (Bottom overlay on map) */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:left-4 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white p-4 rounded-xl shadow-2xl z-30 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedPin.type === 'food' && <UtensilsCrossed className="w-4 h-4 text-amber-400 shrink-0" />}
                {selectedPin.type === 'hub' && <Trash2 className="w-4 h-4 text-sky-400 shrink-0" />}
                {selectedPin.type === 'drain' && <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />}
                {selectedPin.type === 'tree' && <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />}
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  {selectedPin.id} · {selectedPin.coords.lat.toFixed(4)}° N, {selectedPin.coords.lng.toFixed(4)}° E
                </span>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md text-xs cursor-pointer"
                aria-label="Close pin drawer"
              >
                ✕
              </button>
            </div>

            <h3 className="text-sm font-bold text-white mt-2 leading-snug">
              {selectedPin.title}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {selectedPin.subtitle}
            </p>

            <p className="text-xs text-slate-400 mt-2 leading-relaxed bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
              {selectedPin.details}
            </p>

            {selectedPin.metric && (
              <div className="mt-2 text-xs font-mono font-semibold text-emerald-400">
                {selectedPin.metric}
              </div>
            )}

            {selectedPin.actionRoute && (
              <button
                onClick={() => {
                  setCurrentRoute(selectedPin.actionRoute);
                  setSelectedPin(null);
                }}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{selectedPin.actionLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Launch Cards for the Other 5 Pages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setCurrentRoute('surplus-serve')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Surplus2Serve Portal</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Rescue unsold fresh meals before time expires, or auto-bridge expired batches to Bio-Compost.
          </p>
          <div className="text-xs text-amber-600 font-semibold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>{foodOffers.filter(f => f.status === 'available').length} offers waiting</span>
            <span>→</span>
          </div>
        </div>

        <div 
          onClick={() => setCurrentRoute('drain-bounty')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <AlertOctagon className="w-4 h-4" />
            <span>Drain Bounty Missions</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Report and clear choked arterial drains, upload before/after photos, and prevent monsoon flooding.
          </p>
          <div className="text-xs text-rose-600 font-semibold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>{drainHotspots.filter(d => d.status === 'open').length} critical spots open</span>
            <span>→</span>
          </div>
        </div>

        <div 
          onClick={() => setCurrentRoute('green-wallet')}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Leaf className="w-4 h-4" />
            <span>Green Wallet & Urban Canopy</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Track 95/5 micro eco-contributions, plant native trees, and redeem local merchant discount vouchers.
          </p>
          <div className="text-xs text-emerald-600 font-semibold mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Fund Next 10 Trees Pool: 88%</span>
            <span>→</span>
          </div>
        </div>
      </div>

    </div>
  );
};
