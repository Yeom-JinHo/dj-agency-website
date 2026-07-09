import React from "react";
import Image from "next/image";
import CopyButton from "@repo/ui/common/CopyButton";
import { MacBookScroll } from "@/components/MacBookScroll";
import { ShineBorder } from "@repo/ui/common/ShineBorder";
import Link from "next/link";

import { contact } from "./config";
import { Icon } from "@repo/ui/common/Icon";

const brandHoverColor: Record<string, string> = {
  SiYoutube: "group-hover:text-[#FF4444]",
  SiInstagram: "group-hover:text-[#E1306C]",
  SiApple:
    "group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]",
  SiBeatport: "group-hover:text-[#A8FF04]",
};

function Contact() {
  return (
    <section className="section-gap w-full" id="contact" aria-label="Contact">
      <div className="flex flex-col items-center justify-center">
        <MacBookScroll
          title={<span className="hero-heading">Show me your dream</span>}
          badge={
            <a
              href="https://www.instagram.com/samkor.br/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="SAM on Instagram"
            >
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
        {/* 모바일 -mt-12: 스크롤 종료 시점 lid 하단~카드 갭(146px)을
            섹션 리듬(~96px)에 맞춰 당긴다. 데스크탑은 이미 리듬에 맞음. */}
        <div
          style={{
            /* 뒤의 DAW 스크린샷(보라 플러그인 창)이 비치면 카드가 팔레트 밖
               색을 얻으므로, 유리를 어둡게 조여 뉴트럴 다크 글래스로 유지. */
            backdropFilter: "blur(24px) saturate(120%)",
            WebkitBackdropFilter: "blur(24px) saturate(120%)",
            backgroundColor: "rgba(9, 9, 11, 0.9)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.125)",
          }}
          className="pointer-events-auto relative -mt-12 flex h-auto min-w-[300px] flex-col items-center justify-center overflow-hidden p-8 sm:w-[40vw] md:mt-0"
        >
          <ShineBorder
            borderWidth={2}
            duration={8}
            shineColor={["#FFBE7B", "#FFD580", "#FF9A3C"]}
          />
          <h2 className="card-heading mb-8 text-center">Contact</h2>
          <div className="flex items-center">
            <p className="text-lg md:text-xl">{contact.email}</p>
            <CopyButton text={contact.email} className="ml-2" />
          </div>
          <div className="mt-8 flex items-center">
            {contact.socials.map((link, index) => {
              const { href, iconName, name } = link;
              const brandHover =
                iconName && iconName in brandHoverColor
                  ? brandHoverColor[iconName]
                  : "";

              return (
                <Link
                  className={`group ${index > 0 ? "ml-4 border-l border-white/15 pl-4" : ""}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  key={`ft-l_social_${index}`}
                >
                  <span
                    className={`inline-flex transition duration-300 group-hover:scale-110 ${brandHover}`}
                  >
                    {iconName && <Icon name={iconName} className="h-6 w-6" />}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
