import fs from 'fs'
import path from 'path'
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
// @ts-ignore
import rehypeFigure from 'rehype-figure'

interface Heading {
  level: number
  text: string
  slug: string
}

export function extractHeadings(raw: string): Heading[] {
  const regex = /^#{1,3}\s+(.*)$/gm
  const headings: Heading[] = []
  let m: RegExpExecArray | null

  while ((m = regex.exec(raw))) {
    const hashes = m[0].match(/^#+/)![0]
    const level = hashes.length
    const text = m[1].trim()
    const slug = text
      .toLowerCase()
      // @ts-ignore
      .replace(/[^\p{L}\p{N}]+/gu, '-')  // Unicode 글자/숫자만 허용
      .replace(/^-+|-+$/g, '')
    headings.push({ level, text, slug })
  }

  return headings
}

export const Post = defineDocumentType(() => ({
  name: 'Post',
  contentType: 'mdx',
  filePathPattern: `posts/**/*.mdx`,
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    category: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' }, required: true },
    thumbnail: { type: 'string', required: true },
    createdAt: { type: 'date', required: true },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/blog/${post._raw.flattenedPath.replace(/^posts\//, '')}`,
    },
    headings: {
      type: 'json',
      resolve: (post) => {
        const fullPath = path.join(
          process.cwd(),
          'contents',
          post._raw.sourceFilePath
        )
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const headings = extractHeadings(raw);
        return headings;
      },
    },
  },
}))

export const Project = defineDocumentType(() => ({
  name: 'Project',
  contentType: 'mdx',
  filePathPattern: `projects/**/*.mdx`,
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    thumbnail: { type: 'string', required: true },
    techStack: { type: 'list', of: { type: 'string' }, required: true },
    demoUrl: { type: 'string', required: false },
    githubUrl: { type: 'string', required: false },
    createdAt: { type: 'date', required: true },
    featured: { type: 'boolean', required: false, default: false },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (project) => `/project/${project._raw.flattenedPath.replace(/^projects\//, '')}`,
    },
    headings: {
      type: 'json',
      resolve: (project) => {
        const fullPath = path.join(
          process.cwd(),
          'contents',
          project._raw.sourceFilePath
        )
        const raw = fs.readFileSync(fullPath, 'utf-8')
        const headings = extractHeadings(raw);
        return headings;
      },
    },
  },
}))

const options = {
  theme: { dark: "one-dark-pro", light: "github-light" },
}

export default makeSource({
  contentDirPath: 'contents',
  documentTypes: [Post, Project],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypeFigure, { className: 'image-caption' }],
      // @ts-ignore
      [rehypePrettyCode, options],
    ],
  },
})