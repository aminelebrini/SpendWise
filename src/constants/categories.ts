import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ExpenseCategoryId } from '@/types';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface ExpenseCategoryMeta {
  id: ExpenseCategoryId;
  /** Translation key — resolve with t(`cat.${id}`). */
  labelKey: `cat.${ExpenseCategoryId}`;
  icon: IconName;
  color: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
  { id: 'food', labelKey: 'cat.food', icon: 'restaurant', color: '#FBBF24' },
  { id: 'housing', labelKey: 'cat.housing', icon: 'home', color: '#818CF8' },
  { id: 'transport', labelKey: 'cat.transport', icon: 'car', color: '#A78BFA' },
  { id: 'utilities', labelKey: 'cat.utilities', icon: 'flash', color: '#22D3EE' },
  { id: 'health', labelKey: 'cat.health', icon: 'medkit', color: '#34D399' },
  { id: 'shopping', labelKey: 'cat.shopping', icon: 'bag-handle', color: '#F472B6' },
  { id: 'entertainment', labelKey: 'cat.entertainment', icon: 'game-controller', color: '#C084FC' },
  { id: 'family', labelKey: 'cat.family', icon: 'people', color: '#FB7185' },
  { id: 'education', labelKey: 'cat.education', icon: 'school', color: '#2DD4BF' },
  { id: 'other', labelKey: 'cat.other', icon: 'apps', color: '#94A3B8' },
];

export const EXPENSE_CATEGORY_MAP: Record<ExpenseCategoryId, ExpenseCategoryMeta> =
  Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, c])) as Record<ExpenseCategoryId, ExpenseCategoryMeta>;
