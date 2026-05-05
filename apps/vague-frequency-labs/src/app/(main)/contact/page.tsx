"use client";

import type { ReactElement } from "react";
import React from "react";
import Script from "next/script";
import FancyLine from "@repo/ui/common/FancyLine";
import TextReveal from "@repo/ui/common/TextReveal";

// Naver Maps 타입 선언
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: string, options: any) => void;
        LatLng: new (lat: number, lng: number) => void;
        Marker: new (options: any) => void;
        Point: new (x: number, y: number) => void;
      };
    };
  }
}

// TODO: 수정필요
// export const metadata = createMetadata({
//   title,
//   description,
//   openGraph: {
//     url: "/music",
//     title,
//     description,
//   },
//   twitter: {
//     title,
//     description,
//   },
// });

// const jsonLd: WithContext<CollectionPage> = {
//   "@context": "https://schema.org",
//   "@type": "CollectionPage",
//   name: title,
//   description,
//   url: `${meta.site.url}/music`,
//   isPartOf: {
//     "@type": "WebSite",
//     name: meta.site.title,
//     url: meta.site.url,
//   },
//   hasPart: [...project.getPages()].map((project) => ({
//     "@type": "SoftwareApplication",
//     name: project.data.title,
//     description: project.data.description,
//     url: project.url,
//     applicationCategory: "WebApplication",
//   })),
// };

export default function ContactPage(): ReactElement {
  // useEffect(() => {
  //   const mapOptions = {
  //     center: new naver.maps.LatLng(37.3595704, 127.105399),
  //     zoom: 10,
  //   };

  //   const map = new naver.maps.Map("map", mapOptions);
  // }, []);

  const initMap = (x: number, y: number) => {
    if (typeof window === "undefined") return;
    const container = document.getElementById("map");
    if (!container || !window.naver.maps) return;
    const map = new window.naver.maps.Map("map", {
      center: new window.naver.maps.LatLng(x, y),
      zoom: 16,
      mapTypeControl: true,
      zoomControl: true,
    });

    new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(x, y),
      map,
      icon: {
        path: [
          new window.naver.maps.Point(0, 70),
          new window.naver.maps.Point(20, 100),
          new window.naver.maps.Point(40, 70),
          new window.naver.maps.Point(30, 70),
          new window.naver.maps.Point(70, 0),
          new window.naver.maps.Point(10, 70),
        ],
        style: "closedPath",
        anchor: new window.naver.maps.Point(23, 103),
        fillColor: "#ffffff",
        fillOpacity: 1,
        strokeColor: "#000000",
        strokeStyle: "solid",
        strokeWeight: 3,
      },
    });
  };

  return (
    <main className="my-16 flex-1">
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          // 그랜드센트럴 좌표 (서울특별시 중구 세종대로 14)
          initMap(37.5665, 126.978);
        }}
      />

      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      /> */}
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="hero"
      >
        <div className="flex w-full flex-col items-center md:max-w-7xl">
          <TextReveal
            as="h1"
            className="leading-wide tracking-relaxed text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            Contact
          </TextReveal>

          <FancyLine className={"mt-16"} />
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden">
            <div className="flex w-full flex-col">
              <div className="space-y-4 p-8">
                <TextReveal
                  as="h2"
                  className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
                >
                  Address
                </TextReveal>
                <div className="space-y-4">
                  <TextReveal
                    as="p"
                    className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
                  >
                    서울특별시 중구 세종대로 110(수정)
                  </TextReveal>
                </div>
              </div>
              <div className="space-y-4 p-8">
                <TextReveal
                  as="h2"
                  className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
                >
                  Email
                </TextReveal>
                <div className="space-y-4">
                  <TextReveal
                    as="p"
                    className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
                  >
                    vaguefrequencylabs@gmail.com
                  </TextReveal>
                </div>
              </div>
            </div>

            <div id="map" className="h-[400px] w-full"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
