import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import { Reveal, RevealGroup } from '@/components/motion/reveal'
import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'

/** Kierunki wypisane z typu propsa — dopisanie kolejnego nie ominie tej strony. */
const directions = ['up', 'down', 'left', 'right', 'none'] as const

/** Kwadrat wypełniający próbkę — sam ruch jest tu treścią, nie zawartość bloku. */
function Block({ label }: { label: string }) {
	return (
		<Card variant='flat'>
			<CardContent className='flex h-20 items-center justify-center'>
				<Typography
					variant='caption'
					tone='muted'
					className='font-mono'
				>
					{label}
				</Typography>
			</CardContent>
		</Card>
	)
}

export function GroupMotion() {
	return (
		<Showcase
			id='motion'
			index='09'
			title='Animacje'
			description='Reveal pokazuje element przy wejściu w pole widzenia. Dwa zabezpieczenia są tu ważniejsze od samego efektu: ustawienie „ograniczony ruch" wyłącza animację i pokazuje treść od razu, a brak JavaScriptu nie zostawia strony pustej. Oba działają w CSS-ie, bo muszą zadziałać wtedy, gdy JavaScript zawiedzie.'
		>
			<ShowcaseItem
				title='Kierunki'
				note='prop direction — element dojeżdża z podanej strony'
			>
				<div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-5'>
					{directions.map(direction => (
						<Sample
							key={direction}
							label={direction}
						>
							<Reveal
								direction={direction}
								className='w-full'
							>
								<Block label={direction} />
							</Reveal>
						</Sample>
					))}
				</div>
			</ShowcaseItem>

			<ShowcaseItem
				title='Kaskada'
				note='RevealGroup — opóźnienie liczone z pozycji dziecka, nie wpisywane ręcznie'
			>
				<RevealGroup className='grid gap-3 sm:grid-cols-4'>
					<Block label='1' />
					<Block label='2' />
					<Block label='3' />
					<Block label='4' />
				</RevealGroup>
			</ShowcaseItem>

			<ShowcaseItem
				title='Jak to sprawdzić'
				note='efekt zależy od ustawień systemu, więc nie widać go na zrzucie ekranu'
			>
				<Card variant='framed'>
					<CardContent className='flex flex-col gap-2 py-4'>
						<Typography variant='bodySm'>
							Włącz w systemie „ogranicz ruch&rdquo; (Windows: Ustawienia → Ułatwienia
							dostępu → Efekty wizualne; macOS: Dostępność → Wyświetlacz → Ogranicz ruch) i
							odśwież stronę. Bloki powyżej mają pojawić się od razu, bez przesuwania.
						</Typography>
						<Typography variant='bodySm'>
							Drugie zabezpieczenie sprawdzisz, wyłączając JavaScript w narzędziach
							deweloperskich — treść musi zostać widoczna.
						</Typography>
					</CardContent>
				</Card>
			</ShowcaseItem>
		</Showcase>
	)
}
