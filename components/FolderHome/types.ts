export interface Palette {
  from: string;
  to: string;
  /** 카드 위 글자색 */
  ink: "light" | "dark";
}

interface BaseItem {
  id: string;
  kicker: string;
  title: string;
  /** 카드 앞면 제목 아래 한 줄 */
  subline: string;
  palette: Palette;
  /** 카드 장식에 쓰는 이미지와 그 배경의 밝기 */
  art?: { src: string; tone: "light" | "dark" };
}

export interface ProfileLink {
  label: string;
  href: string;
  icon: "mail" | "github" | "discord";
}

export interface AboutItem extends BaseItem {
  kind: "about";
  avatar: string;
  role: string;
  intro: string[];
  links: ProfileLink[];
}

export interface ProjectItem extends BaseItem {
  kind: "project";
  url: string;
  thumbnail: string;
  year: string;
  summary: string;
  period?: string;
  team?: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
}

export interface PostLink {
  title: string;
  url: string;
  date: string;
  category: string;
}

export interface WritingItem extends BaseItem {
  kind: "writing";
  description: string;
  posts: PostLink[];
  total: number;
}

export type FolderItem = AboutItem | ProjectItem | WritingItem;
