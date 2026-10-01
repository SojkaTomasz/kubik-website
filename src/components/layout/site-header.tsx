import { ArrowRight, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

import logo from '@/assets/logo-kubik.png'
import { companyConfig } from '@/company.config'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NavLink } from '@/components/layout/nav-link'
import { SiteMenuButton } from '@/components/layout/site-menu-button'
import { SITE_NAV_LINKS } from '@/components/layout/site-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Image } from '@/components/ui/image'
import { Rating } from '@/components/ui/rating'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { phoneLinks } from '@/lib/phone'
import { siteConfig } from '@/site.config'

/**
 * Nagłówek wspólny dla wszystkich podstron — pływający pasek z projektu
 * (Paper, „Navbar — propozycje", wariant B2: pełne logo).
 *
 * Od desktopu: logo, nawigacja, ocena, telefon i „Darmowa wycena". Na telefonie
 * i tablecie zostaje logo, skrócone „Wycena" i przycisk menu — pełna lista
 * pozycji, telefon i drugi przycisk siedzą w menu (`site-menu-dialog.tsx`).
 *
 * Adresy podstron biorą się z `site-nav.ts`, a nie z ręcznie sklejanych
 * stringów — `Link` z `@/i18n/navigation` sam dokłada prefiks bieżącego języka.
 * Pigułki nawigacji i przyciski mają 4 px (`radius='lg'`) jak pływający pasek;
 * reszta przycisków w serwisie jest kanciasta.
 */
export function SiteHeader() {
	const t = useTranslations('nav')
	const footer = useTranslations('footer')
	const rating = useTranslations('rating')
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined

	return (
		<header className='sticky top-0 z-40 pt-3 lg:pt-5'>
			<Container>
				<Card className='h-16 flex-row items-center justify-between gap-3 rounded-lg border bg-card/95 py-0 pr-2 pl-4 shadow-[0_20px_50px_rgb(0_0_0/40%)] backdrop-blur-sm lg:h-18 lg:pl-6'>
					<div className='flex items-center gap-6 xl:gap-10'>
						{/* Pierwszy odnośnik nagłówka — prowadzi na stronę główną. */}
						<Link
							href='/'
							aria-label={footer('homeLabel', { name: siteConfig.name })}
							className='shrink-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
						>
							<Image
								src={logo}
								alt=''
								sizes='86px'
								eager
								rounded='none'
								// Szerokość z proporcji pliku (800 × 542) — przy samej wysokości
								// obraz o `size-full` wziąłby szerokość naturalną, 800 px.
								className='aspect-[400/271] h-11 lg:h-[3.625rem]'
							/>
						</Link>

						<Separator
							orientation='vertical'
							className='hidden lg:block data-vertical:h-7 data-vertical:self-center'
						/>

						<nav
							aria-label={t('menu')}
							className='hidden lg:block'
						>
							<ul className='flex items-center gap-1.5'>
								{SITE_NAV_LINKS.map(({ href, key, matchNested }) => (
									<li key={href}>
										{/* NavLink, nie Button: dokłada `aria-current`, czyli
										    jedyną informację o bieżącej stronie dostępną dla
										    czytnika ekranu. */}
										<NavLink
											href={href}
											matchNested={matchNested}
											variant='ghost'
											radius='lg'
										>
											{t(key)}
										</NavLink>
									</li>
								))}
							</ul>
						</nav>
					</div>

					<div className='flex items-center gap-2'>
						{companyConfig.rating && (
							<Rating
								size='sm'
								value={companyConfig.rating.value}
								label={rating('short', { count: companyConfig.rating.count })}
								className='hidden px-3.5 xl:flex'
							/>
						)}

						<LanguageSwitcher />

						{phone && (
							<Button
								href={phone.href}
								variant='secondary'
								size='lg'
								radius='lg'
								icon={<Phone className='text-cold-text' />}
								className='hidden font-heading font-extrabold md:inline-flex'
							>
								{phone.display}
							</Button>
						)}

						<Button
							href='/kontakt'
							size='lg'
							radius='lg'
							icon={<ArrowRight />}
							iconPosition='right'
							iconEffect='shiftRight'
							className='max-sm:px-4 max-sm:[&_[data-icon]]:hidden'
						>
							<span className='lg:hidden'>{t('quoteShort')}</span>
							<span className='hidden lg:inline'>{t('quote')}</span>
						</Button>

						<SiteMenuButton className='lg:hidden' />
					</div>
				</Card>
			</Container>
		</header>
	)
}
