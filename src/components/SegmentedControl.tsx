import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ReactElement } from 'react';
import { colors, radius } from '@/constants/theme';

interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  /** compact = smaller text */
  compact?: boolean;
}

/** iOS-style segmented control with a subtle inset track. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  compact = false,
}: SegmentedControlProps<T>): ReactElement {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              void Haptics.selectionAsync();
              onChange(opt.value);
            }}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text
              numberOfLines={1}
              style={[styles.label, compact && styles.labelCompact, selected && styles.labelSelected]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  segmentSelected: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: '600',
  },
  labelCompact: {
    fontSize: 11.5,
  },
  labelSelected: {
    color: colors.text,
  },
});
