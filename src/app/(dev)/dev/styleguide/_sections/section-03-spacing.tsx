import { CssVar } from '@/app/(dev)/dev/_components/css-var'
import { Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'

/**
 * Skala odstępów Tailwinda opiera się na jednostce 0.25rem (4 px).
 * Paski poniżej używają realnych klas, więc pokazują faktyczny rozmiar.
 */
const spacing = [
	['1', 'w-1', '4 px'],
	['2', 'w-2', '8 px'],
	['3', 'w-3', '12 px'],
	['4', 'w-4', '16 px'],
	['5', 'w-5', '20 px'],
	['6', 'w-6', '24 px'],
	['8', 'w-8', '32 px'],
	['10', 'w-10', '40 px'],
	['12', 'w-12', '48 px'],
	['16', 'w-16', '64 px'],
	['20', 'w-20', '80 px'],
	['24', 'w-24', '96 px'],
] as const

const layoutTokens = [
	['--container-max-w', 'Maksymalna szerokość treści (Container size="page")'],
	['--container-px', 'Margines boczny na mobile'],
	['--container-px-lg', 'Margines boczny od breakpointu lg'],
	['--section-py', 'Pionowy odstęp sekcji'],
	['--section-py-lg', 'Pionowy odstęp sekcji od lg'],
	['--navbar-height', 'Wysokość nawigacji — także scroll-padding kotwic'],
] as const

export function SectionSpacing() {
	return (
		<Showcase
			id='spacing'
			index='03'
			title='Odstępy i siatka'
			description='Pionowy rytm strony ustawiasz tokenami sekcji i kontenera, nie klasami py-* rozsianymi po widokach. Decyzja "strona ma oddychać bardziej" to dwie wartości w theme/components.css.'
		>
			<ShowcaseItem
				title='Skala Tailwinda'
				note='jednostka bazowa 4 px'
				className='flex-col items-stretch gap-2'
			>
				{spacing.map(([step, className, px]) => (
					<div
						key={step}
						className='flex items-center gap-3'
					>
						<span className='w-10 font-mono text-[11px] text-muted-foreground'>{step}</span>
						<div className={`h-3 rounded-sm bg-primary ${className}`} />
						<span className='font-mono text-[11px] text-muted-foreground'>{px}</span>
					</div>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Tokeny layoutu'
				note='src/app/theme/components.css'
				className='flex-col items-stretch gap-3'
			>
				{layoutTokens.map(([token, usage]) => (
					<div
						key={token}
						className='flex flex-col gap-0.5 border-b pb-3 last:border-b-0 last:pb-0'
					>
						<CssVar name={token} />
						<span className='text-xs text-muted-foreground'>{usage}</span>
					</div>
				))}
			</ShowcaseItem>
		</Showcase>
	)
}
