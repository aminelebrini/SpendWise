import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/theme';
import { useLanguage } from '@/i18n';

/**
 * Floating glass tab bar — rounded, inset from the screen edges,
 * hovering above content with a hairline border.
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomOffset = Math.max(insets.bottom, 10) + 6;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginBottom: 8,
        },
        tabBarIconStyle: { marginTop: 6 },
        tabBarStyle: {
          position: 'absolute',
          start: 14,
          end: 14,
          bottom: bottomOffset,
          height: 62,
          borderRadius: 22,
          backgroundColor: 'rgba(11, 22, 17, 0.94)',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
        },
        tabBarItemStyle: { paddingTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarAccessibilityLabel: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: t('tabs.expenses'),
          tabBarAccessibilityLabel: t('tabs.expenses'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarAccessibilityLabel: t('tabs.history'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
