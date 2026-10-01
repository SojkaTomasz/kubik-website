import type { StaticImageData } from 'next/image'
import type * as React from 'react'

import { Container } from '@/components/ui/container'
import { Image } from '@/components/ui/image'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

export interface PageHeroProps extends Omit<React.ComponentProps<'section'>, 'title'> {
	/** Zdjęcie z budowy pod treścią — przyciemnione, żeby tekst trzymał kontrast. */
	image: StaticImageData
	/** Punkt kadru, który ma zostać widoczny po przycięciu — `object-position`. */
	imagePosition?: string
	/** Ścieżka nad etykietą — strony miast i realizacji. */
	breadcrumbs?: React.ReactNode
	/** Etykieta z kreską rury — „Frezowane ogrzewanie podłogowe". */
	eyebrow?: React.ReactNode
	/**
	 * Etykieta jako CZĘŚĆ `<h1>`, nie osobny akapit. Strona główna: fraza
	 * „frezowane ogrzewanie podłogowe" ma być w H1 (docs/seo.md), a wygląd zostaje
	 * ten sam — mała etykieta nad dużym tytułem.
	 */
	eyebrowInTitle?: boolean
	title: React.ReactNode
	/** Poziom tytułu — `h1` na stronie, `h2` w próbce na `/dev`, gdzie `h1` już jest. */
	titleAs?: 'h1' | 'h2'
	lead?: React.ReactNode
	/** Rząd pod leadem — trójka „Bez skuwania…", przyciski. */
	children?: React.ReactNode
	/** Blok z prawej od desktopu — ocena i przyciski kontaktu. */
	aside?: React.ReactNode
}

/**
 * Hero podstrony (Paper: „PageHero") — zdjęcie z budowy na całą szerokość,
 * wchodzące POD pływający nagłówek, z tekstem na dole kadru.
 *
 * Ujemny margines równy wysokości nagłówka (76 / 92 px) wsuwa zdjęcie pod
 * pasek, a taki sam padding oddaje miejsce treści — bez tego nad zdjęciem
 * zostawałby pas tła.
 *
 * Zdjęcie ładuje się `eager`, nie z `priority`: elementem LCP jest nagłówek,
 * a preload zdjęcia przed arkuszem stylów zabiera mu pasmo (AGENTS.md).
 */
export function PageHero({
	className,
	image,
	imagePosition = '50% 50%',
	breadcrumbs,
	eyebrow,
	eyebrowInTitle = false,
	title,
	titleAs: TitleTag = 'h1',
	lead,
	children,
	aside,
	...props
}: PageHeroProps) {
	const eyebrowRow = eyebrow && (
		<span className='flex items-center gap-3'>
			{/* `span`, nie `Separator`: ten renderuje `div`, a etykieta bywa w środku `<h1>`. */}
			<span
				aria-hidden
				className='block h-0.5 w-6 shrink-0 bg-pipe md:w-10'
			/>
			<Typography
				as='span'
				variant='overline'
				className='tracking-[0.14em]'
			>
				{eyebrow}
			</Typography>
		</span>
	)

	return (
		<section
			data-slot='page-hero'
			className={cn(
				'relative isolate -mt-[4.75rem] flex min-h-[40rem] items-end overflow-hidden pt-[6.75rem] pb-12 md:min-h-[46rem] lg:-mt-[5.75rem] lg:min-h-[55rem] lg:pt-[7.75rem] lg:pb-20',
				className
			)}
			{...props}
		>
			<Image
				src={image}
				alt=''
				ratio='fill'
				rounded='none'
				eager
				sizes='100vw'
				style={{ objectPosition: imagePosition }}
				className='-z-20'
			/>
			{/* Przyciemnienie: mocniej u dołu, gdzie stoi tekst, i z lewej od desktopu. */}
			<div
				aria-hidden
				className='absolute inset-0 -z-10 bg-linear-to-b from-background/55 via-background/70 to-background lg:bg-linear-to-r lg:from-background lg:via-background/80 lg:to-background/30'
			/>

			<Container className='flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
				<div className='flex max-w-[51.25rem] flex-col gap-5 md:gap-7'>
					{breadcrumbs}
					{eyebrowInTitle ? (
						<TitleTag className='flex flex-col gap-5 md:gap-7'>
							{eyebrowRow}
							<Typography
								as='span'
								variant='displayXl'
							>
								{title}
							</Typography>
						</TitleTag>
					) : (
						<>
							{eyebrowRow && <div>{eyebrowRow}</div>}
							<Typography
								as={TitleTag}
								variant='displayXl'
							>
								{title}
							</Typography>
						</>
					)}
					{lead && (
						<Typography
							variant='lead'
							className='max-w-[45rem] text-foreground/85'
						>
							{lead}
						</Typography>
					)}
					{children}
				</div>

				{aside}
			</Container>
		</section>
	)
}
