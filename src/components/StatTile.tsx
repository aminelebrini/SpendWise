import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius, spacing } from '@/constants/theme';

type Tone = 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';

const TONE: Record<Tone, { fg: string; bg: string }> = {
  cyan: { fg: '#22D3EE', bg: 'rgba(34,211,238,0.12)' },
  violet: { fg: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  emerald: { fg: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  amber: { fg: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  rose: { fg: '#FB7185', bg: 'rgba(251,113,133,0.12)' },
};

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}

/** Compact KPI tile for dashboard grids. */
export const StatTile = memo(function StatTile({ icon, label, value, sub, tone = 'cyan' }: StatTileProps) {
  const t = TONE[tone];
  return (
    <View style={styles.tile}>
      <View style={[styles.iconChip, { backgroundColor: t.bg }]}>
        <Ionicons name={icon} size={16} color={t.fg} />
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {sub ? (
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
    minHeight: 96,
  },
  iconChip: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sub: { color: colors.textFaint, fontSize: 10.5, fontWeight: '600' },
});
