import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '@/components/ScreenBackground';
import { GlassCard } from '@/components/GlassCard';
import { ExpenseRow } from '@/components/ExpenseRow';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, gradients, radius, spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/i18n';
import { formatCurrency, formatCurrencyWhole } from '@/utils/format';
import { cycleMonthLabel, cycleRangeLabel } from '@/utils/cycle';

export default function CycleDetailScreen() {
  const { cycleId } = useLocalSearchParams<{ cycleId: string }>();
  const { financialHistory, hydrated } = useFinance();
  const { t, locale } = useLanguage();

  const cycle = financialHistory.find((c) => c.cycleId === cycleId);

  if (hydrated && !cycle) {
    return (
      <ScreenBackground>
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
          <Header onBack={() => router.back()} title="—" />
          <EmptyState icon="help-circle-outline" title={t('detail.notFound')} subtitle={t('detail.notFoundSubtitle')} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const monthLabel = cycle ? cycleMonthLabel(cycle.startDate, locale) : '';
  const range = cycle ? cycleRangeLabel(cycle.startDate, cycle.endDate, locale) : '';
  const spentPct = cycle && cycle.salary > 0 ? Math.round((cycle.totalExpenses / cycle.salary) * 100) : 0;
  const savedPositive = (cycle?.savedAmount ?? 0) >= 0;
  const expenses = cycle ? [...cycle.expensesList].sort((a, b) => +new Date(b.date) - +new Date(a.date)) : [];

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <Header onBack={() => router.back()} title={monthLabel} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* ── Summary hero ─────────────────────────────────── */}
          <LinearGradient
            colors={gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroRange}>{range}</Text>
            <Text style={styles.heroCompany}>{cycle?.company}</Text>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>{t('detail.salary')}</Text>
                <Text style={styles.heroStatValue}>{formatCurrencyWhole(cycle?.salary ?? 0)}</Text>
              </View>
              <View style={styles.heroDividerV} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>{t('detail.totalSpent')}</Text>
                <Text style={[styles.heroStatValue, { color: '#FDA4AF' }]}>
                  {formatCurrencyWhole(cycle?.totalExpenses ?? 0)}
                </Text>
              </View>
            </View>

            <View style={styles.savingsBanner}>
              <Ionicons
                name={savedPositive ? 'trending-up' : 'trending-down'}
                size={18}
                color={savedPositive ? '#34D399' : '#FDA4AF'}
              />
              <View style={styles.savingsBody}>
                <Text style={styles.savingsLabel}>{t('detail.savedThisCycle')}</Text>
                <Text style={[styles.savingsAmount, savedPositive ? styles.savedGood : styles.savedBad]}>
                  {savedPositive ? '+' : '−'}
                  {formatCurrencyWhole(Math.abs(cycle?.savedAmount ?? 0))}
                </Text>
              </View>
              <Text style={styles.savingsPct}>{t('detail.consumed', { pct: spentPct })}</Text>
            </View>
          </LinearGradient>

          {/* ── Expenses ─────────────────────────────────────── */}
          <SectionHeader title={t('detail.expensesOfCycle', { count: expenses.length })} />
          {expenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}

          <Text style={styles.footerNote}>{formatCurrency(cycle?.totalExpenses ?? 0)}</Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  const { t } = useLanguage();
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('detail.backA11y')}
        onPress={onBack}
        hitSlop={8}
        style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: { backgroundColor: colors.cardPressed, transform: [{ scale: 0.95 }] },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 40 },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Hero
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.22)',
    gap: 4,
  },
  heroRange: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  heroCompany: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.4, marginBottom: spacing.md },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  heroStat: { flex: 1, gap: 3 },
  heroStatLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  heroStatValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  heroDividerV: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)' },

  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  savingsBody: { flex: 1 },
  savingsLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  savingsAmount: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'], marginTop: 1 },
  savedGood: { color: '#34D399' },
  savedBad: { color: '#FDA4AF' },
  savingsPct: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', maxWidth: 84, textAlign: 'center' },

  footerNote: { color: colors.textFaint, fontSize: 10.5, textAlign: 'center', marginTop: spacing.lg, fontVariant: ['tabular-nums'] },
});
