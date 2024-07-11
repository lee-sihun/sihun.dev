import PostCard from "@/components/PostCard";
import { filterPostsByTag } from "@/hooks/posts";

export default function Page({ params }: { params: { slug: string } }) {
  const filteredPosts = filterPostsByTag(params.slug);

  return (
    <section className="flex justify-center flex-wrap mt-3">
      <div className="max-w-[1068px]">
        <div className="max-w-[1068px] w-screen px-6">
          <h2 className="text-2xl md:text-[30px] font-bold mt-2 mb-2">
            #{params.slug} ({filteredPosts.length})
          </h2>
        </div>
        <section className="px-6 max-w-[1068px] w-screen">
          <div className="grid grid-cols-1 gap-[40px] gap-y-14 md:grid-cols-2">
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
