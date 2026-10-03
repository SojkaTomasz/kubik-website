'use client'

import { MenuIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useIsOpen } from '@/hooks/use-is-open'

/*
 * Menu leniwie — konwencja z AGENTS.md („Okna modalne"). Przycisk siedzi
 * w nagłówku KAŻDEJ strony, a menu otwiera tylko część odwiedzających na
 * telefonie.
 */
const SiteMenuDialog = dynamic(() =>
	import('@/components/layout/site-menu-dialog').then(module => module.SiteMenuDialog)
)

/** Przycisk menu na telefonie i tablecie — od desktopu nawigacja stoi w nagłówku. */
export function SiteMenuButton({ className }: { className?: string }) {
	const t = useTranslations('nav')
	const menu = useIsOpen()

	return (
		<>
			<Button
				variant='secondary'
				size='icon-lg'
				aria-label={t('openMenu')}
				aria-haspopup='dialog'
				className={className}
				onClick={menu.handleOpen}
			>
				<MenuIcon />
			</Button>

			{menu.isOpen && (
				<SiteMenuDialog
					open={menu.isOpen}
					onOpenChange={menu.handleOpenChange}
				/>
			)}
		</>
	)
}
