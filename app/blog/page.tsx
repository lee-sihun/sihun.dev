import { allPosts } from "@/.contentlayer/generated";
import { compareDesc } from "date-fns";

export default function Blog() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );

  return (
    <div>
      {posts.map((post) => (
        <h2 key={post._id}>{post.title}</h2>
      ))}
    </div>
  );
}
