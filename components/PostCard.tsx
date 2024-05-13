import { Post } from "@/.contentlayer/generated";
import Link from "next/link";
import Image from "next/image";

interface PostCardProps {
  post: Post;
  onCategorySelect: (category: string) => void;
}

export default function PostCard({
  post,
  onCategorySelect,
}: PostCardProps): React.ReactElement {
  return (
    <div className="flex flex-col max-w-[490px] w-full mx-auto">
      <Link href={post.url}>
        <div className="overflow-hidden w-full rounded-[12px]">
          <Image
            src={post.thumbnail}
            width={490}
            height={270}
            alt="thumbnail"
            className="max-h-[270px] transition-transform duration-300 ease-in-out hover:scale-105"
            priority
          />
        </div>
      </Link>
      <div>
        <div
          className="hover:before:content-['>_'] cursor-pointer font-bold text-[15px] mt-3 bg-gradient-to-r from-[#832374] to-[#E93ECE] dark:from-blue-500 dark:to-green-500 inline-block text-transparent bg-clip-text"
          onClick={() => onCategorySelect(post.category)}
        >
          {post.category}
        </div>
      </div>
      <Link href={post.url} className="group">
        <div className="font-bold text-xl mt-1 group-hover:text-blue-500 dark:group-hover:text-blue-500 group-hover:underline">
          {post.title}
        </div>
        <div className="font-normal text-base mt-1 text-[#525252] dark:text-[#A3A3A3]">
          {post.description}
        </div>
      </Link>
      <div>
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
      </div>
    </div>
  );
}
