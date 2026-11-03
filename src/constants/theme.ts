/**
 * SpendWise design system — dark, glassmorphic "money" theme (emerald + gold).
 */

export const colors = {
  background: '#060B09',
  backgroundElevated: '#0C1411',
  backgroundOrbGreen: 'rgba(52, 211, 153, 0.14)',
  backgroundOrbAmber: 'rgba(251, 191, 36, 0.10)',
  backgroundOrbTeal: 'rgba(45, 212, 191, 0.10)',

  card: 'rgba(255, 255, 255, 0.045)',
  cardStrong: 'rgba(255, 255, 255, 0.075)',
  cardPressed: 'rgba(255, 255, 255, 0.09)',
  border: 'rgba(255, 255, 255, 0.09)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  text: '#F2FBF6',
  textMuted: '#8AA092',
  textFaint: '#5C6F63',

  accent: '#34D399',
  accentSoft: 'rgba(52, 211, 153, 0.14)',
  accentGold: '#FBBF24',
  accentGoldSoft: 'rgba(251, 191, 36, 0.14)',
  accentTeal: '#2DD4BF',
  accentViolet: '#A78BFA',

  danger: '#FB7185',
  dangerSoft: 'rgba(251, 113, 133, 0.14)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.14)',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.14)',
} as const;

export const gradients = {
  accent: ['#34D399', '#FBBF24'] as [string, string, ...string[]],
  accentAlt: ['#2DD4BF', '#34D399'] as [string, string, ...string[]],
  hero: ['#065F46', '#0B1A14'] as [string, string],
  gold: ['#FBBF24', '#F59E0B'] as [string, string, ...string[]],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const fonts = {
  display: '800' as const,
} as const;

/** Height of the floating tab bar + its bottom offset; screens pad for it. */
export const TAB_BAR_SPACE = 108;
