import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { useLanguage } from '@/i18n';
import { clamp, formatCurrencyWhole } from '@/utils/format';

interface ConsumptionBarProps {
  spent: number;
  salary: number;
}

/**
 * Animated salary-consumption bar. Hue shifts green → amber → red
 * as the month burns through the salary.
 */
export const BudgetProgress = memo(function BudgetProgress({ spent, salary }: ConsumptionBarProps) {
  const { t } = useLanguage();
  const pct = salary > 0 ? (spent / salary) * 100 : 0;
  const clamped = clamp(pct, 0, 100);
  const over = pct > 100;
  const fillColor = pct < 60 ? colors.success : pct < 85 ? colors.warning : colors.danger;

  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, {
      toValue: clamped,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [clamped, width]);
  const animatedWidth = width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{t('budget.label')}</Text>
        <Text style={styles.value}>
          <Text style={{ color: fillColor }}>{formatCurrencyWhole(spent)}</Text>
          {` / ${formatCurrencyWhole(salary)}`}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: animatedWidth, backgroundColor: fillColor }]} />
      </View>
      <View style={styles.footerRow}>
        <Text style={[styles.caption, over && { color: colors.danger }]}>
          {over
            ? t('budget.over', { amount: formatCurrencyWhole(spent - salary) })
            : t('budget.left', { amount: formatCurrencyWhole(Math.max(0, salary - spent)) })}
        </Text>
        <Text style={styles.pct}>{Math.round(pct)}%</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', flexShrink: 1 },
  value: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  track: {
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  caption: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '600' },
  pct: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
