import { Anton, Space_Mono } from "next/font/google";
import localFont from "next/font/local";

// [locale]/layout과 루트 not-found(자체 <html> 렌더)가 같은 폰트 변수를 쓴다.
const pretendard = localFont({
  src: "../../public/fonts/PretendardStdVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
  weight: "45 920",
});

// Worldwide hero typography (DJ Hero handoff): condensed poster English (Anton)
// + monospace labels. Anton is Latin-only, so Korean headings fall back to
// Pretendard (already loaded for body) instead of registering an extra font.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

export const fontClassName = `${pretendard.variable} ${anton.variable} ${spaceMono.variable} font-sans antialiased`;
