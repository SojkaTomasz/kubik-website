'use client'

import padStart from 'lodash/padStart'
import { ArrowRight, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { companyConfig } from '@/company.config'
import { NavLink } from '@/components/layout/nav-link'
import { SITE_NAV_LINKS } from '@/components/layout/site-nav'
import { Button } from '@/components/ui/button'
import { Rating } from '@/components/ui/rating'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Typography } from '@/components/ui/typography'
import { phoneLinks } from '@/lib/phone'

export interface SiteMenuDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Menu na telefonie i tablecie — pełny ekran z projektu (Paper, „Menu — mobile"):
 * duże, numerowane pozycje, telefon „całą dobę" i para przycisków na dole, tam,
 * gdzie sięga kciuk.
 *
 * Kliknięcie pozycji zamyka menu: nawigacja klientowa nie przeładowuje strony,
 * więc bez tego menu zostałoby otwarte nad nową podstroną.
 */
export function SiteMenuDialog({ open, onOpenChange }: SiteMenuDialogProps) {
	const t = useTranslations('nav')
	const rating = useTranslations('rating')
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined
	const close = () => onOpenChange(false)

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
			<SheetContent
				side='right'
				className='gap-0 overflow-y-auto px-5 pt-20 pb-6 data-[side=right]:w-full data-[side=right]:sm:max-w-md'
			>
				{/* Nazwa okna dla czytnika ekranu — na ekranie menu mówi samo za siebie. */}
				<SheetTitle className='sr-only'>{t('menu')}</SheetTitle>

				<nav aria-label={t('menu')}>
					<ul className='flex flex-col'>
						{SITE_NAV_LINKS.map(({ href, key, matchNested }, index) => (
							<li
								key={href}
								className='border-b'
							>
								<NavLink
									href={href}
									matchNested={matchNested}
									variant='ghost'
									size='none'
									icon={<ArrowRight />}
									iconPosition='right'
									onClick={close}
									className='w-full justify-between py-5 font-heading text-[2.5rem] leading-none font-extrabold tracking-[-0.03em] text-foreground hover:bg-transparent aria-[current]:bg-transparent aria-[current]:text-hot-text [&_svg]:size-6 [&_svg]:text-muted-foreground'
								>
									<span className='flex items-baseline gap-4'>
										<Typography
											as='span'
											variant='meta'
											aria-hidden
										>
											{padStart(String(index + 1), 2, '0')}
										</Typography>
										{t(key)}
									</span>
								</NavLink>
							</li>
						))}
					</ul>
				</nav>

				{phone && (
					<div className='flex flex-col gap-2 pt-10'>
						<Typography
							as='p'
							variant='overline'
							tone='muted'
						>
							{t('phoneLabel')}
						</Typography>
						<Button
							href={phone.href}
							variant='link'
							size='none'
							className='self-start font-heading text-[2rem] leading-tight font-extrabold tracking-[-0.02em] text-foreground no-underline'
						>
							{phone.display}
						</Button>
					</div>
				)}

				<div className='mt-auto flex flex-col gap-4 pt-10'>
					<div className='grid grid-cols-2 gap-2.5'>
						{phone && (
							<Button
								href={phone.href}
								variant='call'
								size='xl'
								icon={<Phone />}
							>
								{t('call')}
							</Button>
						)}
						<Button
							href='/kontakt'
							size='xl'
							onClick={close}
							className={phone ? undefined : 'col-span-2'}
						>
							{t('quote')}
						</Button>
					</div>
					{companyConfig.rating && (
						<Rating
							size='sm'
							value={companyConfig.rating.value}
							label={rating('long', { count: companyConfig.rating.count })}
						/>
					)}
				</div>
			</SheetContent>
		</Sheet>
	)
}
