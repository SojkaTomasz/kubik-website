import '@/app/globals.css'

import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import type { Metadata } from 'next'

import { CookieConsent } from '@/components/cookie/cookie-consent'
import { DocumentShell } from '@/components/layout/document-shell'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { MAIN_CONTENT_ID, SkipLink } from '@/components/layout/skip-link'
import { Providers } from '@/components/providers/providers'
import { routing } from '@/i18n/routing'
import {
	buildRootMetadata,
	JsonLd,
	jsonLdGraph,
	organizationJsonLd,
	websiteJsonLd,
} from '@/lib/seo'
import { feedPath } from '@/lib/seo/feed'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = buildRootMetadata()

/**
 * Lista języków do prerenderu. Bez niej każda wersja językowa renderowałaby się
 * dynamicznie, bo `[locale]` jest parametrem trasy.
 */
export function generateStaticParams() {
	return routing.locales.map(locale => ({ locale }))
}

export default async function SiteLayout({ children, params }: LayoutProps<'/[locale]'>) {
	const { locale } = await params

	// Parametr trasy pochodzi z adresu, więc może być czymkolwiek — bez tej
	// kontroli `/xx` renderowałby stronę z pustymi tłumaczeniami zamiast 404.
	if (!hasLocale(routing.locales, locale)) notFound()

	return (
		<DocumentShell
			lang={locale}
			head={
				<>
					<JsonLd data={jsonLdGraph(organizationJsonLd(), websiteJsonLd())} />

					{/* Wprost w `<head>`, nie przez `alternates.types`: podstrony nadpisują
						`alternates` w całości, więc kanał zniknąłby z niemal całej witryny. */}
					<link
						rel='alternate'
						type='application/rss+xml'
						title={`${siteConfig.name} — blog`}
						href={feedPath(locale)}
					/>
				</>
			}
		>
			<NextIntlClientProvider>
				<Providers>
					<SkipLink />
					<SiteHeader />

					{/*
						`<main>` daje czytnikom ekranu punkt orientacyjny „treść
						główna" i jest celem linku pomijającego nawigację.
						`flex-1` odpycha stopkę do dołu okna na krótkich stronach.

						`tabIndex={-1}` jest tu po to, żeby pominięcie nawigacji
						faktycznie PRZENOSIŁO fokus. Skok do kotwicy przewija stronę
						zawsze, ale kursor klawiatury zostaje na linku, jeśli cel nie
						przyjmuje fokusu — kolejny Tab wraca wtedy do menu, przez które
						użytkownik właśnie przeszedł. Ujemna wartość zostawia element
						poza kolejnością Tab, więc nie dokłada przystanku.
					*/}
					<main
						id={MAIN_CONTENT_ID}
						tabIndex={-1}
						className='flex-1 outline-none'
					>
						{children}
					</main>

					<SiteFooter />
					<CookieConsent />
				</Providers>
			</NextIntlClientProvider>
		</DocumentShell>
	)
}
