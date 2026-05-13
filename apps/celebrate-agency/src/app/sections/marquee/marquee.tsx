import { ARTISTS } from '@/consts/artists';

export default function Marquee() {
  const loop = [...ARTISTS.map((artist) => artist.name), ...ARTISTS.map((artist) => artist.name)];
  return (
    <div
      aria-hidden="true"
      className="mt-10 overflow-hidden border-y border-ca-line bg-ca-bg py-5 lg:mt-[60px] lg:py-6"
    >
      <div className="flex w-max animate-marquee gap-[60px] whitespace-nowrap">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-[60px] font-display text-5xl uppercase tracking-[0.02em]"
          >
            {item}
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-ca-red" />
          </span>
        ))}
      </div>
    </div>
  );
}
