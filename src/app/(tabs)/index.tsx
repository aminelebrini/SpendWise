import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { ScreenBackground } from '@/components/ScreenBackground';
import { GlassCard } from '@/components/GlassCard';
import { StatTile } from '@/components/StatTile';
import { SectionHeader } from '@/components/SectionHeader';
import { BudgetProgress } from '@/components/BudgetProgress';
import { ExpenseRow } from '@/components/ExpenseRow';
import { EXPENSE_CATEGORY_MAP } from '@/constants/categories';
import { colors, gradients, radius, spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/i18n';
import { useFinanceStats } from '@/hooks/useFinanceStats';
import { formatCurrencyWhole, formatDate } from '@/utils/format';

export default function DashboardScreen() {
  const { currentSalary, currentExpenses, hydrated } = useFinance();
  const { t, lang, setLang } = useLanguage();
  const stats = useFinanceStats(currentSalary, currentExpenses);

  const salaryAmount = currentSalary?.amount ?? 0;
  const latest = useMemo(() => stats.latestFirst.slice(0, 3), [stats.latestFirst]);

  const toggleLanguage = () => {
    void Haptics.selectionAsync();
    void setLang(lang === 'fr' ? 'ar' : 'fr');
  };

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* ── Top bar ─────────────────────────────────────────── */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <LinearGradient
                colors={gradients.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBadge}
              >
                <Ionicons name="cash" size={20} color="#04060C" />
              </LinearGradient>
              <View style={styles.brandText}>
                <Text style={styles.brandName}>SpendWise</Text>
                <Text style={styles.brandSub}>{t('dashboard.brandSub')}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.languageA11y')}
              onPress={toggleLanguage}
              style={({ pressed }) => [styles.langButton, pressed && styles.langPressed]}
            >
              <Ionicons name="globe-outline" size={15} color={colors.accent} />
              <Text style={styles.langText}>{lang === 'fr' ? 'FR' : 'عربي'}</Text>
            </Pressable>
          </View>

          {/* ── Salary hero + consumption ─────────────────────────── */}
          <LinearGradient
            colors={gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroGlow} />
            <View style={styles.heroTopRow}>
              <Text style={styles.heroOverline}>{t('dashboard.salaryActive')}</Text>
              {salaryAmount > 0 ? (
                <View style={styles.activePill}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>{lang === 'ar' ? 'نشط' : 'ACTIF'}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.heroAmount} adjustsFontSizeToFit numberOfLines={1}>
              {formatCurrencyWhole(hydrated ? salaryAmount : 0)}
            </Text>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMeta}>
                <Ionicons name="briefcase-outline" size={13} color="rgba(255,255,255,0.6)" />
                <Text style={styles.heroMetaText}>{currentSalary?.company ?? '—'}</Text>
              </View>
              <View style={styles.heroMeta}>
                <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.6)" />
                <Text style={styles.heroMetaText}>
                  {currentSalary ? t('dashboard.since', { date: formatDate(currentSalary.startDate) }) : ''}
                </Text>
              </View>
            </View>
            <View style={styles.heroDivider} />
            <BudgetProgress spent={stats.totalExpenses} salary={salaryAmount} />
            <View style={styles.cycleRow}>
              <Text style={styles.cycleDay}>
                {t('dashboard.cycleDay', { day: stats.cycle.daysElapsed, total: stats.cycle.daysInCycle })}
              </Text>
              <Text style={styles.cyclePct}>{stats.cycle.progress}%</Text>
            </View>
          </LinearGradient>

          {/* ── First-run hint ─────────────────────────────────── */}
          {salaryAmount === 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.updateSalary')}
              onPress={() => router.push('/update-salary')}
              style={({ pressed }) => [styles.setupHint, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="bulb-outline" size={17} color={colors.warning} />
              <Text style={styles.setupHintText}>{t('dashboard.setupHint')}</Text>
            </Pressable>
          ) : null}

          {/* ── Primary actions ─────────────────────────────────── */}
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.addExpense')}
              onPress={() => router.push('/add-expense')}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.actionPressed]}
            >
              <LinearGradient
                colors={gradients.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryActionGradient}
              >
                <Ionicons name="add-circle" size={20} color="#04060C" />
                <Text style={styles.primaryActionText}>{t('dashboard.addExpense')}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.updateSalary')}
              onPress={() => router.push('/update-salary')}
              style={({ pressed }) => [styles.secondaryAction, pressed && styles.secondaryActionPressed]}
            >
              <Ionicons name="swap-horizontal" size={18} color={colors.accentGold} />
              <Text style={styles.secondaryActionText}>{t('dashboard.updateSalary')}</Text>
            </Pressable>
          </View>

          {/* ── KPI tiles ───────────────────────────────────────── */}
          <View style={styles.tileRow}>
            <StatTile
              icon="receipt-outline"
              label={t('dashboard.kpiCount')}
              value={String(stats.expenseCount)}
              tone="cyan"
            />
            <StatTile
              icon="trending-up-outline"
              label={t('dashboard.kpiAvgDay')}
              value={formatCurrencyWhole(stats.avgPerDay)}
              tone="amber"
            />
            <StatTile
              icon="arrow-up-circle-outline"
              label={t('dashboard.kpiBiggest')}
              value={stats.biggestExpense ? formatCurrencyWhole(stats.biggestExpense.amount) : '—'}
              sub={stats.biggestExpense ? t(EXPENSE_CATEGORY_MAP[stats.biggestExpense.category].labelKey) : undefined}
              tone="rose"
            />
          </View>

          {/* ── Latest expenses ─────────────────────────────────── */}
          <SectionHeader
            title={t('dashboard.latest')}
            actionLabel={t('dashboard.seeAll')}
            onAction={() => router.push('/expenses')}
          />
          {latest.length === 0 ? (
            <GlassCard>
              <Text style={styles.emptyHint}>{t('dashboard.emptyLatest')}</Text>
            </GlassCard>
          ) : (
            <View>
              {latest.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </View>
          )}

          <Text style={styles.footerNote}>{t('dashboard.footerNote')}</Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_SPACE + spacing.xl,
  },

  // Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 1 },
  brandText: { flexShrink: 1 },
  logoBadge: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  brandSub: { color: colors.textMuted, fontSize: 10, fontWeight: '500', marginTop: 1 },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.4)',
    backgroundColor: colors.accentSoft,
  },
  langPressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
  langText: { color: colors.accent, fontSize: 12, fontWeight: '800' },

  // Hero
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.22)',
    overflow: 'hidden',
    gap: 6,
  },
  heroGlow: {
    position: 'absolute',
    top: -70,
    end: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(52,211,153,0.16)',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  heroOverline: { color: 'rgba(255,255,255,0.55)', fontSize: 10.5, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  activePill: {
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
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accentGold },
  activeText: { color: colors.accentGold, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: spacing.md },
  cycleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  cycleDay: { color: 'rgba(255,255,255,0.5)', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  cyclePct: { color: colors.accentGold, fontSize: 11, fontWeight: '800', fontVariant: ['tabular-nums'] },

  // First-run hint
  setupHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
  },
  setupHintText: { flex: 1, color: colors.warning, fontSize: 12.5, fontWeight: '600', lineHeight: 18 },

  // Actions
  actionsRow: { gap: spacing.sm, marginTop: spacing.lg },
  primaryAction: { borderRadius: radius.lg, overflow: 'hidden' },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 16,
  },
  primaryActionText: { color: '#04060C', fontSize: 15.5, fontWeight: '800', letterSpacing: 0.2 },
  actionPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
    backgroundColor: colors.accentGoldSoft,
  },
  secondaryActionPressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  secondaryActionText: { color: colors.accentGold, fontSize: 14, fontWeight: '700' },

  // KPIs
  tileRow: { flexDirection: 'row', gap: spacing.sm + 2, marginTop: spacing.lg },

  emptyHint: { color: colors.textMuted, fontSize: 13, fontWeight: '500', textAlign: 'center', paddingVertical: spacing.sm },
  footerNote: { color: colors.textFaint, fontSize: 10.5, textAlign: 'center', marginTop: spacing.xl },
});
