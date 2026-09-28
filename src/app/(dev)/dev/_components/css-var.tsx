'use client'

import { useEffect, useState } from 'react'

/**
 * Wartość zmiennej CSS czytana z przeglądarki — podpis pod próbką pochodzi z tego
 * samego źródła co ona, więc rozjazd jest niemożliwy. Odświeża się przy zmianie
 * motywu (obserwacja klasy na `<html>`).
 */
export function useCssVar(name: string): string {
	const [value, setValue] = useState('')

	useEffect(() => {
		const read = () => {
			const computed = getComputedStyle(document.documentElement).getPropertyValue(name)
			setValue(computed.trim())
		}

		read()

		const observer = new MutationObserver(read)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'style'],
		})

		return () => observer.disconnect()
	}, [name])

	return value
}

/**
 * Podpis tokenu: nazwa zmiennej i jej aktualna wartość.
 * Do pierwszego renderu (przed hydracją) pokazuje samą nazwę.
 */
export function CssVar({ name, className }: { name: string; className?: string }) {
	const value = useCssVar(name)

	return (
		<span className={className}>
			<span className='font-mono text-[11px] break-all'>{name}</span>
			{value && (
				<>
					<br />
					<span className='font-mono text-[11px] break-all text-muted-foreground'>
						{value}
					</span>
				</>
			)}
		</span>
	)
}
