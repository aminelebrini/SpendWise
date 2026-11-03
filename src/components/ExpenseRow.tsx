import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { EXPENSE_CATEGORY_MAP } from '@/constants/categories';
import { colors, radius, spacing } from '@/constants/theme';
import { useLanguage } from '@/i18n';
import type { Expense } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

interface ExpenseRowProps {
  expense: Expense;
  /** When provided, renders a delete button (with caller-owned confirmation). */
  onDelete?: () => void;
  /** Show the date under the title (flat lists). */
  showDate?: boolean;
}

export const ExpenseRow = memo(function ExpenseRow({ expense, onDelete, showDate = true }: ExpenseRowProps) {
  const { t } = useLanguage();
  const category = EXPENSE_CATEGORY_MAP[expense.category];

  return (
    <View style={styles.row}>
      <View style={[styles.iconTile, { backgroundColor: `${category.color}1F`, borderColor: `${category.color}44` }]}>
        <Ionicons name={category.icon} size={18} color={category.color} />
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.title}>
          {expense.title}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {t(category.labelKey)}
          {showDate ? ` · ${formatDate(expense.date)}` : ''}
        </Text>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.amount}>-{formatCurrency(expense.amount)}</Text>
        {onDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('expenses.deleteTitle')}
            hitSlop={6}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDelete();
            }}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.deletePressed]}
          >
            <Ionicons name="trash-outline" size={17} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: 14, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: 11, fontWeight: '500' },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  amount: { color: colors.text, fontSize: 14.5, fontWeight: '800', fontVariant: ['tabular-nums'] },
  deleteButton: { padding: 2 },
  deletePressed: { opacity: 0.6, transform: [{ scale: 0.92 }] },
});
