import { MetadataRoute } from 'next';
import { allPosts } from '@/.contentlayer/generated';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `https://sihun.dev${post.url}`,
    lastModified: new Date(post.createdAt).toISOString().split('T')[0],
    changeFrequency: 'weekly',
  }));

  return [
    {
      url: 'https://sihun.dev', // 사용자가 접근할 수 있는 URL
      lastModified: new Date().toISOString().split('T')[0], // 마지막으로 수정된 날짜
      changeFrequency: 'yearly', // 변경 빈도
      priority: 1, // 우선순위
    },
    {
      url: 'https://sihun.dev/blog',
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://sihun.dev/about',
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://sihun.dev/guestbook',
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...posts,
  ];
}