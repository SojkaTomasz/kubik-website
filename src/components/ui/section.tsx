import type * as React from 'react'

import { Container, type ContainerProps } from '@/components/ui/container'
import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/**
 * Sekcja strony. Odstępy z tokenów `--section-py` / `--section-py-lg`, więc
 * „strona ma oddychać bardziej" to dwie wartości w theme/components.css.
 *
 * **Sąsiad z tym samym tłem nie dubluje odstępu.** Dwie sekcje na jednym tle
 * stykały się dolnym i górnym odstępem naraz — wizualnie dwa razy dalej od
 * siebie niż sekcje rozdzielone zmianą koloru, gdzie każdy odstęp należy do
 * swojego tła. Sekcja stojąca zaraz po sekcji z tym samym `data-section-bg`
 * traci więc górny odstęp. Czysty CSS (selektor `+`), bez JS-a.
 *
 * Granicą jest też kreska (`divider`) i zdjęcie w tle — po nich odstęp zostaje.
 */

/** Sekcja zaraz po sekcji z tym samym tłem — górny odstęp ma już od sąsiada. */
const SAME_BACKGROUND_ABOVE = {
	none: '[[data-section-bg=none]+&]:pt-0',
	muted: '[[data-section-bg=muted]+&]:pt-0',
	card: '[[data-section-bg=card]+&]:pt-0',
	inverted: '[[data-section-bg=inverted]+&]:pt-0',
} as const
const sectionVariants = cva('w-full', {
	variants: {
		spacing: {
			none: 'py-0',
			sm: 'py-8 lg:py-12',
			default: 'py-section lg:py-section-lg',
			lg: 'py-20 lg:py-32',
		},
		background: {
			none: '',
			muted: 'bg-muted',
			card: 'bg-card',
			inverted: 'bg-foreground text-background',
		},
	},
	defaultVariants: {
		spacing: 'default',
		background: 'none',
	},
})

export interface SectionProps
	extends React.ComponentProps<'section'>, VariantProps<typeof sectionVariants> {
	/** Kotwica sekcji. `scroll-padding-top` pilnuje, żeby nagłówek nie schował się pod navbarem. */
	id?: string
	/** Ustaw `false`, gdy sekcja ma sama zarządzać szerokością (np. pełnoekranowe tło). */
	contained?: boolean
	containerSize?: ContainerProps['size']
	/** Pełna wysokość ekranu, treść wyśrodkowana w pionie — typowe dla hero. */
	fullHeight?: boolean
	/** Adres idzie przez `style` — Tailwind nie wygeneruje klasy z wartości znanej dopiero w runtime. */
	backgroundImage?: string
	/** Przyciemnienie nad zdjęciem, np. `bg-black/50`. Bez niego zdjęcie zjada kontrast tekstu. */
	overlayClassName?: string
	/** Kreska na dole sekcji. Następna sekcja zachowuje wtedy pełny górny odstęp. */
	divider?: boolean
	/**
	 * `content-visibility: auto` — **załóż na każdą sekcję POZA pierwszym
	 * ekranem**, bez tego pierwsze malowanie czeka na ułożenie całej strony
	 * (pomiary w AGENTS.md).
	 *
	 * NIE zakładaj na sekcję z przyklejonym elementem w środku:
	 * `content-visibility` tworzy blok zawierający dla `position: fixed`.
	 */
	deferLayout?: boolean
}

export function Section({
	className,
	spacing,
	background,
	contained = true,
	containerSize,
	fullHeight = false,
	backgroundImage,
	overlayClassName,
	divider = false,
	deferLayout = false,
	children,
	...props
}: SectionProps) {
	const tone = background ?? 'none'
	// Zdjęcie i kreska to granica, której sąsiad nie ma — klucz spoza listy tonów.
	const sectionBg = backgroundImage ? 'image' : divider ? 'divided' : tone

	return (
		<section
			data-slot='section'
			data-section-bg={sectionBg}
			className={cn(
				sectionVariants({ spacing, background }),
				!backgroundImage && SAME_BACKGROUND_ABOVE[tone],
				divider && 'border-b',
				// `svh`, nie `vh`: na telefonie `100vh` liczy okno BEZ paska adresu,
				// więc hero zaczyna się przewijać, choć miał wypełniać ekran.
				fullHeight && 'flex min-h-svh items-center',
				// `isolate` zamyka warstwy tła w sekcji. Bez niego ujemny `z-index`
				// zdjęcia przebija POD tło strony i objaw wygląda jak zły adres pliku.
				backgroundImage && 'relative isolate',
				deferLayout && 'content-skip',
				className
			)}
			{...props}
		>
			{backgroundImage && (
				<>
					<div
						aria-hidden
						data-slot='section-background'
						// Cudzysłów wokół adresu: bez niego reguła rozsypuje się przy
						// spacji w nazwie pliku.
						style={{ backgroundImage: `url("${backgroundImage}")` }}
						className='absolute inset-0 -z-20 bg-cover bg-center'
					/>
					{overlayClassName && (
						<div
							aria-hidden
							data-slot='section-overlay'
							className={cn('absolute inset-0 -z-10', overlayClassName)}
						/>
					)}
				</>
			)}
			{contained ? <Container size={containerSize}>{children}</Container> : children}
		</section>
	)
}

export { sectionVariants }
