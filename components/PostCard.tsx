"use client";
import type { PostPreview } from "@/utilities/post";
import Link from "next/link";
import Image from "next/image";
import Tag from "@/components/Tag";
import { Squircle } from "@/components/Squircle";
import { useCategoryStore } from "@/stores";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface PostCardProps {
  post: PostPreview;
}

const arrowVariants = {
  rest: { x: -12, opacity: 0 },
  hover: { x: 0, opacity: 1 },
};

const textVariants = {
  rest: { x: 0 },
  hover: { x: 12 },
};

const gradientTextClass =
  "bg-gradient-to-r from-[#832374] to-[#E93ECE] text-transparent bg-clip-text dark:from-blue-500 dark:to-green-500 [-webkit-background-clip:text]";

export default function PostCard({ post }: PostCardProps): React.ReactElement {
  const setSelectedCategory = useCategoryStore(
    (state) => state.setSelectedCategory
  );
  const router = useRouter();

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
        <motion.button
          type="button"
          className="mt-3 inline-flex cursor-pointer font-bold text-[15px]"
          onClick={() => {
            setSelectedCategory(post.category);
            router.push("/blog");
          }}
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileTap="hover"
        >
          <span className="relative inline-flex items-center">
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={`absolute left-0 ${gradientTextClass}`}
            >
              &gt;
            </motion.span>
            <motion.span
              variants={textVariants}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={gradientTextClass}
            >
              {post.category}
            </motion.span>
          </span>
        </motion.button>
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
