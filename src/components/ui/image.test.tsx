import { describe, expect, it } from 'vitest'

import { Image } from '@/components/ui/image'
import { render } from '@/test/render'

/**
 * Kompozyt obrazu.
 *
 * Sprawdzamy to, co widać z zewnątrz i co łatwo zepsuć przy przepisywaniu:
 * wybór trybu na podstawie `ratio` oraz domyślne `sizes`. Oba łamią się cicho —
 * obraz nadal się wyświetla, tylko pobiera się w złym rozmiarze albo rozjeżdża
 * kadr.
 */

const SRC = '/przyklad.png'

describe('Image', () => {
	it('przy ratio="auto" nie włącza trybu wypełnienia', () => {
		const { container } = render(
			<Image
				src={SRC}
				alt='Opis'
				width={640}
				height={360}
			/>
		)

		const img = container.querySelector('img')

		// `fill` układa obraz absolutnie. Bez niego zostaje w przepływie i niesie
		// własne wymiary — stąd atrybuty width/height w wyniku.
		expect(img?.getAttribute('width')).toBe('640')
		expect(img?.style.position).not.toBe('absolute')
	})

	it('przy wymuszonych proporcjach włącza tryb wypełnienia', () => {
		const { container } = render(
			<Image
				src={SRC}
				alt='Opis'
				ratio='video'
			/>
		)

		const img = container.querySelector('img')

		expect(img?.style.position).toBe('absolute')
		expect(container.querySelector('[data-slot="image"]')?.className).toContain('aspect-video')
	})

	it('domyślne sizes obejmuje całą szerokość okna, ale tylko w trybie wypełnienia', () => {
		const { container: filled } = render(
			<Image
				src={SRC}
				alt='Opis'
				ratio='square'
			/>
		)
		const { container: intrinsic } = render(
			<Image
				src={SRC}
				alt='Opis'
				width={640}
				height={360}
			/>
		)

		expect(filled.querySelector('img')?.getAttribute('sizes')).toBe('100vw')
		expect(intrinsic.querySelector('img')?.getAttribute('sizes')).toBeNull()
	})

	it('przepuszcza własne sizes zamiast domyślnego', () => {
		const { container } = render(
			<Image
				src={SRC}
				alt='Opis'
				ratio='square'
				sizes='192px'
			/>
		)

		expect(container.querySelector('img')?.getAttribute('sizes')).toBe('192px')
	})

	it('eager zdejmuje leniwe ładowanie, NIE podbijając priorytetu', () => {
		/*
		 * Sedno różnicy między `eager` a `priority`. Ten drugi dokłada
		 * `fetchpriority='high'`, przez co React wstawia preload przed arkuszem
		 * stylów i zdjęcie zabiera pasmo elementowi LCP — na stronie tekstowej
		 * jest nim akapit, nie obraz. Pomiar w AGENTS.md.
		 */
		const { container } = render(
			<Image
				src={SRC}
				alt='Opis'
				width={640}
				height={360}
				eager
			/>
		)

		const img = container.querySelector('img')

		expect(img?.getAttribute('loading')).toBe('eager')
		expect(img?.getAttribute('fetchpriority')).not.toBe('high')
	})

	it('domyślnie zostawia leniwe ładowanie', () => {
		const { container } = render(
			<Image
				src={SRC}
				alt='Opis'
				width={640}
				height={360}
			/>
		)

		expect(container.querySelector('img')?.getAttribute('loading')).toBe('lazy')
	})

	it('nakłada osie wariantów na ramkę, nie na obraz', () => {
		const { container } = render(
			<Image
				src={SRC}
				alt='Opis'
				ratio='square'
				rounded='full'
				fit='contain'
			/>
		)

		const frame = container.querySelector('[data-slot="image"]')

		expect(frame?.className).toContain('rounded-full')
		expect(frame?.className).toContain('object-contain')
	})
})
