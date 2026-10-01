import NextImage, { type ImageProps as NextImageProps } from 'next/image'

import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

const imageVariants = cva('relative overflow-hidden bg-muted', {
	variants: {
		/**
		 * Proporcje ramki. `auto` zostawia obrazowi jego własne — reszta przycina
		 * go do zadanego kształtu.
		 */
		ratio: {
			auto: '',
			square: 'aspect-square',
			video: 'aspect-video',
			portrait: 'aspect-[3/4]',
			wide: 'aspect-[21/9]',
			/** Bez proporcji — ramka wypełnia pozycjonowanego rodzica. Zdjęcie w tle hero. */
			fill: 'absolute inset-0',
		},
		/** Domyślne zaokrąglenie bierze token `--image-radius` z components.css. */
		rounded: {
			none: 'rounded-none',
			default: 'rounded-(--image-radius)',
			full: 'rounded-full',
		},
		/** Jak obraz wypełnia ramkę o wymuszonych proporcjach. */
		fit: {
			cover: '[&_img]:object-cover',
			contain: '[&_img]:object-contain',
		},
	},
	defaultVariants: {
		ratio: 'auto',
		rounded: 'default',
		fit: 'cover',
	},
})

interface ImageProps extends Omit<NextImageProps, 'fill'>, VariantProps<typeof imageVariants> {
	/**
	 * Pobiera od razu, ale BEZ podbijania priorytetu — inaczej niż `priority`,
	 * który wstawia preload przed arkuszem stylów i zabiera pasmo elementowi LCP
	 * (zmierzone: LCP 3714 → 3480 ms, TBT 272 → 141 ms).
	 *
	 * `priority` zostaw dla obrazu, który JEST elementem LCP — sprawdzonym.
	 */
	eager?: boolean
}

/**
 * Obraz w ramce o zadanych proporcjach. `ratio='auto'` zostawia własne proporcje
 * (wymaga `width`/`height`), pozostałe wartości dają `fill` — te wykluczają się
 * w Next.js i podanie obu wywraca się dopiero w runtime.
 *
 * **Importuj statycznie**: Next odczyta wtedy wymiary i wygeneruje `blur`.
 */
function Image({
	className,
	ratio = 'auto',
	rounded,
	fit,
	sizes,
	alt,
	eager = false,
	loading,
	...props
}: ImageProps) {
	const isFilled = ratio !== 'auto'

	return (
		<div
			data-slot='image'
			className={cn(imageVariants({ ratio, rounded, fit }), className)}
		>
			<NextImage
				data-slot='image-media'
				alt={alt}
				className='size-full'
				// Domyślnie cała szerokość okna: bezpieczne, ale rozrzutne. Obraz
				// w wąskiej kolumnie powinien dostać własne `(min-width: 768px) 33vw, 100vw`.
				sizes={isFilled ? (sizes ?? '100vw') : sizes}
				loading={loading ?? (eager ? 'eager' : undefined)}
				{...(isFilled ? { fill: true } : {})}
				{...props}
			/>
		</div>
	)
}

/**
 * Typ zaimportowanego statycznie zdjęcia — dane (`data/projects.ts`) opisują nim
 * galerie, a import `next/image` poza `components/ui` blokuje ESLint.
 */
export type { StaticImageData as ImageSource } from 'next/image'

export { Image, imageVariants }
