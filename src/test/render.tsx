import { render as testingLibraryRender } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type * as React from 'react'

import { defaultLocale } from '@/site.config'

import messages from '../../messages/pl.json'

/**
 * `render` z kontekstem next-intl — `Button` z `href` bez providera rzuca „No intl
 * context found". Importuj STĄD, nie z `@testing-library/react`.
 *
 * Tłumaczenia prawdziwe, nie atrapa: test sięgający po nieistniejący klucz
 * przewraca się tutaj, a nie na stronie.
 */
export function render(
	ui: React.ReactElement,
	options?: Parameters<typeof testingLibraryRender>[1]
) {
	return testingLibraryRender(ui, {
		wrapper: ({ children }) => (
			<NextIntlClientProvider
				locale={defaultLocale}
				messages={messages}
			>
				{children}
			</NextIntlClientProvider>
		),
		...options,
	})
}

export * from '@testing-library/react'
