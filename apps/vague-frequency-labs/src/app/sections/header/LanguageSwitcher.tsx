"use client";

import { Fragment } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// 같은 페이지의 반대 locale로 이동하는 EN/KO 텍스트 토글.
// usePathname은 locale prefix가 제거된 경로를 돌려주므로 동적 세그먼트도 보존된다.
export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("A11y");

  return (
    <nav
      aria-label={t("switchLocale")}
      className={`font-mono flex items-center text-[13px] uppercase tracking-[0.18em] ${className}`}
    >
      {routing.locales.map((code, index) => {
        const isActive = code === locale;
        return (
          <Fragment key={code}>
            {index > 0 && (
              <span aria-hidden className="px-1 text-[#eceae3]/30">
                /
              </span>
            )}
            <Link
              href={pathname}
              locale={code}
              aria-current={isActive ? "true" : undefined}
              className={[
                "rounded-sm px-1 py-1.5 underline-offset-4 transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
                isActive
                  ? "text-[#eceae3]"
                  : "text-[#eceae3]/55 hover:text-[#eceae3]",
              ].join(" ")}
            >
              {code.toUpperCase()}
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
