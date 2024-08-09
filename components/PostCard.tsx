"use client";
import { Post } from "@/.contentlayer/generated";
import Link from "next/link";
import Image from "next/image";
import Tag from "@/components/Tag";
import { Squircle } from "@/components/Squircle";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps): React.ReactElement {
  return (
    <article className="flex flex-col max-w-[490px] w-full mx-auto">
      <Link href={post.url}>
        <Squircle
          cornerRadius={12}
          cornerSmoothing={0.6}
          className="overflow-hidden w-full rounded-[12px]"
        >
          <Image
            src={"/img/thumbnail/" + post.thumbnail}
            width={490}
            height={245}
            alt="thumbnail"
            className="max-h-[245px] transition-transform duration-300 ease-in-out hover:scale-105"
            priority
          />
        </Squircle>
      </Link>
      <div>
        <Link
          href={`/blog/category/${post.category}`}
          className="font-bold text-[15px] mt-3 bg-gradient-to-r from-[#832374] to-[#E93ECE] dark:from-blue-500 dark:to-green-500 inline-block text-transparent bg-clip-text hover:underline"
        >
          {post.category}
        </Link>
      </div>
      <Link href={post.url} className="group">
        <p className="font-bold text-xl mt-1 group-hover:text-blue-500 dark:group-hover:text-blue-500 group-hover:underline">
          {post.title}
        </p>
        <p className="font-normal text-base mt-1 text-[#525252] dark:text-[#A3A3A3]">
          {post.description}
        </p>
      </Link>
      <div>
        {post.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </article>
  );
}