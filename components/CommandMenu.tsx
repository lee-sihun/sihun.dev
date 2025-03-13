"use client";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import {
  allPosts,
  allProjects,
  Post,
  Project,
} from "@/.contentlayer/generated";
import { compareDesc } from "date-fns";
import { useRouter } from "next/navigation";
import MailSvg from "../public/svg/mail.svg";
import GithubSvg from "../public/svg/github.svg";
import DisordSvg from "../public/svg/discord.svg";
import HomeSvg from "../public/svg/home.svg";
import BlogSvg from "../public/svg/blog.svg";
import AboutSvg from "../public/svg/about.svg";
import BookSvg from "../public/svg/book.svg";
import SearchSvg from "../public/svg/search.svg";
import TagSvg from "../public/svg/tag.svg";
import ArrowSvg from "../public/svg/arrow.svg";
import { getTagCounts, filterPostsByTag } from "@/hooks/posts";

interface CommandMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CommandMenu({ open, setOpen }: CommandMenuProps) {
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<string[]>([]);
  const page = pages[pages.length - 1];
  const router = useRouter();

  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );

  const projects = allProjects.sort((a, b) =>
    compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  );

  const tagCounts = getTagCounts();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        //@ts-ignore
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  useEffect(() => {
    setSearch("");
  }, [pages]);

  const routing = (href: string) => {
    setSearch("");
    router.push(href);
    setOpen(false);
  };

  return (
    <div
      id="cmdkbg"
      className={`z-10 fixed top-0 left-0 w-full h-full bg-black bg-opacity-25 backdrop-blur-sm ${
        open ? "" : "hidden"
      }`}
    >
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        onKeyDown={(e) => {
          // Escape goes to previous page
          // Backspace goes to previous page when search is empty
          if (e.key === "Backspace" && !search) {
            e.preventDefault();
            setPages((pages) => pages.slice(0, -1));
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
          }
        }}
      >
        <div cmdk-header="">
          <SearchSvg />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
          />
        </div>
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>

          {page && (
            <Command.Item
              onSelect={() => setPages((pages) => pages.slice(0, -1))}
            >
              <ArrowSvg />
              Back to Backspace
            </Command.Item>
          )}

          {!page && (
            <>
              <Command.Group heading="Pages">
                {/* <Command.Item onSelect={() => routing("/")}>
                  <HomeSvg /> Home
                  <div className="cmdk-vercel-shortcuts">
                    <kbd>H</kbd>
                  </div>
                </Command.Item> */}
                <Command.Item onSelect={() => setPages([...pages, "posts"])}>
                  <BlogSvg />
                  Blog
                  <div className="cmdk-vercel-shortcuts">
                    <kbd>B</kbd>
                  </div>
                </Command.Item>
                <Command.Item onSelect={() => setPages([...pages, "projects"])}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Project
                  <div className="cmdk-vercel-shortcuts">
                    <kbd>P</kbd>
                  </div>
                </Command.Item>
                <Command.Item onSelect={() => routing("/about")}>
                  <AboutSvg />
                  About
                  <div className="cmdk-vercel-shortcuts">
                    <kbd>A</kbd>
                  </div>
                </Command.Item>
                <Command.Item onSelect={() => routing("/guestbook")}>
                  <BookSvg />
                  GuestBook
                  <div className="cmdk-vercel-shortcuts">
                    <kbd>G</kbd>
                  </div>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Tags">
                <Command.Item onSelect={() => setPages([...pages, "tags"])}>
                  <TagSvg /> Tags
                  <div className="cmdk-vercel-shortcuts">
                    <kbd>T</kbd>
                  </div>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Links">
                <Command.Item
                  onSelect={() => routing("mailto:cnsa201119@gmail.com")}
                >
                  <MailSvg /> Mail
                </Command.Item>
                <Command.Item
                  onSelect={() => routing("https://github.com/lee-sihun")}
                >
                  <GithubSvg /> Github
                </Command.Item>
                <Command.Item
                  onSelect={() =>
                    routing("https://discordapp.com/users/479635064368398342")
                  }
                >
                  <DisordSvg /> Discord
                </Command.Item>
              </Command.Group>
            </>
          )}

          {(page === "tags" || search !== "") && (
            <Command.Group heading="Tags">
              {Object.entries(tagCounts).map(([tag, count]) => (
                <Command.Item
                  key={tag}
                  onSelect={() => setPages([...pages, `tag:${tag}`])}
                >
                  <TagSvg />
                  {tag} ({count})
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {(page?.startsWith("tag:") || search !== "") && (
            <Command.Group
              heading={`Posts tagged with "${page?.split(":")[1]}"`}
            >
              {filterPostsByTag(page?.split(":")[1] || "").map((post) => (
                <Command.Item key={post.url} onSelect={() => routing(post.url)}>
                  <BlogSvg />
                  {post.title}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {(page === "posts" || search !== "") && (
            <Command.Group heading="Posts">
              <Command.Item onSelect={() => routing("/blog")}>
                <BlogSvg />
                Blog → All Posts
              </Command.Item>
              {posts.map((post) => (
                <Command.Item key={post.url} onSelect={() => routing(post.url)}>
                  <BlogSvg />
                  Blog → {post.title}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {(page === "projects" || search !== "") && (
            <Command.Group heading="Projects">
              <Command.Item onSelect={() => routing("/project")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                Project → All Projects
              </Command.Item>
              {projects.map((project) => (
                <Command.Item
                  key={project.url}
                  onSelect={() => routing(project.url)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Project → {project.title}
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command.Dialog>
    </div>
  );
}
