import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/theme';

/**
 * App-wide backdrop: near-black green base + soft emerald/amber glow orbs
 * and a top vignette. Sits behind every screen.
 */
export function ScreenBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0B1712', colors.background, '#04080A']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, styles.orbGreen]} />
      <View style={[styles.orb, styles.orbAmber]} />
      <View style={[styles.orb, styles.orbTeal]} />
      {children}
    </View>
  );
}

const ORB_SIZE = 340;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orb: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
  },
  orbGreen: {
    top: -ORB_SIZE * 0.42,
    end: -ORB_SIZE * 0.38,
    backgroundColor: colors.backgroundOrbGreen,
  },
  orbAmber: {
    top: '34%',
    start: -ORB_SIZE * 0.55,
    backgroundColor: colors.backgroundOrbAmber,
  },
  orbTeal: {
    bottom: -ORB_SIZE * 0.4,
    end: -ORB_SIZE * 0.45,
    backgroundColor: colors.backgroundOrbTeal,
  },
});
