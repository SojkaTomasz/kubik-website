import type * as React from 'react'

import { Container, type ContainerProps } from '@/components/ui/container'
import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/**
 * Sekcja strony. Odstępy z tokenów `--section-py` / `--section-py-lg`, więc
 * „strona ma oddychać bardziej" to dwie wartości w theme/components.css.
 */
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
	deferLayout = false,
	children,
	...props
}: SectionProps) {
	return (
		<section
			data-slot='section'
			className={cn(
				sectionVariants({ spacing, background }),
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
