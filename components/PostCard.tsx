import { Post } from "@/.contentlayer/generated";
import Link from "next/link";
import Image from "next/image";

export default function PostCard(post: Post): React.ReactElement {
  return (
    <div className="flex flex-col max-w-[480px]">
      <Link href={post.url}>
        <Image
          src={post.thumbnail}
          width={480}
          height={270}
          alt="thumbnail"
          className="rounded-[15px] max-h-[270px]"
        />
        <div className="font-bold text-xl mt-3">{post.title}</div>
        <div className="font-normal text-base mt-2.5">{post.description}</div>
        {post.tags.map((tag, index) => (
          <div
            key={index}
            className="h-8 mt-2.5 mr-2 bg-[#EDEDED] rounded-[10px] w-auto inline-flex flex-wrap justify-center items-center"
          >
            <div className="font-normal text-base mx-2">{tag}</div>
          </div>
        ))}
      </Link>
    </div>
  );
}
