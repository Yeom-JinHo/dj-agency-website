import type { Social } from "@repo/content/schema";

/**
 * 폼 값 정규화(Artist/Release/Tour 공용). 순수 함수 — 클라이언트/서버 어디서나 안전.
 */

/** 빈/공백 문자열 → null (DB에는 null로 저장). */
export function nullify(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * 폼 초기값용 socials — 선택 키(label)를 빈 문자열로 채워 "키가 아예 없는" 상태를 없앤다.
 * normalizeSocials의 정확한 역함수이고, 그래서 같은 파일에 둔다.
 *
 * 왜 필요한가: 저장할 때 normalizeSocials가 빈 label을 지우므로 DB의 socials 행은
 * `{platform, url}` 2키가 된다. 그런데 폼은 그 값을 그대로 defaultValues로 받으면서도
 * `socials.N.label` 컨트롤은 등록한다. RHF는 컨트롤을 처음 등록할 때
 * updateValidAndValue로 `set(_formValues, "socials.0.label", undefined)`를 실행하는데,
 * set은 값이 undefined여도 **키를 만든다**. _defaultValues에는 손대지 않으므로 그 순간
 * _formValues만 3키, _defaultValues는 2키가 된다.
 * isDirty는 `!deepEqual(_formValues, _defaultValues)`이고 RHF의 deepEqual은
 * Object.keys 길이부터 비교하므로 3키 vs 2키에서 즉시 "다르다"로 끊는다. useForm은
 * 렌더마다 _getDirty를 다시 계산해 반영하기 때문에(react-hook-form/dist/index.esm.mjs의
 * useForm 내 isDirty 재계산 effect), 아무 필드도 건드리지 않은 편집 화면이 마운트
 * 직후부터 dirty가 되어 미저장 경고가 상시 발동했다. dirtyFields는 change/필드어레이
 * 이벤트에서만 갱신되므로 이때 비어 있다 — 즉 "변경된 필드는 없는데 isDirty만 true"다.
 *
 * 다른 안을 기각한 이유:
 * - label을 필수로 바꾸기: socialSchema는 공개 사이트 렌더와 공유하는 스키마라
 *   `label?`가 전제다. 폼 하나 때문에 저장 표현을 바꿀 수 없다.
 * - 미저장 판정을 dirtyFields가 비었는지로 대체하기: 증상만 가린다. 원인은 폼에
 *   들어가는 값의 shape이 폼이 등록하는 필드 집합과 어긋난 것이고, 그건 우리가 고칠 수 있다.
 *
 * ""로 채워도 DB 표현은 그대로다 — 제출 경로에서 normalizeSocials가 다시 지운다.
 */
export function socialsFormDefaults(socials: Social[]): Social[] {
  return socials.map((s) => ({ ...s, label: s.label ?? "" }));
}

/** label이 빈 문자열이면 제거(선택 필드) — jsonb에 label:"" 미저장. */
export function normalizeSocials(socials: Social[]): Social[] {
  return socials.map((s) => {
    const label = s.label?.trim();
    return label
      ? { platform: s.platform, url: s.url, label }
      : { platform: s.platform, url: s.url };
  });
}
