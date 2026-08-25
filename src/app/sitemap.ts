
import { MetadataRoute } from 'next'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { initializeFirebase } from '@/firebase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sareedukan.com'
  const { firestore } = initializeFirebase()

  // Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/crochet`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Dynamic Product Pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const productSnap = await getDocs(query(collection(firestore, 'SareeCollection'), limit(1000)))
    productPages = productSnap.docs.map(doc => ({
      url: `${baseUrl}/products/${doc.id}`,
      lastModified: doc.data().updatedAt?.toDate() || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch (e) {
    console.error("Sitemap product fetch failed")
  }

  // Dynamic Partner Pages
  let partnerPages: MetadataRoute.Sitemap = []
  try {
    const partnerSnap = await getDocs(query(collection(firestore, 'users'), limit(500)))
    partnerPages = partnerSnap.docs
      .filter(doc => doc.data().role === 'wholesaler' || doc.data().role === 'admin')
      .map(doc => ({
        url: `${baseUrl}/partners/${doc.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
  } catch (e) {
    console.error("Sitemap partner fetch failed")
  }

  return [...staticPages, ...productPages, ...partnerPages]
}
