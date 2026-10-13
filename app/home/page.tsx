import type { Metadata } from "next";
import { allPosts, allProjects } from "@/.contentlayer/generated";
import FolderHome, { buildFolderItems } from "@/components/FolderHome";

export const metadata: Metadata = {
  title: "Home",
  description:
    "프론트엔드 개발자 이시훈의 소개와 프로젝트, 글을 한 폴더에 담았습니다.",
  // 메인 페이지로 교체하기 전까지는 검색 결과에 노출하지 않는다
  robots: { index: false },
};

export default function HomePage() {
  return <FolderHome items={buildFolderItems(allProjects, allPosts)} />;
}
