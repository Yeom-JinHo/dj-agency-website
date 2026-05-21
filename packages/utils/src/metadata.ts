import type { Metadata } from "next";

export interface AppMetaConfig {
  author: {
    name: string;
    username: string;
    label: string;
    twitterHandle?: string;
  };
  site: {
    title: string;
    description: string;
    url: string;
    keywords: string[];
    language: string;
    charset: string;
    ogLocale?: string;
    /**
     * Path/URL for the default OG & Twitter card image, resolved against
     * `metadataBase`. Defaults to `/og` for backward compatibility; set this to
     * a served route (e.g. the `app/opengraph-image.png` convention path) to
     * override per app. Pages may still override `openGraph.images` themselves.
     */
    ogImage?: string;
  };
}

const DEFAULT_OG_LOCALE = "en_US";

function deriveImageAlt(
  title: Metadata["title"],
  fallback: string,
): string {
  if (typeof title === "string") return title || fallback;
  if (title && typeof title === "object") {
    if ("absolute" in title && title.absolute) return title.absolute;
    if ("default" in title && title.default) return title.default;
  }
  return fallback;
}

export function createMetadataFactory(meta: AppMetaConfig) {
  const baseUrl = meta.site.url;

  return function createMetadata(override: Metadata): Metadata {
    const imageAlt = deriveImageAlt(override.title, meta.site.title);
    const ogLocale = meta.site.ogLocale ?? DEFAULT_OG_LOCALE;
    const ogImageUrl = meta.site.ogImage ?? "/og";
    const twitterHandle = meta.author.twitterHandle;

    return {
      ...override,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        type: "website",
        title: override.title ?? undefined,
        description: override.description ?? undefined,
        url: baseUrl,
        locale: ogLocale,
        images: [
          {
            alt: imageAlt,
            width: 1200,
            height: 630,
            url: ogImageUrl,
            type: "image/png",
          },
        ],
        siteName: meta.site.title,
        ...override.openGraph,
      },
      twitter: {
        card: "summary_large_image",
        title: override.title ?? undefined,
        description: override.description ?? undefined,
        ...(twitterHandle
          ? { creator: twitterHandle, site: twitterHandle }
          : {}),
        images: [
          {
            alt: imageAlt,
            width: 1200,
            height: 630,
            url: ogImageUrl,
          },
        ],
        ...override.twitter,
      },
      keywords: [
        ...meta.site.keywords,
        ...(Array.isArray(override.keywords)
          ? override.keywords
          : override.keywords
            ? [override.keywords]
            : []),
      ],
      creator: meta.author.username,
      metadataBase: new URL(baseUrl),
    };
  };
}
