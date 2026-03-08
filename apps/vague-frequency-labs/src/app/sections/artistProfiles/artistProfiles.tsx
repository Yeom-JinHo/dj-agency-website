"use client";

import { useMemo } from "react";
import { artistProfiles } from "./config";
import TextReveal from "@repo/ui/common/TextReveal";
import Autoplay from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@repo/ui/common/Carousel";
import Link from "next/link";
import ArtistImage from "./ArtistImage";

const firstRow = [...artistProfiles];

function ArtistProfiles() {
  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        speed: 600 / 1000,
        startDelay: 100,
        stopOnInteraction: false,
      }),
    [],
  );

  return (
    <section className="w-full py-24 lg:py-32" id="artist-profiles">
      <div className="grid gap-10">
        <div className="flex w-full flex-col items-center justify-center px-4 text-center md:px-6 lg:flex-row lg:justify-between lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <TextReveal
              as="h2"
              className="flex flex-col -space-y-4 text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
            >
              Artist Profiles
            </TextReveal>
          </div>
          <p className="mt-4 hidden text-gray-500 lg:mt-0 lg:block lg:w-[35%] dark:text-gray-400">
            Vague Frequency Laboratory
          </p>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden">
          <Carousel
            opts={{
              align: "start",
              dragFree: true,
              loop: true,
            }}
            plugins={[autoplayPlugin]}
            className="w-full"
          >
            <CarouselContent>
              {firstRow.map((artist, index) => (
                <CarouselItem
                  key={`artist_${index}`}
                  className="basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="h-full p-1 relative">
                    <Link href={`/artist/${artist.name}`}>
                      <ArtistImage
                        artist={artist}
                        backgroundLogo={true}
                        priority={index < 2}
                      />
                    </Link>
                    <div className="md:hidden absolute w-full bottom-0 left-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent pt-16 pb-4 px-4">
                      <span className="text-white text-xl font-bold drop-shadow-lg">
                        {artist.name}
                      </span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="md:dark:from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 md:bg-gradient-to-r md:from-white"></div>
          <div className="md:dark:from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 md:bg-gradient-to-l md:from-white"></div>
        </div>
      </div>
    </section>
  );
}

export default ArtistProfiles;
