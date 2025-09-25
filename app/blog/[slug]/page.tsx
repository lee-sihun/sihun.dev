import { allPosts } from "@/.contentlayer/generated";
import { notFound } from "next/navigation";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer/hooks";
import { Pre } from "@/components/Pre";
import Comments from "@/components/Comments";
import Tag from "@/components/Tag";
import { HeadingAnchor } from "@/components/HeadingAnchor";
import type { HTMLAttributes } from "react";
import Toc from "@/components/Toc";
import BlogToolbar from "@/components/BlogToolbar";

const postsOrderedByDate = [...allPosts].sort(
  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
);

const getPostSlug = (post: (typeof allPosts)[number]) =>
  post._raw.flattenedPath.replace(/^posts\//, "");

const headingFactory = (as: keyof JSX.IntrinsicElements) =>
  function Heading(providedProps: HTMLAttributes<HTMLHeadingElement>) {
    return <HeadingAnchor as={as as any} {...providedProps} />;
  };

const mdxComponents: MDXComponents = {
  a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
  // @ts-ignore
  pre: Pre,
  // h1: headingFactory("h1"),
  // h2: headingFactory("h2"),
  // h3: headingFactory("h3"),
  // h4: headingFactory("h4"),
  // h5: headingFactory("h5"),
  // h6: headingFactory("h6"),
};

export const generateStaticParams = async () => {
  return allPosts.map((post) => ({
    slug: post._raw.flattenedPath.replace(/^posts\//, ""),
  }));
};

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find(
    (post) => post._raw.flattenedPath === `posts/${params.slug}`
  );

  if (!post) notFound();

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://sihun.dev/blog/${params.slug}`,
      images: [
        {
          url: `/img/thumbnail/${post.thumbnail}`,
          width: 800,
          height: 600,
          alt: `${post.title} thumbnail`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [
        {
          url: `/img/thumbnail/${post.thumbnail}`,
          alt: `${post.title} thumbnail`,
        },
      ],
    },
  };
};

const style = `
prose-img:rounded-md
before:prose-p:content-none 
after:prose-p:content-none 
before:prose-code:content-none 
after:prose-code:content-none 
prose-blockquote:border-solid
prose-blockquote:bg-[#F5F5F5]
dark:prose-blockquote:bg-[#262626]
prose-a:text-blue-500
prose-a:no-underline
hover:prose-a:text-blue-700
hover:prose-a:underline
`;

export default function Page({ params }: { params: { slug: string } }) {
  const post = allPosts.find(
    (post) => post._raw.flattenedPath === `posts/${params.slug}`
  );

  if (!post) notFound();

  const currentIndex = postsOrderedByDate.findIndex(
    (orderedPost) => orderedPost._id === post._id
  );

  if (currentIndex === -1) notFound();

  const previousPost =
    currentIndex > 0 ? postsOrderedByDate[currentIndex - 1] : null;
  const nextPost =
    currentIndex < postsOrderedByDate.length - 1
      ? postsOrderedByDate[currentIndex + 1]
      : null;

  const previousHref = previousPost ? `/blog/${getPostSlug(previousPost)}` : "";
  const nextHref = nextPost ? `/blog/${getPostSlug(nextPost)}` : "";

  const MDXContent = useMDXComponent(post.body.code);

  // console.log("Post Headings:", post.headings);

  return (
    <article className="max-w-3xl px-6 mx-auto">
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
        <h3 className="mb-0 text-2xl md:text-[32px] font-bold text-black dark:text-white">
          {post.title}
        </h3>
        {post.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
        <div className="h-px w-full mt-5 bg-[#D4D4D4] dark:bg-[#686868]" />
      </div>
      <section
        className={`prose prose-lg mx-auto dark:prose-invert ${style}`}
        data-content
      >
        {post.headings && post.headings.length > 0 && (
          <Toc headings={post.headings} title={post.title} />
        )}
        <MDXContent components={mdxComponents} />
      </section>
      <div className="h-px w-full my-5 bg-[#D4D4D4] dark:bg-[#686868]" />
      <div data-comments />
      <BlogToolbar headings={post.headings} title={post.title} />
      <nav
        className="my-6 grid gap-4 md:grid-cols-2"
        aria-label="Post navigation"
      >
        {previousPost ? (
          <Link
            href={previousHref}
            className="group flex h-full min-h-[108px] flex-col justify-start rounded-xl border border-[#E5E5E5] bg-[#fafafa] p-5 text-left transition-colors hover:border-blue-500 hover:bg-[#F5F5F5] dark:border-[#3F3F3F] dark:bg-[#171717] dark:hover:border-blue-500/60 dark:hover:bg-[#1F1F1F]"
          >
            <span className="text-sm font-medium text-[#525252] dark:text-[#A3A3A3]">
              이전 게시글
            </span>
            <span className="mt-2 text-lg font-semibold text-black group-hover:text-blue-500 dark:text-white dark:group-hover:text-blue-400">
              {previousPost.title}
            </span>
          </Link>
        ) : (
          <div aria-hidden="true" className="h-full min-h-[108px]" />
        )}
        {nextPost ? (
          <Link
            href={nextHref}
            className="group flex h-full min-h-[108px] flex-col justify-start rounded-xl border border-[#E5E5E5] bg-[#fafafa] p-5 text-right transition-colors hover:border-blue-500 hover:bg-[#F5F5F5] dark:border-[#3F3F3F] dark:bg-[#171717] dark:hover:border-blue-500/60 dark:hover:bg-[#1F1F1F]"
          >
            <span className="text-sm font-medium text-[#525252] dark:text-[#A3A3A3]">
              다음 게시글
            </span>
            <span className="mt-2 text-lg font-semibold text-black group-hover:text-blue-500 dark:text-white dark:group-hover:text-blue-400">
              {nextPost.title}
            </span>
          </Link>
        ) : (
          <div aria-hidden="true" className="h-full min-h-[108px]" />
        )}
      </nav>
      <div className="h-px w-full my-5 bg-transparent" />
      <Comments />
    </article>
  );
}
