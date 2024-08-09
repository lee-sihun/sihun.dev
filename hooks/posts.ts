import { Post } from "@/.contentlayer/generated";
import { allPosts } from "@/.contentlayer/generated";

const posts = allPosts;
const taggedPosts: Record<string, Post[]> = {};

posts.forEach(post => {
  post.tags.forEach(tag => {
    if (tag in taggedPosts) {
      taggedPosts[tag].push(post);
    } else {
      taggedPosts[tag] = [post];
    }
  });
});

function getTagCounts(): Record<string, number> {
  return Object.fromEntries(
    Object.entries(taggedPosts).map(([tag, posts]) => [tag, posts.length])
  );
}

function filterPostsByTag(tag: string): Post[] {
  return taggedPosts[tag] || [];
}

export { getTagCounts, filterPostsByTag };