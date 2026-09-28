import { useTranslations } from 'next-intl'

import { CookieSettingsButton } from '@/components/cookie/cookie-settings-button'
import { NavLink } from '@/components/layout/nav-link'
import { Container } from '@/components/ui/container'
import { Typography } from '@/components/ui/typography'
import { siteConfig } from '@/site.config'

/**
 * Stopka wspólna dla wszystkich podstron.
 *
 * Jej najważniejszym elementem jest przycisk ustawień cookies — po pierwszej
 * decyzji baner znika i to jedyne miejsce, z którego użytkownik może zgodę
 * wycofać. Bez niego strona łamie prawo do wycofania zgody.
 *
 * Rok liczony przy renderze, a nie wpisany na sztywno: strona jest
 * prerenderowana, więc data pochodzi z momentu budowania. Wystarczy — a wpisany
 * rok zostawałby nieaktualny do pierwszej ręcznej poprawki.
 */
export function SiteFooter() {
	const t = useTranslations('footer')
	const nav = useTranslations('nav')

	return (
		<footer className='mt-auto border-t py-8'>
			<Container>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<Typography
						variant='caption'
						tone='muted'
					>
						© {new Date().getFullYear()} {siteConfig.name}. {t('rights')}
					</Typography>

					<div className='flex flex-wrap items-center gap-4'>
						<NavLink
							href='/polityka-prywatnosci'
							variant='link'
							size='sm'
							className='h-auto p-0'
						>
							{nav('privacy')}
						</NavLink>
						<CookieSettingsButton />
					</div>
				</div>
			</Container>
		</footer>
	)
}
