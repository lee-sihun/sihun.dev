"use client";
import { Project } from "@/.contentlayer/generated";
import Link from "next/link";
import Image from "next/image";
import { Squircle } from "@/components/Squircle";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({
  project,
}: ProjectCardProps): React.ReactElement {
  return (
    <article className="flex flex-col max-w-[490px] w-full mx-auto">
      <Link href={project.url}>
        <Squircle
          cornerRadius={12}
          cornerSmoothing={0.6}
          className="overflow-hidden w-full rounded-[12px]"
        >
          <Image
            src={"/img/thumbnail/" + project.thumbnail}
            width={490}
            height={245}
            alt={project.title}
            className="max-h-[245px] transition-transform duration-300 ease-in-out hover:scale-105"
            priority
          />
        </Squircle>
      </Link>

      <div className="flex gap-2 mt-3 flex-wrap">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="text-xs px-2 py-1 bg-[#EDEDED] dark:bg-[#262626] rounded-md text-[#404040] dark:text-[#B5B5B5]"
          >
            {tech}
          </span>
        ))}
      </div>

      <Link href={project.url} className="group mt-2">
        <p className="font-bold text-xl mt-1 group-hover:text-blue-500 dark:group-hover:text-blue-500 group-hover:underline">
          {project.title}
        </p>
        <p className="font-normal text-base mt-1 text-[#525252] dark:text-[#A3A3A3]">
          {project.description}
        </p>
      </Link>

      <div className="flex gap-4 mt-3">
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
            GitHub
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
    </article>
  );
}
