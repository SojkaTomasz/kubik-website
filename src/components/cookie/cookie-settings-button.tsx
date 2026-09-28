'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { openConsentSettings } from '@/lib/analytics/consent'

/**
 * Ponowne otwarcie ustawień — WYMÓG RODO, nie wygoda: wycofanie zgody musi być
 * tak samo łatwe jak jej udzielenie, a baner znika po pierwszej decyzji.
 *
 * Zdarzenie okna zamiast kontekstu, żeby przycisk działał z dowolnego miejsca.
 */
export function CookieSettingsButton() {
	const t = useTranslations('cookies')

	return (
		<Button
			variant='link'
			size='sm'
			className='h-auto p-0'
			onClick={openConsentSettings}
		>
			{t('reopen')}
		</Button>
	)
}
