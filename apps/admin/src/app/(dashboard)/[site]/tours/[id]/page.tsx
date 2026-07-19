import { notFound } from "next/navigation";
import { adminGetTourById, adminListArtists } from "@repo/content/admin-queries";
import { siteSlugSchema } from "@repo/content/schema";

import { mediaUrl } from "@/lib/media";
import { TourForm } from "../tour-form";
import { type TourFormValues } from "../schema";
import { DeleteTourButton } from "../delete-tour-button";

export const dynamic = "force-dynamic";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ site: string; id: string }>;
}) {
  const { site: siteParam, id } = await params;
  const parsed = siteSlugSchema.safeParse(siteParam);
  if (!parsed.success) notFound();
  const site = parsed.data;

  const [tour, artists] = await Promise.all([
    adminGetTourById(id),
    adminListArtists(site),
  ]);

  // 다른 사이트 소속 투어를 이 사이트 라우트로 편집하지 못하게 소속 가드.
  if (!tour || tour.siteSlug !== site) notFound();

  const defaultValues: TourFormValues = {
    title: tour.title,
    artistId: tour.artistId ?? "",
    venue: tour.venue ?? "",
    city: tour.city ?? "",
    country: tour.country ?? "",
    // 실제 값은 form이 initialEventDateIso로 datetime-local 변환(브라우저 TZ). 여기선 플레이스홀더.
    eventDate: "",
    doorTime: tour.doorTime ?? "",
    ticketUrl: tour.ticketUrl ?? "",
    descriptionEn: tour.descriptionEn ?? "",
    descriptionKo: tour.descriptionKo ?? "",
    status: tour.status,
    sortOrder: tour.sortOrder,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {tour.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            투어를 편집합니다. 저장하면 즉시 사이트에 반영됩니다.
          </p>
        </div>
        <DeleteTourButton
          site={site}
          tourId={tour.id}
          tourTitle={tour.title}
        />
      </div>
      <TourForm
        mode="edit"
        site={site}
        tourId={tour.id}
        slug={tour.slug}
        defaultValues={defaultValues}
        initialEventDateIso={tour.eventDate}
        artists={artists}
        initialPosterUrl={mediaUrl(tour.posterPath)}
      />
    </div>
  );
}
