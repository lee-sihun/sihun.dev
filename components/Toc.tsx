"use client";

interface Heading {
  level: number;
  text: string;
  slug: string;
}

interface TocProps {
  headings: Heading[];
}

const getIndentClass = (level: number) => {
  switch (level) {
    case 1:
      return "pl-0 font-semibold"; // h1은 더 강조
    case 2:
      return "pl-3";
    case 3:
      return "pl-6";
    // 필요에 따라 h4, h5, h6 레벨 추가
    // case 4: return 'pl-9';
    default:
      return "pl-0";
  }
};

export default function Toc({ headings }: TocProps) {
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <nav className="p-4 border border-indigo-600 rounded-md bg-gray-50 dark:bg-gray-800 text-sm">
      <ul>
        {headings.map(({ slug, text, level }) => (
          <li key={slug} className={getIndentClass(level)}>
            <a href={`#${slug}`}>{text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
