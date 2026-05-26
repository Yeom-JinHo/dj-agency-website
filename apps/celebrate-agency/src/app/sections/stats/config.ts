export type Stat = {
  value: string;
  superscript: string | null;
  label: string;
};

export const stats: Stat[] = [
  { value: "6", superscript: "★", label: "Signed artists" },
  { value: "112", superscript: null, label: "Projects shipped" },
  { value: "6", superscript: null, label: "Years on the wall" },
  { value: "1", superscript: null, label: "City · Seoul" },
];
