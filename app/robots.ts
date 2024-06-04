import { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/about',
    },
    sitemap: 'https://sihun.dev/sitemap.xml',
    host: 'https://sihun.dev',
  };
}