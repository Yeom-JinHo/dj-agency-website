"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { TOUR_STATUSES, type SiteSlug } from "@repo/content/schema";

import { slugify } from "@/lib/media";
import { useEntityFormSubmit } from "@/lib/use-entity-form-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormActions } from "@/components/form-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  /** artist select 옵션(같은 사이트 로스터 id+name). */
  artists: { id: string; name: string }[];
  initialPosterUrl?: string | null;
}

/** 파일 선택 + 미리보기(업로드 전 클라이언트 표시, §4.4). */
function ImageField({
  label,
  initialUrl,
  file,
  onFile,
}: {
  label: string;
  initialUrl: string | null;
  file: File | null;
  onFile: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border">
          {preview ? (
            <Image
              src={preview}
              alt={label}
              width={80}
              height={80}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground text-xs">No image</span>
          )}
        </div>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
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
  const [posterFile, setPosterFile] = useState<File | null>(null);

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

  const titleValue = form.watch("title");
  const slugPreview = mode === "create" ? slugify(titleValue) : (slug ?? "");

  const listHref = `/${site}/tours`;

  const { submitting, onSubmit, onInvalid, onCancel } = useEntityFormSubmit({
    mode,
    listHref,
    createdMessage: "투어를 만들었습니다.",
    // 파일 선택은 RHF 밖 상태라 isDirty에 안 잡힌다 — 함께 미저장으로 취급.
    hasUnsaved: form.formState.isDirty || posterFile !== null,
    buildFormData: (values: TourFormValues) => {
      const fd = new FormData();
      // datetime-local → ISO 변환은 여기(클라이언트)에서 — 브라우저 TZ 기준.
      const payload = {
        ...values,
        eventDate: localInputToIso(values.eventDate),
      };
      fd.set("payload", JSON.stringify(payload));
      if (posterFile) fd.set("posterImage", posterFile);
      return fd;
    },
    create: (fd) => createTour(site, fd),
    update: (fd) => updateTour(site, tourId!, fd),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {/* 제출 중 전체 필드 잠금 — 서버 왕복 동안의 편집 경합을 막는다. */}
        <fieldset disabled={submitting} className="max-w-2xl min-w-0 space-y-6">
        {/* 기본 정보 */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-sm font-medium">기본 정보</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="투어 제목" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Slug</FormLabel>
              <Input value={slugPreview} readOnly disabled className="font-mono" />
              <p className="text-muted-foreground text-xs">
                {mode === "create"
                  ? "제목에서 자동 생성됩니다. 생성 후 변경할 수 없습니다."
                  : "slug는 생성 후 변경할 수 없습니다."}
              </p>
            </FormItem>

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
                  <p className="text-muted-foreground text-xs">
                    사이트에서 노출되는 순서(작을수록 먼저).
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 일정 · 장소 */}
        <Card className="gap-4 py-4">
          <CardHeader>
            <h2 className="text-sm font-medium">일정 · 장소</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>공연 일시</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
          <CardHeader>
            <h2 className="text-sm font-medium">설명</h2>
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
          <CardHeader>
            <h2 className="text-sm font-medium">포스터</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageField
              label="포스터 이미지"
              initialUrl={initialPosterUrl}
              file={posterFile}
              onFile={setPosterFile}
            />
          </CardContent>
        </Card>

        <FormActions>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "저장 중…"
              : mode === "create"
                ? "투어 만들기"
                : "변경사항 저장"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        </FormActions>
        </fieldset>
      </form>
    </Form>
  );
}
