import type { Expense } from '@/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface CycleInfo {
  /** Calendar length of the cycle in days (start → same day next month). */
  daysInCycle: number;
  /** Days elapsed since cycle start, clamped to [0, daysInCycle]. */
  daysElapsed: number;
  /** 0–100 progress through the cycle. */
  progress: number;
}

/** A cycle runs from its start date to the same day of next month. */
export function cycleInfo(startISO: string, now: Date = new Date()): CycleInfo {
  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) {
    return { daysInCycle: 30, daysElapsed: 0, progress: 0 };
  }
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  end.setMonth(end.getMonth() + 1);

  const total = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
  const elapsed = Math.round((now.getTime() - start.getTime()) / MS_PER_DAY);
  const daysElapsed = Math.min(Math.max(elapsed, 0), total);

  return {
    daysInCycle: total,
    daysElapsed,
    progress: total > 0 ? Math.round((daysElapsed / total) * 100) : 0,
  };
}

/** "Octobre 2026" — locale-aware month + year label for a cycle. */
export function cycleMonthLabel(startISO: string, locale: string): string {
  const d = new Date(startISO);
  if (Number.isNaN(d.getTime())) return '—';
  const raw = d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** "1 oct. – 3 nov." — short range label. */
export function cycleRangeLabel(startISO: string, endISO: string, locale: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  return `${fmt(startISO)} – ${fmt(endISO)}`;
}

export interface ExpenseSection {
  key: string;
  title: string;
  data: Expense[];
}

/**
 * Group expenses (any order) into day sections, latest day first,
 * instances within a day sorted latest first. Titles: "Today"/"Yesterday"
 * are resolved by the caller via `labelFor`.
 */
export function groupExpensesByDay(
  expenses: Expense[],
  labelForDay: (date: Date, isoDay: string) => string,
): ExpenseSection[] {
  const byDay = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const d = new Date(expense.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const bucket = byDay.get(key) ?? [];
    bucket.push(expense);
    byDay.set(key, bucket);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => {
      const sorted = [...data].sort((a, b) => +new Date(b.date) - +new Date(a.date));
      return { key, title: labelForDay(new Date(`${key}T12:00:00`), key), data: sorted };
    });
}

