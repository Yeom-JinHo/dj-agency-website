"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { SectionHead } from "@/components/SectionHead";
import { TapeCorners } from "@/components/Tape";
import { ARTIST_ROLE_LABEL, ARTISTS } from "@/consts/artists";

import { ArtistModal } from "./ArtistModal";
import { ArtistPortrait } from "./ArtistPortrait";
import { BookingFiller, ReservedFiller } from "./RosterFiller";

const MOBILE_COLS = 2;
const DESKTOP_COLS = 4;

const mobileFillerCount =
  (MOBILE_COLS - (ARTISTS.length % MOBILE_COLS)) % MOBILE_COLS;
const desktopFillerCount =
  (DESKTOP_COLS - (ARTISTS.length % DESKTOP_COLS)) % DESKTOP_COLS;

const reservedSlotLabel = String(ARTISTS.length + 2).padStart(2, "0");

function getFillerVisibility(index: number): string | null {
  const onMobile = index < mobileFillerCount;
  const onDesktop = index < desktopFillerCount;
  if (!onMobile && !onDesktop) return null;
  if (onMobile && onDesktop) return "block";
  if (onDesktop) return "hidden lg:block";
  return "block lg:hidden";
}

export default function Roster() {
  const bookingVisibility = getFillerVisibility(0);
  const reservedVisibility = getFillerVisibility(1);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndexRef = useRef<number | null>(null);
  activeIndexRef.current = activeIndex;

  const open = useCallback((index: number) => {
    setClosing(false);
    setActiveIndex(index);
  }, []);
  // close는 exit 애니메이션만 트리거하고, 실제 언마운트·포커스 복원은
  // 애니메이션이 끝난 뒤 handleExited에서 수행한다.
  const close = useCallback(() => {
    setClosing(true);
  }, []);
  const handleExited = useCallback(() => {
    const idx = activeIndexRef.current;
    setClosing(false);
    setActiveIndex(null);
    requestAnimationFrame(() => {
      if (idx === null) return;
      const el = triggerRefs.current[idx];
      if (!el) return;
      // 기본 focus()는 화면 밖 카드로 한 프레임에 점프 스크롤한다.
      // preventScroll로 분리한 뒤: 보이면 무스크롤, 1.5행 이내만 smooth,
      // 그 이상은 instant(원거리 smooth는 ~1s 스와이프 잔상이라 역효과).
      // reduced-motion은 CSS 전역 룰이 scrollIntoView 옵션을 못 덮으므로 JS 분기.
      el.focus({ preventScroll: true });
      const rect = el.getBoundingClientRect();
      const overflow =
        rect.top < 0 ? -rect.top : rect.bottom - window.innerHeight;
      if (overflow <= 0) return;
      const smooth =
        overflow <= rect.height * 1.5 &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
        block: "nearest",
      });
    });
  }, []);
  const step = useCallback(
    (delta: number) =>
      setActiveIndex((current) =>
        current === null
          ? current
          : (current + delta + ARTISTS.length) % ARTISTS.length
      ),
    []
  );
  const onPrev = useCallback(() => step(-1), [step]);
  const onNext = useCallback(() => step(1), [step]);

  // open이 stable이라 카드 목록은 마운트에 1번만 생성된다. 엘리먼트 동일성
  // bailout으로 모달 open/close/step마다 카드 전체(+ref 콜백 detach/attach)가
  // 재조정되는 것을 차단.
  const cards = useMemo(
    () =>
      ARTISTS.map((artist, index) => (
        <button
          key={artist.id}
          ref={(el) => {
            triggerRefs.current[index] = el;
          }}
          type="button"
          onClick={() => open(index)}
          aria-haspopup="dialog"
          aria-label={`View ${artist.name} profile`}
          className="group relative block w-full bg-ca-bg p-6 text-left transition-colors duration-300 hover:bg-ca-bg-hover active:bg-ca-bg-hover focus-visible:z-10"
        >
          <div className="relative mb-[18px] aspect-[3/4]">
            <div className="absolute inset-0 overflow-hidden bg-ca-bg-2">
              <ArtistPortrait
                image={artist.image}
                name={artist.name}
                variant="card"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <TapeCorners />
          </div>
          <div className="mb-1.5 font-display text-3xl uppercase leading-none tracking-[0.01em] transition-colors duration-300 group-hover:text-ca-red group-active:text-ca-red">
            {artist.name}
          </div>
          <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted lg:text-[13px]">
            <span>{ARTIST_ROLE_LABEL}</span>
            <span className="text-ca-red">{artist.city}</span>
          </div>
        </button>
      )),
    [open]
  );

  return (
    <section
      id="roster"
      aria-labelledby="roster-heading"
      className="border-t border-ca-line pt-20 pb-0 lg:pt-[120px]"
    >
      <SectionHead
        num="01"
        numLabel="TALENT"
        title="Roster"
        headingId="roster-heading"
        aside={`${ARTISTS.length} artists · By invitation.`}
      />
      <div className="grid grid-cols-2 gap-px border-y border-ca-line bg-ca-line lg:grid-cols-4">
        {cards}

        {bookingVisibility !== null ? (
          <BookingFiller visibility={bookingVisibility} />
        ) : null}

        {reservedVisibility !== null ? (
          <ReservedFiller
            visibility={reservedVisibility}
            slotLabel={reservedSlotLabel}
          />
        ) : null}
      </div>

      {activeIndex !== null ? (
        <ArtistModal
          artists={ARTISTS}
          index={activeIndex}
          closing={closing}
          onClose={close}
          onPrev={onPrev}
          onNext={onNext}
          onExited={handleExited}
        />
      ) : null}
    </section>
  );
}
