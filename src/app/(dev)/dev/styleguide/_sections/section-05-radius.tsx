import { CssVar } from '@/app/(dev)/dev/_components/css-var'
import { Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'

/**
 * Promienie są wyliczane z jednego mnożnika `--radius`, więc zmiana tej jednej
 * wartości przestawia zaokrąglenie całej strony proporcjonalnie.
 */
const radii = [
	['--radius-sm', 'rounded-sm', 'Drobne kontrolki, chipy'],
	['--radius-md', 'rounded-md', 'Przyciski, pola formularza'],
	['--radius-lg', 'rounded-lg', 'Alerty, karty wewnętrzne'],
	['--radius-xl', 'rounded-xl', 'Karty — wartość domyślna'],
	['--radius-2xl', 'rounded-2xl', 'Dialogi, sheet'],
	['--radius-3xl', 'rounded-3xl', 'Duże bloki dekoracyjne'],
] as const

const componentRadii = [
	['--button-radius', 'Przyciski'],
	['--card-radius', 'Karty'],
	['--input-radius', 'Pola formularza'],
	['--badge-radius', 'Odznaki — domyślnie pigułka'],
	['--dialog-radius', 'Okna modalne'],
	['--image-radius', 'Obrazy i kadry'],
] as const

export function SectionRadius() {
	return (
		<Showcase
			id='radius'
			index='05'
			title='Promienie'
			description='Skala wyliczana z mnożnika --radius. Tokeny per rodzina komponentów pozwalają odstroić np. kanciaste przyciski od zaokrąglonych kart, bez ruszania kodu komponentów.'
		>
			<ShowcaseItem title='Skala'>
				{radii.map(([token, className, usage]) => (
					<div
						key={token}
						className='flex w-40 flex-col gap-2'
					>
						<div className={`h-16 border-2 border-foreground/20 bg-muted ${className}`} />
						<CssVar name={token} />
						<span className='text-[11px] text-muted-foreground'>{usage}</span>
					</div>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Tokeny komponentów'
				note='src/app/theme/components.css'
				className='flex-col items-stretch gap-3'
			>
				{componentRadii.map(([token, usage]) => (
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
