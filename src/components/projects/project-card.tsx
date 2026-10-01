import startsWith from 'lodash/startsWith'
import toLower from 'lodash/toLower'
import { useTranslations } from 'next-intl'
import { useId } from 'react'

import { Badge } from '@/components/ui/badge'
import { Image } from '@/components/ui/image'
import { Typography } from '@/components/ui/typography'
import { type Project, projectPath } from '@/data/projects'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

/**
 * „60 m² · cement · 1 dzień" — dane techniczne pod tytułem karty. Czas
 * przychodzi gotowy z tłumaczeń (`project.days`), bo odmiana zależy od języka.
 */
export function projectMeta(project: Pick<Project, 'area' | 'screed'>, days: string): string {
	const screedName = toLower(project.screed)
	const screed = startsWith(screedName, 'cement') ? 'cement' : screedName

	return `${project.area} m² · ${screed} · ${days}`
}

export interface ProjectCardProps {
	project: Project
	/**
	 * Warianty z katalogu (Paper: „ProjectCard"):
	 *   slide — karta karuzeli, miasto jako tag na zdjęciu
	 *   grid  — siatka na liście realizacji, miasto kolorem nad tytułem
	 */
	variant?: 'slide' | 'grid'
	/** Poziom nagłówka karty — zależy od sekcji, w której stoi. */
	headingAs?: 'h2' | 'h3'
	/** Kolor etykiety miasta — w siatce naprzemiennie ciepła i zimna. */
	tone?: 'primary' | 'cold'
	sizes?: string
	className?: string
}

/**
 * Karta realizacji — cała jest odnośnikiem do strony realizacji.
 *
 * `aria-labelledby` na tytule: bez tego nazwą odnośnika byłaby CAŁA treść
 * karty, łącznie z metrażem i miastem, i lista linków czytnika ekranu stałaby
 * się nieczytelna (AGENTS.md, „Klikalna karta").
 */
export function ProjectCard({
	project,
	variant = 'slide',
	headingAs = 'h3',
	tone = 'primary',
	sizes = '(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 80vw',
	className,
}: ProjectCardProps) {
	const t = useTranslations('project')
	const titleId = useId()
	const cover = project.photos[0]

	return (
		<Link
			href={projectPath(project)}
			aria-labelledby={titleId}
			className={cn(
				'group flex flex-col gap-3.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
				className
			)}
		>
			<div className='relative'>
				{cover && (
					<Image
						src={cover}
						alt=''
						ratio='portrait'
						sizes={sizes}
						placeholder='blur'
						className='transition-[filter] duration-300 group-hover:brightness-110'
					/>
				)}
				{variant === 'slide' && (
					<Badge
						variant='photo'
						className='absolute top-3 left-3'
					>
						{project.cityName}
					</Badge>
				)}
			</div>

			<div className='flex flex-col gap-1.5'>
				{variant === 'grid' && (
					<Typography
						as='p'
						variant='overline'
						tone={tone}
						className='font-semibold'
					>
						{project.cityName}
					</Typography>
				)}
				<Typography
					as={headingAs}
					id={titleId}
					variant='h4'
					className='transition-colors group-hover:text-hot-text'
				>
					{project.title}
				</Typography>
				<Typography variant='meta'>
					{projectMeta(project, t('days', { count: project.days }))}
				</Typography>
			</div>
		</Link>
	)
}
