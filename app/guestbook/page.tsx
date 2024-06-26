import Comments from "@/components/Comments";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GuestBook",
  description: "시훈의 개발노트의 게스트북입니다.",
};

export default function Page() {
  return (
    <section className="flex justify-center flex-wrap mt-3 px-6">
      <article className="max-w-[768px] w-full mx-auto text-center">
        {/* <h2 className="font-bold text-2xl md:text-3xl">🎉 제 블로그에 방문해주신 여러분 모두 환영합니다 🎉</h2> */}
        <h2 className="font-semibold text-lg my-1.5">자유롭게 메시지를 남겨주세요 😆</h2>
        <Comments />
      </article>
    </section>
  );
}
