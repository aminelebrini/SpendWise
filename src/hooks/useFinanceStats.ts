import { useMemo } from 'react';
import type { ExpenseCategoryId, Expense, SalaryCycle } from '@/types';
import { EXPENSE_CATEGORY_MAP } from '@/constants/categories';
import { clamp } from '@/utils/format';
import { cycleInfo, type CycleInfo } from '@/utils/cycle';

export interface CategorySlice {
  id: ExpenseCategoryId;
  /** Translation key — resolve with t(slice.labelKey). */
  labelKey: `cat.${ExpenseCategoryId}`;
  color: string;
  amount: number;
  count: number;
  /** 0–100 bar width, normalized against the largest category. */
  pct: number;
}

export type ConsumptionStatus = 'ok' | 'warn' | 'over';

export interface FinanceStats {
  totalExpenses: number;
  /** Salary − expenses (may be negative when overspending). Same as savedThisCycle. */
  remaining: number;
  /** 0–100+ percent of salary consumed. */
  percentUsed: number;
  status: ConsumptionStatus;
  expenseCount: number;
  avgPerDay: number;
  biggestExpense: Expense | null;
  byCategory: CategorySlice[];
  cycle: CycleInfo;
  /** Expenses sorted for display (latest first). */
  latestFirst: Expense[];
}

export function computeFinanceStats(
  salary: SalaryCycle | null,
  expenses: Expense[],
): FinanceStats {
  const totalExpenses = Math.round(expenses.reduce((s, e) => s + e.amount, 0) * 100) / 100;
  const salaryAmount = salary?.amount ?? 0;
  const remaining = Math.round((salaryAmount - totalExpenses) * 100) / 100;
  const percentUsed = salaryAmount > 0 ? (totalExpenses / salaryAmount) * 100 : 0;
  const status: ConsumptionStatus = percentUsed >= 100 ? 'over' : percentUsed >= 80 ? 'warn' : 'ok';

  const cycle = salary ? cycleInfo(salary.startDate) : { daysInCycle: 30, daysElapsed: 0, progress: 0 };
  const avgPerDay = cycle.daysElapsed > 0 ? totalExpenses / cycle.daysElapsed : totalExpenses;

  const biggestExpense = expenses.reduce<Expense | null>(
    (max, e) => (max === null || e.amount > max.amount ? e : max),
    null,
  );

  // --- By category ---
  const categoryTotals = new Map<ExpenseCategoryId, { amount: number; count: number }>();
  for (const expense of expenses) {
    const bucket = categoryTotals.get(expense.category) ?? { amount: 0, count: 0 };
    bucket.amount += expense.amount;
    bucket.count += 1;
    categoryTotals.set(expense.category, bucket);
  }
  const top = Math.max(...[...categoryTotals.values()].map((v) => v.amount), 0);
  const byCategory: CategorySlice[] = [...categoryTotals.entries()]
    .map(([id, { amount, count }]) => ({
      id,
      labelKey: EXPENSE_CATEGORY_MAP[id].labelKey,
      color: EXPENSE_CATEGORY_MAP[id].color,
      amount: Math.round(amount * 100) / 100,
      count,
      pct: top > 0 ? clamp((amount / top) * 100, 2, 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const latestFirst = [...expenses].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return {
    totalExpenses,
    remaining,
    percentUsed,
    status,
    expenseCount: expenses.length,
    avgPerDay,
    biggestExpense,
    byCategory,
    cycle,
    latestFirst,
  };
}

export function useFinanceStats(
  salary: SalaryCycle | null,
  expenses: Expense[],
): FinanceStats {
  return useMemo(() => computeFinanceStats(salary, expenses), [salary, expenses]);
}
