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
     * override per app. `.jpg`/`.jpeg` URLs are emitted as `image/jpeg`,
     * everything else as `image/png`. Pages may still override
     * `openGraph.images` themselves — supply matching `twitter.images` if the
     * cards should stay in sync.
     */
    ogImage?: string;
  };
}

const DEFAULT_OG_LOCALE = "en_US";

export function createMetadataFactory(meta: AppMetaConfig) {
  const baseUrl = meta.site.url;

  return function createMetadata(override: Metadata): Metadata {
    const ogLocale = meta.site.ogLocale ?? DEFAULT_OG_LOCALE;
    const ogImageUrl = meta.site.ogImage ?? "/og";
    const ogImageType =
      ogImageUrl.endsWith(".jpg") || ogImageUrl.endsWith(".jpeg")
        ? "image/jpeg"
        : "image/png";
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
            alt: meta.site.title,
            width: 1200,
            height: 630,
            url: ogImageUrl,
            type: ogImageType,
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
            alt: meta.site.title,
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
