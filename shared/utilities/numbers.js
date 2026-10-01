export function finiteNumber(value, fallback, minimum = -10000, maximum = 10000) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    if (fallback === null) throw new Error("Circuit contains an invalid numeric value.");
    return fallback;
  }
  return Math.min(maximum, Math.max(minimum, number));
}