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
    <div className="flex justify-center flex-wrap mt-3">
      <div className="max-w-[1068px] w-screen px-6">
        <div className="text-[28px] md:text-[30px] font-bold mt-2 mb-2">
          {selectedCategory === "All" ? "All Posts" : selectedCategory} (
          {filteredPosts.length})
        </div>
        <Category
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>
      <div className="px-6 max-w-[1068px] w-screen">
        <div className="grid grid-cols-1 gap-[40px] gap-y-14 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} onCategorySelect={setSelectedCategory} />
          ))}
        </div>
      </div>
    </div>
  );
}
