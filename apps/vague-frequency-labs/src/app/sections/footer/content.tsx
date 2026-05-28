import React from "react";
import { metadata as meta } from "@/app/config";
import Link from "next/link";
import { contact } from "../contact/config";
import { copyright } from "./config";
import { Icon } from "@repo/ui/common/Icon";

export default function Content() {
  return (
    <div className="bg-muted/30 flex h-full w-full flex-col justify-between px-4 py-6 sm:px-8 md:px-12 md:py-8">
      <Nav />
      <Copyright />
    </div>
  );
}

const Copyright = () => {
  return (
    <div className="flex flex-col items-start justify-between sm:flex-row sm:items-end">
      <h1 className="mt-10 text-[14vw] leading-[0.8] sm:text-[16vw] md:text-[13vw] lg:text-[14vw] xl:text-[16vw] 2xl:text-[min(18vw,28rem)]">
        v.f.labs
      </h1>
      <p className="mt-4 text-xs sm:mt-0 sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
        © {copyright.startYear} {meta.author.name}
      </p>
    </div>
  );
};

const Nav = () => {
  return (
    <div className="flex shrink-0 gap-8 sm:gap-12 md:gap-20">
      {/* <div className="flex flex-col gap-2">
        <h3 className="mb-2 text-zinc-500 uppercase dark:text-zinc-400">
          About
        </h3>
        {links.map((link, index) => {
          const { title, href } = link;

          return (
            <Link
              className="underline-offset-4 hover:underline"
              href={href}
              key={`ft-l_about_${index}`}
            >
              {title}
            </Link>
          );
        })}
      </div> */}
      <div className="flex flex-col gap-2">
        <h3 className="mb-2 text-lg text-zinc-500 uppercase md:text-xl lg:text-2xl dark:text-zinc-400">
          Socials
        </h3>
        {contact.socials.map((link, index) => {
          const { name, href, iconName } = link;

          return (
            <Link
              className="text-base underline-offset-4 hover:underline md:text-lg lg:text-xl"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              key={`ft-l_social_${index}`}
              // external
            >
              {iconName && <Icon name={iconName} className="h-5 w-5" />}
              {name}
            </Link>
          );
        })}
      </div>
      {/* <div className="flex flex-col gap-2">
        <h3 className="mb-2 text-zinc-500 uppercase dark:text-zinc-400">
          More
        </h3>
        {footer.map((link, index) => {
          const { title, href } = link;

          return (
            <Link
              className="underline-offset-4 hover:underline"
              href={href}
              key={`ft-l_more_${index}`}
            >
              {title}
            </Link>
          );
        })}
      </div> */}
    </div>
  );
};
