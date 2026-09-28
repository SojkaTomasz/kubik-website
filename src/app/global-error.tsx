'use client'

import '@/app/globals.css'

import { Home, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'

import { DocumentShell } from '@/components/layout/document-shell'
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
import { siteConfig } from '@/site.config'

/**
 * Ostatnia granica błędu — łapie wywrotkę SAMEGO root layoutu, więc zastępuje
 * cały dokument i musi wyrenderować `<html>`, `<body>` oraz zaimportować style.
 *
 * Razem z layoutem znika kontekst next-intl, dlatego teksty są wpisane wprost
 * (jedyne takie miejsce w projekcie), a link do strony głównej jest zwykłą
 * kotwicą — pełne przeładowanie czyści przy okazji popsuty stan aplikacji.
 */
export default function GlobalError({
	error,
	retry,
}: {
	error: Error & { digest?: string }
	retry: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<DocumentShell
			lang={siteConfig.defaultLocale}
			head={<title>{`Coś poszło nie tak | ${siteConfig.name}`}</title>}
		>
			<main className='flex flex-1 flex-col'>
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
								Coś poszło nie tak
							</Typography>

							<EmptyDescription>
								Strona napotkała nieoczekiwany błąd. Spróbuj ponownie — jeśli to nie pomoże,
								wróć na stronę główną.
							</EmptyDescription>
						</EmptyHeader>

						<EmptyContent>
							<div className='flex flex-wrap justify-center gap-2'>
								<Button
									onClick={() => retry()}
									icon={<RotateCcw />}
								>
									Spróbuj ponownie
								</Button>
								<Button
									href='/'
									external
									target='_self'
									variant='outline'
									icon={<Home />}
								>
									Strona główna
								</Button>
							</div>

							{error.digest && (
								<Typography
									variant='caption'
									tone='muted'
								>
									Identyfikator błędu: {error.digest}
								</Typography>
							)}
						</EmptyContent>
					</Empty>
				</Section>
			</main>
		</DocumentShell>
	)
}
