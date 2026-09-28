import { ArrowRight, Check, Info, Mail, Search, Settings, TriangleAlert, X } from 'lucide-react'

import { CssVar } from '@/app/(dev)/dev/_components/css-var'
import { Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import { Button } from '@/components/ui/button'

/**
 * Rozmiary ikon w klasach Tailwinda. `size-4` (16 px) to wartość, którą przyjmują
 * komponenty shadcn, gdy ikona nie ma własnej klasy rozmiaru.
 */
const sizes = [
	['size-3.5', '14 px', 'Ikona w odznace, badge'],
	['size-4', '16 px', 'Domyślna w przyciskach i menu'],
	['size-5', '20 px', 'Ikona samodzielna w nawigacji'],
	['size-6', '24 px', 'Nagłówek karty, pusty stan'],
	['size-8', '32 px', 'Ilustracja stanu pustego'],
] as const

const icons = [Search, Mail, Settings, Check, X, Info, TriangleAlert, ArrowRight] as const

export function SectionIcons() {
	return (
		<Showcase
			id='icons'
			index='07'
			title='Ikonografia'
			description='Biblioteka lucide-react. Grubość kreski jest sterowana jednym tokenem — lucide rysuje domyślnie stroke 2, co przy małych rozmiarach wygląda zbyt ciężko obok tekstu.'
		>
			<ShowcaseItem
				title='Grubość kreski'
				note='reguła w globals.css obejmuje wszystkie ikony z stroke="currentColor"'
				className='flex-col items-stretch gap-2'
			>
				<CssVar name='--icon-stroke-width' />
			</ShowcaseItem>

			<ShowcaseItem title='Rozmiary'>
				{sizes.map(([className, px, usage]) => (
					<div
						key={className}
						className='flex w-40 flex-col items-start gap-2'
					>
						<div className='flex h-14 w-full items-center justify-center rounded-lg border bg-card'>
							<Settings className={className} />
						</div>
						<span className='font-mono text-[11px]'>
							{className} · {px}
						</span>
						<span className='text-[11px] text-muted-foreground'>{usage}</span>
					</div>
				))}
			</ShowcaseItem>

			<ShowcaseItem title='Ikony w kontekście'>
				<Button>
					<Search />Z ikoną z przodu
				</Button>
				<Button variant='outline'>
					Z ikoną z tyłu
					<ArrowRight />
				</Button>
				<Button
					size='icon'
					variant='ghost'
					aria-label='Ustawienia'
				>
					<Settings />
				</Button>
			</ShowcaseItem>

			<ShowcaseItem
				title='Zestaw podstawowy'
				note='pełna biblioteka: lucide.dev/icons'
			>
				{icons.map(Icon => (
					<div
						key={Icon.displayName ?? Icon.name}
						className='flex size-12 items-center justify-center rounded-lg border bg-card'
					>
						<Icon className='size-5' />
					</div>
				))}
			</ShowcaseItem>
		</Showcase>
	)
}
