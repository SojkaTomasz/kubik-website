import { ArrowLeft, FileQuestion } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Button } from '@/components/ui/button'
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
} from '@/components/ui/empty'
import { Section } from '@/components/ui/section'
import { Typography } from '@/components/ui/typography'
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

	return (
		<Section>
			<Empty className='gap-6 border-none py-12'>
				<EmptyHeader>
					<EmptyMedia variant='icon'>
						<FileQuestion />
					</EmptyMedia>

					{/*
						Nagłówek przez `Typography as='h1'`, a nie `EmptyTitle`:
						strona błędu też potrzebuje dokładnie jednego `<h1>`, bo bez
						niego czytnik ekranu nie ma od czego zacząć czytania treści.
					*/}
					<Typography
						as='h1'
						variant='h3'
					>
						{t('title')}
					</Typography>

					<EmptyDescription>{t('description')}</EmptyDescription>
				</EmptyHeader>

				<EmptyContent>
					<Button
						href='/'
						icon={<ArrowLeft />}
					>
						{t('cta')}
					</Button>

					{/* Bez linków 404 jest ślepym zaułkiem — dla użytkownika i dla robota. */}
					<div className='flex flex-wrap justify-center gap-2'>
						<Button
							href='/blog'
							variant='ghost'
							size='sm'
						>
							{t('browseBlog')}
						</Button>
						<Button
							href='/kontakt'
							variant='ghost'
							size='sm'
						>
							{t('contact')}
						</Button>
					</div>
				</EmptyContent>
			</Empty>
		</Section>
	)
}
