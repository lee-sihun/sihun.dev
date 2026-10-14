import type { Post, Project } from "@/.contentlayer/generated";
import { compareDesc, format } from "date-fns";
import type {
  FolderItem,
  Palette,
  ProfileLink,
  ProjectItem,
  SettingsItem,
  WritingItem,
} from "./types";

const ABOUT_PALETTE: Palette = { from: "#FFC296", to: "#D9632F", ink: "light" };
const SETTINGS_PALETTE: Palette = {
  from: "#EEF1F5",
  to: "#9BA6B5",
  ink: "dark",
};
const WRITING_PALETTE: Palette = {
  from: "#B4F5D7",
  to: "#20A688",
  ink: "dark",
};

const PROJECT_PALETTES: Record<string, Palette> = {
  leisureup: { from: "#7AD6FF", to: "#0A5CBF", ink: "light" },
  deepresearch: { from: "#FFEAAE", to: "#F0A126", ink: "dark" },
  deepeye: { from: "#8F8FF7", to: "#22225A", ink: "light" },
  dmnote: { from: "#6A6A78", to: "#141418", ink: "light" },
  "sihun.dev": { from: "#CBBBFF", to: "#6549D6", ink: "light" },
};

// 배경이 어두운 썸네일 (나머지는 밝은 배경으로 본다)
const DARK_THUMBNAILS = new Set(["deepeye"]);

// 팔레트가 지정되지 않은 새 프로젝트용
const FALLBACK_PALETTES: Palette[] = [
  { from: "#FFC4DA", to: "#B3326A", ink: "light" },
  { from: "#C4F0A8", to: "#2A723A", ink: "light" },
  { from: "#FFD4AF", to: "#B34E1C", ink: "light" },
];

const PROFILE: {
  name: string;
  role: string;
  avatar: string;
  intro: string[];
  links: ProfileLink[];
} = {
  name: "이시훈",
  role: "프론트엔드 개발자",
  avatar: "/img/profile.png",
  intro: [
    "직관적이고 자연스러운 UI/UX를 중요하게 생각하며, 유지보수가 용이하고 가독성이 좋은 코드를 작성하기 위해 노력하고 있습니다.",
    "최신 기술에도 관심이 많아 변화에 빠르게 적응할 수 있습니다. 이 블로그에서는 프론트엔드를 주제로 한 게시글을 주로 작성하고 있습니다.",
  ],
  links: [
    { label: "Mail", href: "mailto:cnsa201119@gmail.com", icon: "mail" },
    { label: "GitHub", href: "https://github.com/lee-sihun", icon: "github" },
    {
      label: "Discord",
      href: "https://discordapp.com/users/479635064368398342",
      icon: "discord",
    },
  ],
};

const META_LINE = /^(개발 기간|팀 구성)\s*:\s*(.+)$/;

const normalize = (text: string) =>
  text.toLowerCase().replace(/[\s\-_.·!]/g, "");

function cleanInline(text: string) {
  return text
    .replace(/\[\([^\]]*\)\]\([^)]*\)/g, "") // [(개발 과정)](url) 같은 괄호 링크
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// MDX 본문에서 개발 기간·팀 구성과 소개 문장을 뽑아낸다
function parseProjectBody(raw: string, title: string) {
  const body = raw
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<([a-zA-Z]+)[\s\S]*?<\/\1>/g, "");

  const meta: { period?: string; team?: string } = {};
  const paragraphs: string[] = [];

  for (const block of body.split(/\n\s*\n/)) {
    const lines: string[] = [];
    for (const line of block.split("\n").map((l) => l.trim())) {
      if (!line) continue;
      const match = line.match(META_LINE);
      if (match) {
        if (match[1] === "개발 기간") {
          meta.period = match[2]
            .replace(/\([^)]*\)/g, "")
            .replace(/\?+/g, "진행 중")
            .replace(/\s+/g, " ")
            .trim();
        } else {
          meta.team = match[2].trim();
        }
        continue;
      }
      if (/^(#|!|-|\*|>|\||<|팀명)/.test(line)) continue;
      lines.push(line);
    }
    const text = cleanInline(lines.join(" "));
    if (text.length >= 20) paragraphs.push(text);
  }

  const sentences = (paragraph = "") => paragraph.split(/(?<=[다요]\.)\s+/);
  const key = normalize(title);
  // 프로젝트 이름이 직접 나오는 문장이 있으면 그 문장이 가장 좋은 요약이다
  const named = paragraphs
    .slice(0, 3)
    .flatMap((p) => sentences(p))
    .find((s) => normalize(s).includes(key));
  const summary = (named ?? sentences(paragraphs[0]).slice(0, 2).join(" "))
    .replace(/(는|은)\s+이를 바탕으로\s+/, "$1 ")
    .trim();

  return { ...meta, summary };
}

function toProjectItem(project: Project, index: number): ProjectItem {
  const slug = project._raw.flattenedPath.replace(/^projects\//, "");
  const { summary, period, team } = parseProjectBody(
    project.body.raw,
    project.title
  );
  const year = format(new Date(project.createdAt), "yyyy");

  return {
    kind: "project",
    id: `project-${slug}`,
    kicker: "Project",
    title: project.title,
    subline: [year, ...project.techStack.slice(0, 2)].join(" · "),
    palette:
      PROJECT_PALETTES[slug] ??
      FALLBACK_PALETTES[index % FALLBACK_PALETTES.length],
    art: {
      src: `/img/thumbnail/${project.thumbnail}`,
      tone: DARK_THUMBNAILS.has(slug) ? "dark" : "light",
    },
    url: project.url,
    thumbnail: `/img/thumbnail/${project.thumbnail}`,
    year,
    // 직접 적은 요약(frontmatter summary)이 있으면 그대로 쓰고, 없으면 본문에서 뽑은 문장 → description 순서
    summary: project.summary?.trim() || summary || project.description,
    period,
    team,
    techStack: project.techStack,
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
  };
}

function toWritingItem(posts: Post[]): WritingItem {
  const sorted = [...posts].sort((a, b) =>
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );
  const latest = sorted[0];

  return {
    kind: "writing",
    id: "writing",
    kicker: "Writing",
    title: "시훈의 개발노트",
    subline: latest
      ? `${sorted.length}편 · 최근 ${format(new Date(latest.createdAt), "yyyy.MM.dd")}`
      : "준비 중",
    palette: WRITING_PALETTE,
    description: "프론트엔드 개발자 시훈의 기술 블로그입니다.",
    posts: sorted.slice(0, 4).map((post) => ({
      title: post.title,
      url: post.url,
      date: format(new Date(post.createdAt), "yyyy.MM.dd"),
      category: post.category,
    })),
    total: sorted.length,
  };
}

const SETTINGS_ITEM: SettingsItem = {
  kind: "settings",
  id: "settings",
  kicker: "Settings",
  title: "설정",
  subline: "테마 · 배경 · 효과음",
  palette: SETTINGS_PALETTE,
  description: "보는 방식과 소리를 취향대로 바꿔보세요.",
};

export function buildFolderItems(
  projects: Project[],
  posts: Post[]
): FolderItem[] {
  const sortedProjects = [...projects].sort((a, b) =>
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );

  return [
    {
      kind: "about",
      id: "about",
      kicker: "About",
      title: PROFILE.name,
      subline: PROFILE.role,
      palette: ABOUT_PALETTE,
      art: { src: PROFILE.avatar, tone: "light" },
      avatar: PROFILE.avatar,
      role: PROFILE.role,
      intro: PROFILE.intro,
      links: PROFILE.links,
    },
    ...sortedProjects.map(toProjectItem),
    toWritingItem(posts),
    SETTINGS_ITEM,
  ];
}
