"use client";

import type { Transition, Variant } from "motion/react";
import type {
  CSSProperties,
  Dispatch,
  KeyboardEvent,
  MutableRefObject,
  Ref,
  ReactNode,
  SetStateAction,
} from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import useClickOutside from "@/hooks/useClickOutside";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
} from "motion/react";
import { createPortal } from "react-dom";

import { cn } from "@repo/ui";
import { Icon } from "@repo/ui/common/Icon";

const MotionImage = motion(Image);

export interface MorphingDialogContextType {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  uniqueId: string;
  triggerRef: MutableRefObject<HTMLDivElement | null>;
}

const MorphingDialogContext = createContext<MorphingDialogContextType | null>(
  null
);

function useMorphingDialog() {
  const context = useContext(MorphingDialogContext);
  if (!context) {
    // 웹뷰 안전성을 위해 에러 대신 경고 출력
    console.warn(
      "useMorphingDialog must be used within a MorphingDialogProvider, returning default values"
    );
    return {
      isOpen: false,
      setIsOpen: () => {},
      uniqueId: "fallback-id",
      triggerRef: { current: null } as MutableRefObject<HTMLDivElement | null>,
    };
  }
  return context;
}

export interface MorphingDialogProviderProps {
  children: ReactNode;
  transition?: Transition;
}

function MorphingDialogProvider({
  children,
  transition,
}: MorphingDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);

  const contextValue = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      uniqueId,
      triggerRef,
    }),
    [isOpen, uniqueId]
  );

  return (
    <MorphingDialogContext.Provider value={contextValue}>
      <MotionConfig
        transition={{
          type: "tween",
          duration: 0.3,
          ease: "easeOut",
          ...(transition ?? {}),
        }}
      >
        {children}
      </MotionConfig>
    </MorphingDialogContext.Provider>
  );
}

export interface MorphingDialogProps {
  children: ReactNode;
  transition?: Transition;
}

function MorphingDialog({
  children,
  transition,
}: MorphingDialogProps) {
  const groupId = useId();

  return (
    <MorphingDialogProvider transition={transition}>
      <LayoutGroup id={`dialog-container-${groupId}`}>{children}</LayoutGroup>
    </MorphingDialogProvider>
  );
}

export interface MorphingDialogTriggerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  triggerRef?: Ref<HTMLDivElement>;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as MutableRefObject<T | null>).current = value;
}

function MorphingDialogTrigger({
  children,
  className,
  style,
  triggerRef,
}: MorphingDialogTriggerProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef: contextTriggerRef } =
    useMorphingDialog();

  const handleClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen]
  );
  const handleTriggerRef = useCallback(
    (node: HTMLDivElement | null) => {
      contextTriggerRef.current = node;
      assignRef(triggerRef, node);
    },
    [contextTriggerRef, triggerRef],
  );

  return (
    <motion.div
      ref={handleTriggerRef}
      layout="position"
      layoutId={`dialog-${uniqueId}`}
      className={cn("relative cursor-pointer", className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={style}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={`motion-ui-morphing-dialog-content-${uniqueId}`}
      aria-label={`Open dialog ${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

export interface MorphingDialogContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function MorphingDialogContent({
  children,
  className,
  style,
}: MorphingDialogContentProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(isOpen);
  const [firstFocusableElement, setFirstFocusableElement] =
    useState<HTMLElement | null>(null);
  const [lastFocusableElement, setLastFocusableElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (event.key === "Tab") {
        if (!firstFocusableElement || !lastFocusableElement) return;

        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            event.preventDefault();
            lastFocusableElement.focus();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            event.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsOpen, firstFocusableElement, lastFocusableElement]);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;

    if (isOpen) {
      document.body.classList.add("overflow-hidden");

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        const first = focusableElements[0] as HTMLElement;
        const last = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        setFirstFocusableElement(first);
        setLastFocusableElement(last);
        first.focus();
      } else if (containerRef.current) {
        setFirstFocusableElement(containerRef.current);
        setLastFocusableElement(containerRef.current);
        containerRef.current.focus();
      }
    } else {
      setFirstFocusableElement(null);
      setLastFocusableElement(null);
      document.body.classList.remove("overflow-hidden");

      if (wasOpen) {
        triggerRef.current?.focus();
      }
    }

    wasOpenRef.current = isOpen;

    return () => {
      if (isOpen) {
        document.body.classList.remove("overflow-hidden");
      }
    };
  }, [isOpen, triggerRef]);

  useClickOutside(containerRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  return (
    <motion.div
      ref={containerRef}
      layout="position"
      layoutId={`dialog-${uniqueId}`}
      id={`motion-ui-morphing-dialog-content-${uniqueId}`}
      className={cn("overflow-hidden", className)}
      style={{
        ...style,
        contain: "layout paint",
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-labelledby={`motion-ui-morphing-dialog-title-${uniqueId}`}
      aria-describedby={`motion-ui-morphing-dialog-description-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

export interface MorphingDialogContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function MorphingDialogContainer({ children }: MorphingDialogContainerProps) {
  const { isOpen, uniqueId } = useMorphingDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          <motion.div
            key={`backdrop-${uniqueId}`}
            className="fixed inset-0 h-full w-full bg-white/40 dark:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pt-[calc(env(safe-area-inset-top)+4rem)] md:pt-0">
            {children}
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export interface MorphingDialogTitleProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function MorphingDialogTitle({
  children,
  className,
  style,
}: MorphingDialogTitleProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      id={`motion-ui-morphing-dialog-title-${uniqueId}`}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export interface MorphingDialogSubtitleProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function MorphingDialogSubtitle({
  children,
  className,
  style,
}: MorphingDialogSubtitleProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      className={className}
      style={style}
      id={`motion-ui-morphing-dialog-subtitle-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

export interface MorphingDialogDescriptionProps {
  children: ReactNode;
  className?: string;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
}

function MorphingDialogDescription({
  children,
  className,
  variants,
}: MorphingDialogDescriptionProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      key={`dialog-description-${uniqueId}`}
      variants={variants}
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      id={`motion-ui-morphing-dialog-description-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

export interface MorphingDialogImageProps {
  src: string | StaticImageData;
  alt: string;
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  objectFit?: CSSProperties["objectFit"];
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

function MorphingDialogImage({
  src,
  alt,
  className,
  style,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  quality = 75,
  objectFit = "cover",
  placeholder,
  blurDataURL,
  onLoad,
  onError,
}: MorphingDialogImageProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <MotionImage
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      decoding="async"
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={onLoad}
      onError={onError}
      className={cn("object-cover", className)}
      layout
      layoutId={`dialog-img-${uniqueId}`}
      style={{
        ...style,
        willChange: "transform",
        objectFit,
      }}
    />
  );
}

export interface MorphingDialogCloseProps {
  children?: ReactNode;
  className?: string;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
}

function MorphingDialogClose({
  children,
  className,
  variants,
}: MorphingDialogCloseProps) {
  const { setIsOpen, uniqueId } = useMorphingDialog();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <motion.button
      onClick={handleClose}
      type="button"
      aria-label="Close dialog"
      key={`dialog-close-${uniqueId}`}
      className={cn(
        "absolute top-4 right-4 flex items-center justify-center rounded-full p-2.5 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
        className
      )}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      {children || <Icon name="LuClose" size={24} />}
    </motion.button>
  );
}

export {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
};
