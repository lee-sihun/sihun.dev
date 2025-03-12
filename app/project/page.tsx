"use client";
import ProjectContent from "@/components/ProjectContent";

export default function Page() {
  return (
    <main className="min-h-screen pt-28 pb-24">
      <div className="max-w-[1068px] mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            A showcase of my work and side projects
          </p>
        </div>
      </div>
      <ProjectContent />
    </main>
  );
}
