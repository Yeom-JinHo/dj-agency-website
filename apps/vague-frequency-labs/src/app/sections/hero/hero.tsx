"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  MotionConfig,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { WorldMap, TaegeukMark } from "@/components/WorldMap";
import { useLoaderDone } from "@/app/(main)/loader-context";
import type { WorldMapData } from "@/utils/world-map-data";
import { hero } from "./config";

// Hero cascade curve (easeOutQuint).
const EASE = [0.22, 1, 0.36, 1] as const;
// About reveal curve (expo ease-out) — the same one the music tilt uses.
const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

// ── Hero → About scrub-hybrid tuning knobs ──────────────────────────────────
// The camera is SCRUBBED: scroll position drives the zoom 1:1 through a damped
// spring (the user's hand is the tempo — park, reverse, creep at will). Only
// the About reveal is a time-based beat, fired with hysteresis once the scrub
// commits. Chosen over trigger playback after live comparison (2026-07-17).
//
// ARCHITECTURE: this component computes ONE progress value per concern and
// publishes it as CSS custom properties (--p, --arc) plus a [data-scrub]
// attribute on the section. Every visual ramp (camera transform, map dim, pin
// fades, pulse floor, chrome fades, arc charge) lives in globals.css under
// "hero → about scrub ramps", colocated with the elements it styles. JS never
// touches those elements, so there is no style ownership to manage — removing
// the attribute IS the release, and rest is pixel-identical by construction.
//
// Camera zoom factor toward Seoul. 2.3 keeps a readable world silhouette while
// the pulse blooms into a room (see design options §5-1). Mirrored by the
// scale() factor (SCALE − 1 = 1.3) in the CSS camera rule.
const SCALE = 2.3;
// Scrub progress 0→1 maps over scrollY ∈ [SCRUB_START, SCRUB_START+SCRUB_SPAN]
// in units of 100svh (the 200svh track's first half; sticky releases at 100svh).
const SCRUB_START = 0.2;
const SCRUB_SPAN = 0.65;
// Damped-spring smoothing — the scrub 손맛. Overdamped (ζ≈1.24): monotonic,
// no overshoot, ~120ms settle, and time-based so the weight feels identical
// at 60Hz and 120Hz (unlike a per-frame lerp factor).
const SCRUB_SPRING = { stiffness: 260, damping: 40 } as const;
// About reveal fires at 90% progress — ARRIVAL, not en route: at 0.9 the
// camera is at scale 2.17 with Seoul ~90% recentred, so the room blooms where
// the pulse actually landed. Keyed on the RAW scroll position, not the spring
// value (a spring is asymptotic — a park just short of the threshold would
// otherwise never fire). Release scrubbing back below 82%; the gap keeps
// boundary jitter from strobing the reveal.
const REVEAL_AT = 0.9;
const RELEASE_AT = 0.82;
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
  const sectionRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Seoul's projected fraction in the map-inner's own box — the CSS camera
  // rule interpolates translate/scale from the endpoint vars below, so the
  // zoom needs no pixel measurement (dotted-map getPin projection, no hardcode).
  const { seoulU, seoulV } = useMemo(() => {
    const seoul = mapData.placed.find((p) => p.id === hero.homeId);
    return {
      seoulU: seoul ? seoul.x / mapData.width : 0.876,
      seoulV: seoul ? seoul.y / mapData.height : 0.364,
    };
  }, [mapData]);

  // Camera recenter endpoints → CSS vars, once per map data. The inline CSS
  // camera transform REPLACES the base `translate(-50%, -50%)`, so the −50%
  // centring is folded back into the rule; at --p:0 it reduces to the pure
  // base and rest is pixel-identical to a never-scrubbed hero.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    el.style.setProperty(
      "--cam-tx",
      `${(-SCALE * (seoulU - 0.5) * 100).toFixed(2)}%`,
    );
    el.style.setProperty(
      "--cam-ty",
      `${(-SCALE * (seoulV - 0.5) * 100).toFixed(2)}%`,
    );
  }, [seoulU, seoulV]);

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

  // Scrub progress springs → CSS vars. `jump()` teleports (deep links, reduced
  // motion, cleanup); `set()` glides. Publishing stops at the section element:
  // the ramp rules in globals.css do everything else.
  const p = useSpring(0, SCRUB_SPRING);
  const arc = useSpring(0, SCRUB_SPRING);
  useMotionValueEvent(p, "change", (v) => {
    const el = sectionRef.current;
    if (!el) return;
    el.style.setProperty("--p", v.toFixed(4));
    if (v > 0.001) el.setAttribute("data-scrub", "");
    else el.removeAttribute("data-scrub");
  });
  useMotionValueEvent(arc, "change", (v) => {
    sectionRef.current?.style.setProperty("--arc", v.toFixed(4));
  });

  // Scrub driver — the only scroll listener. Waits for the loader to land so
  // [data-scrub] can't override the crossfade / pin-reveal / breathe CSS while
  // the dot-scatter scene is still measuring and landing.
  useEffect(() => {
    if (reduce || !done) return;
    let revealed = false;
    const read = (jump: boolean) => {
      const H = window.innerHeight;
      const t = Math.min(
        1,
        Math.max(0, (window.scrollY - SCRUB_START * H) / (SCRUB_SPAN * H)),
      );
      // Arc charge runs over the dwell stretch: camera-journey end → sticky
      // release. Completing at exactly 1·100svh couples "ring fully solid"
      // with the stage letting go.
      const arcStart = (SCRUB_START + SCRUB_SPAN) * H;
      const a = Math.min(
        1,
        Math.max(0, (window.scrollY - arcStart) / (H - arcStart)),
      );
      if (jump) {
        p.jump(t);
        arc.jump(a);
      } else {
        p.set(t);
        arc.set(a);
      }
      if (t >= REVEAL_AT && !revealed) {
        revealed = true;
        enterAbout();
      } else if (t <= RELEASE_AT && revealed) {
        revealed = false;
        exitAbout();
      }
    };
    const onScroll = () => read(false);
    // Restored-scroll / deep-link landing settles instantly (no glide-in).
    read(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      p.jump(0);
      arc.jump(0);
    };
  }, [reduce, done, p, arc, enterAbout, exitAbout]);

  // Reduced-motion fallback: no scrub, no camera glide — the sentinel (the
  // whole second screen, 100svh → track end) against a mid-viewport root line
  // snaps between rest and the fully-zoomed About state. Same CSS vars, jumped
  // instead of sprung, so there is no separate style path to maintain. The
  // region sentinel can't be jumped over by an instant scroll the way a 1px
  // point could, and the first callback covers a restored-scroll landing.
  useEffect(() => {
    if (!reduce) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const inside =
          entry.isIntersecting ||
          entry.boundingClientRect.bottom < window.innerHeight / 2;
        p.jump(inside ? 1 : 0);
        if (inside) enterAbout();
        else if (playedRef.current) exitAbout();
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      p.jump(0);
    };
  }, [reduce, p, enterAbout, exitAbout]);

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
  const revealT = (dFull: number, dAbbrev: number, dur = REVEAL_DUR) =>
    shown
      ? {
          duration: kind === "instant" ? 0 : full ? dur : Math.min(dur, 0.3),
          ease: REVEAL_EASE,
          delay: kind === "instant" ? 0 : full ? dFull : dAbbrev,
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
      {/* data-done / data-about are the declarative state hooks the scrub CSS
          keys on (loader-gated cue fade-in, pulse→room handoff); [data-scrub]
          and --p/--arc are written imperatively by the springs above. */}
      <section
        ref={sectionRef}
        className="vfl-hero relative min-h-[200svh]"
        data-done={done ? "" : undefined}
        data-about={shown ? "" : undefined}
      >
        {/* #about anchor + reduced-motion trigger sentinel (the whole second
            screen). A /#about deep link lands here; in the scrub path the
            driver reads the restored scroll position and settles instantly. */}
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
            />
          </div>

          <div className="vfl-vignette" aria-hidden />
          <div className="vfl-grain" aria-hidden />

          {/* Headline: a name-lockup cascade — solid brand column, outlined
              ENTERTAINMENT suffix, mono subline — bottom-left on desktop,
              centred below the map band on mobile. The scrub CSS fades the
              wrapper with early progress; motion only owns its opacity in the
              reduced-motion path (inline styles would beat the CSS ramp). */}
          <motion.div
            className="vfl-headline"
            initial={false}
            animate={
              reduce ? { opacity: shown ? 0 : 1, y: shown ? -12 : 0 } : undefined
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

          {/* Scroll wayfinding — bottom-center, clear of the bottom-left
              headline. Visibility is pure CSS: hidden until [data-done]
              (loader gate), scrub-faded via --p, hidden under [data-about].
              Motion only animates the chevron bounce (and owns opacity in the
              reduced-motion path). */}
          <motion.div
            aria-hidden
            initial={false}
            animate={
              reduce ? { opacity: done && !shown ? 1 : 0 } : undefined
            }
            transition={{ duration: 0.45, ease: "easeOut" }}
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
              elements fade out (scrub CSS) while this layer fades in at the
              same centre, so nothing is left orphaned beside the frame.
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
                {/* The progress arc — warm white, so the charge reads as the
                    hairline ring SOLIDIFYING (luminance, not hue): progress in
                    the same register as the site's mono/hairline vocabulary,
                    leaving the taegeuk seal as the room's only colour moment.
                    The scrub CSS sweeps it over the dwell scroll (post-arrival
                    → sticky release), the circuit completing exactly as the
                    stage hands off to the next section. */}
                <circle
                  className="vfl-about-arc"
                  cx="100"
                  cy="100"
                  r="96"
                  stroke="var(--vfl-fg)"
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
              transition={revealT(D_META, 0.65, 0.35)}
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
