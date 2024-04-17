import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import highlight from 'rehype-highlight';
import rehypePrettyCode from 'rehype-pretty-code';

export const Post = defineDocumentType(() => ({
  name: 'Post',
  contentType: 'mdx',
  filePathPattern: `**/*.mdx`, // mdx 파일경로 패턴

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
    thumbnail: {
      type: 'string',
      required: false,
    },
    createdAt: {
      type: 'date',
      required: true,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/blog/${post._raw.flattenedPath}`,
    },
  },
}));

const contentSource = makeSource({
  // 마크다운 파일이 저장되어 있는 루트 폴더
  contentDirPath: 'posts',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [
      [
         // @ts-ignore
        rehypePrettyCode,
        {
          theme: 'github-dark', // 코드작성시 적용할 테마
        },
      ],
       // @ts-ignore
      highlight,
    ],
  },
});

export default contentSource;