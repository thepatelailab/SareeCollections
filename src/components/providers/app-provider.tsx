'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter,
  DocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, getStorage } from 'firebase/storage';
import { useFirestore, useFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import type { Product, UserProfile, ProductCategory } from '@/lib/types';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { saveProductsToCache, getCachedProducts } from '@/lib/db-persistence';

const ADMIN_EMAIL = 'bp.brpl@gmail.com';
const PAGE_SIZE = 12;

export interface SareeVariety {
  id: string;
  name: string;
  description?: string;
  stateId: string;
}

interface AppContextType {
  isAdmin: boolean;
  isWholesaler: boolean;
  isRoleLoaded: boolean;
  products: Product[];
  sareeVarieties: SareeVariety[];
  addProduct: (product: Omit<Product, 'id' | 'sareeImg' | 'modelImg'> & { sareeImageFile: File, modelImageDataUrl: string }) => Promise<void>;
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  heroImageUrl: string | null;
  updateHeroImage: (image: File | Blob) => Promise<void>;
  isHeroImageLoading: boolean;
  refetchUserProfile: () => Promise<void>;
  incrementProductMetric: (productId: string, metric: 'likes' | 'shares') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_VARIETIES = [
  { id: "v1", name: "Sambalpuri", description: "Authentic Ikat patterns from Odisha.", stateId: "odisha" },
  { id: "v2", name: "Kanchipuram", description: "Royal silk from the South.", stateId: "tamilnadu" },
  { id: "v3", name: "Banarasi", description: "Opulent zari work from Varanasi.", stateId: "up" },
  { id: "v4", name: "Jamdani", description: "Exquisite muslin floral motifs.", stateId: "bengal" },
  { id: "v5", name: "Paithani", description: "Traditional peacock motifs from the West.", stateId: "maharashtra" },
  { id: "v6", name: "Chanderi", description: "Lightweight sheer elegance.", stateId: "mp" },
];

async function createThumbnail(fileOrUrl: File | string, maxWidth = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', 0.8);
    };
    img.onerror = (e) => reject(e);
    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      img.src = URL.createObjectURL(fileOrUrl);
    }
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { firestore, auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWholesaler, setIsWholesaler] = useState(false);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [sareeVarieties, setSareeVarieties] = useState<SareeVariety[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isHeroImageLoading, setIsHeroImageLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    if (!firestore || !user?.uid) {
      setIsAdmin(false);
      setIsWholesaler(false);
      setIsRoleLoaded(!isUserLoading);
      return;
    }
    
    // Super Admin Fast Path: bypass document lookup if email matches
    if (user.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      setIsWholesaler(false);
      setIsRoleLoaded(true);
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setIsAdmin(profile.role === 'admin');
        setIsWholesaler(profile.role === 'wholesaler');
      } else {
        setIsAdmin(false);
        setIsWholesaler(false);
      }
    } catch (e) {
      // In case of permission errors during login sync, default to basic customer
      console.warn("Profile fetch deferred.");
    } finally {
      setIsRoleLoaded(true);
    }
  }, [firestore, user?.uid, user?.email, isUserLoading]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    async function initFetch() {
      if (!firestore) return;
      
      try {
        const cached = await getCachedProducts();
        if (cached.length > 0) {
          setProducts(cached);
          setIsLoadingProducts(false);
        }
      } catch (e) {
        console.warn("Cache load skipped.");
      }

      try {
        const q = query(
          collection(firestore, 'SareeCollection'), 
          orderBy('id', 'desc'), 
          limit(PAGE_SIZE)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
        
        setProducts(fetched);
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === PAGE_SIZE);
        
        saveProductsToCache(fetched);
      } catch (e) {
        console.error("Product sync issue", e);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    initFetch();
  }, [firestore]);

  const loadMore = async () => {
    if (!firestore || !lastDoc || isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const q = query(
        collection(firestore, 'SareeCollection'),
        orderBy('id', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
      
      const newProducts = [...products, ...fetched];
      setProducts(newProducts);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);

      saveProductsToCache(fetched);
    } catch (e) {
      console.error("Load more issue", e);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    async function fetchVarieties() {
      if (!firestore) return;
      try {
        const snap = await getDocs(collection(firestore, 'sareeVarieties'));
        const custom = snap.docs.map(d => ({ ...d.data(), id: d.id } as SareeVariety));
        const list = [...custom];
        DEFAULT_VARIETIES.forEach(def => {
          if (!list.find(v => v.name.toLowerCase() === def.name.toLowerCase())) {
            list.push(def);
          }
        });
        setSareeVarieties(list);
      } catch (e) {
        setSareeVarieties(DEFAULT_VARIETIES);
      }
    }
    fetchVarieties();
  }, [firestore]);

  const fetchHeroImageUrl = useCallback(async () => {
    if (!firestore) return;
    setIsHeroImageLoading(true);
    try {
      const settingsRef = doc(firestore, 'settings', 'hero');
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists()) {
        setHeroImageUrl(docSnap.data().imageUrl);
      } else {
        setHeroImageUrl(null);
      }
    } catch (error) {
      setHeroImageUrl(null);
    } finally {
      setIsHeroImageLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    if (auth && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  useEffect(() => {
    if (firestore) {
      fetchHeroImageUrl();
    }
  }, [firestore, fetchHeroImageUrl]);

  const incrementProductMetric = (productId: string, metric: 'likes' | 'shares') => {
    if (!firestore) return;
    const docRef = doc(firestore, 'SareeCollection', productId);
    updateDoc(docRef, { [metric]: increment(1) }).catch(e => {
       console.error("Metric update error", e);
    });
    setProducts(prev => {
      return prev.map(p => p.id === productId ? { ...p, [metric]: (p[metric] || 0) + 1 } : p);
    });
  };

  const addProduct = async (newProductData: Omit<Product, 'id' | 'sareeImg' | 'modelImg'> & { sareeImageFile: File, modelImageDataUrl: string }): Promise<void> => {
    if (!firestore || !auth?.currentUser) {
        throw new Error("Access denied.");
    }

    const storage = getStorage();
    const newDocRef = doc(collection(firestore, 'SareeCollection'));
    const productId = newDocRef.id;

    const sareeImageRef = ref(storage, `SareeCollection/${productId}/saree.jpg`);
    const modelImageRef = ref(storage, `SareeCollection/${productId}/model.jpg`);
    const thumbSareeRef = ref(storage, `SareeCollection/${productId}/thumb_saree.jpg`);
    const thumbModelRef = ref(storage, `SareeCollection/${productId}/thumb_model.jpg`);

    const sareeThumbBlob = await createThumbnail(newProductData.sareeImageFile);
    const modelThumbBlob = await createThumbnail(newProductData.modelImageDataUrl);

    const sareeUploadSnapshot = await uploadBytes(sareeImageRef, newProductData.sareeImageFile);
    const sareeImgUrl = await getDownloadURL(sareeUploadSnapshot.ref);

    const modelImageResponse = await fetch(newProductData.modelImageDataUrl);
    const modelImageBlob = await modelImageResponse.blob();
    const modelUploadSnapshot = await uploadBytes(modelImageRef, modelImageBlob);
    const modelImgUrl = await getDownloadURL(modelUploadSnapshot.ref);

    const thumbSareeSnap = await uploadBytes(thumbSareeRef, sareeThumbBlob);
    const thumbSareeUrl = await getDownloadURL(thumbSareeSnap.ref);

    const thumbModelSnap = await uploadBytes(thumbModelRef, modelThumbBlob);
    const thumbModelUrl = await getDownloadURL(thumbModelSnap.ref);
    
    const { sareeImageFile: _, modelImageDataUrl: __, ...restOfProductData } = newProductData;

    const finalProduct: Product = {
      id: productId,
      ...restOfProductData,
      sareeImg: sareeImgUrl,
      modelImg: modelImgUrl,
      thumbnailImg: thumbSareeUrl,
      thumbnailModelImg: thumbModelUrl,
      likes: 0,
      shares: 0,
      ownerId: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(newDocRef, finalProduct);
    setProducts(prev => [finalProduct, ...prev]);
    saveProductsToCache([finalProduct]);
  };
  
  const updateHeroImage = async (image: File | Blob) => {
     if (!firestore || !isAdmin) {
        throw new Error("Access denied.");
    }
    const storage = getStorage();
    const imageRef = ref(storage, 'settings/hero-image.jpg');

    try {
        const uploadSnapshot = await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(uploadSnapshot.ref);
        const settingsRef = doc(firestore, 'settings', 'hero');
        await setDoc(settingsRef, { imageUrl }, { merge: true });
        setHeroImageUrl(imageUrl); 
    } catch (serverError: any) {
        const isStorageError = serverError.code?.includes('storage/');
        const error = new FirestorePermissionError({
            path: isStorageError ? imageRef.fullPath : 'settings/hero',
            operation: 'write',
        });
        errorEmitter.emit('permission-error', error);
        throw error;
    }
  };

  const contextValue = useMemo(
    () => ({
      isAdmin,
      isWholesaler,
      isRoleLoaded,
      products,
      sareeVarieties,
      addProduct,
      isLoading: isUserLoading || isLoadingProducts || !isRoleLoaded,
      isFetchingMore,
      hasMore,
      loadMore,
      heroImageUrl,
      updateHeroImage,
      isHeroImageLoading,
      refetchUserProfile: fetchUserProfile,
      incrementProductMetric,
    }),
    [isAdmin, isWholesaler, isRoleLoaded, products, sareeVarieties, isUserLoading, isLoadingProducts, isFetchingMore, hasMore, loadMore, heroImageUrl, isHeroImageLoading, addProduct, updateHeroImage, fetchUserProfile]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};