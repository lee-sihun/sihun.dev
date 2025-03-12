import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
//@ts-ignore
import rehypeFigure from 'rehype-figure';

export const Post = defineDocumentType(() => ({
  name: 'Post',
  contentType: 'mdx',
  filePathPattern: `posts/**/*.mdx`, 
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      required: true,
    },
    category: {
      type: 'string',
      required: true,
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      required: true,
    },
    thumbnail: {
      type: 'string',
      required: true,
    },
    createdAt: {
      type: 'date',
      required: true,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/blog/${post._raw.flattenedPath.replace(/^posts\//, '')}`,
    },
  },
}));

export const Project = defineDocumentType(() => ({
  name: 'Project',
  contentType: 'mdx',
  filePathPattern: `projects/**/*.mdx`,
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      required: true,
    },
    thumbnail: {
      type: 'string',
      required: true,
    },
    techStack: {
      type: 'list',
      of: { type: 'string' },
      required: true,
    },
    demoUrl: {
      type: 'string',
      required: false,
    },
    githubUrl: {
      type: 'string',
      required: false,
    },
    createdAt: {
      type: 'date',
      required: true,
    },
    featured: {
      type: 'boolean',
      default: false,
      required: false,
    }
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (project) => `/project/${project._raw.flattenedPath.replace(/^projects\//, '')}`,
    },
  },
}));

const options = {
  theme: {
    dark: "one-dark-pro",
    light: "github-light",
  },
};

const contentSource = makeSource({
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
});

export default contentSource;