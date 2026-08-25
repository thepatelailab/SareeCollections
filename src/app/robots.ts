import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sareedukan.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/crochet', '/partners', '/products'],
      disallow: ['/admin/', '/partner/dashboard/', '/checkout/', '/cart/', '/my-account/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
