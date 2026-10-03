import '@/app/globals.css'

import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import type { Metadata } from 'next'

import { CookieConsent } from '@/components/cookie/cookie-consent'
import { MirrorSyncClient } from '@/components/dev/mirror-sync-client'
import { DocumentShell } from '@/components/layout/document-shell'
import { HashScroll } from '@/components/layout/hash-scroll'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { MAIN_CONTENT_ID, SkipLink } from '@/components/layout/skip-link'
import { ScrollMotion } from '@/components/motion/scroll-motion'
import { ScrollProgress } from '@/components/motion/scroll-progress'
import { Providers } from '@/components/providers/providers'
import { QuoteLayer } from '@/components/quote/quote-layer'
import { env } from '@/env'
import { routing } from '@/i18n/routing'
import {
	buildRootMetadata,
	JsonLd,
	jsonLdGraph,
	organizationJsonLd,
	websiteJsonLd,
} from '@/lib/seo'

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
			head={<JsonLd data={jsonLdGraph(organizationJsonLd(), websiteJsonLd())} />}
		>
			<NextIntlClientProvider>
				<Providers>
					<SkipLink />
					<ScrollProgress />
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
					<HashScroll />
					<ScrollMotion />
					<QuoteLayer />
					{/* Tylko przy `pnpm dev:mobile` — zmienną ustawia scripts/dev-mobile.mjs. */}
					{env.NODE_ENV === 'development' && env.NEXT_PUBLIC_DEV_MIRROR_PORT && (
						<MirrorSyncClient port={env.NEXT_PUBLIC_DEV_MIRROR_PORT} />
					)}
					<CookieConsent />
				</Providers>
			</NextIntlClientProvider>
		</DocumentShell>
	)
}
