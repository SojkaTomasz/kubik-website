import { useTranslations } from 'next-intl'

/** Identyfikator znacznika `<main>` — cel pominięcia nawigacji. */
export const MAIN_CONTENT_ID = 'content'

/**
 * Pominięcie nawigacji — pierwszy element w kolejności Tab (WCAG 2.4.1). `sr-only`
 * chowa go przed wzrokiem, ale zostawia czytnikom i Tabowi; `focus:not-sr-only`
 * pokazuje, gdy jest potrzebny. Zwykły `<a>`: skok do kotwicy nie jest nawigacją.
 */
export function SkipLink() {
	const t = useTranslations('nav')

	return (
		<a
			href={`#${MAIN_CONTENT_ID}`}
			className='sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-ring'
		>
			{t('skipToContent')}
		</a>
	)
}
