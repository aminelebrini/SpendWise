import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ExpenseRow } from '@/components/ExpenseRow';
import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { colors, radius, spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/i18n';
import type { ExpenseCategoryId, Expense } from '@/types';
import { daysUntil, formatCurrency } from '@/utils/format';
import { groupExpensesByDay } from '@/utils/cycle';

type CategoryFilter = ExpenseCategoryId | 'all';

export default function ExpensesScreen() {
  const { currentExpenses, hydrated, deleteExpense } = useFinance();
  const { t, locale } = useLanguage();

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return currentExpenses.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (!q) return true;
      return item.title.toLowerCase().includes(q);
    });
  }, [currentExpenses, query, categoryFilter]);

  const filteredTotal = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered],
  );

  const dayLabel = useCallback(
    (date: Date): string => {
      const d = daysUntil(date.toISOString());
      if (d === 0) return t('common.today');
      if (d === -1) return t('common.yesterday');
      const raw = date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    },
    [locale, t],
  );

  const sections = useMemo(
    () => groupExpensesByDay(filtered, dayLabel),
    [filtered, dayLabel],
  );

  const confirmDelete = useCallback(
    (expense: Expense) => {
      Alert.alert(t('expenses.deleteTitle'), t('expenses.deleteBody', { title: expense.title }), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            deleteExpense(expense.id);
          },
        },
      ]);
    },
    [deleteExpense, t],
  );

  const isEmpty = hydrated && filtered.length === 0;
  const noMatch = currentExpenses.length > 0 && filtered.length === 0;

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('expenses.title')}</Text>
          <Text style={styles.subtitle}>
            {t('expenses.subtitle', { count: filtered.length, amount: formatCurrency(filteredTotal) })}
          </Text>
        </View>

        {/* ── Search ─────────────────────────────────────────── */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('expenses.searchPlaceholder')}
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.searchInput}
            accessibilityLabel={t('expenses.searchA11y')}
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('expenses.clearSearch')}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* ── Category chips ─────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          <CategoryChip
            label={t('expenses.filterAll')}
            icon="apps"
            selected={categoryFilter === 'all'}
            onPress={() => setCategoryFilter('all')}
          />
          {EXPENSE_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={t(cat.labelKey)}
              icon={cat.icon}
              color={cat.color}
              selected={categoryFilter === cat.id}
              onPress={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}
            />
          ))}
        </ScrollView>

        {/* ── List ───────────────────────────────────────────── */}
        {isEmpty ? (
          noMatch ? (
            <EmptyState
              icon="search-outline"
              title={t('expenses.noMatchTitle')}
              subtitle={t('expenses.noMatchSubtitle')}
              actionLabel={t('expenses.clearFilters')}
              onAction={() => {
                setQuery('');
                setCategoryFilter('all');
              }}
            />
          ) : (
            <EmptyState
              icon="receipt-outline"
              title={t('expenses.emptyTitle')}
              subtitle={t('expenses.emptySubtitle')}
              actionLabel={t('expenses.addFirst')}
              onAction={() => router.push('/add-expense')}
            />
          )
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExpenseRow expense={item} showDate={false} onDelete={() => confirmDelete(item)} />
            )}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionLine} />
              </View>
            )}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              <View style={styles.footerTotal}>
                <Text style={styles.footerLabel}>{t('expenses.footerTotal')}</Text>
                <Text style={styles.footerAmount}>{formatCurrency(filteredTotal)}</Text>
              </View>
            }
          />
        )}

        <Fab label={t('expenses.fabLabel')} onPress={() => router.push('/add-expense')} />
      </SafeAreaView>
    </ScreenBackground>
  );
}

function CategoryChip({
  label,
  icon,
  color,
  selected,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const tint = color ?? colors.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={[
        chipStyles.chip,
        selected && { backgroundColor: `${tint}26`, borderColor: `${tint}66` },
      ]}
    >
      <Ionicons name={icon} size={13} color={selected ? tint : colors.textMuted} />
      <Text style={[chipStyles.label, selected && { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginEnd: 8,
  },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: colors.textMuted, fontSize: 12.5, fontWeight: '600', marginTop: 2, fontVariant: ['tabular-nums'] },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14.5, paddingVertical: 0, textAlign: 'auto' },

  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: TAB_BAR_SPACE + spacing.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  sectionTitle: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },

  footerTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
    backgroundColor: colors.accentSoft,
  },
  footerLabel: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  footerAmount: { color: colors.text, fontSize: 17, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
