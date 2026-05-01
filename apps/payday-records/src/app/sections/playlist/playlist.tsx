import React from "react";
import MotionWrap from "@repo/ui/common/MotionWrap";
import TextReveal from "@repo/ui/common/TextReveal";

import { playlist } from "./config";

function Playlist() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="playlist">
      <div className="flex flex-col items-center justify-center px-4">
        <TextReveal
          as="h2"
          className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
        >
          Sound
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-4 max-w-[700px] text-center text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
        >
          Curated by Payday Records
        </TextReveal>
        <div className="mt-12 w-full max-w-[760px]">
          <iframe
            src={playlist.spotify.embedSrc}
            title="Payday Records curated playlist on Spotify"
            width="100%"
            height={380}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 0, borderRadius: 12 }}
          />
        </div>
        {playlist.soundcloud.variants.map((variant) => (
          <div
            key={variant.label}
            className="mt-8 w-full max-w-[760px]"
          >
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              {variant.label}
              <span className="ml-2 opacity-60">— {variant.meta}</span>
            </p>
            <iframe
              src={variant.embedSrc}
              title={`Payday Records on SoundCloud — ${variant.label}`}
              width="100%"
              height={variant.height}
              allow="autoplay"
              loading="lazy"
              style={{
                border: 0,
                borderRadius: 12,
                ...(variant.darkFilter
                  ? { filter: "invert(1) hue-rotate(180deg)" }
                  : {}),
              }}
            />
          </div>
        ))}
      </div>
    </MotionWrap>
  );
}

export default Playlist;
