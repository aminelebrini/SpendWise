import { useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '@/components/ScreenBackground';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { colors, gradients, radius, spacing } from '@/constants/theme';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/i18n';
import type { ExpenseCategoryId } from '@/types';
import { parseDateInput, toDateInputValue } from '@/utils/format';

const isoDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export default function AddExpenseModal() {
  const { addExpense } = useFinance();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategoryId>('food');
  const [date, setDate] = useState(() => toDateInputValue(isoDaysAgo(0)));
  const [errors, setErrors] = useState<{ title?: string; amount?: string; date?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = t('add.errorTitle');
    const parsed = Number(amount.replace(',', '.'));
    if (amount.trim() === '' || Number.isNaN(parsed) || parsed <= 0) {
      next.amount = t('add.errorAmount');
    }
    const parsedDate = parseDateInput(date);
    if (!parsedDate) next.date = t('add.errorDate');
    setErrors(next);
    return { valid: Object.keys(next).length === 0, parsed, parsedDate };
  };

  const handleSave = () => {
    const { valid, parsed, parsedDate } = validate();
    if (!valid || !parsedDate) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    addExpense({
      title: title.trim(),
      amount: Math.round(parsed * 100) / 100,
      category,
      date: parsedDate.toISOString(),
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* ── Modal header ─────────────────────────────────── */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('add.closeA11y')}
              onPress={() => router.back()}
              hitSlop={8}
              style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerOverline}>{t('add.overline')}</Text>
              <Text style={styles.headerTitle}>{t('add.title')}</Text>
            </View>
            <View style={styles.headerButtonSpacer} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
          >
            {/* ── Title ──────────────────────────────────────── */}
            <FieldLabel required>{t('add.titleLabel')}</FieldLabel>
            <TextInput
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
              }}
              placeholder={t('add.titlePlaceholder')}
              placeholderTextColor={colors.textFaint}
              style={[styles.input, errors.title && styles.inputError]}
              autoFocus
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel={t('add.titleLabel')}
            />
            {errors.title ? <FieldError message={errors.title} /> : null}

            {/* ── Amount ─────────────────────────────────────── */}
            <FieldLabel required>{t('add.amountLabel')}</FieldLabel>
            <View style={[styles.costWrap, errors.amount && styles.inputError]}>
              <Text style={styles.currencySymbol}>DH</Text>
              <TextInput
                value={amount}
                onChangeText={(v) => {
                  setAmount(v);
                  if (errors.amount) setErrors((e) => ({ ...e, amount: undefined }));
                }}
                placeholder="0,00"
                placeholderTextColor={colors.textFaint}
                keyboardType="decimal-pad"
                style={styles.costInput}
                accessibilityLabel={t('add.amountLabel')}
              />
              <Text style={styles.costSuffix}>MAD</Text>
            </View>
            {errors.amount ? <FieldError message={errors.amount} /> : null}

            {/* ── Category grid ──────────────────────────────── */}
            <FieldLabel>{t('add.categoryLabel')}</FieldLabel>
            <View style={styles.categoryGrid}>
              {EXPENSE_CATEGORIES.map((cat) => {
                const selected = category === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setCategory(cat.id);
                    }}
                    style={[
                      styles.categoryChip,
                      selected && { backgroundColor: `${cat.color}1F`, borderColor: `${cat.color}80` },
                    ]}
                  >
                    <Ionicons name={cat.icon} size={15} color={selected ? cat.color : colors.textMuted} />
                    <Text style={[styles.categoryLabel, selected && { color: cat.color }]}>
                      {t(cat.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ── Date ─────────────────────────────────────────── */}
            <FieldLabel required>{t('add.dateLabel')}</FieldLabel>
            <TextInput
              value={date}
              onChangeText={(v) => {
                setDate(v);
                if (errors.date) setErrors((e) => ({ ...e, date: undefined }));
              }}
              placeholder={t('add.datePlaceholder')}
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
              style={[styles.input, errors.date && styles.inputError]}
              accessibilityLabel={t('add.dateA11y')}
            />
            {errors.date ? <FieldError message={errors.date} /> : null}
            <View style={styles.presetRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void Haptics.selectionAsync();
                  setDate(toDateInputValue(isoDaysAgo(0)));
                }}
                style={({ pressed }) => [styles.presetButton, pressed && styles.presetPressed]}
              >
                <Text style={styles.presetText}>{t('common.today')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void Haptics.selectionAsync();
                  setDate(toDateInputValue(isoDaysAgo(1)));
                }}
                style={({ pressed }) => [styles.presetButton, pressed && styles.presetPressed]}
              >
                <Text style={styles.presetText}>{t('common.yesterday')}</Text>
              </Pressable>
            </View>

            {/* ── Save ─────────────────────────────────────────── */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('add.saveA11y')}
              onPress={handleSave}
              style={({ pressed }) => [styles.saveWrap, pressed && styles.savePressed]}
            >
              <LinearGradient
                colors={gradients.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                <Ionicons name="add-circle" size={20} color="#04060C" />
                <Text style={styles.saveText}>{t('add.save')}</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {children}
      {required ? <Text style={styles.requiredMark}> *</Text> : null}
    </Text>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.errorRow}>
      <Ionicons name="alert-circle" size={12} color={colors.danger} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerOverline: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 1 },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: { backgroundColor: colors.cardPressed, transform: [{ scale: 0.95 }] },
  headerButtonSpacer: { width: 40 },

  form: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: 4 },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: 7,
  },
  requiredMark: { color: colors.danger },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'auto',
  },
  inputError: { borderColor: 'rgba(251,113,133,0.55)' },

  costWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  currencySymbol: { color: colors.accent, fontSize: 17, fontWeight: '800' },
  costInput: { flex: 1, color: colors.text, fontSize: 26, fontWeight: '800', paddingVertical: 12, fontVariant: ['tabular-nums'] },
  costSuffix: { color: colors.textFaint, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  categoryLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },

  presetRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  presetButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
    backgroundColor: colors.accentSoft,
  },
  presetPressed: { opacity: 0.75 },
  presetText: { color: colors.accent, fontSize: 12.5, fontWeight: '800' },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  errorText: { color: colors.danger, fontSize: 11.5, fontWeight: '600' },

  saveWrap: { marginTop: spacing.xl, borderRadius: radius.lg, overflow: 'hidden' },
  savePressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 17,
  },
  saveText: { color: '#04060C', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});
