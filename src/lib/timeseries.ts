// Buckets a list of ISO timestamps into a daily count/sum series covering
// the last `days` days (including today), so a trend chart always has a
// continuous x-axis even on days with zero activity.
export function dailySeries<T>(
  items: T[],
  getDate: (item: T) => string,
  getValue: (item: T) => number,
  days = 30,
): { label: string; value: number }[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const item of items) {
    const key = new Date(getDate(item)).toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + getValue(item));
    }
  }

  return Array.from(buckets.entries()).map(([iso, value]) => ({
    label: new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" }),
    value,
  }));
}
