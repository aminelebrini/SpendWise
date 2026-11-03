import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, TAB_BAR_SPACE } from '@/constants/theme';

interface FabProps {
  onPress: () => void;
  /** Visible + accessibility label (already localized by the caller). */
  label: string;
}

/** Floating action button rendered above the tab bar. */
export const Fab = memo(function Fab({ onPress, label }: FabProps) {
  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <LinearGradient colors={gradients.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <Ionicons name="add" size={28} color="#04060C" />
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </LinearGradient>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    end: 20,
    bottom: TAB_BAR_SPACE - 6,
    borderRadius: 999,
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
    zIndex: 20,
  },
  gradient: {
    height: 56,
    minWidth: 56,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.92,
  },
  label: {
    color: '#04060C',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
