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

// Hero cascade curve (easeOutQuint).
const EASE = [0.22, 1, 0.36, 1] as const;
// About reveal curve (expo ease-out) — the same one the music tilt uses.
const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

// ── Hero → About scrub-hybrid tuning knobs ──────────────────────────────────
// The camera is SCRUBBED: scroll position drives zoom/dim/pin ramps 1:1 through
// a damped lerp (the user's hand is the tempo — park, reverse, creep at will).
// Only the About reveal is a time-based beat, fired with hysteresis once the
// scrub commits. Chosen over trigger playback after live comparison (2026-07-17).
//
// Camera zoom factor toward Seoul. 2.3 keeps a readable world silhouette while
// the pulse blooms into a room (see design options §5-1).
const SCALE = 2.3;
// Map opacity floor once About takes over — recede, don't vanish (rejection §4).
const MAP_FLOOR = 0.15;
// Scrub progress 0→1 maps over scrollY ∈ [SCRUB_START, SCRUB_START+SCRUB_SPAN]
// in units of 100svh (the 200svh track's first half; sticky releases at 100svh).
const SCRUB_START = 0.2;
const SCRUB_SPAN = 0.65;
// Damped-lerp factor per frame — lower = heavier, more cinematic drag.
const SCRUB_LERP = 0.16;
// About reveal fires at 90% progress — ARRIVAL, not en route: at 0.9 the
// camera is at scale 2.17 with Seoul ~90% recentred, so the room blooms where
// the pulse actually landed instead of floating over a still-travelling map
// (the "pulse becomes the room" causality needs the pulse to BE there first).
// Release scrubbing back below 82% — the gap keeps boundary jitter from
// strobing the reveal.
const REVEAL_AT = 0.9;
const RELEASE_AT = 0.82;
// Scrubbed ramps (progress windows): the headline clears early so the journey
// owns the frame, and the Seoul pulse RIDES the whole journey — pins/arcs stay
// alive to 88%, growing with the zoom as the camera closes in, then bow out at
// the doorstep so the ring blooms in the pulse's place at 0.9. The travelling
// pulse is the mid-journey focal anchor, so no parking point shows a dead
// frame (UX review MAJOR-1 stays solved by presence, not embers).
const RAMP_DETAIL: [number, number] = [0.3, 0.88];
const RAMP_MAP_DIM: [number, number] = [0.45, 0.9];
const RAMP_HEADLINE: [number, number] = [0.05, 0.35];
// The scroll cue is pure wayfinding chrome — it clears first, ahead of the
// brand headline, so the teardown reads outside-in (UI → identity → data →
// world) instead of leaving a bright affordance lit over a receding globe.
const RAMP_SCROLL: [number, number] = [0.03, 0.22];
// Reveal cascade delays (s) — near-zero: the user's hand already did the
// travelling, so the room answers promptly once the scrub commits.
const REVEAL_DUR = 0.45;
const D_FRAME = 0.05;
const D_SEAL = 0.1;
const D_HEADING = 0.2;
const D_BODY = 0.3;
const D_META = 0.95;
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

  // Reveal state. `mode` is the target (hero vs. About); `kind` times the text
  // cascade (first full play, abbreviated re-entry, instant for reduced motion
  // and load-time snaps).
  const [mode, setMode] = useState<Mode>("hero");
  const [kind, setKind] = useState<SeqKind>("instant");
  const playedRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Seoul's projected fraction in the map-inner's own box — the scrub loop and
  // the reduced-motion camera both interpolate translate/scale from it, so the
  // zoom needs no pixel measurement (dotted-map getPin projection, no hardcode).
  const { seoulU, seoulV, zoomTransform } = useMemo(() => {
    const seoul = mapData.placed.find((p) => p.id === hero.homeId);
    const u = seoul ? seoul.x / mapData.width : 0.876;
    const v = seoul ? seoul.y / mapData.height : 0.364;
    // Inline transform REPLACES the CSS base `translate(-50%, -50%)`, so the
    // −50% centring is folded back in.
    const tx = -50 - SCALE * (u - 0.5) * 100;
    const ty = -50 - SCALE * (v - 0.5) * 100;
    return {
      seoulU: u,
      seoulV: v,
      zoomTransform: `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${SCALE})`,
    };
  }, [mapData]);

  const enterAbout = useCallback(() => {
    const k: SeqKind = reduce ? "instant" : playedRef.current ? "abbrev" : "full";
    playedRef.current = true;
    setKind(k);
    setMode("about");
  }, [reduce]);

  const exitAbout = useCallback(() => {
    setKind(reduce ? "instant" : "abbrev");
    setMode("hero");
  }, [reduce]);

  // Reduced-motion fallback: no scrub, no camera motion — the sentinel (the
  // whole second screen, 100svh → track end) against a mid-viewport root line
  // snaps the About state instantly in either direction. The region sentinel
  // can't be jumped over by an instant scroll the way a 1px point could; the
  // first callback handles the load-time deep-link / restored-scroll case.
  useEffect(() => {
    if (!reduce) return;
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
            setKind("instant");
            setMode("about");
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
  }, [enterAbout, exitAbout, reduce]);

  // Scrub loop. Styles are written straight to the DOM each frame; React never
  // manages transform/opacity for these elements in the scrub path (the camera
  // prop stays undefined), so the writes don't fight the reconciler.
  useEffect(() => {
    // Wait for the loader to land — the crossfade / pin-reveal / breathe CSS
    // owns these elements until then, and stomping them mid-loader breaks the
    // dot-scatter landing illusion.
    if (reduce || !done) return;
    const mapInner = document.querySelector<HTMLElement>(".vfl-map-inner");
    const mapImg = document.querySelector<HTMLElement>(".vfl-map-img");
    const arcSvg = document.querySelector<SVGSVGElement>(
      ".vfl-map-inner > svg",
    );
    const pinLayer = document.querySelector<HTMLElement>(".vfl-pin-layer");
    const headline = document.querySelector<HTMLElement>(".vfl-headline");
    const scrollCue = document.querySelector<HTMLElement>(".vfl-scroll-cue");
    if (!mapInner || !mapImg) return;
    // Endpoint translate components — interpolated linearly in progress, the
    // same way a CSS transition between the rest and zoom transforms would be.
    // (Recentre by the full term ONLY at progress 1; at 0 this must be a pure
    // −50%/−50% or the map sits displaced at rest.)
    const txEnd = -SCALE * (seoulU - 0.5) * 100;
    const tyEnd = -SCALE * (seoulV - 0.5) * 100;
    const ramp = (p: number, [a, b]: [number, number]) =>
      Math.min(1, Math.max(0, (p - a) / (b - a)));
    let target = 0;
    let revealed = false;
    let owned = false;
    const readScroll = () => {
      const H = window.innerHeight;
      target = Math.min(
        1,
        Math.max(0, (window.scrollY - SCRUB_START * H) / (SCRUB_SPAN * H)),
      );
    };
    readScroll();
    let cur = target;
    let raf = 0;
    const own = () => {
      owned = true;
      // No transitions while scrubbing — the lerp IS the smoothing — and the
      // breathe keyframe must not fight the dim ramp.
      mapInner.style.transition = "none";
      mapInner.style.willChange = "transform";
      mapImg.style.transition = "none";
      mapImg.style.animation = "none";
      if (arcSvg) arcSvg.style.transition = "none";
      if (pinLayer) pinLayer.style.transition = "none";
    };
    const release = () => {
      owned = false;
      // Give every style back to the CSS layer (breathe, hover arcs, reveal
      // classes) so the rest state is pixel-identical to a never-scrubbed hero.
      for (const el of [mapInner, mapImg, arcSvg, pinLayer, headline, scrollCue]) {
        if (!el) continue;
        el.style.removeProperty("transform");
        el.style.removeProperty("opacity");
        el.style.removeProperty("transition");
        el.style.removeProperty("animation");
        el.style.removeProperty("pointer-events");
        el.style.removeProperty("will-change");
      }
    };
    const tick = () => {
      cur += (target - cur) * SCRUB_LERP;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      if (cur <= 0.001 && target <= 0.001) {
        if (owned) release();
        raf = requestAnimationFrame(tick);
        return;
      }
      if (!owned) own();
      const s = 1 + (SCALE - 1) * cur;
      const tx = -50 + txEnd * cur;
      const ty = -50 + tyEnd * cur;
      mapInner.style.transform = `translate(${tx.toFixed(3)}%, ${ty.toFixed(3)}%) scale(${s.toFixed(4)})`;
      mapImg.style.opacity = String(
        1 - (1 - MAP_FLOOR) * ramp(cur, RAMP_MAP_DIM),
      );
      const detail = String(1 - ramp(cur, RAMP_DETAIL));
      if (arcSvg) arcSvg.style.opacity = detail;
      if (pinLayer) {
        pinLayer.style.opacity = detail;
        pinLayer.style.pointerEvents = detail === "0" ? "none" : "";
      }
      if (headline)
        headline.style.opacity = String(1 - ramp(cur, RAMP_HEADLINE));
      if (scrollCue)
        scrollCue.style.opacity = String(1 - ramp(cur, RAMP_SCROLL));
      if (cur >= REVEAL_AT && !revealed) {
        revealed = true;
        enterAbout();
      } else if (cur <= RELEASE_AT && revealed) {
        revealed = false;
        exitAbout();
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", readScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", readScroll);
      cancelAnimationFrame(raf);
      release();
    };
  }, [reduce, done, seoulU, seoulV, enterAbout, exitAbout]);

  // Camera prop — reduced-motion path only (instant snap to the zoomed state);
  // undefined otherwise so the scrub loop owns the map styles, and undefined at
  // rest so the CSS base (breathe, hover arcs) behaves normally.
  const camera: WorldMapCamera | undefined = useMemo(() => {
    if (!reduce || mode !== "about") return undefined;
    return {
      transform: zoomTransform,
      transformTransition: "transform 0s",
      mapOpacity: MAP_FLOOR,
      mapTransition: "opacity 0s",
      detailOpacity: 0,
      detailTransition: "opacity 0s",
      active: false,
    };
  }, [reduce, mode, zoomTransform]);

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
  // Room element reveal timing. Frame/seal land first, then heading, body,
  // signature. Exit and instant collapse to a fast crossfade so scrubbing back
  // or reduced motion never lingers.
  const revealT = (dFull: number, dAbbrev: number, extra = 0, dur = REVEAL_DUR) =>
    shown
      ? {
          duration: kind === "instant" ? 0 : full ? dur : Math.min(dur, 0.3),
          ease: REVEAL_EASE,
          delay: kind === "instant" ? 0 : (full ? dFull : dAbbrev) + extra,
        }
      : { duration: kind === "instant" ? 0 : 0.28, ease: "easeOut" as const, delay: 0 };

  // Body word cascade — its own envelope so 51 words land inside ~1.2s of the
  // reveal committing (0.3 + 50·0.005 + 0.35), with a tighter re-entry.
  const wordT = (i: number) =>
    shown
      ? {
          duration: kind === "instant" ? 0 : full ? 0.35 : 0.25,
          ease: REVEAL_EASE,
          delay: kind === "instant" ? 0 : full ? D_BODY + i * 0.005 : 0.32 + i * 0.002,
        }
      : { duration: kind === "instant" ? 0 : 0.28, ease: "easeOut" as const, delay: 0 };

  const bodyWords = ABOUT_BODY.split(" ");

  return (
    <MotionConfig reducedMotion="user">
      <section className="vfl-hero relative min-h-[200svh]">
        {/* #about anchor + reduced-motion trigger sentinel (the whole second
            screen). A /#about deep link lands here; in the scrub path the rAF
            loop reads the restored scroll position and settles instantly. */}
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
              centred below the map band on mobile. The scrub loop fades the
              wrapper with early progress; motion's target stays static in the
              scrub path so the per-frame writes never fight it. */}
          <motion.div
            className="vfl-headline"
            initial={false}
            animate={
              reduce
                ? { opacity: shown ? 0 : 1, y: shown ? -12 : 0 }
                : { opacity: 1, y: 0 }
            }
            transition={{ duration: kind === "instant" ? 0 : 0.35, ease: "easeOut" }}
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
              Motion only owns the loader-gated fade-in (and the reduced-motion
              snap on About entry); in the scrub path the rAF loop fades this via
              RAMP_SCROLL, so its animate target must stay constant there — a
              `shown`-driven opacity would re-animate and fight the per-frame
              writes at the reveal/release boundary. */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{
              opacity: reduce ? (done && !shown ? 1 : 0) : done ? 1 : 0,
            }}
            transition={{ duration: 0.45, ease: "easeOut", delay: shown ? 0 : 0.5 }}
            className="vfl-scroll-cue pointer-events-none absolute inset-x-0 bottom-6 z-[5] flex flex-col items-center gap-2 [color:var(--vfl-ink)]"
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
              nothing is left orphaned beside the frame.
              Deliberately NOT aria-hidden while unrevealed: the scroll trigger
              never fires for a screen-reader virtual cursor, and this copy
              exists nowhere else, so it must stay in the accessibility tree. */}
          <div className="vfl-about-room" data-shown={shown}>
            <motion.div
              className="vfl-about-frame"
              aria-hidden
              initial={false}
              animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 1.12 }}
              transition={revealT(D_FRAME, 0.15)}
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
              transition={revealT(D_SEAL, 0.18)}
            >
              <TaegeukMark />
            </motion.div>

            <motion.h2
              className="vfl-about-heading"
              initial={false}
              animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 16 }}
              transition={revealT(D_HEADING, 0.28)}
            >
              About
            </motion.h2>

            {/* AT reads the intact sentence from the sr-only span; the animated
                word spans are presentation-only (no space text nodes between
                them — margin-right fakes the gaps — so they'd read/copy as one
                run-on word). */}
            <p className="vfl-about-body">
              <span className="sr-only">{ABOUT_BODY}</span>
              <span aria-hidden>
                {bodyWords.map((word, i) => (
                  <motion.span
                    key={`${word}-${i}`}
                    initial={false}
                    animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 8 }}
                    transition={wordT(i)}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </p>

            {/* The coordinate signature signs off AFTER the last body word —
                introduction first, then the stamp. */}
            <motion.div
              className="vfl-about-meta"
              initial={false}
              animate={{ opacity: shown ? 1 : 0 }}
              transition={revealT(D_META, 0.65, 0, 0.35)}
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
