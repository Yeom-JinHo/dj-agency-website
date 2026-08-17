"use client"

import * as React from "react"
import type { Label as LabelPrimitive } from "radix-ui"
import { Slot } from "radix-ui"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id, hasDescription, setHasDescription } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    hasDescription,
    setHasDescription,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
  /**
   * 이 필드에 FormDescription이 실제로 렌더됐는지. FormControl이 설명 id를
   * 무조건 참조하면 설명 없는 필드는 존재하지 않는 요소를 가리키게 되고,
   * 그 끊어진 IDREF는 스크린리더에서 aria-describedby 전체를 무의미하게 만든다.
   */
  hasDescription: boolean
  setHasDescription: (value: boolean) => void
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  // 설명 유무를 children 검사로 알아내면 FormControl/FormMessage를 감싸는 div
  // 같은 중첩 배치(release-form의 플랫폼 링크)에서 놓친다. FormDescription이
  // 마운트하며 스스로 등록하게 두면 배치와 무관하게 정확하다 — 대가는 설명이
  // 있는 필드에서 마운트 직후 1회 추가 렌더뿐이다.
  const [hasDescription, setHasDescription] = React.useState(false)
  const value = React.useMemo(
    () => ({ id, hasDescription, setHasDescription }),
    [id, hasDescription]
  )

  // content-start: 이 그리드는 라벨·컨트롤·설명·메시지를 세로로 "쌓기만" 하는 장치다.
  // 그런데 grid의 기본 align-content(normal→stretch)는 셀이 내용보다 커지면 남는 높이를
  // 암시적 행들에 나눠 주고, 그 첫 수혜자가 라벨 행이라 라벨 박스가 세로로 늘어나며
  // 그 아래 컨트롤이 통째로 밀린다. Label이 leading-none이라 본래 14px인 박스가
  // 34px까지 부푸는 식이다(실측: 아티스트 편집 "설명" 카드의 전체 설명 EN/KO —
  // 두 FormItem의 top은 356px로 같은데 textarea top이 378 vs 398로 20px 갈라졌다).
  // sm:grid-cols-2 블록은 행 stretch로 두 셀 높이를 긴 쪽에 맞추므로, 좌우 내용
  // 길이가 다른 순간(설명 EN/KO, 레이블/발매일, 플랫폼 링크 2열, 한쪽에만 뜬 에러
  // 메시지) 짧은 쪽 입력창만 아래로 내려가 상단선이 어긋난다. 남는 높이를 라벨 행이
  // 아니라 블록 끝(보이지 않는 여백)으로 흘려보내면 좌우 입력창이 같은 선에서 시작한다.
  //
  // 왜 여기(shadcn 원본)를 고치는가 — 이 앱은 ui/* 수정에 신중하지만, 이 결함의 층위가
  // 여기다: FormItem의 그리드는 남는 높이를 배분할 의도가 애초에 없으므로 stretch는
  // 원본의 미지정 동작이지 계약이 아니다. 게다가 이 파일은 이미 hasDescription 컨텍스트로
  // 원본에서 벗어나 있어(위 주석) 유틸리티 한 개 추가가 새 층을 만드는 것보다 얕다.
  // 기각한 대안:
  // (1) 2열 컨테이너마다 items-start — 폼 3종에 흩어진 8곳을 고쳐야 하고, 앞으로 2열
  //     블록을 추가할 때마다 같은 걸 다시 빠뜨린다. 증상이 나는 자리마다 붙이는 처방이다.
  // (2) textarea의 field-sizing-content 제거 — 20px 차이를 만든 계기일 뿐 원인이 아니다.
  //     좌우 높이가 다른 건 2열 폼의 정상 상태고(에러 메시지 하나만 떠도 벌어진다),
  //     긴 본문을 스크롤 없이 보는 실익을 계기라는 이유로 버릴 근거가 못 된다.
  // (3) 앱 전용 래퍼(FormRow 등) 신설 — 호출부 전부를 갈아타게 만드는 단일 목적 추상화.
  //
  // 부작용: stretch가 없는 배치에선 배분할 높이 자체가 없어 no-op다 — 로그인 폼과
  // 1열 space-y 블록(간격은 그대로 gap-2), items-start를 이미 쓰는 소셜 링크 행,
  // 셀 안에 래퍼 div를 두는 배치가 모두 여기 해당한다. FormMessage가 떴다 사라질 때도
  // 오히려 안정적이다: 종전엔 메시지가 뜨며 셀 높이가 변하면 라벨 행 배분이 바뀌어
  // 입력창이 위아래로 튀었지만, 이제 컨트롤은 제자리에 있고 메시지만 아래에 붙고 빠진다.
  return (
    <FormItemContext.Provider value={value}>
      <div
        data-slot="form-item"
        className={cn("grid content-start gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot.Root>) {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId,
    hasDescription,
  } = useFormField()

  // 실제로 렌더된 요소만 참조한다 — 원본은 설명 id를 무조건 붙여 대부분의 필드가
  // 끊어진 IDREF를 갖고 있었다. 참조할 게 없으면 속성 자체를 생략한다.
  const describedBy =
    [hasDescription ? formDescriptionId : null, error ? formMessageId : null]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={describedBy}
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId, setHasDescription } = useFormField()

  // 조건부로 걸리거나 언마운트되는 설명도 있을 수 있으니 cleanup에서 되돌린다.
  React.useEffect(() => {
    setHasDescription(true)
    return () => setHasDescription(false)
  }, [setHasDescription])

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
