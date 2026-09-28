import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { devPages } from '@/app/(dev)/dev/dev-pages'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { Typography } from '@/components/ui/typography'

export default function DevIndexPage() {
	return (
		<Section>
			<div className='flex flex-col gap-10'>
				<div className='flex flex-col gap-3'>
					<Typography variant='overline'>Narzędzia</Typography>
					<Typography
						as='h1'
						variant='h2'
					>
						Strony deweloperskie
					</Typography>
					<Typography
						variant='lead'
						tone='muted'
						className='max-w-2xl'
					>
						Podgląd systemu projektowego w prawdziwym środowisku aplikacji — z tymi samymi
						fontami, tokenami i motywem co strona produkcyjna. Niedostępne w buildzie
						produkcyjnym, chyba że włączysz je flagą{' '}
						<Typography
							as='code'
							variant='code'
						>
							NEXT_PUBLIC_ENABLE_DEV_PAGES
						</Typography>
						.
					</Typography>
				</div>

				<div className='grid gap-4 sm:grid-cols-2'>
					{devPages.map(page => (
						<Link
							key={page.href}
							href={page.href}
							className='group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
						>
							<Card className='h-full transition-colors hover:border-foreground/20'>
								<CardHeader>
									<CardTitle className='flex items-center justify-between gap-2'>
										{page.title}
										<ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
									</CardTitle>
									<CardDescription>{page.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<Typography
										as='code'
										variant='code'
										tone='muted'
									>
										{page.href}
									</Typography>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</Section>
	)
}
