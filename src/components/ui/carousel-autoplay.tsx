'use client'

import Autoplay from 'embla-carousel-autoplay'
import padStart from 'lodash/padStart'
import { Pause, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Carousel, useCarousel } from '@/components/ui/carousel'
import { Progress, ProgressLabel } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 *
 * Osobny plik, a nie dopisek w `carousel.tsx` — tamten pochodzi z rejestru
 * i `shadcn add --overwrite` skasowałby dopisek. Pełna lista zmian: AGENTS.md.
 */

export interface AutoplayCarouselProps extends React.ComponentProps<typeof Carousel> {
	/** Czas jednego slajdu w milisekundach. */
	delay?: number
}

/**
 * Karuzela przewijająca się sama — oficjalna wtyczka Embli `embla-carousel-autoplay`.
 *
 * Wtyczkę trzeba podać przy tworzeniu karuzeli, więc ten komponent zastępuje `Carousel`,
 * a nie siedzi w nim. Startuje zatrzymana: rusza ją dopiero `CarouselAutoplayProgress`,
 * i to wyłącznie bez ograniczonego ruchu — przy `prefers-reduced-motion` treść stoi
 * (WCAG 2.2.2). Najechanie myszą i fokus w karuzeli wstrzymują odliczanie, żeby opinia
 * nie uciekła w połowie czytania.
 */
export function AutoplayCarousel({ delay = 7000, plugins, ...props }: AutoplayCarouselProps) {
	const autoplay = React.useMemo(
		() =>
			Autoplay({
				delay,
				playOnInit: false,
				stopOnInteraction: false,
				stopOnMouseEnter: true,
				stopOnFocusIn: true,
			}),
		[delay]
	)

	return (
		<Carousel
			plugins={[autoplay, ...(plugins ?? [])]}
			{...props}
		/>
	)
}

export interface CarouselAutoplayProgressProps extends Omit<
	React.ComponentProps<'div'>,
	'children'
> {
	/** Liczba slajdów — „02 / 05" nad paskiem. */
	total: number
}

/**
 * Licznik slajdu, pasek czasu do następnego slajdu i przycisk pauzy. Pasek to shadcnowy
 * `Progress` napełniany z `timeUntilNext()` wtyczki — widać dokładnie, kiedy opinia się
 * zmieni.
 *
 * Przycisk pauzy nie jest ozdobą: treść przesuwająca się sama dłużej niż 5 s musi dać
 * się zatrzymać (WCAG 2.2.2). Musi stać wewnątrz `AutoplayCarousel`.
 */
export function CarouselAutoplayProgress({
	className,
	total,
	...props
}: CarouselAutoplayProgressProps) {
	const t = useTranslations('a11y')
	const { api } = useCarousel()
	const [current, setCurrent] = React.useState(1)
	const [progress, setProgress] = React.useState(0)
	const [isPlaying, setIsPlaying] = React.useState(false)
	/** Pauza z przycisku — w odróżnieniu od chwilowej (mysz, fokus) trzyma do odwołania. */
	const [isPausedByUser, setIsPausedByUser] = React.useState(false)
	const isPausedByUserRef = React.useRef(false)

	React.useEffect(() => {
		const autoplay = api?.plugins().autoplay
		if (!api || !autoplay) return undefined

		const isStill = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		let frame = 0

		/*
		 * Wtyczka wznawia odliczanie sama — po zjechaniu myszą, utracie fokusu i puszczeniu
		 * przeciągnięcia — bez względu na to, że ktoś wcisnął pauzę. Każde takie wznowienie
		 * przy pauzie gasimy. W mikrozadaniu, bo zdarzenia lecą, zanim wtyczka oznaczy się
		 * jako aktywna — `stop()` wywołane od razu nie miałoby czego zatrzymać.
		 */
		const guard = () => {
			if (isPausedByUserRef.current) queueMicrotask(() => autoplay.stop())
		}

		// Pasek czyta pozostały czas co klatkę — wtyczka nie ma zdarzenia „tik".
		const tick = () => {
			const delay = autoplay.options.delay
			const left = autoplay.timeUntilNext()
			if (typeof delay === 'number' && left !== null) setProgress(100 - (left / delay) * 100)
			frame = requestAnimationFrame(tick)
		}

		const syncSlide = () => setCurrent(api.selectedScrollSnap() + 1)
		// W mikrozadaniu z tego samego powodu co `guard`: przy `autoplay:play` wtyczka
		// jeszcze nie zdążyła się oznaczyć jako aktywna i `isPlaying()` kłamie.
		const syncPlaying = () => queueMicrotask(() => setIsPlaying(autoplay.isPlaying()))
		// Licznik zatrzymany (mysz, fokus, pauza) — pasek wraca do zera, a nie zastyga w pół.
		const clearProgress = () => setProgress(0)

		syncSlide()
		api.on('select', syncSlide)
		api.on('autoplay:play', guard)
		api.on('autoplay:timerset', guard)
		api.on('autoplay:play', syncPlaying)
		api.on('autoplay:stop', syncPlaying)
		api.on('autoplay:timerstopped', clearProgress)

		// Ograniczony ruch: start w pauzie, ale przycisk pozwala świadomie włączyć przewijanie.
		if (isStill) {
			isPausedByUserRef.current = true
			setIsPausedByUser(true)
		} else {
			autoplay.play()
		}
		frame = requestAnimationFrame(tick)

		return () => {
			cancelAnimationFrame(frame)
			autoplay.stop()
			api.off('select', syncSlide)
			api.off('autoplay:play', guard)
			api.off('autoplay:timerset', guard)
			api.off('autoplay:play', syncPlaying)
			api.off('autoplay:stop', syncPlaying)
			api.off('autoplay:timerstopped', clearProgress)
		}
	}, [api])

	const togglePause = () => {
		const autoplay = api?.plugins().autoplay
		const next = !isPausedByUserRef.current
		isPausedByUserRef.current = next
		setIsPausedByUser(next)
		if (next) autoplay?.stop()
		else autoplay?.play()
	}

	const pad = (value: number) => padStart(String(value), 2, '0')

	return (
		<div
			data-slot='carousel-autoplay-progress'
			className={cn('flex flex-1 items-center gap-4', className)}
			{...props}
		>
			<Progress
				value={progress}
				aria-hidden
				// Pasek odświeżany co klatkę — przejście CSS goniłoby wartość i szarpało.
				className='flex-1 flex-nowrap items-center *:data-[slot=progress-track]:w-auto *:data-[slot=progress-track]:flex-1 [&_[data-slot=progress-indicator]]:transition-none'
			>
				<ProgressLabel className='shrink-0'>
					{pad(current)} / {pad(total)}
				</ProgressLabel>
			</Progress>
			<Button
				variant='secondary'
				size='icon-lg'
				aria-label={isPausedByUser || !isPlaying ? t('playAutoplay') : t('pauseAutoplay')}
				aria-pressed={isPausedByUser}
				icon={isPausedByUser || !isPlaying ? <Play /> : <Pause />}
				onClick={togglePause}
			/>
		</div>
	)
}
