import { allPosts, allProjects } from "@/.contentlayer/generated";
import FolderHome, { buildFolderItems } from "@/components/FolderHome";

export default function Home() {
  return <FolderHome items={buildFolderItems(allProjects, allPosts)} />;
}
