
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useUser, useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import type { Product, UserProfile } from '@/lib/types';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { saveProductsToCache, getCachedProducts } from '@/lib/db-persistence';
import { useToast } from '@/hooks/use-toast';

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
  archiveProduct: (productId: string, shouldArchive: boolean) => Promise<void>;
  deleteProductPermanently: (productId: string) => Promise<void>;
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  heroImageUrl: string | null;
  updateHeroImage: (image: File | Blob) => Promise<void>;
  isHeroImageLoading: boolean;
  refetchUserProfile: () => Promise<void>;
  incrementProductMetric: (productId: string, metric: 'likes' | 'shares') => void;
  submitRestockRequest: (product: Product) => Promise<void>;
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
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWholesaler, setIsWholesaler] = useState(false);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
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
    
    if (user.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      setIsWholesaler(false);
      setIsRoleLoaded(true);
      return;
    }

    try {
      const { doc, getDoc } = await import('firebase/firestore');
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
          setProducts(cached.filter(p => !p.isArchived));
          setIsLoadingProducts(false);
        }
      } catch (e) {}

      try {
        const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
        const q = query(
          collection(firestore, 'SareeCollection'), 
          orderBy('id', 'desc'), 
          limit(PAGE_SIZE * 2) 
        );
        const snap = await getDocs(q);
        const allFetched = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
        const filtered = allFetched.filter(p => !p.isArchived).slice(0, PAGE_SIZE);
        
        setProducts(filtered);
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length >= PAGE_SIZE);
        
        saveProductsToCache(allFetched);
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
      const { collection, query, orderBy, limit, startAfter, getDocs } = await import('firebase/firestore');
      const q = query(
        collection(firestore, 'SareeCollection'),
        orderBy('id', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snap = await getDocs(q);
      const allFetched = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
      const filtered = allFetched.filter(p => !p.isArchived);
      
      const newProducts = [...products, ...filtered];
      setProducts(newProducts);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);

      saveProductsToCache(allFetched);
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
        const { collection, getDocs } = await import('firebase/firestore');
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
      const { doc, getDoc } = await import('firebase/firestore');
      const settingsRef = doc(firestore, 'settings', 'hero');
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists()) {
        const url = docSnap.data().imageUrl;
        setHeroImageUrl(url && url.trim() !== '' ? url : null);
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

  const incrementProductMetric = async (productId: string, metric: 'likes' | 'shares') => {
    if (!firestore) return;
    try {
      const { doc, updateDoc, increment } = await import('firebase/firestore');
      const docRef = doc(firestore, 'SareeCollection', productId);
      await updateDoc(docRef, { [metric]: increment(1) });
      setProducts(prev => {
        return prev.map(p => p.id === productId ? { ...p, [metric]: (p[metric] || 0) + 1 } : p);
      });
    } catch (e) {}
  };

  const archiveProduct = async (productId: string, shouldArchive: boolean) => {
    if (!firestore) return;
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const docRef = doc(firestore, 'SareeCollection', productId);
      await updateDoc(docRef, { isArchived: shouldArchive });
      
      if (shouldArchive) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (e) {}
  };

  const deleteProductPermanently = async (productId: string) => {
    if (!firestore || !auth?.currentUser) return;
    
    try {
      const { getStorage, ref, deleteObject } = await import('firebase/storage');
      const { doc, deleteDoc } = await import('firebase/firestore');
      
      const storage = getStorage();
      const docRef = doc(firestore, 'SareeCollection', productId);
      
      const filePaths = [
        `SareeCollection/${productId}/saree.jpg`,
        `SareeCollection/${productId}/model.jpg`,
        `SareeCollection/${productId}/thumb_saree.jpg`,
        `SareeCollection/${productId}/thumb_model.jpg`,
      ];

      for (const path of filePaths) {
        const fileRef = ref(storage, path);
        await deleteObject(fileRef).catch(() => {});
      }

      await deleteDoc(docRef);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (e) {
      throw e;
    }
  };

  const submitRestockRequest = async (product: Product) => {
    if (!firestore || !user || user.isAnonymous) return;
    
    try {
      const { collection, query, where, getDocs, addDoc, serverTimestamp } = await import('firebase/firestore');
      const q = query(
        collection(firestore, 'restockRequests'),
        where('productId', '==', product.id),
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        toast({ title: "Already Registered", description: "You are already on the waitlist for this piece." });
        return;
      }

      await addDoc(collection(firestore, 'restockRequests'), {
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Heritage Customer',
        ownerId: product.ownerId || 'admin',
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      
      toast({ title: "Waitlist Registered!", description: "We will notify you the moment this piece is restocked." });
    } catch (e) {
      toast({ variant: 'destructive', title: "Request Failed" });
    }
  };

  const addProduct = async (newProductData: Omit<Product, 'id' | 'sareeImg' | 'modelImg'> & { sareeImageFile: File, modelImageDataUrl: string }): Promise<void> => {
    if (!firestore || !auth?.currentUser) throw new Error("Access denied.");

    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { doc, collection, setDoc, serverTimestamp } = await import('firebase/firestore');

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
        isArchived: false,
      };
      
      await setDoc(newDocRef, finalProduct);
      setProducts(prev => [finalProduct, ...prev]);
      saveProductsToCache([finalProduct]);
    } catch (e) {
      throw e;
    }
  };
  
  const updateHeroImage = async (image: File | Blob) => {
     if (!firestore || !isAdmin) throw new Error("Access denied.");
     
     try {
       const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
       const { doc, setDoc } = await import('firebase/firestore');

       const storage = getStorage();
       const imageRef = ref(storage, 'settings/hero-image.jpg');

       const uploadSnapshot = await uploadBytes(imageRef, image);
       const imageUrl = await getDownloadURL(uploadSnapshot.ref);
       const settingsRef = doc(firestore, 'settings', 'hero');
       await setDoc(settingsRef, { imageUrl }, { merge: true });
       setHeroImageUrl(imageUrl); 
    } catch (serverError: any) {
        const error = new FirestorePermissionError({
            path: 'settings/hero',
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
      archiveProduct,
      deleteProductPermanently,
      isLoading: isUserLoading || isLoadingProducts || !isRoleLoaded,
      isFetchingMore,
      hasMore,
      loadMore,
      heroImageUrl,
      updateHeroImage,
      isHeroImageLoading,
      refetchUserProfile: fetchUserProfile,
      incrementProductMetric,
      submitRestockRequest,
    }),
    [isAdmin, isWholesaler, isRoleLoaded, products, sareeVarieties, isUserLoading, isLoadingProducts, isFetchingMore, hasMore, lastDoc, heroImageUrl, isHeroImageLoading, fetchUserProfile, submitRestockRequest]
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
