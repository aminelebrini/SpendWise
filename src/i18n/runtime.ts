/**
 * Mutable module-level locale used by pure utility functions (formatters)
 * that can't call React hooks. LanguageProvider keeps this in sync.
 */
export type AppLanguage = 'fr' | 'ar';

let activeLanguage: AppLanguage = 'fr';

export function setActiveLanguage(lang: AppLanguage): void {
  activeLanguage = lang;
}

export function getActiveLanguage(): AppLanguage {
  return activeLanguage;
}

/** BCP-47 locale for Intl formatters. */
export function getActiveLocale(): string {
  return activeLanguage === 'ar' ? 'ar-MA' : 'fr-MA';
}
