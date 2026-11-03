/**
 * SpendWise domain types — salary cycles, expenses and archived history.
 */

export type ExpenseCategoryId =
  | 'food'
  | 'housing'
  | 'transport'
  | 'utilities'
  | 'health'
  | 'shopping'
  | 'entertainment'
  | 'family'
  | 'education'
  | 'other';

/** The active salary for the current financial cycle. */
export interface SalaryCycle {
  id: string;
  /** Net salary amount in dirhams. */
  amount: number;
  company: string;
  /** ISO date — when this cycle (and salary) started. */
  startDate: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  title: string;
  /** Amount in dirhams (always positive — it's a spend). */
  amount: number;
  category: ExpenseCategoryId;
  /** ISO date of the purchase. */
  date: string;
}

/** A closed financial cycle, archived to history. */
export interface ClosedCycle {
  cycleId: string;
  company: string;
  salary: number;
  startDate: string;
  endDate: string;
  totalExpenses: number;
  savedAmount: number;
  expensesList: Expense[];
}

/** Entire persisted document. One blob = atomic writes. */
export interface FinanceState {
  currentSalary: SalaryCycle | null;
  currentExpenses: Expense[];
  financialHistory: ClosedCycle[];
}
