import { Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'

/**
 * Cienie z przypisanym zastosowaniem.
 *
 * Kolumna „użycie" jest tu najważniejsza — bez niej każdy dobiera poziom cienia
 * na oko i po miesiącu karta rzuca mocniejszy cień niż dialog nad nią.
 */
const shadows = [
	['shadow-xs', 'shadow-xs', 'Pola formularza, subtelne oddzielenie'],
	['shadow-sm', 'shadow-sm', 'Karty w spoczynku'],
	['shadow-md', 'shadow-md', 'Hover karty, dropdown, tooltip'],
	['shadow-lg', 'shadow-lg', 'Popover, panel filtrów, baner cookie'],
	['shadow-xl', 'shadow-xl', 'Dialog, sheet'],
	['shadow-2xl', 'shadow-2xl', 'Lightbox, warstwa nad wszystkim'],
] as const

export function SectionElevation() {
	return (
		<Showcase
			id='elevation'
			index='04'
			title='Elewacja'
			description='Cień komunikuje, jak wysoko nad stroną leży element. Trzymanie się tej tabeli sprawia, że hierarchia warstw jest czytelna bez zaglądania w kod.'
		>
			<ShowcaseItem title='Poziomy cienia'>
				{shadows.map(([label, className, usage]) => (
					<div
						key={label}
						className='flex w-44 flex-col gap-2'
					>
						<div className={`h-20 rounded-xl border bg-card ${className}`} />
						<span className='font-mono text-[11px]'>{label}</span>
						<span className='text-[11px] text-muted-foreground'>{usage}</span>
					</div>
				))}
			</ShowcaseItem>
		</Showcase>
	)
}
