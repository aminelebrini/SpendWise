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
import { colors, gradients, radius, spacing } from '@/constants/theme';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/i18n';
import {
  formatCurrencyWhole,
  parseDateInput,
  toDateInputValue,
} from '@/utils/format';
import { cycleRangeLabel } from '@/utils/cycle';

export default function UpdateSalaryModal() {
  const { currentSalary, currentExpenses, closeCycle } = useFinance();
  const { t, locale } = useLanguage();

  const [amount, setAmount] = useState('');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date().toISOString()));
  const [errors, setErrors] = useState<{ amount?: string; company?: string; startDate?: string }>({});

  const period = currentSalary
    ? cycleRangeLabel(currentSalary.startDate, new Date().toISOString(), locale)
    : '—';

  const totalSpent = currentExpenses.reduce((s, e) => s + e.amount, 0);
  /** A cycle is archived only when it carries real data (salary or expenses). */
  const willArchive = (currentSalary?.amount ?? 0) > 0 || currentExpenses.length > 0;

  const validate = () => {
    const next: typeof errors = {};
    const parsed = Number(amount.replace(',', '.'));
    if (amount.trim() === '' || Number.isNaN(parsed) || parsed <= 0) {
      next.amount = t('salary.errorAmount');
    }
    if (!company.trim()) next.company = t('salary.errorCompany');
    const parsedDate = parseDateInput(startDate);
    if (!parsedDate) next.startDate = t('salary.errorDate');
    setErrors(next);
    return { valid: Object.keys(next).length === 0, parsed, parsedDate };
  };

  const handleSave = () => {
    const { valid, parsed, parsedDate } = validate();
    if (!valid || !parsedDate) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Alert.alert(
      willArchive ? t('salary.confirmTitle') : t('salary.confirmTitleFresh'),
      willArchive
        ? t('salary.confirmBody', {
            company: company.trim(),
            amount: formatCurrencyWhole(parsed),
            count: currentExpenses.length,
          })
        : t('salary.confirmBodyFresh', {
            company: company.trim(),
            amount: formatCurrencyWhole(parsed),
          }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: willArchive ? t('salary.confirmButton') : t('salary.confirmButtonFresh'),
          style: willArchive ? 'destructive' : 'default',
          onPress: () => {
            closeCycle({
              amount: parsed,
              company: company.trim(),
              startDate: parsedDate.toISOString(),
            });
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ],
    );
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
              <Text style={styles.headerOverline}>{t('salary.overline')}</Text>
              <Text style={styles.headerTitle}>{t('salary.title')}</Text>
            </View>
            <View style={styles.headerButtonSpacer} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
          >
            {/* ── What's about to happen ─────────────────────── */}
            <View style={styles.warningBox}>
              <View style={styles.warningIconWrap}>
                <Ionicons name="information-circle" size={20} color={colors.warning} />
              </View>
              <View style={styles.warningBody}>
                <Text style={styles.warningTitle}>{t('salary.warningTitle')}</Text>
                <Text style={styles.warningText}>{t('salary.warningBody', { period })}</Text>
              </View>
            </View>

            {/* ── Current cycle recap ─────────────────────────── */}
            <View style={styles.recapCard}>
              <RecapRow label={t('salary.recapCurrent')} value={formatCurrencyWhole(currentSalary?.amount ?? 0)} />
              <View style={styles.recapDivider} />
              <RecapRow label={t('salary.recapSpent')} value={formatCurrencyWhole(totalSpent)} accent={colors.danger} />
              <View style={styles.recapDivider} />
              <RecapRow label={t('salary.recapCount')} value={String(currentExpenses.length)} />
            </View>

            {/* ── New salary ──────────────────────────────────── */}
            <FieldLabel required>{t('salary.amountLabel')}</FieldLabel>
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
                autoFocus
                accessibilityLabel={t('salary.amountLabel')}
              />
              <Text style={styles.costSuffix}>MAD</Text>
            </View>
            {errors.amount ? <FieldError message={errors.amount} /> : null}

            {/* ── Company ─────────────────────────────────────── */}
            <FieldLabel required>{t('salary.companyLabel')}</FieldLabel>
            <TextInput
              value={company}
              onChangeText={(v) => {
                setCompany(v);
                if (errors.company) setErrors((e) => ({ ...e, company: undefined }));
              }}
              placeholder={t('salary.companyPlaceholder')}
              placeholderTextColor={colors.textFaint}
              style={[styles.input, errors.company && styles.inputError]}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel={t('salary.companyLabel')}
            />
            {errors.company ? <FieldError message={errors.company} /> : null}

            {/* ── Effective date ─────────────────────────────────── */}
            <FieldLabel required>{t('salary.startLabel')}</FieldLabel>
            <TextInput
              value={startDate}
              onChangeText={(v) => {
                setStartDate(v);
                if (errors.startDate) setErrors((e) => ({ ...e, startDate: undefined }));
              }}
              placeholder={t('add.datePlaceholder')}
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
              style={[styles.input, errors.startDate && styles.inputError]}
              accessibilityLabel={t('salary.startA11y')}
            />
            {errors.startDate ? <FieldError message={errors.startDate} /> : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void Haptics.selectionAsync();
                setStartDate(toDateInputValue(new Date().toISOString()));
              }}
              style={({ pressed }) => [styles.todayButton, pressed && styles.todayPressed]}
            >
              <Ionicons name="today-outline" size={14} color={colors.accent} />
              <Text style={styles.todayText}>{t('common.today')}</Text>
            </Pressable>

            {/* ── Save ─────────────────────────────────────────── */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('salary.saveA11y')}
              onPress={handleSave}
              style={({ pressed }) => [styles.saveWrap, pressed && styles.savePressed]}
            >
              <LinearGradient
                colors={gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                <Ionicons name="lock-closed-outline" size={19} color="#04060C" />
                <Text style={styles.saveText}>{t('salary.save')}</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function RecapRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.recapRow}>
      <Text style={styles.recapLabel}>{label}</Text>
      <Text style={[styles.recapValue, accent ? { color: accent } : null]}>{value}</Text>
    </View>
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
  headerOverline: { color: colors.accentGold, fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
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

  // Warning
  warningBox: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
    marginTop: spacing.sm,
  },
  warningIconWrap: { paddingTop: 1 },
  warningBody: { flex: 1, gap: 3 },
  warningTitle: { color: colors.warning, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  warningText: { color: 'rgba(255,255,255,0.75)', fontSize: 12.5, fontWeight: '500', lineHeight: 18 },

  // Recap
  recapCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  recapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  recapLabel: { color: colors.textMuted, fontSize: 12.5, fontWeight: '600' },
  recapValue: { color: colors.text, fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  recapDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },

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
  currencySymbol: { color: colors.accentGold, fontSize: 17, fontWeight: '800' },
  costInput: { flex: 1, color: colors.text, fontSize: 26, fontWeight: '800', paddingVertical: 12, fontVariant: ['tabular-nums'] },
  costSuffix: { color: colors.textFaint, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },

  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
    backgroundColor: colors.accentSoft,
  },
  todayPressed: { opacity: 0.75 },
  todayText: { color: colors.accent, fontSize: 12, fontWeight: '700' },

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
  saveText: { color: '#04060C', fontSize: 15.5, fontWeight: '800', letterSpacing: 0.2 },
});
