import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import { Iframe } from '@/components/ui/iframe'
import { Marquee } from '@/components/ui/marquee'
import { Rating, ratingVariants } from '@/components/ui/rating'
import { SpecList, SpecListItem } from '@/components/ui/spec-list'
import { Stat, StatGroup, statGroupVariants, statValueVariants } from '@/components/ui/stat'
import { Steps } from '@/components/ui/steps'
import { Typography } from '@/components/ui/typography'
import { variantKeys } from '@/lib/cva'

/* Listy czytane z komponentu — patrz komentarz w group-actions.tsx. */
const statTones = variantKeys(statValueVariants, 'tone')
const statSizes = variantKeys(statValueVariants, 'size')
const statGroupLayouts = variantKeys(statGroupVariants, 'layout')
const ratingSizes = variantKeys(ratingVariants, 'size')

const STEPS_SAMPLE = [
	{ title: 'Rozplanowanie pętli', description: 'Pętle od rozdzielacza do każdego pokoju.' },
	{ title: 'Frezowanie', description: 'Rowki na grubość rury, bez kurzu w domu.' },
	{ title: 'Układanie rury', description: 'Rura w jednym kawałku, bez łączeń.' },
	{ title: 'Zalewanie', description: 'Rowki zalane masą, gotowe pod panele.' },
]

const MARQUEE_CITIES = ['Kraków', 'Nowy Sącz', 'Tarnów', 'Zakopane']

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
				note='linie między pozycjami rysuje grupa — row: pasek dowodu, grid: karta techniczna realizacji'
				className='flex-col items-stretch gap-6'
			>
				{statGroupLayouts.map(layout => (
					<Sample
						key={layout}
						label={layout}
					>
						<StatGroup layout={layout}>
							<Stat
								layout={layout === 'grid' ? 'spec' : 'figure'}
								size={layout === 'grid' ? 'sm' : 'default'}
								label='Zleceń'
								value='1200+'
							/>
							<Stat
								layout={layout === 'grid' ? 'spec' : 'figure'}
								size={layout === 'grid' ? 'sm' : 'default'}
								label='tys. m² podłóg'
								value='15'
							/>
							<Stat
								layout={layout === 'grid' ? 'spec' : 'figure'}
								size={layout === 'grid' ? 'sm' : 'default'}
								label='Reklamacji'
								value='0'
							/>
							<Stat
								layout={layout === 'grid' ? 'spec' : 'figure'}
								size={layout === 'grid' ? 'sm' : 'default'}
								label='Dni pracy'
								value='1'
							/>
						</StatGroup>
					</Sample>
				))}
				<Typography
					variant='caption'
					tone='muted'
				>
					`tabular-nums` sprawia, że wszystkie cyfry mają tę samą szerokość — licznik animowany
					od zera nie drga.
				</Typography>
			</ShowcaseItem>

			<ShowcaseItem
				title='Rating'
				note='ocena i liczba opinii z jednego źródła; czytnik słyszy zdanie z ukrytego napisu, nie same gwiazdki'
				className='flex-col items-start gap-6'
			>
				{ratingSizes.map(size => (
					<Sample
						key={size}
						label={size}
					>
						<Rating
							size={size}
							value={5}
							label={size === 'sm' ? '70+ opinii' : '70+ opinii w Google'}
						/>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Steps'
				note='lista uporządkowana — numer pozycji ogłasza czytnik, cyfra w kółku jest ozdobą'
				className='flex-col items-stretch gap-8'
			>
				<Sample label='responsive'>
					<Steps items={STEPS_SAMPLE} />
				</Sample>
				<Sample label='vertical'>
					<Steps
						orientation='vertical'
						items={STEPS_SAMPLE}
					/>
				</Sample>
				<Sample label='appearance="rule" — przebieg realizacji'>
					<Steps
						appearance='rule'
						items={STEPS_SAMPLE.slice(0, 3)}
					/>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='SpecList'
				note='<dl> — para etykieta i wartość czytana jako całość'
				className='flex-col items-stretch gap-8'
			>
				<Sample label='spec'>
					<SpecList>
						<SpecListItem
							label='Typowa wylewka'
							value='cementowa, 5–7 cm'
						/>
						<SpecListItem
							label='Czas pracy'
							value='1 dzień'
						/>
					</SpecList>
				</Sample>
				<Sample label='feature'>
					<SpecList appearance='feature'>
						<SpecListItem
							label='Pod pompę ciepła'
							value='niska temp.'
						/>
						<SpecListItem
							label='Mieszkanie w bloku'
							value='bez podnoszenia'
						/>
					</SpecList>
				</Sample>
				<Sample label='feature · muted'>
					<SpecList
						appearance='feature'
						tone='muted'
					>
						<SpecListItem label='Podłoga drewniana na legarach' />
					</SpecList>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Marquee'
				note='Magic UI — kopie treści ukryte przed czytnikiem, przy ograniczonym ruchu pas stoi'
				className='flex-col items-stretch'
			>
				<Marquee className='[--duration:30s] [--gap:2rem]'>
					{MARQUEE_CITIES.map(city => (
						<Typography
							key={city}
							as='span'
							variant='displayMd'
							tone='muted'
						>
							{city}
						</Typography>
					))}
				</Marquee>
			</ShowcaseItem>
		</Showcase>
	)
}
