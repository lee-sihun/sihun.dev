import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
//@ts-ignore
import rehypeFigure from 'rehype-figure';
import rehypeSlug from 'rehype-slug'; 
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { visit } from 'unist-util-visit'; 
import type { Root, Element as HastElement } from 'hast';

// Heading 타입
interface Heading {
  level: number;
  text: string;
  slug: string;
}

// headings 추출
const extractHeadings = () => {
  return (tree: Root, file: any) => {
    const headings: Heading[] = [];
    visit(tree, 'element', (node: HastElement) => {
      // h1, h2, h3 태그만 추출 
      if (node.tagName === 'h1' || node.tagName === 'h2' || node.tagName === 'h3') {
        const id = node.properties?.id as string | undefined;
        let text = '';

        // 자식 노드를 순회하며 텍스트 콘텐츠 추출 (인라인 코드 포함)
        visit(node, ['text', 'element'], (child: any) => {
           if (child.type === 'text') {
             text += child.value;
           } else if (child.type === 'element' && child.tagName === 'code') {
             visit(child, 'text', (codeText: any) => {
               text += codeText.value;
             });
           }
        });

        if (id && text) {
          headings.push({
            level: parseInt(node.tagName.substring(1), 10),
            text: text.trim(),
            slug: id,
          });
        }
      }
    });
    // 추출된 headings를 file.data에 저장
    if (!file.data) file.data = {};
    file.data.headings = headings;
  };
};

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
    headings: {
      type: 'json', 
      resolve: (doc) => {
        // extractHeadings 플러그인이 file.data에 저장한 headings 반환
        // 타입 단언 추가하여 doc.headings 접근
        return (doc as any).headings || [];
      },
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
    headings: {
      type: 'json', // 타입을 'json'으로 설정
      resolve: (doc) => {
        // extractHeadings 플러그인이 file.data에 저장한 headings 반환
        // 타입 단언 추가하여 doc.headings 접근
        return (doc as any).headings || [];
      },
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
      rehypeSlug, // 제목에 id 추가 (rehypeAutolinkHeadings보다 먼저 와야 함)
      [
        rehypeAutolinkHeadings, // 제목에 자동 링크 추가
        {
          properties: {
            className: ['anchor'], // 생성된 링크에 클래스 추가 (스타일링용)
            ariaLabel: 'Link to section'
          },
          behavior: 'append' // 링크 아이콘을 제목 텍스트 뒤에 추가
        }
      ],
      extractHeadings, // headings 추출 플러그인 (rehypeSlug 이후 실행)
      [rehypeFigure, { className: 'image-caption' }],
      // @ts-ignore
      [rehypePrettyCode, options],
    ],
  },
});

export default contentSource;