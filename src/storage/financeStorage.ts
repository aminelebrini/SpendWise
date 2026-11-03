import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FinanceState } from '@/types';

/**
 * Typed persistence layer over AsyncStorage — the single source of truth
 * is one versioned JSON document, so writes are atomic (no half-saved state
 * when the app is killed mid-write).
 */

const KEYS = {
  finance: 'spendwise/finance/v2',
} as const;

const isFinanceState = (value: unknown): value is FinanceState => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<FinanceState>;
  return Array.isArray(v.currentExpenses) && Array.isArray(v.financialHistory);
};

export async function loadFinanceState(): Promise<FinanceState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.finance);
    if (raw == null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isFinanceState(parsed)) {
      console.warn('[storage] Corrupt finance payload — ignoring.');
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('[storage] Failed to load finance state', error);
    return null;
  }
}

export async function saveFinanceState(state: FinanceState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.finance, JSON.stringify(state));
  } catch (error) {
    console.warn('[storage] Failed to save finance state', error);
  }
}
