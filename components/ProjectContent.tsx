"use client";
import { allProjects } from "@/.contentlayer/generated";
import ProjectCard from "@/components/ProjectCard";
import { compareDesc } from "date-fns";

export default function ProjectContent() {
  const projects = allProjects.sort((a, b) =>
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );

  // Separate featured projects from regular projects
  const featuredProjects = projects.filter((project) => project.featured);
  const regularProjects = projects;

  return (
    <section className="flex justify-center flex-wrap mt-3">
      <div className="max-w-[1068px]">
        {/* <div className="max-w-[1068px] w-screen px-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mt-[8px]">Projects</h1>
          <p className="text-[#525252] dark:text-[#A3A3A3] mt-2">
            Portfolio 
          </p>
        </div> */}

        <div className="max-w-[1068px] w-screen px-6">
          <h2 className="text-2xl md:text-[30px] font-bold mt-2 mb-2">
            Featured Projects ({featuredProjects.length})
          </h2>
        </div>

        {featuredProjects.length > 0 && (
          <section className="px-6 max-w-[1068px] w-screen mb-12 mt-[24px]">
            <div className="grid grid-cols-1 gap-[40px] gap-y-14 md:grid-cols-2">
              {featuredProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </section>
        )}

        {regularProjects.length > 0 && (
          <>
            <div className="max-w-[1068px] w-screen px-6">
              <h2 className="text-2xl md:text-[30px] font-bold mt-2 mb-2">
                All Projects ({regularProjects.length})
              </h2>
            </div>
            <section className="px-6 max-w-[1068px] w-screen mt-[24px]">
              <div className="grid grid-cols-1 gap-[40px] gap-y-14 md:grid-cols-2">
                {regularProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </section>
  );
}
