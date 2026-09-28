import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { APPLE_ICON_BACKGROUND } from '@/app/icon-mark'

/**
 * Zgodność ikony iOS-a ze znakiem z `icon.svg`.
 *
 * `apple-icon.tsx` maluje tło osobno (iOS nakłada własną maskę, więc rogi
 * zaokrąglone w SVG zostawiłyby przy krawędziach ciemne sierpy), a znak czyta
 * z `icon.svg`. Kolor tła jest więc jedyną wartością powtórzoną w dwóch
 * miejscach — i jedyną, która może się rozjechać.
 *
 * Objaw rozjazdu: ikona generuje się poprawnie, tylko znak odcina się od tła
 * obwódką w innym kolorze. Widać to dopiero na ekranie telefonu.
 */

const iconSvg = readFileSync(join(process.cwd(), 'src/app/icon.svg'), 'utf8')

describe('znak marki', () => {
	it('tło ikony iOS zgadza się z wypełnieniem z icon.svg', () => {
		const background = /<rect[^>]*fill="([^"]+)"/.exec(iconSvg)?.[1]

		expect(background, 'nie znaleziono wypełnienia prostokąta w icon.svg').toBeTruthy()

		// Porównanie bez rozróżniania wielkości liter — `#0A0A0A` i `#0a0a0a`
		// to ten sam kolor, a zapis bywa różny w zależności od edytora grafiki.
		expect(background).toMatch(new RegExp(`^${APPLE_ICON_BACKGROUND}$`, 'i'))
	})

	it('icon.svg da się osadzić w adresie data:', () => {
		// `apple-icon.tsx` przekazuje go Satoriemu jako obraz w adresie `data:`.
		// Znak `#` z zapisu kolorów urywa taki adres, jeśli nie przejdzie przez
		// `encodeURIComponent` — ikona wychodzi wtedy pusta, bez błędu.
		const encoded = encodeURIComponent(iconSvg)

		expect(encoded).not.toContain('#')
		expect(decodeURIComponent(encoded)).toBe(iconSvg)
	})

	it('icon.svg jest kwadratowy', () => {
		// Ikona iOS-a jest kwadratem 180×180. Prostokątny znak zostałby
		// rozciągnięty albo obcięty przez maskę systemu.
		const viewBox = /viewBox="0 0 (\d+) (\d+)"/.exec(iconSvg)

		expect(viewBox?.[1]).toBe(viewBox?.[2])
	})
})
