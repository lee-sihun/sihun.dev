import fs from "fs";
import path from "path";
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
// @ts-ignore
import rehypeFigure from "rehype-figure";
import GithubSlugger from "github-slugger";
import rehypeSlug from "rehype-slug";

interface Heading {
  level: number;
  text: string;
  slug: string;
}

export function extractHeadings(
  raw: string,
  slugger: GithubSlugger
): Heading[] {
  const regex = /^#{1,6}\s+(.*)$/gm;
  const headings: Heading[] = [];
  let m: RegExpExecArray | null;

  while ((m = regex.exec(raw))) {
    const hashes = m[0].match(/^#+/);
    if (!hashes) {
      continue;
    }

    const level = Math.min(hashes[0].length, 6);
    const text = m[1].trim();
    const slug = slugger.slug(text);
    headings.push({ level, text, slug });
  }

  return headings;
}

export const Post = defineDocumentType(() => ({
  name: "Post",
  contentType: "mdx",
  filePathPattern: `posts/**/*.mdx`,
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    category: { type: "string", required: true },
    tags: { type: "list", of: { type: "string" }, required: true },
    thumbnail: { type: "string", required: true },
    createdAt: { type: "date", required: true },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) =>
        `/blog/${post._raw.flattenedPath.replace(/^posts\//, "")}`,
    },
    headings: {
      type: "json",
      resolve: (post) => {
        const fullPath = path.join(
          process.cwd(),
          "contents",
          post._raw.sourceFilePath
        );
        const raw = fs.readFileSync(fullPath, "utf-8");
        const slugger = new GithubSlugger();
        const headings = extractHeadings(raw, slugger);
        return headings;
      },
    },
  },
}));

export const Project = defineDocumentType(() => ({
  name: "Project",
  contentType: "mdx",
  filePathPattern: `projects/**/*.mdx`,
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    thumbnail: { type: "string", required: true },
    techStack: { type: "list", of: { type: "string" }, required: true },
    demoUrl: { type: "string", required: false },
    githubUrl: { type: "string", required: false },
    createdAt: { type: "date", required: true },
    featured: { type: "boolean", required: false, default: false },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (project) =>
        `/project/${project._raw.flattenedPath.replace(/^projects\//, "")}`,
    },
    headings: {
      type: "json",
      resolve: (project) => {
        const fullPath = path.join(
          process.cwd(),
          "contents",
          project._raw.sourceFilePath
        );
        const raw = fs.readFileSync(fullPath, "utf-8");
        const slugger = new GithubSlugger();
        const headings = extractHeadings(raw, slugger);
        return headings;
      },
    },
  },
}));

const options = {
  theme: { dark: "one-dark-pro", light: "github-light" },
};

export default makeSource({
  contentDirPath: "contents",
  documentTypes: [Post, Project],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypeFigure, { className: "image-caption" }],
      // @ts-ignore
      [rehypePrettyCode, options],
      rehypeSlug,
    ],
  },
});
