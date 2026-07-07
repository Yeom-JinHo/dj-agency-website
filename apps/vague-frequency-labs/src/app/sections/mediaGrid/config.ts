export type MediaTile = {
  id: string;
  title: string;
  credit: string;
  spanClassName: string;
  aspectClassName: string;
};

/* 콘텐츠는 전부 placeholder — 실제 영상/이미지는 추후 교체.
   제목은 특정 아티스트에 묶지 않고 콘텐츠 유형만 예고한다. */
export const mediaTiles: MediaTile[] = [
  {
    id: "live-set",
    title: "Live Set",
    credit: "Seoul · 2026",
    spanClassName: "lg:col-span-7",
    aspectClassName: "aspect-[16/10]",
  },
  {
    id: "studio-session",
    title: "Studio Session",
    credit: "VFL Studio",
    spanClassName: "lg:col-span-5",
    aspectClassName: "aspect-[4/3]",
  },
  {
    id: "visualizer",
    title: "Visualizer",
    credit: "In Rotation",
    spanClassName: "lg:col-span-5",
    aspectClassName: "aspect-[4/3]",
  },
  {
    id: "backstage",
    title: "Backstage",
    credit: "Tour Archive",
    spanClassName: "lg:col-span-7",
    aspectClassName: "aspect-[16/10]",
  },
];
