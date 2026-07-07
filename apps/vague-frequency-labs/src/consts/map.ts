// Land-dot radius in dotted-map viewBox units (viewBox is 198x100). The loader
// scene's landing dots and the WorldMap SVG must render at the SAME radius or
// the landing→map crossfade shows a visible size jump — both import this
// constant instead of hardcoding 0.22 locally.
export const MAP_DOT_RADIUS = 0.22;
