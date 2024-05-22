import { allPosts } from "@/.contentlayer/generated";

interface Post {
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  createdAt: string;
  url: string;
}

function usePost() {
  return allPosts;
}

function getTagCounts(posts: Post[]): Record<string, number> {
  const tagCounts: Record<string, number> = {};

  posts.forEach(post => {
    post.tags.forEach(tag => {
      if (tag in tagCounts) {
        tagCounts[tag] += 1;
      } else {
        tagCounts[tag] = 1;
      }
    });
  });

  return tagCounts;
}

function filterPostsByTag(tag: string): Post[] {
  const posts = usePost();
  return posts.filter(post => post.tags.includes(tag));
}

export { usePost, getTagCounts, filterPostsByTag };