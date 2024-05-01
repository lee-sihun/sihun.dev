import { allPosts } from "@/.contentlayer/generated";
import { notFound } from "next/navigation";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer/hooks";

const mdxComponents: MDXComponents = {
  a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
};

export const generatedStaticParams = async () => {
  allPosts.map((post) => ({ slug: post._raw.flattenedPath }));
};

export const generatedMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
  if (!post) notFound();
};

export default function Page({ params }: { params: { slug: string } }) {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
  if (!post) notFound();

  const MDXContent = useMDXComponent(post.body.code);

  return (
    <article className="mx-auto px-6 max-w-3xl prose">
      <div className="mt-10 mb-8 text-center">
        <time
          dateTime={post.createdAt}
          className="mb-2.5 text-base text-[#686868] dark:text-[#A3A3A3]"
        >
          {new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(post.createdAt))}
        </time>
        <h1 className="mb-0 text-3xl md:text-[32px] font-bold text-black dark:text-white">
          {post.title}
        </h1>
        {post.tags.map((tag, index) => (
          <div
            key={index}
            className="mt-[15px] h-8 mr-2 bg-[#EDEDED] dark:bg-[#262626] rounded-[10px] w-auto inline-flex flex-wrap justify-center items-center"
          >
            <div className="font-normal text-base mx-2 text-[#404040] dark:text-[#B5B5B5]">
              {tag}
            </div>
          </div>
        ))}
        <div className="h-px w-full mt-5 bg-[#D4D4D4] dark:bg-[#686868]" />
      </div>
      <MDXContent components={mdxComponents} />
    </article>
  );
}
