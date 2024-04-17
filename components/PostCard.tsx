import { Post } from "@/.contentlayer/generated";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function PostCard(post: Post): React.ReactElement {
  return (
    <div className="mb-4 flex flex-col border-2 rounded-lg p-2">
      <Link href={post.url} className="text-3xl mb-1 text-blue-500">
        {post.title}
      </Link>
      <time dateTime={post.createdAt}>
        {format(parseISO(post.createdAt), "LLLL d, yyyy")}
      </time>
    </div>
  );
}
