import Link from "next/link";

const nav: { title: string; location: string }[] = [
  { title: "블로그", location: "/blog" },
  { title: "포트폴리오", location: "/portfolio" },
  { title: "소개", location: "/about" },
];

export default function Nav() {
  return (
    <div>
      {nav.map((item) => {
        const { title, location } = item;
        return (
          <Link className="text-base" href={location} key={title}>
            {title}
          </Link>
        );
      })}
    </div>
  );
}
