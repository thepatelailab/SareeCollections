
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { collection, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, getStorage } from 'firebase/storage';
import { useFirestore, useCollection, useFirebase, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import type { Product, UserProfile, ProductCategory } from '@/lib/types';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export interface SareeVariety {
  id: string;
  name: string;
  description?: string;
  stateId: string;
}

interface AppContextType {
  isAdmin: boolean;
  isWholesaler: boolean;
  products: Product[];
  sareeVarieties: SareeVariety[];
  addProduct: (product: Omit<Product, 'id' | 'sareeImg' | 'modelImg'> & { sareeImageFile: File, modelImageDataUrl: string }) => Promise<void>;
  isLoading: boolean;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { firestore, auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWholesaler, setIsWholesaler] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isHeroImageLoading, setIsHeroImageLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    if (!firestore || !user?.uid) {
      setUserProfile(null);
      return;
    }
    const userDocRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfile);
    } else {
      setUserProfile(null);
    }
  }, [firestore, user?.uid]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setIsAdmin(userProfile.role === 'admin');
      setIsWholesaler(userProfile.role === 'wholesaler');
    } else {
      setIsAdmin(false);
      setIsWholesaler(false);
    }
  }, [userProfile]);

  const productsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'SareeCollection');
  }, [firestore]);

  const varietiesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'sareeVarieties');
  }, [firestore]);

  const { data: productsData, isLoading: areProductsLoading } = useCollection<Product>(productsCollection);
  const { data: customVarieties, isLoading: areVarietiesLoading } = useCollection<SareeVariety>(varietiesCollection);

  const products = useMemo(() => {
    if (!productsData) return [];
    // Ensure all products have a category, defaulting to saree for legacy data
    return productsData.map(p => ({
      ...p,
      category: p.category || 'saree'
    }));
  }, [productsData]);

  const sareeVarieties = useMemo(() => {
    const list = [...(customVarieties || [])];
    DEFAULT_VARIETIES.forEach(def => {
        if (!list.find(v => v.name.toLowerCase() === def.name.toLowerCase())) {
            list.push(def);
        }
    });
    return list;
  }, [customVarieties]);

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
       console.error("Metric update failed", e);
    });
  };

  const addProduct = async (newProductData: Omit<Product, 'id' | 'sareeImg' | 'modelImg'> & { sareeImageFile: File, modelImageDataUrl: string }): Promise<void> => {
    if (!firestore || !auth?.currentUser) {
        throw new Error("Permission denied.");
    }

    const storage = getStorage();
    const newDocRef = doc(collection(firestore, 'SareeCollection'));
    const productId = newDocRef.id;

    const sareeImageRef = ref(storage, `SareeCollection/${productId}/saree.jpg`);
    const modelImageRef = ref(storage, `SareeCollection/${productId}/model.jpg`);

    const sareeUploadSnapshot = await uploadBytes(sareeImageRef, newProductData.sareeImageFile);
    const sareeImgUrl = await getDownloadURL(sareeUploadSnapshot.ref);

    const modelImageResponse = await fetch(newProductData.modelImageDataUrl);
    const modelImageBlob = await modelImageResponse.blob();
    const modelUploadSnapshot = await uploadBytes(modelImageRef, modelImageBlob);
    const modelImgUrl = await getDownloadURL(modelUploadSnapshot.ref);
    
    const { sareeImageFile: _, modelImageDataUrl: __, ...restOfProductData } = newProductData;

    const finalProduct: Product = {
      id: productId,
      ...restOfProductData,
      sareeImg: sareeImgUrl,
      modelImg: modelImgUrl,
      likes: 0,
      shares: 0,
      ownerId: auth.currentUser.uid,
    };
    
    await setDoc(newDocRef, finalProduct);
  };
  
  const updateHeroImage = async (image: File | Blob) => {
     if (!firestore || !isAdmin) {
        throw new Error("Permission denied.");
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
      products: products || [],
      sareeVarieties,
      addProduct,
      isLoading: isUserLoading || areProductsLoading || areVarietiesLoading,
      heroImageUrl,
      updateHeroImage,
      isHeroImageLoading,
      refetchUserProfile: fetchUserProfile,
      incrementProductMetric,
    }),
    [isAdmin, isWholesaler, products, sareeVarieties, isUserLoading, areProductsLoading, areVarietiesLoading, heroImageUrl, isHeroImageLoading, addProduct, updateHeroImage, fetchUserProfile]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
