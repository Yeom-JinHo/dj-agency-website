"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { artistProfiles } from "./config";
import TextReveal from "@repo/ui/common/TextReveal";
import Autoplay, { type AutoScrollType } from "embla-carousel-auto-scroll";

import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@repo/ui/common/Carousel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ArtistImage from "./ArtistImage";

const firstRow = [...artistProfiles];
const VISIBILITY_ROOT_MARGIN = "200px 0px";
const VISIBILITY_THRESHOLD = 0.05;

function ArtistProfiles() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const carouselApiRef = useRef<CarouselApi | null>(null);
  const isVisibleRef = useRef(false);
  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        speed: 600 / 1000,
        startDelay: 0,
        playOnInit: false,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    [],
  );
  const carouselPlugins = useMemo(() => [autoplayPlugin], [autoplayPlugin]);
  const syncAutoplay = useCallback(
    (shouldPlay: boolean, api = carouselApiRef.current) => {
      const autoScroll = api?.plugins()?.autoScroll as
        | AutoScrollType
        | undefined;

      if (!autoScroll) {
        return;
      }

      if (shouldPlay) {
        if (!autoScroll.isPlaying()) {
          autoScroll.play();
        }
        return;
      }

      if (autoScroll.isPlaying()) {
        autoScroll.stop();
      }
    },
    [],
  );
  const handleSetApi = useCallback(
    (api: CarouselApi) => {
      carouselApiRef.current = api;
      syncAutoplay(isVisibleRef.current, api);
    },
    [syncAutoplay],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextIsVisible = entry?.isIntersecting ?? false;
        isVisibleRef.current = nextIsVisible;
        syncAutoplay(nextIsVisible);
      },
      {
        rootMargin: VISIBILITY_ROOT_MARGIN,
        threshold: VISIBILITY_THRESHOLD,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      syncAutoplay(false);
    };
  }, [syncAutoplay]);

  return (
    <section
      ref={sectionRef}
      className="w-full py-24 lg:py-32"
      id="artist-profiles"
    >
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
            setApi={handleSetApi}
            plugins={carouselPlugins}
            className="w-full"
          >
            <CarouselContent>
              {firstRow.map((artist, index) => (
                <CarouselItem
                  key={`artist_${index}`}
                  className="basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="h-full p-1 relative">
                    <Link
                      href={`/artist/${artist.name}`}
                      prefetch
                      className="block h-full touch-manipulation transition-transform duration-150 active:scale-[0.97]"
                      onMouseEnter={() =>
                        router.prefetch(`/artist/${artist.name}`)
                      }
                      onPointerDown={(e) => {
                        if (e.pointerType !== "mouse") {
                          router.prefetch(`/artist/${artist.name}`);
                        }
                      }}
                    >
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
