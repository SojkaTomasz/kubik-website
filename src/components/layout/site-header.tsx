import { ArrowRight, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

import logo from '@/assets/logo-kubik.png'
import { companyConfig } from '@/company.config'
import { LanguageSwitcher } from '@/components/language-switcher'
import { HeaderDock } from '@/components/layout/header-dock'
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
import { cn } from '@/lib/utils'
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
 * Nagłówek, pigułki nawigacji i przyciski są kanciaste jak reszta serwisu —
 * bez wyjątków z promieniem (`--button-radius: 0`).
 *
 * **Dokowanie przy przewijaniu.** Na górze strony pływająca karta nad hero.
 * Po pierwszych pikselach przewinięcia TO SAMO tło karty rozciąga się do
 * krawędzi ekranu i przykleja do góry: rogi się prostują, z ramki zostaje
 * dolna kreska, a treść podjeżdża o górny odstęp i siada w pasku. Nad
 * nawigacją nie prześwituje już pas strony.
 *
 * Tło to osobna warstwa za treścią (`header-surface`), której krawędzie
 * przechodzą z prostokąta karty na pełną szerokość. Treść zostaje wyrównana
 * do strony. Animowana jest wyłącznie ta pusta warstwa i `translate` treści —
 * wysokość nagłówka w układzie się nie zmienia, więc strona pod nim nie skacze.
 * Stan ustawia `HeaderDock`, wygląd — klasy `in-data-[header-docked]:`.
 */

/** Wspólny rytm tła i treści — miękkie wyhamowanie, bez sprężyny. */
const DOCK_EASE = 'duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'

/**
 * Krawędź karty liczona jak w `Container`: margines strony plus połowa
 * nadwyżki ponad `--container-max-w`. Procenty w `left`/`right` odnoszą się
 * do szerokości nagłówka, czyli okna.
 */
const CARD_EDGE =
	'[--dock-x:calc(max(0px,(100%_-_var(--container-max-w))_/_2)_+_var(--container-px))] md:[--dock-x:calc(max(0px,(100%_-_var(--container-max-w))_/_2)_+_var(--container-px-md))] lg:[--dock-x:calc(max(0px,(100%_-_var(--container-max-w))_/_2)_+_var(--container-px-lg))]'

export function SiteHeader() {
	const t = useTranslations('nav')
	const footer = useTranslations('footer')
	const rating = useTranslations('rating')
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined

	return (
		<header className={cn('sticky top-0 z-40 pt-3 lg:pt-5', CARD_EDGE)}>
			<HeaderDock />
			{/*
				Tło karty, które przy przewinięciu rozciąga się w pasek. Na górze:
				prostokąt karty z ramką i cieniem. Zadokowane: pełna szerokość od
				samej góry, wysokość karty (dół cofnięty o górny odstęp nagłówka),
				z ramki tylko dolna kreska.
			*/}
			<div
				aria-hidden
				data-slot='header-surface'
				className={cn(
					'pointer-events-none absolute -z-10 border bg-card/95 shadow-[0_20px_50px_rgb(0_0_0/40%)] backdrop-blur-sm',
					'inset-x-(--dock-x) top-3 bottom-0 lg:top-5',
					'transition-[left,right,top,bottom,border-color,box-shadow]',
					DOCK_EASE,
					'in-data-[header-docked]:inset-x-0 in-data-[header-docked]:top-0 in-data-[header-docked]:bottom-3 in-data-[header-docked]:border-x-transparent in-data-[header-docked]:border-t-transparent in-data-[header-docked]:shadow-[0_12px_32px_rgb(0_0_0/35%)]',
					'lg:in-data-[header-docked]:top-0 lg:in-data-[header-docked]:bottom-5'
				)}
			/>
			<Container>
				<Card
					className={cn(
						'h-16 flex-row items-center justify-between gap-3 rounded-none bg-transparent py-0 pr-3 pl-4 lg:h-18 lg:pl-6',
						'transition-[translate]',
						DOCK_EASE,
						'in-data-[header-docked]:-translate-y-3 lg:in-data-[header-docked]:-translate-y-5'
					)}
				>
					<div className='flex items-center gap-4 xl:gap-6'>
						{/* Pierwszy odnośnik nagłówka — prowadzi na stronę główną. */}
						<Link
							href='/'
							aria-label={footer('homeLabel', { name: siteConfig.name })}
							className='shrink-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
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
										>
											{t(key)}
										</NavLink>
									</li>
								))}
							</ul>
						</nav>
					</div>

					<div className='flex items-center gap-1 min-[23.75rem]:gap-2'>
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
								icon={<Phone className='text-cold-text' />}
								className='hidden font-heading font-extrabold md:inline-flex'
							>
								{phone.display}
							</Button>
						)}

						<Button
							href='/kontakt'
							size='lg'
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
