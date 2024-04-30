"use client";
import { allPosts } from "@/.contentlayer/generated";
import PostCard from "@/components/PostCard";
import Category from "@/components/Category";
import { compareDesc } from "date-fns";
import { useState } from "react";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );

  const filteredPosts = posts.filter((post) =>
    selectedCategory === "All" ? true : post.category === selectedCategory
  );

  return (
    <div className="flex justify-center flex-wrap">
      <div className="max-[1020px]:px-[14px] px-6 max-w-[1088px] w-screen">
        <div className="text-2xl md:text-[32px] font-bold mt-8 mb-3 px-2.5">
          {selectedCategory === "All" ? "All Posts" : selectedCategory} (
          {filteredPosts.length})
        </div>
        <Category
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>
      <div className="px-6 max-w-[1068px] w-screen">
        <div className="grid grid-cols-1 gap-[60px] gap-y-20 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <PostCard key={post._id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
