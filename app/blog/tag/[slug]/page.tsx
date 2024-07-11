"use client";
import PostCard from "@/components/PostCard";
import { filterPostsByTag } from "@/hooks/posts";
import { useCategoryStore } from "@/stores";
import { notFound } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
  const setSelectedCategory = useCategoryStore(
    (state) => state.setSelectedCategory
  );
  const filteredPosts = filterPostsByTag(params.slug);
  if (filteredPosts.length === 0) notFound();

  return (
    <section className="flex justify-center flex-wrap mt-3">
      <div className="max-w-[1068px]">
        <div className="max-w-[1068px] w-screen px-6">
          <h2 className="text-2xl md:text-[30px] font-bold mt-2 mb-2">
            #{params.slug} ({filteredPosts.length})
          </h2>
        </div>
        <section className="mt-[22px] px-6 max-w-[1068px] w-screen">
          <div className="grid grid-cols-1 gap-[40px] gap-y-14 md:grid-cols-2">
            {filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onCategorySelect={setSelectedCategory}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
