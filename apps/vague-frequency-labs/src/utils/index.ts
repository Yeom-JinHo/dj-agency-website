import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Messages } from "next-intl";
import { createMetadataFactory } from "@repo/utils/metadata";
import { canonicalPath, localeAlternates, ogLocales } from "./locale";
import { metadata as meta } from "@/app/config";

export const baseUrl = meta.site.url;

export const createMetadata = createMetadataFactory(meta);

export {
  canonicalPath,
  hasKoTwin,
  localeAlternates,
  localeUrl,
  ogLocales,
} from "./locale";

type MetadataNamespace = keyof Messages["Metadata"];

/**
 * locale별 페이지 메타데이터 — 번역 title/description + og:url·og:locale(:alternate)
 * + canonical/hreflang을 한 곳에서 조립한다. title이 없는 네임스페이스(home)는
 * layout의 절대 title을 그대로 쓴다. noindex 페이지는 `alternates: false`.
 */
export async function localizedMetadata({
  locale,
  path,
  namespace,
  keywords,
  alternates = true,
}: {
  locale: string;
  path: string;
  namespace: MetadataNamespace;
  keywords?: string[];
  alternates?: boolean;
}): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: `Metadata.${namespace}`,
  });
  const description = t("description");
  // title 키를 undefined로라도 넘기면 layout의 title(absolute/template) 상속이 끊긴다 —
  // 값이 있을 때만 키를 만든다. keywords도 같은 이유로 조건부.
  const title = t.has("title") ? { title: t("title") } : {};
  const kw = keywords ? { keywords } : {};
  return createMetadata({
    ...title,
    description,
    ...kw,
    openGraph: {
      url: canonicalPath(path, locale),
      ...title,
      description,
      ...ogLocales(locale),
    },
    twitter: { ...title, description },
    ...(alternates && { alternates: localeAlternates(path, locale) }),
  });
}
