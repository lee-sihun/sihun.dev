import { allProjects } from "@/.contentlayer/generated";
import { notFound } from "next/navigation";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer/hooks";
import { Pre } from "@/components/Pre";
import Comments from "@/components/Comments";
import Toc from "@/components/Toc";
import BlogToolbar from "@/components/BlogToolbar";

const mdxComponents: MDXComponents = {
  a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
  // @ts-ignore
  pre: Pre,
};

export const generateStaticParams = async () => {
  return allProjects.map((project) => ({
    slug: project._raw.flattenedPath.replace(/^projects\//, ""),
  }));
};

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const project = allProjects.find(
    (project) => project._raw.flattenedPath === `projects/${params.slug}`
  );

  if (!project) notFound();

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      url: `https://sihun.dev/project/${params.slug}`,
      images: [
        {
          url: `/img/thumbnail/${project.thumbnail}`,
          width: 800,
          height: 600,
          alt: `${project.title} thumbnail`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: [
        {
          url: `/img/thumbnail/${project.thumbnail}`,
          alt: `${project.title} thumbnail`,
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
  const project = allProjects.find(
    (project) => project._raw.flattenedPath === `projects/${params.slug}`
  );

  if (!project) notFound();

  const MDXContent = useMDXComponent(project.body.code);

  return (
    <article className="max-w-3xl px-6 mx-auto">
      <div className="mt-10 mb-8 text-center">
        {/* <time
          dateTime={project.createdAt}
          className="mb-2.5 text-base text-[#686868] dark:text-[#A3A3A3]"
        >
          {new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(project.createdAt))}
        </time> */}
        <h1 className="text-2xl md:text-[32px] font-bold text-black dark:text-white">
          {project.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-[10px]">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 justify-center mb-[10px]">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-3 py-1 bg-[#EDEDED] dark:bg-[#262626] rounded-full text-[#404040] dark:text-[#B5B5B5]"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-4 justify-center mb-6">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              className="flex items-center text-sm hover:text-blue-500 dark:hover:text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              GitHub Repository
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              className="flex items-center text-sm hover:text-blue-500 dark:hover:text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Live Demo
            </a>
          )}
        </div>

        <div className="h-px w-full mt-5 bg-[#D4D4D4] dark:bg-[#686868]" />
      </div>

      <section
        className={`prose prose-lg mx-auto dark:prose-invert ${style}`}
        data-content
      >
        {project.headings && project.headings.length > 0 && (
          <Toc headings={project.headings} title={project.title} />
        )}
        <MDXContent components={mdxComponents} />
      </section>

      <div className="h-px w-full my-8 bg-[#D4D4D4] dark:bg-[#686868]" />
      <BlogToolbar headings={project.headings} title={project.title} />
      <div className="h-px w-full my-8 bg-transparent" />
      <Comments />
      <div data-comments />
    </article>
  );
}
