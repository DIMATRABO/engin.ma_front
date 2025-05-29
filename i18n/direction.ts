export const localeDirections: Record<string, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
  fr: 'ltr'
};

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return localeDirections[locale] || 'ltr'; // Default to 'ltr' if locale is not found
}