import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { FinanceProvider } from '@/context/FinanceContext';
import { LanguageProvider } from '@/i18n';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <FinanceProvider>
        <View style={styles.root}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="add-expense"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                contentStyle: { backgroundColor: colors.backgroundElevated },
              }}
            />
            <Stack.Screen
              name="update-salary"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                contentStyle: { backgroundColor: colors.backgroundElevated },
              }}
            />
            <Stack.Screen name="history/[cycleId]" />
          </Stack>
        </View>
      </FinanceProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
