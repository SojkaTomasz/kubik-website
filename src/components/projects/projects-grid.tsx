'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { ProjectCard } from '@/components/projects/project-card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { type Project, type ProjectKind, projectKinds } from '@/data/projects'
import { anim } from '@/lib/animations/attributes'

type Filter = ProjectKind | 'all'

/**
 * Siatka realizacji z filtrem rodzaju obiektu (Paper: „Realizacje").
 *
 * Serwer renderuje komplet — filtr startuje od „Wszystkie", więc po hydracji
 * nic się nie zmienia, a robot widzi wszystkie karty. Liczba wyników trafia
 * do obszaru `role='status'`: bez niego osoba z czytnikiem kliknie filtr
 * i nie dowie się, że lista się zmieniła.
 */
export function ProjectsGrid({ projects }: { projects: Project[] }) {
	const t = useTranslations('projectsPage')
	const [filter, setFilter] = useState<Filter>('all')
	const visible = filter === 'all' ? projects : projects.filter(project => project.kind === filter)
	const kinds = projectKinds.filter(kind => projects.some(project => project.kind === kind))

	return (
		<div className='flex flex-col gap-10'>
			<ToggleGroup
				aria-label={t('filterLabel')}
				variant='chip'
				size='lg'
				className='flex-wrap'
				value={[filter]}
				// Kliknięcie w aktywny żeton oddaje pustą listę — filtr zostaje, jaki był.
				onValueChange={value => value[0] && setFilter(value[0] as Filter)}
			>
				<ToggleGroupItem value='all'>{t('all')}</ToggleGroupItem>
				{kinds.map(kind => (
					<ToggleGroupItem
						key={kind}
						value={kind}
					>
						{t(`kinds.${kind}`)}
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<p
				role='status'
				className='sr-only'
			>
				{t('count', { count: visible.length })}
			</p>

			<ul
				className='grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-14'
				{...anim('stagger')}
			>
				{visible.map((project, index) => (
					<li key={project.slug}>
						<ProjectCard
							project={project}
							variant='grid'
							headingAs='h2'
							tone={index % 2 === 0 ? 'primary' : 'cold'}
							sizes='(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'
						/>
					</li>
				))}
			</ul>
		</div>
	)
}
