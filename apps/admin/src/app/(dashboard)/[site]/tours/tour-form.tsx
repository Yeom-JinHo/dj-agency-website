"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { TOUR_STATUSES, type SiteSlug } from "@repo/content/schema";

import { slugify } from "@/lib/media";
import { hasSiteCategory } from "@/lib/sites";
import { useEntityFormSubmit } from "@/lib/use-entity-form-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormActions } from "@/components/form-actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import {
  EMPTY_IMAGE_FIELD,
  ImageField,
  isImageFieldDirty,
  type ImageFieldValue,
} from "@/components/image-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { tourFormSchema, type TourFormValues } from "./schema";
import { createTour, updateTour } from "./actions";

/** status 선택 라벨(표시 전용). */
const STATUS_LABELS: Record<(typeof TOUR_STATUSES)[number], string> = {
  scheduled: "예정",
  soldout: "매진",
  cancelled: "취소",
};

/** artist select의 "미지정" 센티널(아티스트 id는 uuid라 충돌 없음 — Radix는 빈 value 불가). */
const NO_ARTIST = "none";

/**
 * ISO(timestamptz) → datetime-local input 값("YYYY-MM-DDTHH:mm"). 브라우저 로컬
 * 벽시계 기준으로 변환해야 편집자 TZ와 일치 — 서버에서 하면 서버 TZ가 끼어든다.
 */
function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local 값 → ISO. 브라우저가 로컬 벽시계로 해석하도록 클라이언트에서 변환. */
function localInputToIso(local: string): string {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? local : d.toISOString();
}

interface TourFormProps {
  mode: "create" | "edit";
  /** 소속 사이트(라우트에서 부여). 링크·redirect·서버 액션에 전달. */
  site: SiteSlug;
  tourId?: string;
  /** edit 모드: 기존 slug(불변, 읽기 전용 표시). */
  slug?: string;
  defaultValues: TourFormValues;
  /** edit 모드: 기존 event_date(ISO) — 클라이언트에서 datetime-local로 변환. */
  initialEventDateIso?: string;
  /** artist select 옵션(같은 사이트 로스터 id+name). 아티스트 미노출 사이트에선 빈 배열. */
  artists: { id: string; name: string }[];
  initialPosterUrl?: string | null;
}

export function TourForm({
  mode,
  site,
  tourId,
  slug,
  defaultValues,
  initialEventDateIso,
  artists,
  initialPosterUrl = null,
}: TourFormProps) {
  const [poster, setPoster] = useState<ImageFieldValue>(EMPTY_IMAGE_FIELD);

  const form = useForm<TourFormValues>({
    // login/page.tsx와 동일: zodResolver 대신 standardSchemaResolver(zod v4 브랜드 충돌 회피).
    resolver: standardSchemaResolver(tourFormSchema),
    // event_date는 브라우저 로컬 기준으로 datetime-local로 변환(서버 TZ 회피).
    defaultValues: {
      ...defaultValues,
      eventDate: initialEventDateIso
        ? isoToLocalInput(initialEventDateIso)
        : defaultValues.eventDate,
    },
  });

  /**
   * 로스터 셀렉트는 아티스트를 노출하는 사이트에서만(SITE_CATEGORY_SEGMENTS) —
   * 릴리즈 폼과 같은 규칙이고 근거도 같다(release-form.tsx 주석). 다만 tours에는
   * releases.artist_credit 같은 자유 텍스트 대체 필드가 없다. 지금 투어를 쓰는 juntaro는
   * 공개 화면(app/tour/page.tsx·components/tour-list.tsx)에서 아티스트를 렌더하지 않아
   * 감춰도 잃는 표시가 없고, 나중에 투어에 아티스트명을 내야 하면 그때 컬럼을 추가한다.
   * 여기서도 값은 지우지 않고 렌더만 막는다 — 이유는 release-form.tsx 주석 참고.
   */
  const showArtistSelect = hasSiteCategory(site, "artists");

  const titleValue = form.watch("title");
  const slugPreview = mode === "create" ? slugify(titleValue) : (slug ?? "");
  const slugFieldId = useId();
  // "생성 후 변경할 수 없습니다"는 지금 입력을 되돌릴 수 없다는 규칙이라 필드에 묶어야
  // 낭독된다. RHF 필드가 아니라 FormDescription을 못 써 id를 직접 만든다(라벨과 같은 방식).
  const slugHintId = useId();

  const listHref = `/${site}/tours`;

  const { submitting, onSubmit, onInvalid, onCancel } = useEntityFormSubmit({
    form,
    mode,
    listHref,
    createdMessage: "투어를 만들었습니다.",
    // 파일 선택·제거는 RHF 밖 상태라 isDirty에 안 잡힌다 — 함께 미저장으로 취급.
    hasUnsaved: form.formState.isDirty || isImageFieldDirty(poster),
    buildFormData: (values: TourFormValues) => {
      const fd = new FormData();
      // datetime-local → ISO 변환은 여기(클라이언트)에서 — 브라우저 TZ 기준.
      const payload = {
        ...values,
        eventDate: localInputToIso(values.eventDate),
      };
      fd.set("payload", JSON.stringify(payload));
      if (poster.file) fd.set("posterImage", poster.file);
      if (poster.removed) fd.set("removePosterImage", "1");
      return fd;
    },
    create: (fd) => createTour(site, fd),
    update: (fd) => updateTour(site, tourId!, fd),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        aria-busy={submitting}
      >
        {/* max-w-4xl: 사이드바(16rem)+콘텐츠 패딩과 합쳐 1200px — 1366 노트북까지 들어가고
            사이드바 도입 전 값(2xl)이 남기던 우측 여백을 회수한다. 긴 텍스트의 measure는
            설명 카드의 2열 그리드가 잡는다(한 열 ≈55자). 스켈레톤도 같은 폭이어야 한다.
            액션 바까지 이 폭 안에 있어야 sticky 바의 border-t가 폼과 같은 너비로 그어진다. */}
        <div className="max-w-4xl min-w-0 space-y-6">
        {/* 제출 중 입력 필드 잠금 — 서버 왕복 동안의 편집 경합을 막는다. 저장·취소 버튼은
            fieldset 밖이다: disabled가 되는 순간 브라우저가 blur시켜 Enter로 저장한
            키보드 사용자가 탭 위치를 잃는다(FormSubmitButton 주석 참고). */}
        <fieldset disabled={submitting} className="min-w-0 space-y-6">
        {/* 섹션 제목 text-lg + 구분선 — 페이지 제목(text-2xl)과 필드 라벨(text-sm) 사이에
            한 단씩 벌려야 카드가 이어지는 폼에서 섹션 경계가 잡힌다(text-base는 라벨과
            한 단 차이뿐이었다). border-b는 CardHeader의 [.border-b]:pb-6 훅을 깨우는데,
            카드는 py-4 리듬이지만 pb-4로 덮으려면 !important가 필요하고(훅 선택자가 :is()로
            한 단 높다) 이 앱엔 그 선례가 없어 24px을 그대로 받아들인다. */}
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">기본 정보</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  {/* 필수 표시 — 별표는 시각 전용(aria-hidden), 의미는 aria-required가
                      전달한다(release-form.tsx 제목 필드와 같은 패턴). */}
                  <FormLabel>
                    제목
                    <span aria-hidden className="text-destructive -ml-1">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="투어 제목" aria-required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* slug는 RHF 필드가 아니라 제목에서 파생되는 읽기 전용 표시라 FormItem/FormLabel을 쓰지 않는다 —
                FormLabel의 htmlFor는 FormControl이 부여하는 id를 가리키는데 여기엔 FormControl이 없어
                라벨이 존재하지 않는 id를 가리키고 있었다(스크린리더가 이름 없는 필드로 읽음).
                RHF 관여가 없으니 일반 Label + useId로 직접 연결한다. 마크업(grid gap-2)은 FormItem과 동일. */}
            <div className="grid gap-2">
              <Label htmlFor={slugFieldId}>Slug</Label>
              <Input
                id={slugFieldId}
                value={slugPreview}
                readOnly
                aria-describedby={slugHintId}
                className="bg-muted font-mono"
              />
              <p id={slugHintId} className="text-muted-foreground text-xs">
                {mode === "create"
                  ? "제목에서 자동 생성됩니다. 생성 후 변경할 수 없습니다."
                  : "slug는 생성 후 변경할 수 없습니다."}
              </p>
            </div>

            {showArtistSelect && (
              <FormField
                control={form.control}
                name="artistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>아티스트</FormLabel>
                    <Select
                      value={field.value ? field.value : NO_ARTIST}
                      onValueChange={(v) =>
                        field.onChange(v === NO_ARTIST ? "" : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="아티스트 없음" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_ARTIST}>아티스트 없음</SelectItem>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TOUR_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>정렬 순서</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      className="w-32"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  {/* 생 <p> 대신 FormDescription — FormControl의 aria-describedby가
                      이 요소를 가리켜야 정렬 규칙이 필드와 함께 낭독된다.
                      text-xs는 기존 크기 유지용(기본값은 text-sm). */}
                  <FormDescription className="text-xs">
                    사이트에서 노출되는 순서(작을수록 먼저).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 일정 · 장소 */}
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">일정 · 장소</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      공연 일시
                      <span aria-hidden className="text-destructive -ml-1">
                        *
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" aria-required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doorTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>도어 오픈</FormLabel>
                    <FormControl>
                      <Input placeholder="10PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>장소</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>도시</FormLabel>
                    <FormControl>
                      <Input placeholder="Seoul" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>국가</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ticketUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>티켓 URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 설명 (en/ko) */}
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">설명</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["descriptionEn", "설명 (EN)"],
                  ["descriptionKo", "설명 (KO)"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 포스터 */}
        <Card className="gap-4 py-4">
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">포스터</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageField
              label="포스터 이미지"
              initialUrl={initialPosterUrl}
              value={poster}
              onChange={setPoster}
            />
          </CardContent>
        </Card>

        </fieldset>

        <FormActions>
          <FormSubmitButton busy={submitting}>
            {submitting
              ? "저장 중…"
              : mode === "create"
                ? "투어 만들기"
                : "변경사항 저장"}
          </FormSubmitButton>
          {/* 취소는 fieldset 밖으로 나왔지만 잠금은 유지 — 저장 왕복 중 이탈은 막아야
              한다. 포커스를 쥔 채 disabled가 되는 경로가 없어(취소 버튼은 제출을
              시작시키지 않는다) 저장 버튼과 달리 disabled를 그대로 쓴다. */}
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onCancel}
          >
            취소
          </Button>
        </FormActions>
        </div>
      </form>
    </Form>
  );
}
