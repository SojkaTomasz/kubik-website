'use client'

import { Search } from 'lucide-react'
import { useId, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Wyszukiwarka po zawartości `/dev`. Indeks powstaje z DRZEWA DOKUMENTU, nie
 * z ręcznej listy — ta rozjeżdżałaby się po cichu, bo wyszukiwarka nadal działa.
 * Budowany leniwie, przy pierwszym znaku, i bez ani jednego efektu.
 */

interface Hit {
	/** Tytuł podsekcji, np. „Combobox". */
	label: string
	/** Nazwa grupy, w której podsekcja leży — kontekst dla wyniku. */
	group: string
	element: HTMLElement
}

/** Buduje indeks z nagłówków podsekcji wewnątrz każdej sekcji z identyfikatorem. */
function buildIndex(): Hit[] {
	const hits: Hit[] = []

	for (const section of document.querySelectorAll<HTMLElement>('section[id]')) {
		// Pierwszy nagłówek sekcji to jej tytuł; kolejne to tytuły podsekcji.
		const group = section.querySelector('h2')?.textContent?.trim() ?? section.id

		for (const heading of section.querySelectorAll<HTMLElement>('h3')) {
			const label = heading.textContent?.trim()
			if (label) hits.push({ label, group, element: heading })
		}
	}

	return hits
}

/** Dopasowanie bez rozróżniania wielkości liter i polskich znaków diakrytycznych. */
function normalize(text: string): string {
	return text
		.toLocaleLowerCase('pl')
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
}

/** Ile wyników pokazujemy — dłuższa lista i tak zmusza do doprecyzowania frazy. */
const MAX_HITS = 8

export function SectionSearch() {
	const [phrase, setPhrase] = useState('')
	const [hits, setHits] = useState<Hit[]>([])
	const [activeIndex, setActiveIndex] = useState(0)
	const indexRef = useRef<Hit[]>(null)
	const listId = useId()

	/**
	 * Identyfikator pozycji wyników. Musi istnieć, żeby `aria-activedescendant`
	 * miał na co wskazywać — bez tego strzałki przesuwają wyłącznie podświetlenie
	 * i czytnik ekranu nie ogłasza niczego, choć wybór faktycznie się zmienia.
	 */
	const optionId = (position: number) => `${listId}-option-${position}`

	function search(value: string): void {
		setPhrase(value)
		setActiveIndex(0)

		const needle = normalize(value.trim())

		// Jedna litera pasuje do prawie wszystkiego — lista wyników byłaby szumem.
		if (needle.length < 2) {
			setHits([])
			return
		}

		indexRef.current ??= buildIndex()

		setHits(
			indexRef.current
				.filter(hit => normalize(`${hit.label} ${hit.group}`).includes(needle))
				.slice(0, MAX_HITS)
		)
	}

	function goTo(hit: Hit): void {
		hit.element.scrollIntoView({ block: 'start', behavior: 'smooth' })
		setPhrase('')
		setHits([])
	}

	function clear(): void {
		setPhrase('')
		setHits([])
	}

	const isOpen = hits.length > 0

	return (
		<div className='relative'>
			<Search className='pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground' />
			<Input
				type='search'
				role='combobox'
				aria-expanded={isOpen}
				aria-controls={listId}
				aria-autocomplete='list'
				// Fokus zostaje w polu, a wybraną pozycję wskazuje ten atrybut —
				// tak działa wzorzec combobox z ARIA. Bez niego użytkownik czytnika
				// naciska Enter, nie wiedząc, co zaraz otworzy.
				aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
				aria-label='Szukaj komponentu'
				placeholder='Szukaj…'
				value={phrase}
				className='h-8 ps-9 text-xs'
				onChange={event => search(event.target.value)}
				onKeyDown={event => {
					if (event.key === 'Escape') {
						clear()
						return
					}

					if (!isOpen) return

					if (event.key === 'ArrowDown') {
						event.preventDefault()
						setActiveIndex(current => (current + 1) % hits.length)
					} else if (event.key === 'ArrowUp') {
						event.preventDefault()
						setActiveIndex(current => (current - 1 + hits.length) % hits.length)
					} else if (event.key === 'Enter') {
						event.preventDefault()
						const hit = hits[Math.min(activeIndex, hits.length - 1)]
						if (hit) goTo(hit)
					}
				}}
			/>

			{isOpen && (
				<ul
					id={listId}
					role='listbox'
					className='absolute inset-x-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-popover p-1 shadow-lg'
				>
					{hits.map((hit, position) => (
						<li
							key={`${hit.group}-${hit.label}`}
							// `presentation`, żeby `option` miało nad sobą `listbox`,
							// a nie `listitem` — ten drugi nie jest dozwolonym
							// dzieckiem listy wyboru (axe: aria-required-parent).
							role='presentation'
						>
							<button
								id={optionId(position)}
								type='button'
								role='option'
								// Fokus klawiatury nie wchodzi na pozycje listy (steruje
								// nimi `aria-activedescendant`), więc nie mogą też
								// przechwytywać Taba z pola wyszukiwania.
								tabIndex={-1}
								aria-selected={position === activeIndex}
								onMouseEnter={() => setActiveIndex(position)}
								onClick={() => goTo(hit)}
								className={cn(
									'flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-1.5 text-start',
									position === activeIndex && 'bg-muted'
								)}
							>
								<span className='text-xs font-medium'>{hit.label}</span>
								<span className='font-mono text-[10px] text-muted-foreground'>
									{hit.group}
								</span>
							</button>
						</li>
					))}
				</ul>
			)}
			{/*
				Liczba wyników dla czytnika ekranu. Lista pojawia się i zmienia bez
				przeniesienia fokusu, więc bez tego obszaru osoba niewidoma pisze
				w pole i nie wie, czy cokolwiek zostało znalezione.
			*/}
			<div
				role='status'
				aria-live='polite'
				className='sr-only'
			>
				{phrase.trim().length >= 2 ? `Wyników: ${hits.length}` : ''}
			</div>
		</div>
	)
}
