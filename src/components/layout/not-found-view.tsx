import { ArrowRight, ArrowUpRight, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { companyConfig } from '@/company.config'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Section } from '@/components/ui/section'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { Link } from '@/i18n/navigation'
import { phoneLinks } from '@/lib/phone'
import type { Locale } from '@/site.config'

/**
 * Treść strony 404 — jedna dla obu plików, które ją renderują.
 *
 * Next.js wymaga tu DWÓCH osobnych plików i nie da się ich scalić (szczegóły
 * w `app/global-not-found.tsx`), więc bez tego komponentu ten sam widok byłby
 * opisany w dwóch miejscach i rozjechałby się przy pierwszej zmianie tekstu.
 *
 * Leży w `components/layout`, bo to jedyna warstwa dzielona przez pliki
 * z korzenia `app/` — nie jest to komponent rejestru shadcn, tylko kawałek
 * szkieletu aplikacji.
 */

/** Skróty z 404 — te same trzy wyjścia co w menu (Paper: „404"). */
const SHORTCUTS = [
	{ href: '/frezowanie-pod-ogrzewanie-podlogowe', key: 'service' },
	{ href: '/realizacje', key: 'projects' },
	{ href: '/kontakt', key: 'quote' },
] as const

export async function NotFoundView({
	/**
	 * Język komunikatów. Podawany jawnie tylko przez `global-not-found.tsx`,
	 * który renderuje się POZA segmentem `[locale]` i nie ma skąd go wziąć.
	 */
	locale,
}: {
	locale?: Locale
} = {}) {
	const t = locale
		? await getTranslations({ locale, namespace: 'notFound' })
		: await getTranslations('notFound')
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined

	return (
		<Section
			spacing='lg'
			// `overflow-hidden` przycina ozdobne „404", które celowo wychodzi za krawędź.
			className='relative overflow-hidden'
		>
			{/* Ozdoba w tle — numer błędu niesie już etykieta nad nagłówkiem. */}
			<Typography
				as='span'
				aria-hidden
				variant='displayXl'
				className='pointer-events-none absolute -top-4 -right-6 text-[10rem] leading-none text-card select-none md:text-[18rem] lg:top-10 lg:-right-10 lg:text-[26rem]'
			>
				404
			</Typography>

			<div className='relative flex flex-col gap-6 md:gap-8'>
				<div className='flex items-center gap-3'>
					<Separator
						variant='pipe'
						className='data-horizontal:w-7 md:data-horizontal:w-10'
					/>
					<Typography
						variant='overline'
						tone='primary'
					>
						{t('eyebrow')}
					</Typography>
				</div>

				{/*
					Nagłówek przez `Typography as='h1'`: strona błędu też potrzebuje
					dokładnie jednego `<h1>`, bo bez niego czytnik ekranu nie ma od
					czego zacząć czytania treści.
				*/}
				<Typography
					as='h1'
					variant='displayLg'
					className='max-w-[13ch]'
				>
					{t('title')}
				</Typography>

				<Typography
					variant='lead'
					tone='muted'
					className='max-w-xl'
				>
					{t('description')}
				</Typography>

				<div className='flex flex-col gap-2.5 pt-2 sm:flex-row sm:gap-3'>
					<Button
						href='/'
						size='xl'
						icon={<ArrowRight />}
						iconPosition='right'
						iconEffect='shiftRight'
					>
						{t('cta')}
					</Button>
					{phone && (
						<Button
							href={phone.href}
							variant='secondary'
							size='xl'
							icon={<Phone className='text-cold-text' />}
							className='font-heading font-bold'
						>
							{phone.display}
						</Button>
					)}
				</div>

				{/* Bez linków 404 jest ślepym zaułkiem — dla użytkownika i dla robota. */}
				<nav
					aria-labelledby='not-found-shortcuts'
					className='flex max-w-xl flex-col gap-3 pt-6 md:pt-10'
				>
					<Typography
						as='h2'
						id='not-found-shortcuts'
						variant='overline'
						tone='muted'
					>
						{t('shortcutsTitle')}
					</Typography>
					<ItemGroup className='gap-0'>
						{SHORTCUTS.map(({ href, key }) => (
							<Item
								key={href}
								variant='line'
								size='flush'
								// `Link` świadomy języka: z `/en` skrót prowadzi do `/en/kontakt`.
								render={<Link href={href} />}
							>
								<ItemContent>
									<ItemTitle>{t(key)}</ItemTitle>
								</ItemContent>
								<ItemActions>
									<ArrowUpRight className='size-5 text-muted-foreground' />
								</ItemActions>
							</Item>
						))}
					</ItemGroup>
				</nav>
			</div>
		</Section>
	)
}
