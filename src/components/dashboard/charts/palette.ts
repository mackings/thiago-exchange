// Chart color is a separate decision from badge/status color — a chart
// needs stable categorical identity (a series' color never changes when the
// data reorders) and legible ink, not the four-part semantic-meaning
// formula used by status pills. Assign colors here, never by eyeballing a
// hex value inside a chart component.

export type ColorPair = { light: string; dark: string };

// 8 fixed hues, assigned alphabetically by series name — never by current
// rank — so a series' color is stable across re-renders and data changes.
// Built from Thiago's maroon/gold brand family plus enough distinct
// supporting hues to stay tell-apart-able at 8 series; no green anywhere,
// per the app-wide brand rule.
export const CATEGORICAL_SLOTS: ColorPair[] = [
  { light: "#611818", dark: "#d17575" }, // maroon
  { light: "#d9861f", dark: "#f0b654" }, // gold
  { light: "#3b5b73", dark: "#7fa8c2" }, // slate blue
  { light: "#8f5312", dark: "#e0a85c" }, // amber-brown
  { light: "#7a1e1e", dark: "#e5a3a3" }, // rust
  { light: "#6a3f8f", dark: "#c4a3e0" }, // plum
  { light: "#452808", dark: "#c99a5c" }, // deep brown
  { light: "#4a1212", dark: "#b84a4a" }, // deep maroon
];

// Single-hue ramp for magnitude comparisons (one metric, many buckets),
// e.g. a "value over time" area chart — not for distinguishing categories.
// Thiago maroon in light mode, lightened for legibility on a dark card.
export const SEQUENTIAL: ColorPair = { light: "#611818", dark: "#d17575" };

export const CHART_INK = {
  primary: { light: "#241010", dark: "#f1f5f9" },
  secondary: { light: "#7a5a5a", dark: "#cbd5e1" },
  muted: { light: "#a58888", dark: "#64748b" },
  gridline: { light: "rgba(97,24,24,0.08)", dark: "rgba(241,245,249,0.08)" },
};

// Deterministic name -> color assignment, stable regardless of array order.
export function assignCandidateColors(names: string[]): Record<string, ColorPair> {
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  const map: Record<string, ColorPair> = {};
  sorted.forEach((name, i) => {
    map[name] = CATEGORICAL_SLOTS[i % CATEGORICAL_SLOTS.length];
  });
  return map;
}
