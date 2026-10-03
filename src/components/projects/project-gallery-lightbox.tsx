'use client'

import dynamic from 'next/dynamic'
import { createContext, type ReactNode, use } from 'react'

import { Button } from '@/components/ui/button'
import { useIsOpen } from '@/hooks/use-is-open'
import { cn } from '@/lib/utils'
import type { ImageSource } from '@/components/ui/image'

/*
 * Okno leniwie — konwencja z AGENTS.md („Okna modalne"). Chunk z oknem pobiera się
 * dopiero przy pierwszym kliknięciu zdjęcia.
 */
const ProjectPhotoDialog = dynamic(() =>
	import('@/components/projects/project-photo-dialog').then(module => module.ProjectPhotoDialog)
)

const OpenPhotoContext = createContext<((index: number) => void) | null>(null)

interface ProjectGalleryLightboxProps {
	photos: ImageSource[]
	alts: string[]
	children: ReactNode
}

/**
 * Stan powiększenia dla galerii realizacji. Siatka zostaje komponentem serwerowym — na
 * kliencie są tylko ten dostawca i przyciski wokół zdjęć (`GalleryPhotoButton`).
 */
export function ProjectGalleryLightbox({ photos, alts, children }: ProjectGalleryLightboxProps) {
	const viewer = useIsOpen<number>()

	return (
		<OpenPhotoContext value={viewer.handleOpenWithTransportedValue}>
			{children}
			{viewer.isOpen && viewer.transportedValue !== null && (
				<ProjectPhotoDialog
					photos={photos}
					alts={alts}
					index={viewer.transportedValue}
					onIndexChange={viewer.handleOpenWithTransportedValue}
					open={viewer.isOpen}
					onOpenChange={viewer.handleOpenChange}
				/>
			)}
		</OpenPhotoContext>
	)
}

interface GalleryPhotoButtonProps {
	index: number
	className?: string
	children: ReactNode
}

/**
 * Zdjęcie galerii jako przycisk otwierający powiększenie. Nazwą dostępną jest `alt`
 * zdjęcia w środku, więc przycisk nie potrzebuje własnego `aria-label`.
 */
export function GalleryPhotoButton({ index, className, children }: GalleryPhotoButtonProps) {
	const openPhoto = use(OpenPhotoContext)

	return (
		<Button
			variant='ghost'
			size='none'
			aria-haspopup='dialog'
			onClick={() => openPhoto?.(index)}
			className={cn(
				'block w-full cursor-zoom-in overflow-hidden rounded-(--image-radius) hover:bg-transparent [&_img]:transition-[filter] [&_img]:duration-300 hover:[&_img]:brightness-110',
				className
			)}
		>
			{children}
		</Button>
	)
}
