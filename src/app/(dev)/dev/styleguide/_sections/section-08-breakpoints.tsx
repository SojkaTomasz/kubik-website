'use client'

import { Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'

/**
 * Domyślne breakpointy Tailwinda. Podajemy je jako dane, żeby dało się pokazać
 * obok siebie próg i jego typowe zastosowanie — bez tego kontekstu ludzie
 * dobierają `md:` i `lg:` na wyczucie.
 */
const breakpoints = [
	['(brak)', '0 px', 'Telefon — projekt zaczynasz stąd'],
	['sm', '640 px', 'Duży telefon w poziomie'],
	['md', '768 px', 'Tablet — pierwszy moment na dwie kolumny'],
	['lg', '1024 px', 'Laptop — układ docelowy'],
	['xl', '1280 px', 'Monitor — szerokość kontenera'],
	['2xl', '1536 px', 'Duży monitor'],
] as const

export function SectionBreakpoints() {
	return (
		<Showcase
			id='breakpoints'
			index='08'
			title='Breakpointy'
			description='Projekt zaczyna się od telefonu — klasa bez prefiksu opisuje najmniejszy ekran, a każdy kolejny próg tylko nadpisuje różnice. Wskaźnik poniżej pokazuje aktywny próg: zwężaj okno i obserwuj, który się podświetla.'
		>
			<ShowcaseItem
				title='Aktywny próg'
				note='ten wskaźnik działa wyłącznie na CSS — bez nasłuchiwania resize w JS'
				className='flex-col items-stretch gap-3'
			>
				<div className='flex flex-wrap gap-2'>
					<Badge className='sm:hidden'>bazowy (&lt; 640)</Badge>
					<Badge className='hidden sm:inline-flex md:hidden'>sm</Badge>
					<Badge className='hidden md:inline-flex lg:hidden'>md</Badge>
					<Badge className='hidden lg:inline-flex xl:hidden'>lg</Badge>
					<Badge className='hidden xl:inline-flex 2xl:hidden'>xl</Badge>
					<Badge className='hidden 2xl:inline-flex'>2xl</Badge>
				</div>
				<Typography
					variant='caption'
					tone='muted'
				>
					Podświetlony próg odpowiada bieżącej szerokości okna.
				</Typography>
			</ShowcaseItem>

			<ShowcaseItem
				title='Progi'
				className='flex-col items-stretch gap-0 divide-y'
			>
				{breakpoints.map(([prefix, width, usage]) => (
					<div
						key={prefix}
						className='flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0'
					>
						<span className='w-16 font-mono text-[11px] font-medium'>{prefix}</span>
						<span className='w-20 font-mono text-[11px] text-muted-foreground'>{width}</span>
						<span className='text-xs text-muted-foreground'>{usage}</span>
					</div>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Siatka responsywna'
				note='1 kolumna → 2 od sm → 4 od lg'
				className='flex-col items-stretch'
			>
				<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
					{[1, 2, 3, 4].map(index => (
						<div
							key={index}
							className='flex h-16 items-center justify-center rounded-lg bg-muted font-mono text-xs text-muted-foreground'
						>
							{index}
						</div>
					))}
				</div>
			</ShowcaseItem>
		</Showcase>
	)
}
