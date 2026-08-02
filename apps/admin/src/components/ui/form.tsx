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

  return (
    <FormItemContext.Provider value={value}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
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
