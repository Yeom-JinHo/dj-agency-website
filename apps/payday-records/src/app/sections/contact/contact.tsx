import React from "react";
import Image from "next/image";
import CopyButton from "@repo/ui/common/CopyButton";
import { MacBookScroll } from "@/components/MacBookScroll";
import { ShineBorder } from "@repo/ui/common/ShineBorder";
import Link from "next/link";

import { contact } from "./config";
import { Icon } from "@repo/ui/common/Icon";

function Contact() {
  return (
    <div className="w-full" id="contact">
      <div className="flex flex-col items-center justify-center">
        <MacBookScroll
          title={
            <span className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight">
              Show me the your dream
            </span>
          }
          badge={
            <a href="https://www.instagram.com/samkor.br/">
              <Image
                src="/images/artist/sam/logo.webp"
                alt="SAM"
                width={100}
                height={100}
              />
            </a>
          }
          src={"/images/mac/image.webp"}
          showGradient={false}
        />
        <div
          style={{
            backdropFilter: "blur(11px) saturate(200%)",
            WebkitBackdropFilter: "blur(11px) saturate(200%)",
            backgroundColor: "rgba(17, 25, 40, 0.27)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.125)",
          }}
          className="pointer-events-auto relative mb-[200px] flex h-auto min-w-[300px] flex-col items-center justify-center overflow-hidden p-8 sm:w-[40vw] [@media(max-width:375px)]:mb-40"
        >
          <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
          <h3 className="mb-8 text-center text-3xl font-bold">Contact</h3>
          <div className="flex items-center">
            <p className="text-lg md:text-xl">{contact.email}</p>
            <CopyButton text={contact.email} className="ml-2" />
          </div>
          <div className="mt-8 flex items-center">
            {contact.socials.map((link, index) => {
              const { href, iconName } = link;

              return (
                <Link
                  className={`underline-offset-4 hover:underline ${index > 0 ? "ml-4 border-l border-gray-300 pl-4" : ""}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={`ft-l_social_${index}`}
                >
                  {iconName && <Icon name={iconName} className="h-6 w-6" />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
