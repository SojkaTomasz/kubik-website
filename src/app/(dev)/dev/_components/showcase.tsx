import type * as React from 'react'

import { CssVar } from '@/app/(dev)/dev/_components/css-var'
import { Container } from '@/components/ui/container'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

/**
 * Elementy powtarzalne stron /dev.
 *
 * Zasada, która trzyma te strony w ryzach: każda próbka to REALNY komponent
 * z `components/ui`, nigdy jego imitacja. Jeśli coś tu wygląda źle, poprawka
 * idzie do komponentu, a nie do tej strony.
 */

/** Numerowana sekcja z kotwicą — jednostka nawigacji na obu stronach /dev. */
export function Showcase({
	id,
	index,
	title,
	description,
	children,
}: {
	id: string
	index: string
	title: string
	description?: string
	children: React.ReactNode
}) {
	return (
		<section
			id={id}
			className='scroll-mt-navbar border-b py-14 last:border-b-0'
		>
			<Container>
				<div className='flex flex-col gap-8'>
					<div className='flex flex-col gap-2'>
						<Typography variant='overline'>
							{index} — {title}
						</Typography>
						{description && (
							<Typography
								variant='bodySm'
								tone='muted'
								className='max-w-2xl'
							>
								{description}
							</Typography>
						)}
					</div>
					{children}
				</div>
			</Container>
		</section>
	)
}

/** Podsekcja — jeden komponent lub jedna grupa tokenów. */
export function ShowcaseItem({
	title,
	note,
	children,
	className,
}: {
	title: string
	note?: string
	children: React.ReactNode
	className?: string
}) {
	return (
		<div className='flex flex-col gap-3'>
			<div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
				<Typography
					as='h3'
					variant='h6'
				>
					{title}
				</Typography>
				{note && (
					<Typography
						variant='caption'
						tone='muted'
					>
						{note}
					</Typography>
				)}
			</div>
			<div
				className={cn(
					'flex flex-wrap items-center gap-3 rounded-xl border bg-card p-5',
					className
				)}
			>
				{children}
			</div>
		</div>
	)
}

/** Pojedynczy przykład z podpisem — np. jeden wariant przycisku. */
export function Sample({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className='flex flex-col items-start gap-1.5'>
			<span className='font-mono text-[11px] text-muted-foreground'>{label}</span>
			{children}
		</div>
	)
}

/** Próbka koloru z podpisem czytanym na żywo z CSS. */
export function Swatch({
	token,
	className,
	label,
}: {
	/** Nazwa zmiennej CSS, np. `--brand-500`. */
	token: string
	/** Klasa Tailwinda malująca próbkę, np. `bg-brand-500`. */
	className: string
	label?: string
}) {
	return (
		<div className='flex w-32 flex-col gap-1.5'>
			<div className={cn('h-14 rounded-lg border', className)} />
			{label && <span className='text-[11px] font-medium'>{label}</span>}
			<CssVar name={token} />
		</div>
	)
}
