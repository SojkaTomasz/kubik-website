import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import { Iframe } from '@/components/ui/iframe'
import { Stat, StatGroup, statValueVariants } from '@/components/ui/stat'
import { Typography } from '@/components/ui/typography'
import { variantKeys } from '@/lib/cva'

/* Listy czytane z komponentu — patrz komentarz w group-actions.tsx. */
const statTones = variantKeys(statValueVariants, 'tone')
const statSizes = variantKeys(statValueVariants, 'size')

/**
 * Podgląd osadzenia jako plik z `public/`: obca domena wciągałaby do testów e2e
 * zależność od sieci, a adres `data:` wymagałby `frame-src data:` — czyli zgody
 * na osadzenie dowolnego wstrzykniętego dokumentu.
 */
const EMBED_PREVIEW = '/embed-preview.html'

export function GroupSpecialized() {
	return (
		<Showcase
			id='specialized'
			index='08'
			title='Osadzenia i wskaźniki'
			description='Dwa komponenty, które żyją z danych spoza strony: ramka na treść z obcej domeny i kafelek z liczbą. Oba mają domyślne ustawienia, o których łatwo zapomnieć przy pisaniu markupu od zera — leniwe ładowanie i ograniczoną politykę referrera przy ramce, cyfry o stałej szerokości przy liczniku.'
		>
			<ShowcaseItem
				title='Iframe'
				note='title jest wymagany typem — bez niego czytnik ekranu ogłasza ramkę bez nazwy (axe: frame-title)'
				className='flex-col items-stretch gap-4'
			>
				<Sample label='własna wysokość'>
					<Iframe
						src={EMBED_PREVIEW}
						title='Podgląd osadzenia'
						height={180}
					/>
				</Sample>

				{/*
				 * `fill` przydaje się przy proporcjach: ramka wypełnia rodzica, a ten
				 * zadaje kształt. `<iframe>` sam z siebie nie ma wysokości, więc bez
				 * rodzica z wymiarem zapadłby się do zera.
				 */}
				<Sample label='fill w ramce o proporcjach 16/9'>
					<Iframe
						src={EMBED_PREVIEW}
						title='Podgląd osadzenia wypełniający ramkę'
						fill
						containerClassName='aspect-video w-full'
					/>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Stat — odcienie'
				note='kolory statusowe biorą parę -soft-foreground, bo pełny kolor jako duża liczba nie przechodzi progu kontrastu'
			>
				{statTones.map(tone => (
					<Sample
						key={tone}
						label={tone}
					>
						<Stat
							className='w-44'
							tone={tone}
							label='Zgłoszenia'
							value='1 248'
							hint='w tym miesiącu'
						/>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem title='Stat — rozmiary'>
				{statSizes.map(size => (
					<Sample
						key={size}
						label={size}
					>
						<Stat
							className='w-44'
							size={size}
							label='Konwersja'
							value='4,7%'
						/>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='StatGroup'
				note='siatka zawijająca się sama — widok nie ustawia kolumn'
				className='flex-col items-stretch'
			>
				<StatGroup className='w-full'>
					<Stat
						label='Klienci'
						value='500+'
					/>
					<Stat
						label='Projekty'
						value='1 240'
						hint='od 2019 roku'
					/>
					<Stat
						label='Satysfakcja'
						value='98%'
						tone='success'
					/>
					<Stat
						label='Czas odpowiedzi'
						value='2 h'
						tone='muted'
					/>
				</StatGroup>
				<Typography
					variant='caption'
					tone='muted'
					className='mt-3'
				>
					`tabular-nums` sprawia, że wszystkie cyfry mają tę samą szerokość — licznik
					odświeżany na żywo nie drga, a kolumna kafelków się równa.
				</Typography>
			</ShowcaseItem>
		</Showcase>
	)
}
