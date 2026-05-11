import { SectionHead } from "@/components/SectionHead";

const SERVICES = [
  {
    num: "01",
    title: "Talent",
    tags: ["Bookings", "Negotiation", "Rights", "Tour ops"],
  },
  {
    num: "02",
    title: "Production",
    tags: ["Pre-pro", "Crew", "Locations", "Post"],
  },
  {
    num: "03",
    title: "Direction",
    tags: ["Campaign", "Brand films", "Editorial", "Identity"],
  },
  {
    num: "04",
    title: "Specials",
    tags: ["Print", "Exhibit", "Live", "Residency"],
  },
];

export default function Services() {
  return (
    <section id="services" className="border-t border-ca-line py-[120px]">
      <SectionHead
        num="03"
        numLabel="SERVICES"
        title="Services"
        aside={
          <>
            Four practices.
            <br />
            One roof.
          </>
        }
      />
      <div className="grid grid-cols-1 gap-px border-t border-ca-line bg-ca-line lg:grid-cols-2">
        {SERVICES.map((svc) => (
          <div
            key={svc.num}
            className="relative min-h-[280px] bg-ca-bg px-10 py-14"
          >
            <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ca-red">
              [ {svc.num} ]
            </div>
            <h3 className="mb-5 font-display text-[56px] uppercase leading-[0.95]">
              {svc.title}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {svc.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-ca-dim px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ca-fg"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
