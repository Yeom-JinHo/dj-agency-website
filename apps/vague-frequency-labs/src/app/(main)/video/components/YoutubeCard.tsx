"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";

import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

import { BlurFade } from "@repo/ui/common/BlurFade";

interface YoutubeCardProps {
  id: string;
  title: string;
}

export default function YoutubeCard({ id, title }: YoutubeCardProps) {
  return (
    <BlurFade
      inView
      duration={0.6}
      className="relative w-full p-8 md:w-[640px]"
    >
      <LiteYouTubeEmbed
        aspectHeight={9}
        aspectWidth={16}
        id={id}
        title={title}
      />
      <p className="mt-2 text-xl font-bold">{title}</p>
    </BlurFade>
  );
}
