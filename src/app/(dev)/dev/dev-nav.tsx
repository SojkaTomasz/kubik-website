'use client'

import { Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { devPages } from '@/app/(dev)/dev/dev-pages'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'

/**
 * Pasek nawigacyjny stron deweloperskich.
 *
 * Świadomie NIE używa `@/i18n/navigation` — strony /dev są poza i18n, więc
 * zwykły `next/link` jest tu właściwy. Użycie wersji z prefiksem języka
 * przekierowywałoby na `/pl/dev/…`, których nie ma.
 */
export function DevNav() {
	const pathname = usePathname()

	return (
		<header className='sticky top-0 z-40 border-b bg-card/80 backdrop-blur'>
			<Container className='flex h-navbar items-center gap-4'>
				<Link
					href='/dev'
					className='flex items-center gap-2 font-semibold'
				>
					<Badge variant='secondary'>dev</Badge>
				</Link>

				<nav className='flex flex-1 items-center gap-1'>
					{devPages.map(page => (
						<Button
							key={page.href}
							href={page.href}
							variant='ghost'
							size='sm'
							className={cn(pathname === page.href && 'bg-muted text-foreground')}
						>
							{page.title}
						</Button>
					))}
				</nav>

				<ThemeToggle />
				<Button
					href='/'
					variant='ghost'
					size='icon'
					aria-label='Wróć na stronę główną'
					icon={<Home className='size-5' />}
				/>
			</Container>
		</header>
	)
}
