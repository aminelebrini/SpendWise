import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import * as Updates from 'expo-updates';
import { translations, type TranslationKey } from './translations';
import { setActiveLanguage, type AppLanguage } from './runtime';

export type { AppLanguage };

const STORAGE_KEY = 'spendwise/lang/v1';

export type TranslationParams = Record<string, string | number>;

interface LanguageContextValue {
  lang: AppLanguage;
  /** BCP-47 locale for Intl formatters (fr-MA / ar-MA). */
  locale: string;
  isRTL: boolean;
  ready: boolean;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  setLang: (lang: AppLanguage) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const deviceDefault = (): AppLanguage => {
  try {
    const code = getLocales()[0]?.languageCode ?? 'fr';
    return code.startsWith('ar') ? 'ar' : 'fr';
  } catch {
    return 'fr';
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLanguage>('fr');
  const [ready, setReady] = useState(false);

  // Hydrate persisted preference before first render; force RTL up-front.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let initial: AppLanguage = deviceDefault();
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'fr' || stored === 'ar') initial = stored;
      } catch {
        // Fall back to device default.
      }
      if (cancelled) return;
      I18nManager.allowRTL(true);
      const shouldBeRTL = initial === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) I18nManager.forceRTL(shouldBeRTL);
      setActiveLanguage(initial);
      setLangState(initial);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = useCallback(async (next: AppLanguage) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persist best-effort; reload still applies the choice for this session.
    }
    setActiveLanguage(next);
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(next === 'ar');
    try {
      await Updates.reloadAsync();
    } catch {
      // Reload unavailable (e.g. some runtimes) — apply in place and tell the user.
      setLangState(next);
      Alert.alert(
        translations[next]['lang.restartTitle'],
        translations[next]['lang.restartBody'],
      );
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      let value: string = translations[lang][key] ?? key;
      if (params) {
        for (const [token, replacement] of Object.entries(params)) {
          value = value.replaceAll(`{${token}}`, String(replacement));
        }
      }
      return value;
    },
    [lang],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      locale: lang === 'ar' ? 'ar-MA' : 'fr-MA',
      isRTL: lang === 'ar',
      ready,
      t,
      setLang,
    }),
    [lang, ready, t, setLang],
  );

  // Avoid rendering views before RTL direction is committed.
  if (!ready) return null;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>');
  return ctx;
}
