import type { Metadata } from 'next'

import { AnchorNav } from '@/app/(dev)/dev/_components/anchor-nav'
import { GroupActions } from '@/app/(dev)/dev/components/_sections/group-actions'
import { GroupConversation } from '@/app/(dev)/dev/components/_sections/group-conversation'
import { GroupData } from '@/app/(dev)/dev/components/_sections/group-data'
import { GroupFeedback } from '@/app/(dev)/dev/components/_sections/group-feedback'
import { GroupForms } from '@/app/(dev)/dev/components/_sections/group-forms'
import { GroupLayout } from '@/app/(dev)/dev/components/_sections/group-layout'
import { GroupMotion } from '@/app/(dev)/dev/components/_sections/group-motion'
import { GroupNavigation } from '@/app/(dev)/dev/components/_sections/group-navigation'
import { GroupOverlays } from '@/app/(dev)/dev/components/_sections/group-overlays'
import { GroupSpecialized } from '@/app/(dev)/dev/components/_sections/group-specialized'
import { Container } from '@/components/ui/container'
import { Typography } from '@/components/ui/typography'

export const metadata: Metadata = {
	title: 'Komponenty',
	robots: { index: false, follow: false },
}

const anchors = [
	['actions', '01 Akcje'],
	['forms', '02 Formularze'],
	['feedback', '03 Komunikaty'],
	['overlays', '04 Warstwy'],
	['navigation', '05 Nawigacja'],
	['data', '06 Dane'],
	['layout', '07 Layout'],
	['specialized', '08 Osadzenia'],
	['motion', '09 Animacje'],
	['conversation', '10 Rozmowa'],
] as const

export default function ComponentsPage() {
	return (
		// Szyna nawigacyjna jest `fixed` i bez tego zasłaniałaby lewą część strony.
		<div className='lg:ps-56'>
			<Container className='py-12'>
				<div className='flex flex-col gap-3'>
					<Typography variant='overline'>Biblioteka</Typography>
					<Typography
						as='h1'
						variant='h2'
					>
						Komponenty
					</Typography>
					<Typography
						variant='lead'
						tone='muted'
						className='max-w-3xl'
					>
						Wszystko, z czego wolno budować widoki. Zasada startera jest jedna: widok składa
						się wyłącznie z komponentów tej biblioteki i kompozytów na nich opartych. Brakuje
						czegoś? Dochodzi nowy komponent do components/ui, a nie doraźny markup w widoku.
					</Typography>
				</div>
			</Container>

			<AnchorNav items={anchors} />

			<GroupActions />
			<GroupForms />
			<GroupFeedback />
			<GroupOverlays />
			<GroupNavigation />
			<GroupData />
			<GroupLayout />
			<GroupSpecialized />
			<GroupMotion />
			<GroupConversation />
		</div>
	)
}
