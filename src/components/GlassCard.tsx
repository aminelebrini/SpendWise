import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Removes default padding (for cards with edge-to-edge rows). */
  bare?: boolean;
  accessibilityLabel?: string;
}

/**
 * Frosted-glass surface: translucent fill, hairline border, soft shadow.
 * Highlights on the top edge are faked with a lighter border.
 */
export const GlassCard = memo(function GlassCard({
  children,
  style,
  onPress,
  bare = false,
  accessibilityLabel,
}: GlassCardProps) {
  const baseStyle = [styles.card, !bare && styles.padded, style];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [baseStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={baseStyle}>{children}</View>;
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    // Subtle top-edge highlight keeps the glass illusion on dark backgrounds.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.cardPressed,
    borderColor: colors.borderStrong,
    transform: [{ scale: 0.985 }],
  },
});
