'use client'

import { useTranslations } from 'next-intl'

import { Button, type ButtonProps } from '@/components/ui/button'
import { openConsentSettings } from '@/lib/analytics/consent'

/**
 * Ponowne otwarcie ustawień — WYMÓG RODO, nie wygoda: wycofanie zgody musi być
 * tak samo łatwe jak jej udzielenie, a baner znika po pierwszej decyzji.
 *
 * Zdarzenie okna zamiast kontekstu, żeby przycisk działał z dowolnego miejsca.
 *
 * Wygląd przyjmuje propsami — w stopce to odnośnik, w polityce prywatności
 * pełny przycisk. Domyślnie odnośnik z napisem „Ustawienia cookies".
 */
export function CookieSettingsButton({
	variant = 'link',
	size = 'none',
	children,
	...props
}: Omit<ButtonProps, 'onClick' | 'href'>) {
	const t = useTranslations('cookies')

	return (
		<Button
			variant={variant}
			size={size}
			onClick={openConsentSettings}
			{...props}
		>
			{children ?? t('reopen')}
		</Button>
	)
}
