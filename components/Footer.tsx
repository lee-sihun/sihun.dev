import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-5 min-h-[60px] flex text-sm container mx-auto text-[#262626] dark:text-[#A3A3A3]">
      <div className="container mx-auto text-center flex flex-col justify-center">
        <span className="block">
          Copyright © 2025{" "}
          <Link className="underline" href="https://github.com/lee-sihun">
            lee-sihun
          </Link>{" "}
          All rights reserved.
        </span>
        <span className="block">
          Powered by{" "}
          <Link className="underline" href="https://vercel.com/">
            Vercel.
          </Link>
        </span>
      </div>
    </footer>
  );
}
