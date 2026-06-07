"use client";

import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } from "ogl";
import { PLANE_FRAGMENT, PLANE_VERTEX } from "./shaders";

export interface DreamDiveSlide {
  image: string;
  depth: string;
}

export interface DreamDiveProps {
  /** dive 하며 통과할 이미지 시퀀스 (2장 이상) */
  slides: DreamDiveSlide[];
  /** hold 시 카메라 전진 속도 (월드 유닛/초). 기본 2.2 */
  speed?: number;
  /** 초점 평면 (0..1). 기본 0.5 */
  focus?: number;
  /** 색수차 강도 (미묘). 기본 0.004 */
  aberration?: number;
  className?: string;
  alt?: string;
}

const SPACING = 3.0; // 면 사이 z 간격
const LERP_SPEED = 0.06;
const PLANE_W = 1.4;
const PLANE_H = 1.4; // 버블(원형)이므로 정사각 면

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function DreamDive({
  slides,
  speed = 2.2,
  focus = 0.5,
  aberration = 0.004,
  className,
  alt = "",
}: DreamDiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || slides.length === 0) return;

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
    gl.clearColor(0, 0, 0, 1);

    const camera = new Camera(gl, { fov: 35, near: 0.1, far: 100 });
    camera.position.set(0, 0, 0);

    const scene = new Transform();

    // ── 슬라이드별 컬러/깊이 텍스처 ──
    const makeTexture = (url: string) => {
      const texture = new Texture(gl, {
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        generateMipmaps: false,
      });
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        texture.image = img;
      };
      img.src = url;
      return texture;
    };
    const slots = slides.map((s) => ({
      color: makeTexture(s.image),
      depth: makeTexture(s.depth),
    }));

    // ── z축으로 배치된 이미지 면들 ──
    const COUNT = Math.max(slides.length + 1, 6); // 동시에 떠 있는 면 수
    const geometry = new Plane(gl, { width: PLANE_W, height: PLANE_H });

    type PlaneSlot = { mesh: Mesh; program: Program };
    const planes: PlaneSlot[] = [];
    let cursor = 0;

    const assignSlide = (program: Program) => {
      const s = slots[cursor % slots.length];
      cursor += 1;
      if (!s) return;
      program.uniforms.tMap.value = s.color;
      program.uniforms.tDepth.value = s.depth;
    };

    for (let i = 0; i < COUNT; i++) {
      const program = new Program(gl, {
        vertex: PLANE_VERTEX,
        fragment: PLANE_FRAGMENT,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          tMap: { value: null },
          tDepth: { value: null },
          uFocus: { value: focus },
          uOpacity: { value: 0 },
          uAberration: { value: aberration },
          uPinch: { value: 0 },
        },
      });
      assignSlide(program);
      const mesh = new Mesh(gl, { geometry, program });
      mesh.position.z = -SPACING * (i + 1);
      mesh.setParent(scene);
      planes.push({ mesh, program });
    }

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ── 입력 상태 ──
    let holding = false;
    let curSpeed = 0;
    let camZ = 0;

    const onDown = () => {
      if (reduceMotion) return;
      holding = true;
    };
    const onUp = () => {
      holding = false;
    };

    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    container.addEventListener("pointerleave", onUp);

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;

      // hold → 카메라가 -z 로 전진. 떼면 가장 가까운 면이 정위치에 오도록 격자 스냅.
      curSpeed += ((holding ? speed : 0) - curSpeed) * LERP_SPEED;
      if (holding || Math.abs(curSpeed) > 0.03) {
        camZ -= curSpeed * dt;
      } else {
        const snap = Math.round(camZ / SPACING) * SPACING;
        camZ += (snap - camZ) * 0.06;
      }
      camera.position.z = camZ;

      for (const p of planes) {
        // 카메라를 지나친 면은 가장 뒤로 재배치하고 다음 슬라이드 할당.
        if (p.mesh.position.z > camZ + 0.6) {
          p.mesh.position.z -= COUNT * SPACING;
          assignSlide(p.program);
        }
        const d = camZ - p.mesh.position.z; // 카메라 앞쪽 거리(양수)
        // 통과 직전(코앞)이면 거대한 반투명 유령이 되기 전에 빠르게 어둠으로 삼킨다.
        const near = smoothstep(1.1, 3.0, d) ** 1.6;
        // 가장 가까운 면만 또렷하고 다음 면부터는 어둠에 잠기게 (인셉션 액자 방지).
        const far = smoothstep(SPACING * 2.3, SPACING * 0.9, d);
        p.program.uniforms.uOpacity.value = near * far;
        // 통과 직전일수록 물방울처럼 빨려드는 왜곡을 키운다. (idle 면 d≈3 엔 0)
        p.program.uniforms.uPinch.value = 1 - smoothstep(1.1, 2.8, d);
        p.mesh.renderOrder = -p.mesh.position.z; // 먼 것부터 그린다
      }

      renderer.render({ scene, camera });
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointerleave", onUp);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [slides, speed, focus, aberration]);

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
