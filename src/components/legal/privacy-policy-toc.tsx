'use client'

import { useTranslations } from 'next-intl'

import { sectionAnchor, sectionNumber, SECTIONS } from '@/components/legal/privacy-policy-outline'
import { Item } from '@/components/ui/item'
import { Typography } from '@/components/ui/typography'
import { useActiveSection } from '@/hooks/use-active-section'
import { scrollToAnchor } from '@/lib/scroll'
import { cn } from '@/lib/utils'

const ANCHORS = SECTIONS.map(sectionAnchor)

/**
 * Spis treści — lista odnośników do sekcji, z numerami jak w nagłówkach.
 * Sekcja, którą właśnie czytasz, świeci tak jak pozycja pod kursorem;
 * kliknięcie przewija do niej płynnie.
 * Osobny moduł kliencki, bo treść polityki renderuje też serwer.
 *
 * Stan niesie `aria-current='true'` (pozycja w obrębie strony, nie sama
 * strona) — podświetlenie bez odpowiednika w ARIA byłoby dla czytnika
 * niewidoczne (AGENTS.md, „Stan widoczny okiem").
 */
export function PrivacyPolicyToc({ className }: { className?: string }) {
	const t = useTranslations('privacy')
	const active = useActiveSection(ANCHORS)

	return (
		<nav
			aria-label={t('tocTitle')}
			className={cn('flex flex-col gap-4', className)}
		>
			<Typography
				as='p'
				variant='overline'
				tone='muted'
			>
				{t('tocTitle')}
			</Typography>
			<ul className='flex flex-col'>
				{SECTIONS.map((key, index) => (
					<li key={key}>
						<Item
							variant='rail'
							size='sm'
							render={
								<a
									href={`#${sectionAnchor(key)}`}
									aria-current={active === sectionAnchor(key) ? 'true' : undefined}
									// Płynnie i pod przyklejony nagłówek, jak kotwice w `Button`. Bez JS-a
									// zostaje zwykły skok po `href`.
									onClick={event => {
										if (scrollToAnchor(`#${sectionAnchor(key)}`)) event.preventDefault()
									}}
								/>
							}
						>
							<Typography
								as='span'
								variant='meta'
								tone='primary'
								aria-hidden
							>
								{sectionNumber(index)}
							</Typography>
							<span className='text-[0.9375rem]'>{t(`sections.${key}.title`)}</span>
						</Item>
					</li>
				))}
			</ul>
		</nav>
	)
}
