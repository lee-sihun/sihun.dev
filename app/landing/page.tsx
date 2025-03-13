import StarTrails from "../../components/StarTrails";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <StarTrails />
      <div className="container mx-auto px-4 py-20 relative z-10">
        <h1 className="text-5xl font-bold mb-6 text-white">환영합니다</h1>
        <p className="text-xl text-white/80">
          스크롤을 내려보세요. 별들이 움직이기 시작합니다.
        </p>
        {/* 추가 콘텐츠는 여기에 */}
        <div className="h-[200vh]"></div> {/* 스크롤을 위한 여백 */}
      </div>
    </main>
  );
}
