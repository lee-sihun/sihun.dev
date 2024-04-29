import { allPosts } from "@/.contentlayer/generated";
import PostCard from "@/components/PostCard";
import { compareDesc } from "date-fns";

export default function Blog() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );

  return (
    <div className="flex justify-center">
      <div className="px-6 max-w-[1068px] grid grid-cols-1 gap-[60px] gap-y-20 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post._id} {...post} />
        ))}
      </div>
    </div>
  );
}
