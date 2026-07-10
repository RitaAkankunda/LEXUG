// Design tokens for LexUg. One accent (gold), one neutral family (cool navy/gray).
// Radius rule: pill buttons (999), 14px inputs, 28px sheet/card top corners. No other radii.

export const colors = {
  bg: "#F5F7FA",
  surface: "#FFFFFF",
  navy: "#0B2545",
  navyMuted: "#33455E",
  accent: "#B98A2E",
  accentSoft: "#F1E4C8",
  textPrimary: "#0B2545",
  textSecondary: "#5B6472",
  textOnNavy: "#FFFFFF",
  textOnNavyMuted: "#B9C2D0",
  border: "#E2E5EA",
  borderOnNavy: "#3D5170",
  error: "#B3261E",
  errorSoft: "#FBEAE9",
  white: "#FFFFFF",
} as const;

export const radius = {
  input: 14,
  sheet: 28,
  pill: 999,
} as const;

export const layout = {
  maxContentWidth: 480,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const type = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: "800" as const, letterSpacing: -0.5 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: "700" as const, letterSpacing: -0.3 },
  h2: { fontSize: 19, lineHeight: 25, fontWeight: "700" as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "500" as const },
  bodyRegular: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: "600" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const },
  button: { fontSize: 16, lineHeight: 20, fontWeight: "700" as const },
} as const;
