# WebGL — Hold-to-Dive Depth Parallax

theavener.com/Beautiful 인터랙티브 뮤직비디오 사이트의 "click & hold로 이미지 속을 파고드는" 경험을 재현한 실험.
ogl(three.js 경량 대안) + 깊이맵 기반.

> 상태: **프로토타입 (lab)**. `apps/vague-frequency-labs` 의 `/lab/depth` 데모 라우트(noindex)에서만 사용. 프로덕션 미적용.

---

## 구성 요소

| 파일 | 역할 |
|---|---|
| `DreamDive.tsx` | **메인.** 3D 카메라가 z축의 이미지 버블들을 통과하는 hold-to-dive |
| `DepthParallax.tsx` | 단일 이미지 depth parallax (hold=줌인). 초기 버전, 보존됨 |
| `shaders.ts` | GLSL 문자열 (`VERTEX`/`FRAGMENT` = DepthParallax용, `PLANE_*` = DreamDive용) |
| `index.ts` | `@repo/ui/webgl` export |

데모: `apps/vague-frequency-labs/src/app/lab/depth/page.tsx`
깊이맵 자산: `apps/vague-frequency-labs/public/images/lab/<artist>-depth.webp`

### 실행
```bash
pnpm dev --filter=vague-frequency-labs   # → http://localhost:3004/lab/depth
```
**데스크톱 와이드 창**에서 확인할 것. 모바일 좁은 뷰포트는 버블이 폭을 꽉 채워 검은 여백이 줄어든다(미해결, 아래 TODO).

---

## DreamDive 동작 원리

1. 이미지 "버블"(정사각 plane)들을 z축으로 `SPACING` 간격 배치.
2. `hold` 시 원근 카메라가 -z로 전진(`speed`), 떼면 가장 가까운 격자점으로 **스냅**(한 컷이 정위치에 정지).
3. 카메라를 지나친 버블은 맨 뒤로 재배치하며 다음 슬라이드 텍스처 할당 → 무한 루프.
4. 거리 기반 opacity: 가장 가까운 한 버블만 또렷, 나머지는 검은 공간에 잠김(인셉션 액자 방지).
5. 통과 직전 버블은 어둠으로 fade + **빨려드는 왜곡(uPinch)**.

각 버블 fragment(`PLANE_FRAGMENT`)는 평면을 **유리/물방울 버블**로 보이게 함:
- 구면 굴절(어안 볼록), 원형 마스크, 굴절 림, 스펙큘러 하이라이트
- 통과 시: 소용돌이 + 중앙 수축 + 방사형 줌 블러(속도 스트릭)

### 마우스 시차는 제거됨
사용자 요청으로 카메라가 마우스를 따라 흔들리는 효과는 제거. `hold`만 카메라를 전진시킨다.

---

## 조정 포인트 (튜닝 다이얼)

### `DreamDive.tsx` 상수/props
| 이름 | 현재값 | 의미 |
|---|---|---|
| `SPACING` | 3.0 | 버블 간 z 간격 |
| `PLANE_W`/`PLANE_H` | 1.4 / 1.4 | 버블 크기(정사각). 키우면 화면 점유↑, 검은 여백↓ |
| `speed` (prop) | 2.2 | hold 시 전진 속도(월드유닛/초) |
| `focus` (prop) | 0.5 | 깊이 초점 평면 |
| `aberration` (prop) | 0.004 | 굴절 색분산 |
| near fade | `smoothstep(1.1,3.0,d)**1.6` | 통과 직전 어둠 흡수 |
| far fade | `smoothstep(SPACING*2.3, SPACING*0.9, d)` | 먼 버블 어둠 잠김(작을수록 한 개만 또렷) |
| uPinch 범위 | `1 - smoothstep(1.1, 2.8, d)` | 빨려듦 시작 거리. 상한(2.8)을 키우면 idle 면도 왜곡되니 주의 |

### `shaders.ts` `PLANE_FRAGMENT`
| 이름 | 현재값 | 의미 |
|---|---|---|
| `TEX_ASPECT` | 0.667 | 원본 사진 종횡비(2:3). **세로 cover** 용. 다른 비율 사진 쓰면 수정 |
| `bulge` | 0.18 | 구면 굴절 볼록 강도. 키우면 어안↑(과하면 인물 왜곡) |
| swirl | `uPinch * 3.4` | 빨려들 때 소용돌이 회전량 |
| 수축 | `uPinch * 0.82` | 중앙 수축량 |
| `blur` | `uPinch * 0.16` | 방사형 줌 블러(속도 스트릭) 강도. 8샘플 |
| 림/하이라이트 | rim 0.45 / spec 0.4 | 유리 두께감·광택 |

---

## 깊이맵 생성

원본 사진엔 깊이맵이 없으므로 **AI(Depth Anything V2)** 로 생성. Python/torch 없이 Node + transformers.js(ONNX/CPU).

```js
// 임시 디렉토리에서 (예: /tmp/depthgen)
// package.json: { "type":"module", "dependencies": { "@huggingface/transformers": "^3" } }
import { pipeline } from "@huggingface/transformers";
import sharp from "sharp";

const est = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", { dtype: "fp32" });
const out = await est("<input>.webp");
await out.depth.save("/tmp/depth.png");
await sharp("/tmp/depth.png").webp({ quality: 82 }).toFile("<artist>-depth.webp"); // 흰색=가까움
```

현재 데모 자산: `sam, dearboi, sielo, juntaro, playmode, loozbone` (vfl artist 프로필 기반, 각 15~30KB).

> ⚠️ 깊이맵 생성 스크립트는 레포에 커밋되지 않았다(임시 디렉토리에서 1회 실행). 정식화하려면 아래 TODO 참고.

---

## 디자인 진화 (왜 이렇게 됐는지)

레퍼런스에 맞추며 여러 번 방향을 틀었다. 같은 실수 반복 방지용 기록:

1. **단일 이미지 줌** (`DepthParallax`) — "한 장 안에서 입체감"만. 레퍼런스의 핵심(여러 이미지 통과)이 빠져 폐기 방향.
2. **풀스크린 2D crossfade** — 청록 색조 + 강한 글리치로 "싸구려"가 됨. 방향 자체가 틀림(절제 부족).
3. **3D 카메라 통과** (`DreamDive` 초기) — 검은 공간 + 깊이 통과 확보. 단 통과 면이 "거대 반투명 유령"으로 화면을 덮고, idle이 불안정(아무 z에 정지)했음 → near fade 강화 + 격자 스냅으로 해결.
4. **인셉션 액자 제거** — 두 번째 면이 너무 또렷해 "액자 속 액자"가 됨 → far fade 공격적으로 당김(한 개만 또렷).
5. **버블 굴절** — "평면이 찌그러진다"는 피드백 → 원형 마스크 + 구면 굴절 + 유리 질감으로 "물방울에 감싸인" 형태.
6. **cover 축 버그** — 세로사진을 정사각 버블에 넣을 때 가로(x)를 압축해 인물이 옆으로 눌렸음 → 세로(y) 잘림으로 수정.
7. **빨려듦 강화** — 단순 수축만으론 약함. 방사형 줌 블러(속도 스트릭) + 핀치 강화로 보강.

**핵심 교훈**: 레퍼런스의 느낌 = "절제 + 검은 여백 + 한 번에 하나 + 속도감(블러)". 효과를 많이 더하는 게 아니라 덜고 다듬는 방향.

---

## TODO (이어서 작업)

우선순위 순:

- [ ] **② 흡입 가속** — 통과 직전 카메라가 확 당겨지는 가속(현재 등속). 빨려듦의 마지막 남은 요소. `DreamDive` loop에서 가장 가까운 면 거리 기반으로 `targetSpeed` 부스트.
- [ ] **빨려듦/버블 강도 최종 튜닝** — chrome-devtools 검증 도구가 작업 후반 끊겨 버블·블러 변경(5~7)을 **시각 확인 못 함**. 재연결 후 레퍼런스와 나란히 비교해 `bulge`/`blur`/swirl 미세조정 필요.
- [ ] **미세 입자(먼지)** — 검은 공간에 떠다니는 먼지. 레퍼런스의 몽환감 디테일.
- [ ] **사운드** — 앰비언트 루프 + 전환음(Web Audio). 레퍼런스는 atmosphere.mp3 + transition.mp3.
- [ ] **모바일 대응** — 좁은 뷰포트에서 버블이 폭을 꽉 채움. 종횡비별 `PLANE` 크기/카메라 거리 조정.
- [ ] **깊이맵 파이프라인 정식화** — 위 생성 스크립트를 `scripts/gen-depth.mjs` + `pnpm gen:depth` 로. 다른 비율 사진은 `TEX_ASPECT` 처리 필요.
- [ ] **reduced-motion 강화** — 현재 hold 무효화만. 정적 fallback 이미지 검토.

## 알려진 이슈

- **worktree-local lockfile**: 이 worktree에서 `pnpm install` 해서 `pnpm-lock.yaml` 이 worktree 기준으로 갱신됨. PR/머지 전 **레포 루트에서 `pnpm install` 재실행** 권장.
- **lint 전체 실행**(`pnpm lint --filter=@repo/ui`)은 기존 파일(Button/Carousel/FancyLine) 경고 + worktree node_modules의 react-compiler 플러그인 누락으로 실패할 수 있음. **신규 `src/webgl/` 파일은 clean**(직접 eslint 통과).
- **성능**: 버블 fragment가 방사 블러 8샘플 × RGB = 픽셀당 24 텍스처 페치. 모바일/저사양에서 무거울 수 있어 샘플 수 조건부 축소 검토.
