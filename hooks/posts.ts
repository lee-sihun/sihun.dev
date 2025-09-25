import { allPosts } from "@/.contentlayer/generated";
import { compareDesc } from "date-fns";
import type { PostPreview } from "@/utilities/post";
import { toPostPreview } from "@/utilities/post";

const sortedPosts = [...allPosts].sort((a, b) =>
  compareDesc(new Date(a.createdAt), new Date(b.createdAt))
);

const taggedPostMap: Record<string, PostPreview[]> = {};
const tagCounts: Record<string, number> = {};

sortedPosts.forEach((post) => {
  const preview = toPostPreview(post);

  post.tags.forEach((tag) => {
    if (!taggedPostMap[tag]) {
      taggedPostMap[tag] = [];
    }

    taggedPostMap[tag].push(preview);
    tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  });
});

function getTagCounts(): Record<string, number> {
  return { ...tagCounts };
}

function filterPostsByTag(tag: string): PostPreview[] {
  const posts = taggedPostMap[tag];
  return posts ? [...posts] : [];
}

export { getTagCounts, filterPostsByTag };
