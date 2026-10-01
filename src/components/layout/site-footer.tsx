import { useTranslations } from 'next-intl'
import { Fragment } from 'react'

import { companyConfig } from '@/company.config'
import { CookieSettingsButton } from '@/components/cookie/cookie-settings-button'
import { NavLink } from '@/components/layout/nav-link'
import { SITE_NAV_LINKS } from '@/components/layout/site-nav'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Marquee } from '@/components/ui/marquee'
import { Typography } from '@/components/ui/typography'
import { phoneLinks } from '@/lib/phone'
import { siteConfig } from '@/site.config'

/** Odnośniki z dolnego paska — mono wersalikami, bez podkreślenia, jak w projekcie. */
const LEGAL_LINK =
	'font-mono text-xs tracking-[0.06em] uppercase no-underline hover:text-foreground'

/**
 * Stopka wspólna dla wszystkich podstron (Paper: „SiteFooter + CityMarquee").
 *
 * Jej najważniejszym elementem jest przycisk ustawień cookies — po pierwszej
 * decyzji baner znika i to jedyne miejsce, z którego użytkownik może zgodę
 * wycofać. Bez niego strona łamie prawo do wycofania zgody.
 *
 * Dolny pasek ma w projekcie kolor `placeholder` (#5e6670, 3,18:1 na tle) —
 * za mało na odnośniki, więc idzie kolorem wyciszonym (7,07:1).
 *
 * Rok liczony przy renderze, a nie wpisany na sztywno: strona jest
 * prerenderowana, więc data pochodzi z momentu budowania. Wystarczy — a wpisany
 * rok zostawałby nieaktualny do pierwszej ręcznej poprawki.
 */
export function SiteFooter() {
	const t = useTranslations('footer')
	const nav = useTranslations('nav')
	const cities = companyConfig.serviceCities ?? []
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined

	return (
		<footer className='mt-auto flex flex-col gap-12 overflow-hidden border-t pt-12 pb-28 md:pb-10 lg:gap-16 lg:pt-16 lg:pb-14'>
			{/*
				Przewijany pas miast to ozdoba: te same miasta stoją niżej jako lista.
				Ukryty przed czytnikiem w całości — inaczej usłyszałby je dwa razy
				(a z kopiami pasa — kilkanaście).
			*/}
			{cities.length > 0 && (
				<Marquee
					aria-hidden
					repeat={2}
					className='[--duration:60s] [--gap:2rem]'
				>
					{cities.map((city, index) => (
						<Fragment key={city}>
							<Typography
								as='span'
								variant='displayLg'
								className='whitespace-nowrap text-border'
							>
								{city}
							</Typography>
							{/* Kropki na zmianę ciepła i zimna — jak rura w projekcie. */}
							<Typography
								as='span'
								variant='displayLg'
								className={index % 2 === 0 ? 'text-hot' : 'text-cold'}
							>
								·
							</Typography>
						</Fragment>
					))}
				</Marquee>
			)}

			<Container className='flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between'>
				<div className='flex flex-col gap-4'>
					{phone && (
						<Button
							href={phone.href}
							variant='link'
							size='none'
							className='self-start font-heading text-[1.75rem] leading-tight tracking-[-0.02em] font-extrabold text-foreground no-underline hover:text-hot-text md:text-[2.5rem]'
						>
							{phone.display}
						</Button>
					)}
					<Typography
						variant='body'
						tone='muted'
					>
						{companyConfig.name}
						<br />
						{t('tagline')}
					</Typography>
				</div>

				<div className='flex flex-col gap-10 sm:flex-row lg:gap-20'>
					<nav
						aria-labelledby='footer-pages'
						className='flex flex-col gap-4'
					>
						<Typography
							as='h2'
							id='footer-pages'
							variant='overline'
							tone='muted'
						>
							{t('pagesTitle')}
						</Typography>
						<ul className='flex flex-col gap-3'>
							{SITE_NAV_LINKS.map(({ href, key, matchNested }) => (
								<li key={href}>
									<NavLink
										href={href}
										matchNested={matchNested}
										variant='link'
										size='none'
										className='font-medium text-foreground no-underline hover:text-hot-text'
									>
										{nav(key)}
									</NavLink>
								</li>
							))}
						</ul>
					</nav>

					{cities.length > 0 && (
						<div className='flex flex-col gap-4'>
							<Typography
								as='h2'
								variant='overline'
								tone='muted'
							>
								{t('citiesTitle')}
							</Typography>
							<ul className='grid grid-cols-3 gap-x-6 gap-y-3'>
								{cities.map(city => (
									<li key={city}>
										<Typography
											as='span'
											variant='body'
											tone='muted'
										>
											{city}
										</Typography>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</Container>

			<Container className='flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between'>
				<Typography
					variant='meta'
					as='p'
				>
					© {new Date().getFullYear()} {siteConfig.name}
				</Typography>

				<div className='flex flex-wrap items-center gap-x-7 gap-y-3'>
					<CookieSettingsButton className={LEGAL_LINK} />
					<NavLink
						href='/polityka-prywatnosci'
						variant='link'
						size='none'
						className={LEGAL_LINK}
					>
						{nav('privacy')}
					</NavLink>
				</div>
			</Container>
		</footer>
	)
}
