import type { Metadata } from 'next'

import { AnchorNav } from '@/app/(dev)/dev/_components/anchor-nav'
import { SectionColors } from '@/app/(dev)/dev/styleguide/_sections/section-01-colors'
import { SectionTypography } from '@/app/(dev)/dev/styleguide/_sections/section-02-typography'
import { SectionSpacing } from '@/app/(dev)/dev/styleguide/_sections/section-03-spacing'
import { SectionElevation } from '@/app/(dev)/dev/styleguide/_sections/section-04-elevation'
import { SectionRadius } from '@/app/(dev)/dev/styleguide/_sections/section-05-radius'
import { SectionStates } from '@/app/(dev)/dev/styleguide/_sections/section-06-states'
import { SectionIcons } from '@/app/(dev)/dev/styleguide/_sections/section-07-icons'
import { SectionBreakpoints } from '@/app/(dev)/dev/styleguide/_sections/section-08-breakpoints'
import { Container } from '@/components/ui/container'
import { Typography } from '@/components/ui/typography'

export const metadata: Metadata = {
	title: 'Styleguide',
	robots: { index: false, follow: false },
}

const anchors = [
	['colors', '01 Kolory'],
	['typography', '02 Typografia'],
	['spacing', '03 Odstępy'],
	['elevation', '04 Elewacja'],
	['radius', '05 Promienie'],
	['states', '06 Stany'],
	['icons', '07 Ikony'],
	['breakpoints', '08 Breakpointy'],
] as const

export default function StyleguidePage() {
	return (
		/*
		 * Odsunięcie treści od szyny nawigacyjnej, która jest pozycjonowana stale
		 * (fixed) i bez tego zasłaniałaby lewą część strony. Tylko od breakpointu
		 * lg — poniżej nawigacja jest paskiem u góry i nic nie zasłania.
		 */
		<div className='lg:ps-56'>
			<Container className='py-12'>
				<div className='flex flex-col gap-3'>
					<Typography variant='overline'>Fundamenty</Typography>
					<Typography
						as='h1'
						variant='h2'
					>
						Styleguide
					</Typography>
					<Typography
						variant='lead'
						tone='muted'
						className='max-w-3xl'
					>
						Każda próbka poniżej to realny komponent z <code>components/ui</code>, nie jego
						imitacja — jeśli coś tu wygląda źle, poprawka idzie do komponentu, a nie do tej
						strony. Wartości tokenów są czytane na żywo z CSS, więc podpis nie może rozjechać
						się z rzeczywistością.
					</Typography>
					<Typography
						variant='bodySm'
						tone='muted'
					>
						Przełącz motyw w prawym górnym rogu i przejrzyj wszystko jeszcze raz — połowa
						błędów kolorystycznych ujawnia się dopiero w drugim motywie.
					</Typography>
				</div>
			</Container>

			<AnchorNav items={anchors} />

			<SectionColors />
			<SectionTypography />
			<SectionSpacing />
			<SectionElevation />
			<SectionRadius />
			<SectionStates />
			<SectionIcons />
			<SectionBreakpoints />
		</div>
	)
}
