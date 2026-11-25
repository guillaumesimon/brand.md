const NAMED = {
  black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], green: [0, 128, 0],
  blue: [0, 0, 255], yellow: [255, 255, 0], orange: [255, 165, 0], purple: [128, 0, 128],
  gray: [128, 128, 128], grey: [128, 128, 128], silver: [192, 192, 192], navy: [0, 0, 128],
  teal: [0, 128, 128], maroon: [128, 0, 0], olive: [128, 128, 0], lime: [0, 255, 0],
  aqua: [0, 255, 255], cyan: [0, 255, 255], fuchsia: [255, 0, 255], magenta: [255, 0, 255],
};

const clamp = (n) => Math.min(255, Math.max(0, Math.round(n)));

function hslToRgb(h, s, l) {
  const hue = (((h % 360) + 360) % 360) / 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [channel(hue + 1 / 3) * 255, channel(hue) * 255, channel(hue - 1 / 3) * 255];
}

/**
 * Convert a CSS colour string to opaque sRGB, as [r, g, b] in 0-255.
 * Understands hex, rgb(), hsl() and the basic named colours. Alpha is ignored.
 * Returns null for anything else (oklch(), color-mix(), ...), so callers can
 * skip a check they cannot perform instead of reporting a wrong result.
 *
 * @param {unknown} value
 * @returns {[number, number, number] | null}
 */
export function toRgb(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim().toLowerCase();

  const hex = text.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    const digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      return [0, 1, 2].map((i) => parseInt(digits[i] + digits[i], 16));
    }
    if (digits.length === 6 || digits.length === 8) {
      return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
    }
    return null;
  }

  const fn = text.match(/^(rgba?|hsla?)\(([^)]+)\)$/);
  if (fn) {
    const parts = fn[2].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    if (fn[1].startsWith('rgb')) {
      const rgb = parts.slice(0, 3).map((p) => (p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p)));
      return rgb.some(Number.isNaN) ? null : rgb.map(clamp);
    }
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    if ([h, s, l].some(Number.isNaN)) return null;
    return hslToRgb(h, s, l).map(clamp);
  }

  return NAMED[text] ? [...NAMED[text]] : null;
}

function luminance([r, g, b]) {
  const linear = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG contrast ratio between two sRGB triples. */
export function contrastRatio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** True when two colour strings denote the same sRGB colour. */
export function sameColor(a, b) {
  const x = toRgb(a);
  const y = toRgb(b);
  return Boolean(x && y && x.every((channel, i) => channel === y[i]));
}
