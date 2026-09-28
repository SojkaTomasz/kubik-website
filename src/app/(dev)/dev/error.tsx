'use client'

import { RotateCcw } from 'lucide-react'
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
 * Granica błędu gałęzi `/dev`. Bez niej błąd jednej próbki gasi całą stronę razem
 * z nawigacją — a to tutaj najpierw wychodzi komponent wywracający się na
 * brzegowych propsach.
 */
export default function DevError({
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
						Strona deweloperska się wywróciła
					</Typography>

					<EmptyDescription>
						{/* Komunikat wprost, inaczej niż po stronie publicznej — to on mówi,
							który komponent zawiódł. */}
						{error.message || 'Nieznany błąd renderowania.'}
					</EmptyDescription>
				</EmptyHeader>

				<EmptyContent>
					<Button
						onClick={() => retry()}
						icon={<RotateCcw />}
					>
						Spróbuj ponownie
					</Button>

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
	)
}
