/**
 * Hold-to-dive depth parallax 셰이더.
 *
 * theavener.com "Beautiful" 사이트의 핵심 원리(2D 사진 + 흑백 depth map을
 * fragment shader에서 시차 렌더링)를 단일 displacement 샘플로 축소한 버전.
 * 원본은 16-step raymarching(parallax occlusion mapping)이지만, 단일 샘플만으로도
 * 체감의 대부분이 재현된다.
 */

export const VERTEX = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D uImage;      // 컬러 사진
uniform sampler2D uDepth;      // 흑백 깊이맵 (흰색 = 가까움)
uniform vec2  uMouse;          // lerp된 마우스, -1..1
uniform float uZoom;           // 1.0 = 기본, hold 시 1.0 -> maxZoom
uniform float uFocus;          // 0..1, 움직이지 않을 초점 평면
uniform float uParallax;       // 시차 강도
uniform float uAberration;     // 색수차 강도
uniform float uVignette;       // 비네팅 강도
uniform vec2  uImageSize;      // 원본 이미지 px
uniform vec2  uResolution;     // 캔버스 px

varying vec2 vUv;

// object-fit: cover 와 동일하게 uv 를 맞춘다.
vec2 coverUv(vec2 uv, vec2 res, vec2 img) {
  float rImg = img.x / img.y;
  float rRes = res.x / res.y;
  vec2 scale = rRes > rImg
    ? vec2(1.0, rImg / rRes)
    : vec2(rRes / rImg, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 baseUv = coverUv(vUv, uResolution, uImageSize);

  // 깊이 = 초점 평면 기준 상대값. 양수=카메라쪽, 음수=배경.
  float depth = texture2D(uDepth, baseUv).r;
  float rel = depth - uFocus;

  // 줌(파고들기) + 깊이 비례 시차.
  vec2 uv = (baseUv - 0.5) / uZoom + 0.5;
  uv += uMouse * rel * uParallax;            // 마우스 시차
  uv += (uZoom - 1.0) * rel * 0.18 * uMouse; // 줌이 깊을수록 레이어 분리

  // 색수차: 깊이/줌에 비례해 가장자리 레이어에서 RGB 분리.
  float ca = uAberration * (abs(rel) + (uZoom - 1.0) * 0.5);
  vec2 dir = normalize(uMouse + vec2(1e-4));
  float r = texture2D(uImage, uv + dir * ca).r;
  float g = texture2D(uImage, uv).g;
  float b = texture2D(uImage, uv - dir * ca).b;
  vec3 color = vec3(r, g, b);

  // 비네팅.
  float d = distance(vUv, vec2(0.5));
  color *= 1.0 - smoothstep(0.35, 0.95, d) * uVignette;

  gl_FragColor = vec4(color, 1.0);
}
`;

/**
 * Dream dive — 3D 공간 버전.
 * 이미지 면(plane)들을 z축으로 배치하고, hold 하면 원근 카메라가 앞으로 전진하며
 * 한 장씩 통과한다. 각 면은 검은 공간에 떠 있는 시네마틱 프레임처럼 가장자리가
 * 부드럽게 사라지고(edge fade), 깊이맵으로 은은한 시차만 준다(절제).
 *
 * 풀스크린 셰이더와 달리 MVP 행렬을 쓰므로 ogl 의 Mesh 가 자동 주입하는
 * modelViewMatrix / projectionMatrix 를 사용한다.
 */
export const PLANE_VERTEX = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const PLANE_FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D tMap;     // 컬러 사진
uniform sampler2D tDepth;   // 흑백 깊이맵
uniform float uFocus;       // 초점 평면
uniform float uOpacity;     // 거리 기반 페이드
uniform float uAberration;  // 굴절 색분산
uniform float uPinch;       // 통과 시 빨려드는 왜곡 (0..1)

varying vec2 vUv;

const float TEX_ASPECT = 0.667; // 세로 사진 2:3

void main() {
  // 버블 좌표: 정사각 면 중심 기준, 반지름 0.5 를 1.0 으로 정규화.
  vec2 cc = vUv - 0.5;
  float rad = length(cc) / 0.5;

  // 반구 높이 → 구면 굴절(어안 볼록). 물방울/유리구슬 렌즈감.
  float rr = clamp(rad, 0.0, 1.0);
  float z = sqrt(1.0 - rr * rr);
  vec2 nrm = normalize(cc + vec2(1e-5));
  float bulge = 0.18;
  vec2 sUv = vUv - nrm * (1.0 - z) * bulge;

  // 통과 순간 물방울처럼 중앙으로 휘말려 빨려든다(소용돌이 + 수축).
  vec2 pc = sUv - 0.5;
  float prad = length(pc);
  float ang = uPinch * 3.4 * (0.5 - prad);
  float si = sin(ang), co = cos(ang);
  pc = mat2(co, -si, si, co) * pc;
  pc *= 1.0 - uPinch * 0.82 * (1.0 - smoothstep(0.0, 0.55, prad));
  sUv = pc + 0.5;

  // 세로 사진을 원형 버블에 cover (가로를 채우고 세로 위아래를 자른다).
  vec2 texUv = vec2(sUv.x, (sUv.y - 0.5) * TEX_ASPECT + 0.5);

  // 깊이맵 → 굴절 색분산 강도에 사용.
  float depth = texture2D(tDepth, texUv).r;
  float rel = depth - uFocus;

  // 굴절 색수차 + 방사형 줌 블러: 빨려들수록 픽셀이 방사상으로 늘어나 속도감을 준다.
  float ca = uAberration * (abs(rel) + rad * rad * 1.0);
  vec2 toC = texUv - 0.5;
  float blur = uPinch * 0.16;
  vec3 color = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float t = float(i) / 7.0;
    vec2 bUv = 0.5 + toC * (1.0 + blur * t); // 바깥으로 흐르는 전진 스트릭
    color.r += texture2D(tMap, bUv + nrm * ca).r;
    color.g += texture2D(tMap, bUv).g;
    color.b += texture2D(tMap, bUv - nrm * ca).b;
  }
  color /= 8.0;

  // 굴절 림: 가장자리 그림자 + 얇은 빛 테두리(유리 두께감).
  float rim = smoothstep(0.7, 1.0, rad);
  color *= 1.0 - rim * 0.45;
  float ring = smoothstep(0.9, 0.99, rad) * smoothstep(1.0, 0.95, rad);
  color += ring * 0.25;

  // 스펙큘러 하이라이트: 좌상단 빛 반사 → 젖은 물방울 질감.
  float spec = smoothstep(0.16, 0.0, distance(cc, vec2(-0.16, 0.16))) * 0.4;
  color += spec;

  // 원형 버블 마스크 (바깥은 검은 공간).
  float mask = smoothstep(1.0, 0.94, rad);

  gl_FragColor = vec4(color, uOpacity * mask);
}
`;
