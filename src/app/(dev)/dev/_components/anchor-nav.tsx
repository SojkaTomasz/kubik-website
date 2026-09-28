'use client'

import { useEffect, useState } from 'react'

import { SectionSearch } from '@/app/(dev)/dev/_components/section-search'
import { cn } from '@/lib/utils'

/**
 * Nawigacja po sekcjach `/dev`: szyna przy lewej krawędzi, na wąskich ekranach
 * pasek u góry. Zwykłe `<a href='#id'>` — to nawigacja w obrębie dokumentu,
 * router nie ma tu czego wnieść.
 */

export interface AnchorNavProps {
	items: readonly (readonly [string, string])[]
}

/** Pas obserwacji: między 20% a 30% wysokości okna, licząc od góry. */
const OBSERVER_BAND = '-20% 0px -70% 0px'

/** Sekcja widoczna na ekranie. IntersectionObserver, nie nasłuch przewijania. */
function useActiveSection(ids: readonly string[]): string | undefined {
	const [active, setActive] = useState<string>()

	// Zależnością jest ZŁĄCZONA lista, nie tablica: `items.map(...)` daje przy
	// każdym renderze nową tożsamość, więc `[ids]` wpychało efekt w pętlę
	// i zostawiało podświetloną poprzednią sekcję.
	const key = ids.join('|')

	useEffect(() => {
		const sections = key
			.split('|')
			.map(id => document.getElementById(id))
			.filter((element): element is HTMLElement => element !== null)

		// Pusta lista nie jest błędem — sekcje mogą jeszcze nie istnieć w drzewie.
		if (sections.length === 0) return () => {}

		const order = key.split('|')
		const visible = new Set<string>()

		const observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (entry.isIntersecting) visible.add(entry.target.id)
					else visible.delete(entry.target.id)
				}

				// Widocznych sekcji bywa kilka naraz. Bierzemy pierwszą w kolejności
				// dokumentu, żeby podświetlenie nie skakało przy przewijaniu.
				setActive(order.find(id => visible.has(id)))
			},
			{ rootMargin: OBSERVER_BAND }
		)

		for (const section of sections) observer.observe(section)

		return () => observer.disconnect()
	}, [key])

	return active
}

export function AnchorNav({ items }: AnchorNavProps) {
	const active = useActiveSection(items.map(([id]) => id))

	return (
		<>
			{/* --- szeroki ekran: szyna przy lewej krawędzi --- */}
			<nav
				aria-label='Sekcje strony'
				className='fixed start-0 top-navbar bottom-0 z-30 hidden w-56 overflow-y-auto border-e bg-card px-3 py-4 lg:block'
			>
				<div className='mb-3'>
					<SectionSearch />
				</div>

				<ul className='flex flex-col gap-0.5'>
					{items.map(([id, label]) => (
						<li key={id}>
							<a
								href={`#${id}`}
								aria-current={active === id ? 'true' : undefined}
								className={cn(
									'block rounded-md border-s-2 px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors',
									'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
									// Aktywną pozycję niesie pasek, nie tło: `muted` na ciemnym
									// motywie jest w praktyce niewidoczne.
									active === id
										? 'border-s-primary bg-muted font-medium text-foreground'
										: 'border-s-transparent text-muted-foreground'
								)}
							>
								{label}
							</a>
						</li>
					))}
				</ul>
			</nav>

			{/* --- wąski ekran: pasek u góry, przewijany w poziomie --- */}
			<div className='sticky top-navbar z-30 border-b bg-card lg:hidden'>
				<nav
					aria-label='Sekcje strony'
					className='flex gap-2 overflow-x-auto px-4 py-3'
				>
					{items.map(([id, label]) => (
						<a
							key={id}
							href={`#${id}`}
							aria-current={active === id ? 'true' : undefined}
							className={cn(
								'shrink-0 rounded-md border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors',
								'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
								active === id
									? 'border-primary bg-muted font-medium'
									: 'border-foreground/15'
							)}
						>
							{label}
						</a>
					))}
				</nav>
			</div>
		</>
	)
}
