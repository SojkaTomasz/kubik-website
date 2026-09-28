import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import { fontFamilies } from '@/app/fonts'
import { Typography, typographyVariants } from '@/components/ui/typography'
import { variantKeys } from '@/lib/cva'

/*
 * Warianty i odcienie czytane z komponentu; ręcznie trzymamy wyłącznie opis
 * zastosowania — tego z kodu nie da się wyprowadzić, a to właśnie ta kolumna
 * decyduje, czy ktoś sięgnie po właściwy wariant. Wariant bez opisu i tak się
 * pokaże, tylko bez podpowiedzi.
 */
const variants = variantKeys(typographyVariants, 'variant')
const tones = variantKeys(typographyVariants, 'tone')

const usage: Record<string, string> = {
	displayXl: 'Hero na całą szerokość ekranu',
	displayLg: 'Nagłówek strony głównej',
	displayMd: 'Nagłówek sekcji hero',
	displaySm: 'Mocny nagłówek w treści',
	h1: 'Tytuł podstrony',
	h2: 'Nagłówek sekcji',
	h3: 'Nagłówek podsekcji',
	h4: 'Nagłówek grupy',
	h5: 'Nagłówek karty',
	h6: 'Etykieta bloku',
	lead: 'Akapit wprowadzający',
	body: 'Tekst podstawowy',
	bodySm: 'Tekst pomocniczy',
	caption: 'Podpis, metadane',
	overline: 'Nadtytuł nad nagłówkiem',
	quote: 'Cytat',
	code: 'Kod w treści',
}

const SAMPLE = 'Zażółć gęślą jaźń — 0123456789'

export function SectionTypography() {
	return (
		<Showcase
			id='typography'
			index='02'
			title='Typografia'
			description='Wariant niesie wygląd, a tag HTML semantykę — dlatego Typography ma osobny props "as". Nagłówek sekcji, który wizualnie ma być mały, zapisujemy jako as="h2" variant="h4", dzięki czemu kolejność nagłówków w dokumencie zostaje poprawna dla czytników ekranu.'
		>
			<ShowcaseItem
				title='Rodziny fontów'
				note='public/fonts — subsety latin + latin-ext'
				className='flex-col items-stretch gap-5'
			>
				{fontFamilies.map(font => (
					<div
						key={font.name}
						className='flex flex-col gap-1'
					>
						<span className='font-mono text-[11px] text-muted-foreground'>
							{font.variable} · {font.role} · {font.weights}
						</span>
						<span className={`${font.className} text-2xl`}>{SAMPLE}</span>
					</div>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Skala wariantów'
				className='flex-col items-stretch gap-0 divide-y'
			>
				{variants.map(variant => (
					<div
						key={variant}
						className='flex flex-col gap-1 py-4 first:pt-0 last:pb-0'
					>
						<span className='font-mono text-[11px] text-muted-foreground'>
							{variant}
							{usage[variant] ? ` · ${usage[variant]}` : ''}
						</span>
						<Typography
							as='p'
							variant={variant}
						>
							{SAMPLE}
						</Typography>
					</div>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Odcienie'
				className='flex-col items-stretch gap-2'
			>
				{tones.map(tone => (
					<Sample
						key={tone}
						label={tone}
					>
						<Typography tone={tone}>{SAMPLE}</Typography>
					</Sample>
				))}
			</ShowcaseItem>
		</Showcase>
	)
}
