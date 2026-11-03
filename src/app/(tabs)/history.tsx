import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '@/components/ScreenBackground';
import { EmptyState } from '@/components/EmptyState';
import { colors, gradients, radius, spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/i18n';
import type { ClosedCycle } from '@/types';
import { formatCurrencyWhole } from '@/utils/format';
import { cycleMonthLabel } from '@/utils/cycle';

export default function HistoryScreen() {
  const { financialHistory, hydrated } = useFinance();
  const { t, locale } = useLanguage();

  const summary = useMemo(() => {
    const cumulative = financialHistory.reduce((s, c) => s + c.savedAmount, 0);
    const best = financialHistory.reduce<ClosedCycle | null>(
      (acc, c) => (acc === null || c.savedAmount > acc.savedAmount ? c : acc),
      null,
    );
    return { cumulative, best };
  }, [financialHistory]);

  const isEmpty = hydrated && financialHistory.length === 0;

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('history.title')}</Text>
          <Text style={styles.subtitle}>{t('history.subtitle')}</Text>
        </View>

        {isEmpty ? (
          <EmptyState
            icon="time-outline"
            title={t('history.emptyTitle')}
            subtitle={t('history.emptySubtitle')}
          />
        ) : (
          <FlatList
            data={financialHistory}
            keyExtractor={(item) => item.cycleId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <LinearGradient
                colors={gradients.hero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryCard}
              >
                <View style={styles.summaryTop}>
                  <Text style={styles.summaryLabel}>{t('history.cumulativeSaved')}</Text>
                  <View style={styles.summaryBadge}>
                    <Ionicons name="trending-up" size={13} color={colors.accentGold} />
                    <Text style={styles.summaryBadgeText}>
                      {t(
                        financialHistory.length === 1 ? 'history.cyclesClosed_one' : 'history.cyclesClosed_other',
                        { count: financialHistory.length },
                      )}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.summaryAmount, summary.cumulative < 0 && styles.summaryNegative]}>
                  {summary.cumulative >= 0 ? '+' : '−'}
                  {formatCurrencyWhole(Math.abs(summary.cumulative))}
                </Text>
                {summary.best ? (
                  <Text style={styles.summaryBest}>
                    {t('history.bestCycle')} · {cycleMonthLabel(summary.best.startDate, locale)} (
                    {summary.best.savedAmount >= 0 ? '+' : '−'}
                    {formatCurrencyWhole(Math.abs(summary.best.savedAmount))})
                  </Text>
                ) : null}
              </LinearGradient>
            }
            renderItem={({ item }) => (
              <CycleCard
                cycle={item}
                monthLabel={cycleMonthLabel(item.startDate, locale)}
                onPress={() =>
                  router.push({ pathname: '/history/[cycleId]', params: { cycleId: item.cycleId } })
                }
              />
            )}
          />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

function CycleCard({
  cycle,
  monthLabel,
  onPress,
}: {
  cycle: ClosedCycle;
  monthLabel: string;
  onPress: () => void;
}) {
  const { t } = useLanguage();
  const savedPositive = cycle.savedAmount >= 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('history.detailA11y', { month: monthLabel })}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardMonth}>{monthLabel}</Text>
          <Text style={styles.cardCompany} numberOfLines={1}>{cycle.company}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>{t('history.salary')}</Text>
          <Text style={styles.statValue}>{formatCurrencyWhole(cycle.salary)}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>{t('history.spent')}</Text>
          <Text style={styles.statValue}>{formatCurrencyWhole(cycle.totalExpenses)}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>{t('history.saved')}</Text>
          <Text style={[styles.statValue, savedPositive ? styles.savedGood : styles.savedBad]}>
            {savedPositive ? '+' : '−'}
            {formatCurrencyWhole(Math.abs(cycle.savedAmount))}
          </Text>
        </View>
      </View>

      {/* Mini consumption strip */}
      <View style={styles.miniBarTrack}>
        <View
          style={[
            styles.miniBarFill,
            {
              width: `${Math.min(100, (cycle.totalExpenses / cycle.salary) * 100)}%`,
              backgroundColor: cycle.totalExpenses <= cycle.salary ? colors.accent : colors.danger,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { color: colors.textMuted, fontSize: 12.5, fontWeight: '500', marginTop: 2 },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: TAB_BAR_SPACE + spacing.xl,
    gap: spacing.md,
  },

  // Summary card
  summaryCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.22)',
    overflow: 'hidden',
    gap: 6,
    marginBottom: spacing.sm,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  summaryLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  summaryBadgeText: { color: colors.accentGold, fontSize: 9.5, fontWeight: '800' },
  summaryAmount: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', letterSpacing: -1.2, fontVariant: ['tabular-nums'] },
  summaryNegative: { color: '#FDA4AF' },
  summaryBest: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600' },

  // Cycle card
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardPressed: { backgroundColor: colors.cardPressed, transform: [{ scale: 0.985 }] },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  cardTitleWrap: { flex: 1 },
  cardMonth: { color: colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  cardCompany: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCell: { flex: 1, gap: 2 },
  statLabel: { color: colors.textFaint, fontSize: 9.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  statValue: { color: colors.text, fontSize: 14.5, fontWeight: '800', fontVariant: ['tabular-nums'] },
  savedGood: { color: colors.success },
  savedBad: { color: colors.danger },
  miniBarTrack: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },
});
