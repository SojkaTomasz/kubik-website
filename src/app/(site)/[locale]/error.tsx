'use client'

import { Home, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
} from '@/components/ui/empty'
import { Section } from '@/components/ui/section'
import { Typography } from '@/components/ui/typography'

/**
 * Granica błędu części publicznej. Obejmuje strony i zagnieżdżone layouty
 * segmentu `[locale]`, ale NIE jego własny `layout.tsx` — ten wychodzi wyżej,
 * do `global-error.tsx`. Dlatego potrzebne są oba pliki.
 */
export default function SiteError({
	error,
	retry,
}: {
	error: Error & { digest?: string }
	retry: () => void
}) {
	const t = useTranslations('error')

	useEffect(() => {
		/*
		 * Miejsce na wpięcie zewnętrznego monitoringu (Sentry, Axiom, GlitchTip).
		 * W produkcji `error.message` jest z serwera celowo ogólny — wiąże go
		 * z logiem serwera dopiero `error.digest`, dlatego logujemy cały obiekt.
		 */
		console.error(error)
	}, [error])

	return (
		<Section>
			<Empty className='gap-6 border-none py-12'>
				<EmptyHeader>
					<EmptyMedia variant='icon'>
						<RotateCcw />
					</EmptyMedia>

					<Typography
						as='h1'
						variant='h3'
					>
						{t('title')}
					</Typography>

					<EmptyDescription>{t('description')}</EmptyDescription>
				</EmptyHeader>

				<EmptyContent>
					<div className='flex flex-wrap justify-center gap-2'>
						{/*
							`retry()` ponawia pobranie i render zawartości granicy —
							w Next.js 16 zastąpiło `reset()`, które samo czyściło stan
							bez ponownego pobrania danych. Przy błędzie chwilowym
							(zerwane połączenie, restart backendu) to wystarcza.
						*/}
						<Button
							onClick={() => retry()}
							icon={<RotateCcw />}
						>
							{t('retry')}
						</Button>
						<Button
							href='/'
							variant='outline'
							icon={<Home />}
						>
							{t('home')}
						</Button>
					</div>

					{/*
						Identyfikator błędu widoczny dla użytkownika: to jedyna rzecz,
						którą może podać w zgłoszeniu, żeby dało się odnaleźć wpis
						w logach serwera.
					*/}
					{error.digest && (
						<Typography
							variant='caption'
							tone='muted'
						>
							{t('digest')}: {error.digest}
						</Typography>
					)}
				</EmptyContent>
			</Empty>
		</Section>
	)
}
