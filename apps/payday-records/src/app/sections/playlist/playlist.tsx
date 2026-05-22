import React from "react";
import MotionWrap from "@repo/ui/common/MotionWrap";
import TextReveal from "@repo/ui/common/TextReveal";

import { playlist } from "./config";

function Playlist() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="playlist">
      <div className="flex flex-col items-center justify-center px-6 text-center sm:px-4">
        <TextReveal as="h2" className="section-heading">
          Sound
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-6 max-w-[640px] text-base/relaxed text-neutral-400 md:text-lg/relaxed"
        >
          Curated by Payday Records
        </TextReveal>
        <div className="mt-12 w-full max-w-[1160px] rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
              <iframe
                src={playlist.spotify.embedSrc}
                title="Payday Records curated playlist on Spotify"
                width="100%"
                height={420}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="block"
                style={{ border: 0 }}
              />
            </div>
            <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
              <iframe
                src={playlist.soundcloud.embedSrc}
                title="Payday Records on SoundCloud"
                width="100%"
                height={420}
                allow="autoplay"
                loading="lazy"
                className="block"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default Playlist;
