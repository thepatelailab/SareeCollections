
/**
 * @fileOverview Client-side IndexedDB persistence layer for Product Metadata.
 * This allows the app to load instantly from the local device and reduces Firestore reads.
 */

import { Product } from './types';

const DB_NAME = 'SareeDukanCache';
const STORE_NAME = 'products';
const DB_VERSION = 1;

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveProductsToCache(products: Product[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    products.forEach((product) => {
      // Stripping complex Firebase objects before saving to IDB if necessary
      // For now, simple spread is fine as long as we don't save raw FieldValues
      store.put(product);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedProducts(): Promise<Product[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      // Return products sorted by ID desc (our current logic)
      const sorted = (request.result as Product[]).sort((a, b) => 
        b.id.localeCompare(a.id)
      );
      resolve(sorted);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearProductCache(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
}
