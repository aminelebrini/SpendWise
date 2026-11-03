import { getActiveLocale } from '@/i18n/runtime';

const makeCurrency = (maximumFractionDigits: number): Intl.NumberFormat =>
  new Intl.NumberFormat(getActiveLocale(), {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits,
  });

/** "1 234,50 DH" (fr-MA) / Arabic rendering under ar-MA. Rebuilt per call to respect live locale. */
export function formatCurrency(value: number): string {
  return makeCurrency(2).format(value);
}

/** Whole-dirham figure for headlines: "500 DH". */
export function formatCurrencyWhole(value: number): string {
  return makeCurrency(0).format(value);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days from now until the ISO date (negative when in the past). */
export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return 0;
  const today = new Date();
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const b = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b - a) / MS_PER_DAY);
}

/** "3 nov." / "٣ نوفمبر" — short absolute date, locale-aware. */
export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(getActiveLocale(), { month: 'short', day: 'numeric' });
}

/** "2026-11-03" — value for the editable date field. */
export function toDateInputValue(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse "YYYY-MM-DD" (or any Date-parsable string). Returns null when invalid. */
export function parseDateInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
