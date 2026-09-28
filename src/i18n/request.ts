import { locale as localeParam } from 'next/root-params'
import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from '@/i18n/routing'

/**
 * Wybór języka i wczytanie tłumaczeń. Język z `next/root-params` (next-intl 4.14
 * uznał `requestLocale` i `setRequestLocale` za przestarzałe na jego rzecz).
 *
 * `locale` w wyniku jest OBOWIĄZKOWE — jego brak daje błąd dopiero w runtime.
 */
export default getRequestConfig(async ({ locale: explicitLocale }) => {
	// `explicitLocale` przy `getTranslations({ locale })` — root params nie działają
	// w Server Actions ani Route Handlerach.
	const requested = explicitLocale ?? (await localeParam())
	const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	}
})
