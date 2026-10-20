/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'vendor' | 'ngo' | 'collector' | 'planner';

export type Language = 'en' | 'bn';

export type ViewMode = 'web' | 'mobile';

export type PageRoute = 
  | 'map' 
  | 'surplus-serve' 
  | 'recycling-passport' 
  | 'drain-bounty' 
  | 'green-wallet' 
  | 'urp-governance'
  | 'civic-chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type FoodCategory = 'cooked' | 'bakery' | 'produce' | 'dairy';

export type FoodStatus = 'available' | 'claimed' | 'collected' | 'expired_locked' | 'bridged_compost';

export interface FoodOffer {
  id: string;
  itemName: string;
  category: FoodCategory;
  vendorName: string;
  vendorLocation: string;
  latitude: number;
  longitude: number;
  quantityDisplay: string;
  portions: number;
  preparedTimeAgo: string;
  expiresAt: number; // Unix timestamp ms
  safeHandlingGuidelines: string;
  status: FoodStatus;
  claimedByNgo?: string;
  bridgedBatchId?: string;
  createdAt: number;
}

export type WasteType = 'plastic_pet' | 'bio_compost' | 'hdpe_rigid' | 'aluminum_cans';

export type VerificationStep = 1 | 2 | 3 | 4;

export interface WasteBatch {
  batchId: string;
  type: WasteType;
  title: string;
  weightKg: number;
  sourceType: 'food_expiry_bridge' | 'collector_dropoff' | 'vendor_recycling' | 'drain_bounty_divert';
  sourceName: string;
  originLocation: string;
  hubLocation: string;
  currentStep: VerificationStep;
  status: 'In-Transit' | 'Received at Recycler' | 'Verified Recycled' | 'Pending Handover';
  pendingPoints: number;
  creditedPoints?: number;
  timestamp: string;
  chainHistory: {
    step: VerificationStep;
    label: string;
    actor: string;
    timestamp: string;
    verified: boolean;
  }[];
}

export type DrainStatus = 'open' | 'in_review' | 'cleared';
export type RiskLevel = 'critical' | 'high' | 'moderate';

export interface DrainHotspot {
  id: string;
  title: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: DrainStatus;
  riskLevel: RiskLevel;
  bountyPoints: number;
  estimatedDebrisKg: number;
  reportedAgo: string;
  description: string;
  proofSubmission?: {
    collectorName: string;
    beforePhotoUrl: string;
    afterPhotoUrl: string;
    gpsCoordinates: string;
    clearedBags: number;
    submittedAt: string;
  };
}

export interface PlantedTree {
  id: string;
  speciesName: string;
  scientificName: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  plantedDate: string;
  fundedBy: string;
  carbonOffsetKgYr: number;
  healthStatus: 'Thriving' | 'Established' | 'Sapling';
  pointsDrawn: number;
}

export interface WalletTransaction {
  id: string;
  timestamp: string;
  description: string;
  source: 'surplus_rescue' | 'drain_bounty' | 'container_return' | 'recycling_bounty' | 'tree_donation' | 'voucher_redeem';
  grossPoints: number;
  walletPoints: number; // 95%
  treeFundPoints: number; // 5%
  type: 'credit' | 'debit';
}

export interface VoucherItem {
  id: string;
  title: string;
  merchant: string;
  costPoints: number;
  discountValue: string;
  category: 'Grocery' | 'Cafe' | 'Compost & Nursery' | 'Pharmacy';
  expiryDate: string;
  codePrefix: string;
}

export interface SponsorAuditEntry {
  id: string;
  sponsorName: string;
  grantTitle: string;
  committedBDT: number;
  utilizedBDT: number;
  utilizationPct: number;
  verifiedOutputs: {
    foodKgRescued: number;
    plasticKgRecycled: number;
    drainsCleared: number;
    treesPlanted: number;
  };
  auditorStatus: 'Audited & Verified' | 'Q3 Review Approved' | 'Annual Cycle Verified';
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'info' | 'warning';
}
