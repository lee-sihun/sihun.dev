import Link from "next/link";

export default function NotFound() {
  return (
    <article className="flex items-center justify-center min-h-screen">
      <section className="text-center font-bold">
        <p className="text-3xl">페이지를 찾을 수 없습니다</p>
        <Link href="/" className="text-xl underline text-blue-500">홈으로 돌아가기</Link>
      </section>
    </article>
  );
}
