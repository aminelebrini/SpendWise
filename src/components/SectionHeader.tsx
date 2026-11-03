import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Small caps row above grouped content, with optional right-side action. */
export const SectionHeader = memo(function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Text accessibilityRole="button" onPress={onAction} style={styles.action}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  title: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  action: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
