import { Post } from "@/.contentlayer/generated";
import Link from "next/link";
import Image from "next/image";

export default function PostCard(post: Post): React.ReactElement {
  return (
    <div className="flex flex-col max-w-[480px] w-full mx-auto">
      <Link href={post.url}>
        <Image
          src={post.thumbnail}
          width={480}
          height={270}
          alt="thumbnail"
          className="rounded-[15px] max-h-[270px]"
        />
        <div className="font-bold text-xl mt-3">{post.title}</div>
        <div className="font-normal text-base mt-2.5 text-[#525252] dark:text-[#A3A3A3]">
          {post.description}
        </div>
        {post.tags.map((tag, index) => (
          <div
            key={index}
            className="h-8 mt-2.5 mr-2 bg-[#EDEDED] dark:bg-[#262626] rounded-[10px] w-auto inline-flex flex-wrap justify-center items-center"
          >
            <div className="font-normal text-base mx-2 text-[#404040] dark:text-[#B5B5B5]">
              {tag}
            </div>
          </div>
        ))}
      </Link>
    </div>
  );
}
