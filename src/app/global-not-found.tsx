import '@/app/globals.css'

import { NextIntlClientProvider } from 'next-intl'
import type { Metadata } from 'next'

import { DocumentShell } from '@/components/layout/document-shell'
import { NotFoundView } from '@/components/layout/not-found-view'
import { siteConfig } from '@/site.config'

/**
 * 404 dla adresów, które nie pasują do ŻADNEJ trasy.
 *
 * `not-found.tsx` tu nie wystarcza: bez pasującej trasy Next.js nie wchodzi
 * w drzewo segmentów, więc granica 404 w `[locale]` się nie renderuje. Wymaga
 * flagi `experimental.globalNotFound` — bez niej plik jest cicho ignorowany.
 *
 * Plik omija root layout, więc dokument trzeba zbudować samemu, razem
 * z importem `globals.css` (bez niego strona jest poprawna, ale bez stylów)
 * i kontekstem next-intl (`Button` z `href` bez niego rzuca błędem).
 * Język jest zawsze domyślny — nie ma go z czego odczytać.
 */
export const metadata: Metadata = {
	title: `404 | ${siteConfig.name}`,
	description: siteConfig.description,
}

export default function GlobalNotFound() {
	return (
		<DocumentShell lang={siteConfig.defaultLocale}>
			{/* `<main>` wprost, bo dokłada go zwykle root layout — a ten plik go omija. */}
			<NextIntlClientProvider>
				<main className='flex flex-1 flex-col'>
					<NotFoundView locale={siteConfig.defaultLocale} />
				</main>
			</NextIntlClientProvider>
		</DocumentShell>
	)
}
