import type * as React from 'react'

import { preloadedFonts } from '@/app/fonts'
import { InlineScript } from '@/components/layout/inline-script'
import { CONSENT_PENDING_CLASS, consentPendingScript } from '@/lib/analytics/consent'
import { GoogleTagManager, GoogleTagManagerNoScript } from '@/lib/analytics/gtm'
import { enableMotionScript, NO_JS_CLASS } from '@/lib/motion'
import { themeScript } from '@/lib/theme'
import { cn } from '@/lib/utils'

/**
 * Szkielet dokumentu wspólny dla obu root layoutów (`(site)/[locale]` i `(dev)/dev`).
 * Oba muszą wyrenderować `<html>` i `<body>` — tutaj, żeby fonty, GTM i klasy
 * nie rozjechały się między nimi.
 */
export function DocumentShell({
	lang,
	children,
	head,
}: {
	lang: string
	children: React.ReactNode
	/** Dodatkowa zawartość `<head>` — np. JSON-LD danej gałęzi. */
	head?: React.ReactNode
}) {
	return (
		<html
			lang={lang}
			// Obie klasy są w HTML-u OD RAZU i znikają dopiero po wykonaniu skryptu
			// startowego. Odwrotny kierunek zostawiałby przy awarii JS-u treść
			// niewidoczną, a pytanie o zgodę niezadane.
			className={cn('h-full antialiased', NO_JS_CLASS, CONSENT_PENDING_CLASS)}
			// Skrypt motywu dopisuje klasę przed hydracją — bez flagi React zgłasza rozjazd.
			suppressHydrationWarning
		>
			<head>
				{preloadedFonts.map(font => (
					<link
						key={font.href}
						rel='preload'
						href={font.href}
						as='font'
						type='font/woff2'
						crossOrigin='anonymous'
					/>
				))}
				{/* Przed pierwszym malowaniem — inaczej błysk białego tła.
					`InlineScript`, bo zwykły `<script>` i `next/script` wywołują
					ostrzeżenie Reacta; szczegóły przy helperze. */}
				<InlineScript html={themeScript} />

				{/* Zdjęcie `no-js` — potwierdzenie, że JavaScript żyje. */}
				<InlineScript html={enableMotionScript} />

				{/* Zdjęcie `consent-pending` przed pierwszym malowaniem — inaczej baner
					mignie osobie, która decyzję podjęła dawno temu. */}
				<InlineScript html={consentPendingScript} />

				{head}
				<GoogleTagManager />
			</head>
			<body className='flex min-h-full flex-col'>
				<GoogleTagManagerNoScript />
				{children}
			</body>
		</html>
	)
}
