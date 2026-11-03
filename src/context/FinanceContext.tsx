import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ClosedCycle, Expense, FinanceState, SalaryCycle } from '@/types';
import {
  loadFinanceState,
  saveFinanceState,
} from '@/storage/financeStorage';

export interface CloseCycleInput {
  /** New net salary in dirhams (must be > 0). */
  amount: number;
  company: string;
  /** ISO date when the new cycle takes effect (usually today). */
  startDate: string;
}

interface FinanceContextValue {
  currentSalary: SalaryCycle | null;
  currentExpenses: Expense[];
  financialHistory: ClosedCycle[];
  /** false until the first read from AsyncStorage completes. */
  hydrated: boolean;
  addExpense: (draft: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;
  /**
   * Close the active cycle: archive salary + expenses into `financialHistory`,
   * then start a fresh cycle (new salary, zeroed expenses).
   * Cycles with no salary and no expenses are NOT archived (nothing to close).
   * Returns the archived cycle, or null when nothing was archived.
   */
  closeCycle: (input: CloseCycleInput) => ClosedCycle | null;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const createId = (): string =>
  `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Fresh install: everything at zero — no salary, no expenses, no history. */
const buildEmptyState = (): FinanceState => ({
  currentSalary: {
    id: 'salary-initial',
    amount: 0,
    company: '',
    startDate: new Date().toISOString(),
    isActive: true,
  },
  currentExpenses: [],
  financialHistory: [],
});

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(() => buildEmptyState());
  const [hydrated, setHydrated] = useState(false);

  // --- Initial hydration: stored data wins, otherwise persist the zero state ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadFinanceState();
      if (cancelled) return;
      if (stored !== null) {
        setState(stored);
      } else {
        const empty = buildEmptyState();
        setState(empty);
        await saveFinanceState(empty);
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Write-through persistence (only after hydration to avoid clobbering) ---
  useEffect(() => {
    if (hydrated) void saveFinanceState(state);
  }, [state, hydrated]);

  const addExpense = useCallback<FinanceContextValue['addExpense']>((draft) => {
    const expense: Expense = { ...draft, id: createId() };
    setState((prev) => ({
      ...prev,
      currentExpenses: [expense, ...prev.currentExpenses],
    }));
    return expense;
  }, []);

  const deleteExpense = useCallback<FinanceContextValue['deleteExpense']>((id) => {
    setState((prev) => ({
      ...prev,
      currentExpenses: prev.currentExpenses.filter((e) => e.id !== id),
    }));
  }, []);

  const closeCycle = useCallback<FinanceContextValue['closeCycle']>(
    ({ amount, company, startDate }) => {
      if (!Number.isFinite(amount) || amount <= 0) return null;
      const now = new Date().toISOString();

      const salary = state.currentSalary;
      const expenses = state.currentExpenses;
      const totalSpent = round2(expenses.reduce((s, e) => s + e.amount, 0));
      const hasMeaningfulCycle =
        (salary !== null && salary.amount > 0) || expenses.length > 0;

      // Nothing recorded yet → this is a first-time salary setup, not a cycle close.
      const archived: ClosedCycle | null = hasMeaningfulCycle
        ? {
            cycleId: createId(),
            company: salary?.company ?? '',
            salary: salary?.amount ?? 0,
            startDate: salary?.startDate ?? now,
            endDate: now,
            totalExpenses: totalSpent,
            savedAmount: round2((salary?.amount ?? 0) - totalSpent),
            expensesList: expenses,
          }
        : null;

      setState((prev) => ({
        currentSalary: {
          id: createId(),
          amount: round2(amount),
          company: company.trim(),
          startDate,
          isActive: true,
        },
        currentExpenses: [],
        financialHistory: archived ? [archived, ...prev.financialHistory] : prev.financialHistory,
      }));

      return archived;
    },
    [state.currentSalary, state.currentExpenses],
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      currentSalary: state.currentSalary,
      currentExpenses: state.currentExpenses,
      financialHistory: state.financialHistory,
      hydrated,
      addExpense,
      deleteExpense,
      closeCycle,
    }),
    [state, hydrated, addExpense, deleteExpense, closeCycle],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within <FinanceProvider>');
  return ctx;
}
