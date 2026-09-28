import '@/app/globals.css'

import { NextIntlClientProvider } from 'next-intl'
import type { Metadata } from 'next'

import { assertDevPagesEnabled } from '@/app/(dev)/dev/dev-guard'
import { DevNav } from '@/app/(dev)/dev/dev-nav'
import { DocumentShell } from '@/components/layout/document-shell'
import { MAIN_CONTENT_ID, SkipLink } from '@/components/layout/skip-link'
import { Providers } from '@/components/providers/providers'
import { siteConfig } from '@/site.config'

/**
 * Drugi root layout aplikacji — dla stron deweloperskich.
 *
 * Leżą poza segmentem `[locale]`, więc mają czyste adresy `/dev/…` zamiast
 * `/pl/dev/…` i nie wymagają tłumaczeń. `proxy.ts` wyklucza je ze swojego
 * matchera, żeby next-intl nie próbował dokleić im prefiksu języka.
 */
export const metadata: Metadata = {
	title: {
		default: 'Dev',
		template: '%s | Dev',
	},
	robots: { index: false, follow: false },
}

export default function DevLayout({ children }: LayoutProps<'/dev'>) {
	assertDevPagesEnabled()

	return (
		<DocumentShell lang={siteConfig.defaultLocale}>
			{/*
				Strony dev nie mają tłumaczeń, ale kontekst next-intl jest tu
				potrzebny: `Button` z `href` renderuje link świadomy języka, a ten
				bez kontekstu rzuca błędem. Poza segmentem `[locale]` root params
				są puste, więc `i18n/request.ts` schodzi do języka domyślnego.
			*/}
			<NextIntlClientProvider>
				<Providers>
					{/* Strony `/dev` też mają nawigację do pominięcia — szyna sekcji
					    jest długa, a bez tego linku trzeba ją przetabować całą. */}
					<SkipLink />
					<DevNav />
					<main
						id={MAIN_CONTENT_ID}
						tabIndex={-1}
						className='flex-1 outline-none'
					>
						{children}
					</main>
				</Providers>
			</NextIntlClientProvider>
		</DocumentShell>
	)
}
