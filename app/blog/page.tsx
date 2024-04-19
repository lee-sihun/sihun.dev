import { allPosts } from "@/.contentlayer/generated";
import PostCard from "@/components/PostCard";
import { compareDesc } from "date-fns";

export default function Blog() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );

  return (
    <main className="mx-auto max-w-5xl">
      {posts.map((post) => (
        <PostCard key={post._id} {...post} />
      ))}
    </main>
  );
}
