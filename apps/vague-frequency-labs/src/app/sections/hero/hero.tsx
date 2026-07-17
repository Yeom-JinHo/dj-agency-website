"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import {
  WorldMap,
  TaegeukMark,
  type WorldMapCamera,
} from "@/components/WorldMap";
import { useLoaderDone } from "@/app/(main)/loader-context";
import type { WorldMapData } from "@/utils/world-map-data";
import { hero } from "./config";

// Hero cascade curve (easeOutQuint) — reused for the Phase A camera return.
const EASE = [0.22, 1, 0.36, 1] as const;
// Phase C reveal curve (expo ease-out) — the same one the music tilt uses.
const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

// ── Hero → About zoom sequence tuning knobs ──────────────────────────────
// Camera zoom factor toward Seoul. 2.3 keeps a readable world silhouette while
// the pulse blooms into a room (see design options §5-1).
const SCALE = 2.3;
// Map opacity floor once About takes over — recede, don't vanish (rejection §4).
const MAP_FLOOR = 0.15;
// First-entry full sequence vs. re-entry / reverse (abbreviated) windows (ms).
const FULL_MS = 1400;
const ABBREV_MS = 500;
// Pure band-centering transform — matches the CSS base `.vfl-map-inner` sets, so
// a camera-driven rest is pixel-identical to the camera-undefined (CSS) rest.
const REST_TRANSFORM = "translate(-50%, -50%) scale(1)";
// About copy — confirmed 2026-07-17 (design options §6). Do not edit.
const ABOUT_BODY =
  "Vague Frequency Laboratory is an independent electronic music label and creative studio, broadcasting from Seoul since 2025. We work where experimental tech house and bass house blur — frequencies tuned in the studio, tested on dance floors from Tokyo to Berlin. Every signal we send out starts here, at home base.";
const ABOUT_META = "37.5665°N · 126.9780°E — SEOUL · EST. 2025";

type Mode = "hero" | "about";
type SeqKind = "full" | "abbrev" | "instant";

function Hero({ mapData }: { mapData: WorldMapData }) {
  // Gated on the loader's landing signal (useLoaderDone) rather than a client
  // timer: LoaderProvider's unconditional watchdog guarantees `done` fires
  // even if the dot-scatter scene fails, so this never hangs (fail-open).
  const done = useLoaderDone();
  const reduce = useReducedMotion();

  // Second-screen trigger state. `mode` is the target (hero vs. About), `kind`
  // is how the current transition is timed (first full play, abbreviated
  // re-entry/reverse, or an instant snap for fast scroll / reduced motion), and
  // `active` scopes will-change to the transition window only.
  const [mode, setMode] = useState<Mode>("hero");
  const [kind, setKind] = useState<SeqKind>("instant");
  const [active, setActive] = useState(false);
  const playedRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Camera target toward Seoul, expressed in the map-inner's OWN box units so it
  // needs no pixel measurement: translating by −S·(u−0.5)·100% recentres Seoul
  // (u,v = its projected fraction) as the layer scales about its centre. The
  // inline transform REPLACES the CSS base `translate(-50%, -50%)` that centres
  // the band, so we fold that −50% back in; REST_TRANSFORM below reproduces the
  // pure base so a camera-driven rest matches the CSS-driven (undefined) rest.
  const zoomTransform = useMemo(() => {
    const seoul = mapData.placed.find((p) => p.id === hero.homeId);
    const u = seoul ? seoul.x / mapData.width : 0.876;
    const v = seoul ? seoul.y / mapData.height : 0.364;
    const tx = -50 - SCALE * (u - 0.5) * 100;
    const ty = -50 - SCALE * (v - 0.5) * 100;
    return `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${SCALE})`;
  }, [mapData]);

  const clearSettle = () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = null;
  };

  const enterAbout = useCallback(() => {
    const k: SeqKind = reduce ? "instant" : playedRef.current ? "abbrev" : "full";
    playedRef.current = true;
    clearSettle();
    setKind(k);
    setMode("about");
    if (k === "instant") {
      setActive(false);
      return;
    }
    setActive(true);
    settleTimer.current = setTimeout(
      () => setActive(false),
      k === "full" ? FULL_MS : ABBREV_MS,
    );
  }, [reduce]);

  const exitAbout = useCallback(() => {
    const k: SeqKind = reduce ? "instant" : "abbrev";
    clearSettle();
    setKind(k);
    setMode("hero");
    if (k === "instant") {
      setActive(false);
      return;
    }
    setActive(true);
    settleTimer.current = setTimeout(() => setActive(false), ABBREV_MS);
  }, [reduce]);

  // The sentinel is the whole second screen (100svh → track end) and the root is
  // collapsed to the viewport mid-line, so `isIntersecting` is a plain "is the
  // mid-line inside the second screen" boolean — it flips at 25% of the track and
  // can't be jumped over by an instant scroll the way a 1px point could. The
  // first callback handles the fast-scroll / deep-link case: if we land already
  // inside (or wholly past) the region, snap straight to the final About state.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const inside =
          entry.isIntersecting ||
          entry.boundingClientRect.bottom < window.innerHeight / 2;
        if (first) {
          first = false;
          if (inside) {
            playedRef.current = true;
            clearSettle();
            setKind("instant");
            setMode("about");
            setActive(false);
          }
          return;
        }
        if (inside) enterAbout();
        else exitAbout();
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enterAbout, exitAbout]);

  useEffect(() => () => clearSettle(), []);

  // Camera prop: undefined at true rest (map breathes / hovers normally), set
  // while zoomed or reversing. Transition strings carry all the phase timing.
  const camera: WorldMapCamera | undefined = useMemo(() => {
    if (mode === "hero" && !active) return undefined;
    const zoomed = mode === "about";
    if (kind === "instant") {
      return {
        transform: zoomed ? zoomTransform : REST_TRANSFORM,
        transformTransition: "transform 0s",
        mapOpacity: zoomed ? MAP_FLOOR : 1,
        mapTransition: "opacity 0s",
        detailOpacity: zoomed ? 0 : 1,
        detailTransition: "opacity 0s",
        active: false,
      };
    }
    if (zoomed && kind === "full") {
      // Phase A camera (0–0.7s), Phase B map recede (delayed 0.5s), details fade across.
      return {
        transform: zoomTransform,
        transformTransition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        mapOpacity: MAP_FLOOR,
        mapTransition: "opacity 0.4s ease-out 0.5s",
        detailOpacity: 0,
        detailTransition: "opacity 0.7s ease-out",
        active,
      };
    }
    // Abbreviated enter or reverse (0.45s), monotonic curve, no phase delays.
    return {
      transform: zoomed ? zoomTransform : REST_TRANSFORM,
      transformTransition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
      mapOpacity: zoomed ? MAP_FLOOR : 1,
      mapTransition: "opacity 0.35s ease-out",
      detailOpacity: zoomed ? 0 : 1,
      detailTransition: "opacity 0.4s ease-out",
      active,
    };
  }, [mode, active, kind, zoomTransform]);

  // Staggered rise so the headline reads in order — eyebrow, brand, subline —
  // instead of arriving as one flat block. Held at `initial` until the loader
  // lands, then plays with the existing stagger delays.
  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: done ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: { duration: 0.65, ease: EASE, delay },
  });

  const shown = mode === "about";
  const full = kind === "full";
  // Room element reveal timing. Phase B (frame/seal) overlaps Phase C (heading/
  // body/meta). Exit and instant collapse to a fast crossfade so a fast reverse
  // or reduced-motion never lingers.
  const revealT = (dFull: number, dAbbrev: number, extra = 0) =>
    shown
      ? {
          duration: kind === "instant" ? 0 : 0.6,
          ease: REVEAL_EASE,
          delay: kind === "instant" ? 0 : (full ? dFull : dAbbrev) + extra,
        }
      : { duration: kind === "instant" ? 0 : 0.28, ease: "easeOut" as const, delay: 0 };

  // Chrome (headline + scroll cue) clears as the camera returns to Seoul.
  const chromeT = {
    duration: kind === "instant" ? 0 : full ? 0.5 : 0.35,
    ease: "easeOut" as const,
  };

  const bodyWords = ABOUT_BODY.split(" ");

  return (
    <MotionConfig reducedMotion="user">
      <section className="vfl-hero relative min-h-[200svh]">
        {/* #about anchor + trigger sentinel — 25% into the 200svh track. The
            nav's About link points at /about, but a /#about deep link lands here
            and the crossing naturally plays the sequence. */}
        <div
          id="about"
          ref={sentinelRef}
          className="vfl-about-sentinel"
          aria-hidden
        />

        <div className="vfl-hero-stage">
          {/* The map mounts immediately (its .vfl-map-inner rect is measured by
              the loader's dot-scatter scene while it's still running) but stays
              visually gated — revealed only once the loader signals `done` —
              so the landing dots crossfade into it instead of popping in early. */}
          <div className="vfl-map-wrap">
            <WorldMap
              mapData={mapData}
              cities={hero.cities}
              homeId={hero.homeId}
              revealed={done}
              mapRevealDelay={0}
              revealDelay={0.2}
              camera={camera}
            />
          </div>

          <div className="vfl-vignette" aria-hidden />
          <div className="vfl-grain" aria-hidden />

          {/* Headline: a name-lockup cascade — solid brand column, outlined
              ENTERTAINMENT suffix, mono subline — bottom-left on desktop,
              centred below the map band on mobile. Clears on About entry. */}
          <motion.div
            className="vfl-headline"
            initial={false}
            animate={{ opacity: shown ? 0 : 1, y: shown ? -12 : 0 }}
            transition={chromeT}
          >
            <motion.h1 {...rise(0)} className="vfl-h-big vfl-h-brand">
              {hero.headline.split(" ").map((word, i, arr) => (
                <span key={word} className="vfl-h-word">
                  {word}
                  {i < arr.length - 1 ? " " : ""}
                </span>
              ))}
            </motion.h1>
            {/* Suffix: the outline cut keeps the category word part of the name
                lockup without competing with the solid brand lead. */}
            <motion.span {...rise(0.08)} className="vfl-h-suffix">
              {hero.suffix}
            </motion.span>
            <motion.div {...rise(0.16)} className="vfl-h-en">
              {hero.subline}
            </motion.div>
          </motion.div>

          {/* Scroll wayfinding — bottom-center, clear of the bottom-left headline.
              Same loader-gated reveal as the headline; clears on About entry. */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: done && !shown ? 1 : 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: shown ? 0 : 0.5 }}
            className="pointer-events-none absolute inset-x-0 bottom-6 z-[5] flex flex-col items-center gap-2 [color:var(--vfl-ink)]"
          >
            <span className="hidden font-mono text-[10px] tracking-[0.34em] opacity-55 sm:block">
              SCROLL
            </span>
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 opacity-70"
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path d="m6 9 6 6 6-6" />
            </motion.svg>
          </motion.div>

          {/* About "room" — the enlarged Seoul pulse becomes the frame, the
              taegeuk core the header seal. Cross-succession: the map-side pin
              elements fade out while this layer fades in at the same centre, so
              nothing is left orphaned beside the frame. */}
          <div
            className="vfl-about-room"
            data-shown={shown}
            aria-hidden={!shown}
          >
            <motion.div
              className="vfl-about-frame"
              aria-hidden
              initial={false}
              animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 1.12 }}
              transition={revealT(0.45, 0.15)}
            >
              <svg viewBox="0 0 200 200" fill="none" aria-hidden>
                <circle
                  cx="100"
                  cy="100"
                  r="96"
                  stroke="var(--vfl-line-strong)"
                  strokeWidth="0.6"
                />
                {/* The frozen pulse arc — a single accent segment at top, the
                    signal that became the room's frame. */}
                <circle
                  cx="100"
                  cy="100"
                  r="96"
                  stroke="var(--vfl-accent)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray="44 559"
                  transform="rotate(-90 100 100)"
                  opacity="0.9"
                />
              </svg>
            </motion.div>

            <motion.div
              className="vfl-about-seal"
              aria-hidden
              initial={false}
              animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.8 }}
              transition={revealT(0.5, 0.18)}
            >
              <TaegeukMark />
            </motion.div>

            <motion.h2
              className="vfl-about-heading"
              initial={false}
              animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 16 }}
              transition={revealT(0.8, 0.28)}
            >
              About
            </motion.h2>

            <p className="vfl-about-body">
              {bodyWords.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  initial={false}
                  animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 8 }}
                  transition={revealT(0.9, 0.32, i * 0.012)}
                >
                  {word}
                </motion.span>
              ))}
            </p>

            <motion.div
              className="vfl-about-meta"
              initial={false}
              animate={{ opacity: shown ? 1 : 0 }}
              transition={revealT(1.05, 0.4)}
            >
              {ABOUT_META}
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

export default Hero;
