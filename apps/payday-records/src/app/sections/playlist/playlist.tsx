import React from "react";
import MotionWrap from "@repo/ui/common/MotionWrap";
import TextReveal from "@repo/ui/common/TextReveal";

import { playlist } from "./config";

function Playlist() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="playlist">
      <div className="flex flex-col items-center justify-center px-4 text-center">
        <span className="section-kicker mb-5">02 — Music</span>
        <TextReveal as="h2" className="section-heading">
          Sound
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-6 max-w-[640px] text-base/relaxed text-neutral-400 md:text-lg/relaxed"
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
              style={{ border: 0, borderRadius: 12 }}
            />
          </div>
        ))}
      </div>
    </MotionWrap>
  );
}

export default Playlist;
