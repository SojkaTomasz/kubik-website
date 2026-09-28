import { render, screen } from '@/test/render'
import { describe, expect, it } from 'vitest'

import { Typography, typographyElements, typographyVariants } from '@/components/ui/typography'
import { variantKeys } from '@/lib/cva'

/**
 * Typography rozdziela wygląd od semantyki.
 *
 * To rozdzielenie jest jedynym powodem istnienia tego komponentu, więc testy
 * pilnują właśnie jego: nagłówek, który wizualnie ma być mały, musi zostać
 * nagłówkiem właściwego poziomu w drzewie dokumentu. Czytnik ekranu buduje
 * z tych poziomów spis treści strony — pomyłka gubi w nim całą sekcję.
 */

describe('dobór tagu HTML', () => {
	it('wariant nagłówkowy renderuje nagłówek odpowiedniego poziomu', () => {
		render(<Typography variant='h2'>Nagłówek sekcji</Typography>)

		expect(screen.getByRole('heading', { level: 2, name: 'Nagłówek sekcji' })).toBeInTheDocument()
	})

	it('warianty display renderują nagłówki, nie akapity', () => {
		render(<Typography variant='displayLg'>Hero</Typography>)

		expect(screen.getByRole('heading', { level: 1, name: 'Hero' })).toBeInTheDocument()
	})

	it('warianty tekstowe renderują akapit', () => {
		render(<Typography variant='body'>Treść</Typography>)

		expect(screen.getByText('Treść').tagName).toBe('P')
	})

	it('props as nadpisuje tag wynikający z wariantu', () => {
		// Sedno komponentu: wygląd h4, semantyka h2.
		render(
			<Typography
				as='h2'
				variant='h4'
			>
				Mały nagłówek sekcji
			</Typography>
		)

		expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
	})

	it('każdy wariant ma przypisany domyślny tag', () => {
		// Brak wpisu w mapie oznacza `undefined` jako typ elementu i wywrócenie
		// renderu — a zauważyłby to dopiero ktoś, kto użyje nowego wariantu.
		for (const variant of variantKeys(typographyVariants, 'variant')) {
			expect(typographyElements).toHaveProperty(variant)
		}
	})
})

describe('warianty', () => {
	it('domyślnie zachowuje się jak tekst podstawowy', () => {
		render(<Typography>Treść</Typography>)

		expect(screen.getByText('Treść').tagName).toBe('P')
	})

	it('odcień nakłada się niezależnie od wariantu', () => {
		render(
			<Typography
				variant='h3'
				tone='muted'
			>
				Nagłówek
			</Typography>
		)

		expect(screen.getByRole('heading')).toHaveClass('text-muted-foreground')
	})

	it('przepuszcza własne className', () => {
		render(<Typography className='moja-klasa'>Treść</Typography>)

		expect(screen.getByText('Treść')).toHaveClass('moja-klasa')
	})
})
