"use client";

import { useEffect, useRef } from "react";
import { Renderer, Triangle, Program, Mesh, Texture } from "ogl";
import { FRAGMENT, VERTEX } from "./shaders";

export interface DepthParallaxProps {
  /** 컬러 사진 URL */
  image: string;
  /** 흑백 깊이맵 URL (흰색 = 가까움) */
  depth: string;
  /** 움직이지 않을 초점 평면 (0..1). 기본 0.5 */
  focus?: number;
  /** hold 시 최대 줌. 기본 1.35 */
  maxZoom?: number;
  /** 마우스 시차 강도. 기본 0.04 */
  parallax?: number;
  /** 색수차 강도. 기본 0.006 */
  aberration?: number;
  /** 비네팅 강도 (0..1). 기본 0.5 */
  vignette?: number;
  className?: string;
  /** 접근성 대체 텍스트 */
  alt?: string;
}

const LERP_ZOOM = 0.08;
const LERP_MOUSE = 0.1;

export function DepthParallax({
  image,
  depth,
  focus = 0.5,
  maxZoom = 1.35,
  parallax = 0.04,
  aberration = 0.006,
  vignette = 0.5,
  className,
  alt = "",
}: DepthParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderer = new Renderer({
      canvas,
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: false,
      antialias: true,
    });
    const gl = renderer.gl;

    const makeTexture = (url: string, onLoad?: (img: HTMLImageElement) => void) => {
      const texture = new Texture(gl, {
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        generateMipmaps: false,
      });
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        texture.image = img;
        onLoad?.(img);
      };
      img.src = url;
      return texture;
    };

    const imageSize: [number, number] = [1, 1];
    const uImage = makeTexture(image, (img) => {
      imageSize[0] = img.naturalWidth;
      imageSize[1] = img.naturalHeight;
      program.uniforms.uImageSize.value = imageSize;
    });
    const uDepth = makeTexture(depth);

    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        uImage: { value: uImage },
        uDepth: { value: uDepth },
        uMouse: { value: [0, 0] },
        uZoom: { value: 1 },
        uFocus: { value: focus },
        uParallax: { value: parallax },
        uAberration: { value: aberration },
        uVignette: { value: vignette },
        uImageSize: { value: imageSize },
        uResolution: { value: [1, 1] },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ── 입력 상태 ──
    let targetZoom = 1;
    let zoom = 1;
    const targetMouse: [number, number] = [0, 0];
    const mouse: [number, number] = [0, 0];

    const setPointer = (e: PointerEvent) => {
      if (reduceMotion) return;
      const rect = container.getBoundingClientRect();
      targetMouse[0] = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse[1] = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onDown = (e: PointerEvent) => {
      if (reduceMotion) return;
      setPointer(e);
      targetZoom = maxZoom;
    };
    const onUp = () => {
      targetZoom = 1;
      targetMouse[0] = 0;
      targetMouse[1] = 0;
    };

    container.addEventListener("pointermove", setPointer);
    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    container.addEventListener("pointerleave", onUp);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      zoom += (targetZoom - zoom) * LERP_ZOOM;
      mouse[0] += (targetMouse[0] - mouse[0]) * LERP_MOUSE;
      mouse[1] += (targetMouse[1] - mouse[1]) * LERP_MOUSE;
      program.uniforms.uZoom.value = zoom;
      program.uniforms.uMouse.value = mouse;
      renderer.render({ scene: mesh });
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", setPointer);
      container.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointerleave", onUp);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [image, depth, focus, maxZoom, parallax, aberration, vignette]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label={alt}
      style={{ touchAction: "none", cursor: "grab" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
