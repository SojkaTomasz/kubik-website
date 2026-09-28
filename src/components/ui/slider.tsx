import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn.
 * Dodane przekazanie nazwy dostępnej do ukrytego <input> wewnątrz uchwytu.
 * Bez tego suwak nie ma nazwy dla czytnika ekranu — audyt axe zgłasza to jako
 * naruszenie krytyczne, a rejestr shadcn nie rozwiązuje tego sam.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	getAriaLabel,
	'aria-label': ariaLabel,
	...props
}: SliderPrimitive.Root.Props & {
	/**
	 * Nazwa uchwytu dla czytnika ekranu. Przy suwaku zakresowym dostaje indeks
	 * uchwytu, więc da się rozróżnić „cena od" i „cena do".
	 */
	getAriaLabel?: (index: number) => string
}) {
	const _values = Array.isArray(value)
		? value
		: Array.isArray(defaultValue)
			? defaultValue
			: [min, max]

	return (
		<SliderPrimitive.Root
			className={cn('data-horizontal:w-full data-vertical:h-full', className)}
			data-slot='slider'
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			thumbAlignment='edge'
			{...props}
		>
			<SliderPrimitive.Control className='relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col'>
				<SliderPrimitive.Track
					data-slot='slider-track'
					className='relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1'
				>
					<SliderPrimitive.Indicator
						data-slot='slider-range'
						className='bg-primary select-none data-horizontal:h-full data-vertical:w-full'
					/>
				</SliderPrimitive.Track>
				{Array.from({ length: _values.length }, (_, index) => (
					<SliderPrimitive.Thumb
						data-slot='slider-thumb'
						key={index}
						// Rola suwaka siedzi na ukrytym <input>, nie na widocznym uchwycie,
						// więc aria-label podane na komponencie musi tu zostać przekazane.
						getAriaLabel={getAriaLabel ?? (ariaLabel ? () => ariaLabel : undefined)}
						className='relative block size-3 shrink-0 cursor-pointer rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50'
					/>
				))}
			</SliderPrimitive.Control>
		</SliderPrimitive.Root>
	)
}

export { Slider }
