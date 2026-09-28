import { useTranslations } from 'next-intl'

import { LanguageSwitcher } from '@/components/language-switcher'
import { NavLink } from '@/components/layout/nav-link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Container } from '@/components/ui/container'
import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/site.config'

/**
 * Nagłówek wspólny dla wszystkich podstron.
 *
 * Wcześniej przełącznik motywu i języka stały wklejone w stronę główną, więc
 * pozostałe podstrony nie miały ich wcale — użytkownik, który wszedł wprost na
 * `/kontakt`, nie mógł ani zmienić języka, ani wrócić na stronę główną.
 *
 * Adresy podstron biorą się z `nav`, a nie z ręcznie sklejanych stringów —
 * `Link` z `@/i18n/navigation` sam dokłada prefiks bieżącego języka.
 */

/**
 * `matchNested` dla bloga: wpis leży pod `/blog/<slug>`, więc pozycja menu ma
 * zostać oznaczona jako bieżąca także tam. Pozostałe trasy są liśćmi.
 */
const NAV_LINKS = [
	{ href: '/blog', key: 'blog', matchNested: true },
	{ href: '/kontakt', key: 'contact', matchNested: false },
	{ href: '/polityka-prywatnosci', key: 'privacy', matchNested: false },
] as const

export function SiteHeader() {
	const t = useTranslations('nav')

	return (
		<header className='sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm'>
			<Container>
				<div className='flex h-navbar items-center justify-between gap-4'>
					<Link
						href='/'
						className='font-semibold tracking-tight transition-colors hover:text-primary'
					>
						{siteConfig.name}
					</Link>

					<div className='flex items-center gap-1'>
						<nav aria-label={t('menu')}>
							<ul className='flex items-center gap-1'>
								{NAV_LINKS.map(({ href, key, matchNested }) => (
									<li key={href}>
										{/* NavLink, nie Button: dokłada `aria-current`, czyli
										    jedyną informację o bieżącej stronie dostępną dla
										    czytnika ekranu. */}
										<NavLink
											href={href}
											matchNested={matchNested}
											variant='ghost'
											size='sm'
										>
											{t(key)}
										</NavLink>
									</li>
								))}
							</ul>
						</nav>

						<ThemeToggle />
						<LanguageSwitcher />
					</div>
				</div>
			</Container>
		</header>
	)
}
