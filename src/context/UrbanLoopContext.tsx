/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  Language,
  ViewMode,
  PageRoute,
  FoodOffer,
  WasteBatch,
  DrainHotspot,
  PlantedTree,
  WalletTransaction,
  ToastMessage,
  VoucherItem,
} from '../types';
import {
  INITIAL_FOOD_OFFERS,
  INITIAL_WASTE_BATCHES,
  INITIAL_DRAIN_HOTSPOTS,
  INITIAL_PLANTED_TREES,
  INITIAL_TRANSACTIONS,
  VOUCHER_ITEMS,
  I18N,
} from '../data/seedData';
import {
  calculateEcoSplit,
  calculateContainerRefund,
  calculateTreeFundProgress,
  calculateMonsoonRiskReduction,
} from '../utils/circularEconomy';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  FirebaseUser,
  handleFirestoreError,
  OperationType,
} from '../firebase/config';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

interface UrbanLoopContextType {
  // Navigation & Preferences
  role: UserRole;
  setRole: (role: UserRole) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentRoute: PageRoute;
  setCurrentRoute: (route: PageRoute) => void;
  t: (typeof I18N)['en'];

  // Data Collections
  foodOffers: FoodOffer[];
  wasteBatches: WasteBatch[];
  drainHotspots: DrainHotspot[];
  plantedTrees: PlantedTree[];
  transactions: WalletTransaction[];
  vouchers: VoucherItem[];

  // Wallet & Tree Fund
  walletBalance: number;
  treeFundPointsPool: number;
  totalFoodRescuedKg: number;
  totalPlasticRecycledKg: number;
  drainsClearedCount: number;

  // Actions
  postFoodOffer: (offer: Omit<FoodOffer, 'id' | 'createdAt' | 'status'>) => void;
  claimFoodOffer: (offerId: string) => void;
  simulateFoodExpiry: (offerId: string) => void;
  bridgeExpiredFoodToCompost: (offerId: string) => string;
  advanceBatchStep: (batchId: string) => void;
  processContainerReturn: (small: number, large: number, cans: number) => { refundSGD: number; greenPoints: number };
  submitDrainProof: (hotspotId: string, proof: { collectorName: string; beforePhotoUrl: string; afterPhotoUrl: string; gpsCoordinates: string; clearedBags: number }) => void;
  verifyDrainClearing: (hotspotId: string) => void;
  donatePointsForTree: (points: number, customLocation?: string) => boolean;
  redeemVoucher: (voucherId: string) => { success: boolean; code?: string; message?: string };

  // Toast System
  toasts: ToastMessage[];
  addToast: (title: string, description: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Firebase Auth & Cloud Sync
  currentUser: FirebaseUser | null;
  signInWithGoogle: () => Promise<void>;
  signOutGoogle: () => Promise<void>;
  isCloudSynced: boolean;
}

const UrbanLoopContext = createContext<UrbanLoopContextType | undefined>(undefined);

export const UrbanLoopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('vendor');
  const [lang, setLang] = useState<Language>('en');
  const [viewMode, setViewMode] = useState<ViewMode>('web');
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('map');

  const [foodOffers, setFoodOffers] = useState<FoodOffer[]>(INITIAL_FOOD_OFFERS);
  const [wasteBatches, setWasteBatches] = useState<WasteBatch[]>(INITIAL_WASTE_BATCHES);
  const [drainHotspots, setDrainHotspots] = useState<DrainHotspot[]>(INITIAL_DRAIN_HOTSPOTS);
  const [plantedTrees, setPlantedTrees] = useState<PlantedTree[]>(INITIAL_PLANTED_TREES);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [vouchers] = useState<VoucherItem[]>(VOUCHER_ITEMS);

  const [walletBalance, setWalletBalance] = useState<number>(460);
  const [treeFundPointsPool, setTreeFundPointsPool] = useState<number>(4400);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Firebase state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  const t = I18N[lang];

  // Helper to trigger toast
  const addToast = (title: string, description: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Firebase Auth listener and user profile sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsCloudSynced(true);
        const userPath = `users/${user.uid}`;
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              uid: user.uid,
              displayName: user.displayName || 'UrbanLoop Citizen',
              email: user.email || '',
              role: role,
              walletBalance: walletBalance,
              lifetimeEarned: 1200,
              treesPlantedCount: plantedTrees.length,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, userPath);
        }
      } else {
        setIsCloudSynced(false);
      }
    });

    return () => unsubscribe();
  }, [role, walletBalance, plantedTrees.length]);

  // Firestore real-time listener for community food listings when authenticated
  useEffect(() => {
    if (!currentUser) return;
    const pathForListings = 'food_listings';
    const unsubListings = onSnapshot(
      collection(db, pathForListings),
      (snapshot) => {
        const cloudOffers: FoodOffer[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.itemName) {
            cloudOffers.push({
              id: docSnap.id,
              itemName: data.itemName,
              category: (data.category as any) || 'cooked',
              vendorName: data.vendorName || 'Pilot Vendor',
              vendorLocation: data.vendorLocation || 'Ward 15 Kitchen Gate',
              portions: Number(data.portions) || 10,
              quantityDisplay: `${data.portions} servings`,
              status: data.status || 'available',
              expiresAt: Number(data.expiresAt) || Date.now() + 3600000,
              createdAt: Date.now(),
              latitude: 23.746,
              longitude: 90.374,
              preparedTimeAgo: 'Recently',
              safeHandlingGuidelines: 'Keep at safe holding temperature above 60°C or below 4°C.',
            });
          }
        });
        if (cloudOffers.length > 0) {
          setFoodOffers((prev) => {
            const merged = [...cloudOffers];
            for (const item of prev) {
              if (!merged.some((m) => m.id === item.id)) {
                merged.push(item);
              }
            }
            return merged;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, pathForListings);
      }
    );

    return () => unsubListings();
  }, [currentUser]);

  const signInWithGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        addToast(
          lang === 'en' ? 'Google Account Connected' : 'গুগল অ্যাকাউন্ট সংযুক্ত হয়েছে',
          lang === 'en'
            ? `Signed in as ${user.displayName || user.email}. Cloud sync active.`
            : `${user.displayName || user.email} হিসেবে সাইন ইন সম্পন্ন হয়েছে।`,
          'success'
        );
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      addToast(
        lang === 'en' ? 'Sign-in Failed' : 'সাইন ইন ব্যর্থ হয়েছে',
        lang === 'en' ? 'Could not complete Google authentication.' : 'গুগল প্রমাণীকরণ সম্পন্ন করা যায়নি।',
        'warning'
      );
    }
  };

  const signOutGoogle = async () => {
    try {
      await logoutUser();
      addToast(
        lang === 'en' ? 'Signed Out' : 'সাইন আউট সম্পন্ন',
        lang === 'en' ? 'Local session disconnected from cloud.' : 'ক্লাউড সেশন বিচ্ছিন্ন করা হয়েছে।',
        'info'
      );
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Aggregated Counters
  const totalFoodRescuedKg = foodOffers
    .filter((f) => f.status === 'claimed' || f.status === 'collected' || f.status === 'bridged_compost')
    .reduce((sum, f) => sum + (f.portions * 0.45), 185); // 185 baseline seed

  const totalPlasticRecycledKg = wasteBatches
    .filter((b) => b.type === 'plastic_pet' || b.type === 'hdpe_rigid')
    .reduce((sum, b) => sum + b.weightKg, 340); // baseline seed

  const drainsClearedCount = drainHotspots.filter((d) => d.status === 'cleared').length;

  // 1. Post Food Offer (Surplus2Serve)
  const postFoodOffer = (offerData: Omit<FoodOffer, 'id' | 'createdAt' | 'status'>) => {
    const newId = `FO-0${foodOffers.length + 1}`;
    const newOffer: FoodOffer = {
      ...offerData,
      id: newId,
      status: 'available',
      createdAt: Date.now(),
    };
    setFoodOffers((prev) => [newOffer, ...prev]);

    // Persist to Firestore if authenticated
    if (auth.currentUser) {
      const listingPath = `food_listings/${newId}`;
      setDoc(doc(db, 'food_listings', newId), {
        id: newId,
        itemName: offerData.itemName,
        category: offerData.category,
        vendorName: offerData.vendorName,
        vendorLocation: offerData.vendorLocation,
        portions: offerData.portions,
        status: 'available',
        expiresAt: offerData.expiresAt,
        createdBy: auth.currentUser.uid,
      }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, listingPath);
      });
    }

    addToast(
      lang === 'en' ? 'Surplus Listing Active' : 'উদ্বৃত্ত খাবার পোস্ট সম্পন্ন',
      lang === 'en' 
        ? `${offerData.itemName} (${offerData.quantityDisplay}) broadcast to verified NGOs.`
        : `${offerData.itemName} সফলভাবে এনজিওদের জন্য উন্মুক্ত করা হয়েছে।`,
      'success'
    );
  };

  // 2. Claim Food Offer (NGO Role)
  const claimFoodOffer = (offerId: string) => {
    setFoodOffers((prev) =>
      prev.map((offer) => {
        if (offer.id === offerId) {
          return {
            ...offer,
            status: 'claimed',
            claimedByNgo: 'Bidyanondo Foundation / Ward 15 Relief Unit',
          };
        }
        return offer;
      })
    );

    // Reward points for vendor and NGO participation
    const earned = 120;
    const split = calculateEcoSplit(earned, 5);
    setWalletBalance((prev) => prev + split.walletPoints);
    setTreeFundPointsPool((prev) => prev + split.treeFundPoints);

    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      timestamp: 'Just now',
      description: `Food Surplus Rescue Dispatched (${offerId})`,
      source: 'surplus_rescue',
      grossPoints: split.grossPoints,
      walletPoints: split.walletPoints,
      treeFundPoints: split.treeFundPoints,
      type: 'credit',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addToast(
      lang === 'en' ? 'Food Surplus Claimed!' : 'খাবার সফলভাবে বুক করা হয়েছে!',
      lang === 'en'
        ? `Collection arranged. ${split.walletPoints} Green Credits added to wallet, ${split.treeFundPoints} auto-contributed to Ward Tree Fund.`
        : `সংগ্রহের গাড়ি পাঠানো হয়েছে। ওয়ালেটে ${split.walletPoints} পয়েন্ট এবং ওয়ার্ড বৃক্ষ তহবিলে ${split.treeFundPoints} পয়েন্ট যোগ হয়েছে।`,
      'success'
    );
  };

  // 3. Simulate Expiry (Strict physical timeline compliance)
  const simulateFoodExpiry = (offerId: string) => {
    setFoodOffers((prev) =>
      prev.map((offer) => {
        if (offer.id === offerId) {
          return {
            ...offer,
            expiresAt: Date.now() - 1000,
            status: 'expired_locked',
          };
        }
        return offer;
      })
    );
    addToast(
      lang === 'en' ? 'Safety Window Elapsed' : 'খাদ্য নিরাপত্তার সময়সীমা শেষ',
      lang === 'en'
        ? 'Listing locked for human consumption. Physical safety protocol activated. Divert to Bio-Compost.'
        : 'মানুষের খাওয়ার জন্য খাবারটি লক করা হয়েছে। কম্পোস্টিং পাসপোর্টে প্রেরণের বাটন সক্রিয়।',
      'warning'
    );
  };

  // 4. Auto-Bridge Expired Food to Bio-Compost Passport (Page 2 -> Page 3 Transition)
  const bridgeExpiredFoodToCompost = (offerId: string): string => {
    const targetOffer = foodOffers.find((f) => f.id === offerId);
    const batchId = `UL-BIO${Math.floor(100 + Math.random() * 900)}`;
    const weightEstimate = targetOffer ? Math.max(10, Math.round(targetOffer.portions * 0.45)) : 25;

    const newBatch: WasteBatch = {
      batchId,
      type: 'bio_compost',
      title: `Organic Compost Slurry from ${targetOffer?.itemName || 'Expired Food'}`,
      weightKg: weightEstimate,
      sourceType: 'food_expiry_bridge',
      sourceName: `Bridge Portal (${targetOffer?.vendorName || 'Vendor Point'})`,
      originLocation: targetOffer?.vendorLocation || 'Ward 15 Kitchen Gate',
      hubLocation: 'Bengal Organic Aerobic Compost Cell #4',
      currentStep: 1,
      status: 'Pending Handover',
      pendingPoints: Math.round(weightEstimate * 4),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chainHistory: [
        {
          step: 1,
          label: 'Supplier Handover (Bridge Triggered)',
          actor: targetOffer?.vendorName || 'Vendor Gate',
          timestamp: 'Just now',
          verified: true,
        },
        {
          step: 2,
          label: 'Collector In-Transit',
          actor: 'Ward 15 Bio-Rickshaw',
          timestamp: 'Scheduled',
          verified: false,
        },
        {
          step: 3,
          label: 'Recycler Received',
          actor: 'Compost Pit Intake',
          timestamp: 'Pending',
          verified: false,
        },
        {
          step: 4,
          label: 'Verified Recycled',
          actor: 'Aerobic Digestion Batch',
          timestamp: 'Pending',
          verified: false,
        },
      ],
    };

    setWasteBatches((prev) => [newBatch, ...prev]);

    // Update food offer status to bridged
    setFoodOffers((prev) =>
      prev.map((f) => (f.id === offerId ? { ...f, status: 'bridged_compost' } : f))
    );

    addToast(
      lang === 'en' ? 'Bridged to Bio-Compost Passport' : 'কম্পোস্ট পাসপোর্টে ব্রিজ সম্পন্ন',
      lang === 'en'
        ? `Immutable Batch #${batchId} created (${weightEstimate} kg diverted from landfill).`
        : `লট #${batchId} বায়ো-কম্পোস্টে ট্রান্সফার করা হয়েছে (${weightEstimate} কেজি বর্জ্য উদ্ধার)।`,
      'success'
    );

    return batchId;
  };

  // 5. Advance Step on Waste Batch (4-Step Verification Stepper)
  const advanceBatchStep = (batchId: string) => {
    let earnedBatchPoints = 0;
    let finalBatchWeight = 0;

    setWasteBatches((prev) =>
      prev.map((batch) => {
        if (batch.batchId !== batchId) return batch;

        const nextStep = (batch.currentStep + 1) as 1 | 2 | 3 | 4;
        if (batch.currentStep >= 4) return batch;

        const updatedHistory = batch.chainHistory.map((item) => {
          if (item.step === nextStep) {
            return {
              ...item,
              timestamp: 'Just now',
              verified: true,
            };
          }
          return item;
        });

        let newStatus = batch.status;
        if (nextStep === 2) newStatus = 'In-Transit';
        if (nextStep === 3) newStatus = 'Received at Recycler';
        if (nextStep === 4) {
          newStatus = 'Verified Recycled';
          earnedBatchPoints = batch.pendingPoints;
          finalBatchWeight = batch.weightKg;
        }

        return {
          ...batch,
          currentStep: nextStep,
          status: newStatus,
          chainHistory: updatedHistory,
        };
      })
    );

    // If final step 4 is reached: distribute Green Points with 95/5 micro-deduction split
    if (earnedBatchPoints > 0) {
      const split = calculateEcoSplit(earnedBatchPoints, 5);
      setWalletBalance((prev) => prev + split.walletPoints);
      setTreeFundPointsPool((prev) => prev + split.treeFundPoints);

      const newTx: WalletTransaction = {
        id: `TX-${Date.now()}`,
        timestamp: 'Just now',
        description: `Recycling Passport #${batchId} Verified (${finalBatchWeight}kg)`,
        source: 'recycling_bounty',
        grossPoints: split.grossPoints,
        walletPoints: split.walletPoints,
        treeFundPoints: split.treeFundPoints,
        type: 'credit',
      };
      setTransactions((prev) => [newTx, ...prev]);

      addToast(
        lang === 'en' ? 'Recycling Passport Finalized!' : 'রিসাইক্লিং পাসপোর্ট ভেরিফাইড!',
        lang === 'en'
          ? `Step 4 confirmed. ${split.walletPoints} Green Credits added to wallet, ${split.treeFundPoints} points auto-contributed to Ward Tree Fund.`
          : `ধাপ ৪ যাচাই সম্পন্ন। ওয়ালেটে ${split.walletPoints} পয়েন্ট যোগ এবং ওয়ার্ড বৃক্ষ তহবিলে ${split.treeFundPoints} পয়েন্ট জমা হয়েছে।`,
        'success'
      );
    } else {
      addToast(
        lang === 'en' ? 'Batch Chain Advanced' : 'ব্যাচ চেইনের ধাপ আপডেট হয়েছে',
        lang === 'en' ? `Batch #${batchId} moved to next chain of custody.` : `ব্যাচ #${batchId} পরবর্তী ধাপে উন্নীত করা হয়েছে।`,
        'info'
      );
    }
  };

  // 6. Process Beverage Container Return (Reverse Vending Machine Simulator)
  const processContainerReturn = (small: number, large: number, cans: number) => {
    const result = calculateContainerRefund(small, large, cans);
    const split = calculateEcoSplit(result.greenPoints, 5);

    setWalletBalance((prev) => prev + split.walletPoints);
    setTreeFundPointsPool((prev) => prev + split.treeFundPoints);

    const totalCount = small + large + cans;
    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      timestamp: 'Just now',
      description: `Container Return Machine #${Math.floor(10 + Math.random() * 90)} (${totalCount} containers)`,
      source: 'container_return',
      grossPoints: split.grossPoints,
      walletPoints: split.walletPoints,
      treeFundPoints: split.treeFundPoints,
      type: 'credit',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addToast(
      lang === 'en' ? 'Deposit Refund Issued' : 'কন্টেইনার রিফান্ড জমা হয়েছে',
      lang === 'en'
        ? `Refund: $${result.refundSGD.toFixed(2)} SGD (equiv). ${split.walletPoints} pts added to wallet, ${split.treeFundPoints} auto-contributed to Tree Fund.`
        : `রিফান্ড: $${result.refundSGD.toFixed(2)} সিঙ্গাপুর ডলার সমমূল্য। ওয়ালেটে ${split.walletPoints} পয়েন্ট ও বৃক্ষ তহবিলে ${split.treeFundPoints} পয়েন্ট যুক্ত হয়েছে।`,
      'success'
    );

    return {
      refundSGD: result.refundSGD,
      greenPoints: result.greenPoints,
    };
  };

  // 7. Submit Drain Proof (Page 4 Drain Bounty)
  const submitDrainProof = (
    hotspotId: string,
    proof: { collectorName: string; beforePhotoUrl: string; afterPhotoUrl: string; gpsCoordinates: string; clearedBags: number }
  ) => {
    setDrainHotspots((prev) =>
      prev.map((h) => {
        if (h.id === hotspotId) {
          return {
            ...h,
            status: 'in_review',
            proofSubmission: {
              ...proof,
              submittedAt: 'Just now',
            },
          };
        }
        return h;
      })
    );

    // Persist to Firestore if authenticated
    if (auth.currentUser) {
      const reportPath = `drain_reports/${hotspotId}`;
      setDoc(doc(db, 'drain_reports', hotspotId), {
        id: hotspotId,
        hotspotId: hotspotId,
        collectorName: proof.collectorName,
        gpsCoordinates: proof.gpsCoordinates,
        clearedBags: proof.clearedBags,
        status: 'in_review',
        submittedBy: auth.currentUser.uid,
      }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, reportPath);
      });
    }

    addToast(
      lang === 'en' ? 'Proof Submitted for Verification' : 'পরিষ্কারের প্রমাণ জমা হয়েছে',
      lang === 'en'
        ? `Task #${hotspotId} is now under municipal inspection. Bounty points will be awarded upon approval.`
        : `টাস্ক #${hotspotId} নগর পরিদর্শনের জন্য জমা হয়েছে। অনুমোদনের পর বাউন্টি পয়েন্ট যুক্ত হবে।`,
      'info'
    );
  };

  // 8. Verify Drain Clearing (City Planner or Municipal Inspector Role)
  const verifyDrainClearing = (hotspotId: string) => {
    const target = drainHotspots.find((d) => d.id === hotspotId);
    const points = target?.bountyPoints || 200;
    const split = calculateEcoSplit(points, 5);

    setDrainHotspots((prev) =>
      prev.map((h) => (h.id === hotspotId ? { ...h, status: 'cleared' } : h))
    );

    setWalletBalance((prev) => prev + split.walletPoints);
    setTreeFundPointsPool((prev) => prev + split.treeFundPoints);

    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      timestamp: 'Just now',
      description: `Drain Bounty Cleared: ${target?.title || hotspotId}`,
      source: 'drain_bounty',
      grossPoints: split.grossPoints,
      walletPoints: split.walletPoints,
      treeFundPoints: split.treeFundPoints,
      type: 'credit',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addToast(
      lang === 'en' ? 'Drain Bounty Verified & Cleared!' : 'ড্রেন বাউন্টি ভেরিফায়েড ও ক্লিয়ার্ড!',
      lang === 'en'
        ? `Municipal approval confirmed. ${split.walletPoints} pts added to wallet, ${split.treeFundPoints} pts auto-contributed to Ward Tree Fund!`
        : `সিটি অনুমোদন সম্পন্ন! ${split.walletPoints} পয়েন্ট ওয়ালেটে এবং ${split.treeFundPoints} পয়েন্ট ওয়ার্ড বৃক্ষ তহবিলে জমা হয়েছে!`,
      'success'
    );
  };

  // 9. Voluntary Tree Donation
  const donatePointsForTree = (pointsToDonate: number, customLocation?: string): boolean => {
    if (pointsToDonate <= 0 || pointsToDonate > walletBalance) {
      addToast(
        lang === 'en' ? 'Insufficient Points' : 'অপর্যাপ্ত পয়েন্ট',
        lang === 'en' ? 'Your wallet balance is insufficient for this contribution.' : 'এই অনুদানের জন্য আপনার ওয়ালেটে যথেষ্ট পয়েন্ট নেই।',
        'warning'
      );
      return false;
    }

    setWalletBalance((prev) => prev - pointsToDonate);
    setTreeFundPointsPool((prev) => prev + pointsToDonate);

    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      timestamp: 'Just now',
      description: `Voluntary Tree Planting Contribution (${pointsToDonate} pts)`,
      source: 'tree_donation',
      grossPoints: pointsToDonate,
      walletPoints: pointsToDonate,
      treeFundPoints: pointsToDonate,
      type: 'debit',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Check if new tree is funded (500 pts threshold)
    if (pointsToDonate >= 500 || (treeFundPointsPool + pointsToDonate) >= (plantedTrees.length + 1) * 500) {
      const treeSpeciesList = [
        { name: 'Neem (Margosa)', scientific: 'Azadirachta indica', co2: 22.5 },
        { name: 'Krishnachura', scientific: 'Delonix regia', co2: 30.0 },
        { name: 'Bakul', scientific: 'Mimusops elengi', co2: 18.0 },
        { name: 'Chatim', scientific: 'Alstonia scholaris', co2: 25.0 },
        { name: 'Jarul', scientific: 'Lagerstroemia speciosa', co2: 20.0 },
      ];
      const selected = treeSpeciesList[Math.floor(Math.random() * treeSpeciesList.length)];
      const treeIndex = plantedTrees.length + 1;
      const newTree: PlantedTree = {
        id: `UT-0${treeIndex}`,
        speciesName: selected.name,
        scientificName: selected.scientific,
        locationName: customLocation || `Dhanmondi Lake Green Belt Plot #${treeIndex}`,
        coordinates: {
          lat: 23.7430 + (Math.random() - 0.5) * 0.008,
          lng: 90.3750 + (Math.random() - 0.5) * 0.008,
        },
        plantedDate: new Date().toISOString().split('T')[0],
        fundedBy: `Citizen Eco-Credits (${role.toUpperCase()} Role)`,
        carbonOffsetKgYr: selected.co2,
        healthStatus: 'Sapling',
        pointsDrawn: 500,
      };

      setPlantedTrees((prev) => [...prev, newTree]);

      addToast(
        lang === 'en' ? 'New Tree Planted in Ward 15!' : 'ওয়ার্ড ১৫-এ নতুন গাছ রোপিত হয়েছে!',
        lang === 'en'
          ? `${selected.name} funded! A new green leaf pin is now live on the Command Map.`
          : `${selected.name} গাছ রোপিত হয়েছে! কমান্ড ম্যাপে সবুজ পাতার পিন যুক্ত করা হয়েছে।`,
        'success'
      );
    } else {
      addToast(
        lang === 'en' ? 'Micro-Donation Successful' : 'মাইক্রো-অনুদান সফল হয়েছে',
        lang === 'en'
          ? `${pointsToDonate} pts added to Ward 15 Tree Fund pool.`
          : `${pointsToDonate} পয়েন্ট ওয়ার্ড ১৫ বৃক্ষ তহবিলে যোগ হয়েছে।`,
        'success'
      );
    }

    return true;
  };

  // 10. Redeem Voucher
  const redeemVoucher = (voucherId: string) => {
    const item = vouchers.find((v) => v.id === voucherId);
    if (!item) return { success: false, message: 'Item not found' };

    if (walletBalance < item.costPoints) {
      addToast(
        lang === 'en' ? 'Insufficient Points' : 'অপর্যাপ্ত পয়েন্ট',
        lang === 'en' ? `You need ${item.costPoints} pts to redeem this voucher.` : `এই ভাউচারটির জন্য ${item.costPoints} পয়েন্ট প্রয়োজন।`,
        'warning'
      );
      return { success: false, message: 'Insufficient points' };
    }

    const generatedCode = `UL-${item.category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setWalletBalance((prev) => prev - item.costPoints);

    const newTx: WalletTransaction = {
      id: `TX-${Date.now()}`,
      timestamp: 'Just now',
      description: `Redeemed ${item.title} (${item.merchant})`,
      source: 'voucher_redeem',
      grossPoints: item.costPoints,
      walletPoints: item.costPoints,
      treeFundPoints: 0,
      type: 'debit',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addToast(
      lang === 'en' ? 'Voucher Redeemed!' : 'ভাউচার সফলভাবে রিডিম হয়েছে!',
      lang === 'en'
        ? `Code: ${generatedCode}. Show this digital voucher at ${item.merchant}.`
        : `কোড: ${generatedCode}। ${item.merchant}-এ এই কোডটি প্রদর্শন করুন।`,
      'success'
    );

    return { success: true, code: generatedCode };
  };

  return (
    <UrbanLoopContext.Provider
      value={{
        role,
        setRole,
        lang,
        setLang,
        viewMode,
        setViewMode,
        currentRoute,
        setCurrentRoute,
        t,
        foodOffers,
        wasteBatches,
        drainHotspots,
        plantedTrees,
        transactions,
        vouchers,
        walletBalance,
        treeFundPointsPool,
        totalFoodRescuedKg,
        totalPlasticRecycledKg,
        drainsClearedCount,
        postFoodOffer,
        claimFoodOffer,
        simulateFoodExpiry,
        bridgeExpiredFoodToCompost,
        advanceBatchStep,
        processContainerReturn,
        submitDrainProof,
        verifyDrainClearing,
        donatePointsForTree,
        redeemVoucher,
        toasts,
        addToast,
        removeToast,
        currentUser,
        signInWithGoogle,
        signOutGoogle,
        isCloudSynced,
      }}
    >
      {children}
    </UrbanLoopContext.Provider>
  );
};

export function useUrbanLoop() {
  const context = useContext(UrbanLoopContext);
  if (!context) {
    throw new Error('useUrbanLoop must be used within an UrbanLoopProvider');
  }
  return context;
}
