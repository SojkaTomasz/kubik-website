import { describe, expect, it } from 'vitest'

import { formatCount, parseCount } from '@/lib/animations/count'

describe('parseCount / formatCount', () => {
	it.each(['1200+', '15', '5,0', '70+ opinii', '50 m²', '15 000 m²', '15 000', '2.5 dnia'])(
		'wartość końcowa wraca w niezmienionym zapisie: %s',
		text => {
			const parts = parseCount(text)

			expect(parts).not.toBeNull()
			expect(formatCount(parts!, parts!.value)).toBe(text)
		}
	)

	it('wartość pośrednia trzyma format oryginału — przecinek i spacje tysięcy', () => {
		expect(formatCount(parseCount('5,0')!, 2.46)).toBe('2,5')
		expect(formatCount(parseCount('15 000 m²')!, 1234.4)).toBe('1 234 m²')
		expect(formatCount(parseCount('1200+')!, 0)).toBe('0+')
	})

	it('napis bez liczby nie jest licznikiem', () => {
		expect(parseCount('Cementowa')).toBeNull()
		expect(parseCount('')).toBeNull()
	})
})
