import { Post } from "@/.contentlayer/generated";

export interface PostPreview {
  _id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  createdAt: string;
}

export function toPostPreview(post: Post): PostPreview {
  return {
    _id: post._id,
    url: post.url,
    title: post.title,
    description: post.description,
    category: post.category,
    tags: post.tags,
    thumbnail: post.thumbnail,
    createdAt: post.createdAt,
  };
}
