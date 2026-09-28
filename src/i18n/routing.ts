import { defineRouting } from 'next-intl/routing'

import { defaultLocale, locales } from '@/site.config'

/**
 * `localePrefix: 'as-needed'` — język domyślny bez prefiksu, więc główna wersja
 * zachowuje krótkie, historyczne adresy z linkami zewnętrznymi.
 */
export const routing = defineRouting({
	locales,
	defaultLocale,
	localePrefix: 'as-needed',
	/**
	 * Bez wykrywania po Accept-Language: wymusza obsługę każdego żądania z osobna,
	 * co wyklucza cache na CDN i psuje statyczny render.
	 */
	localeDetection: false,
})
