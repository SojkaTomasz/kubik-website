import { TriangleAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { siteConfig } from '@/site.config'

export interface PrivacyPolicyProps {
	/** `h1` na stronie, `h2` w oknie — strona pod spodem ma już własny `h1`. */
	titleAs?: 'h1' | 'h2'
	/** Okno wskazuje go w `aria-labelledby` — nazwa okna to dokładnie to, co widać. */
	titleId?: string
}

/**
 * Treść polityki — JEDNO źródło dla strony i dla okna z banera. Rozjazd
 * w dokumencie, na który użytkownik wyraża zgodę, jest usterką prawną, nie
 * kosmetyczną. Bez `Section` i `Container`: o szerokość dba miejsce użycia.
 *
 * ⚠️ To SZKIELET. Podstawienie wymyślonej treści byłoby gorsze niż jej brak —
 * wyglądałaby na gotową i ktoś by ją wypuścił.
 */
export function PrivacyPolicy({ titleAs = 'h2', titleId }: PrivacyPolicyProps) {
	const t = useTranslations('privacy')

	// `t.raw`, bo to lista — `t()` zwraca wyłącznie tekst. Zgodności liczby
	// pozycji w obu językach pilnuje `i18n/messages.test.ts`.
	const checklist = t.raw('checklist') as string[]

	return (
		<div className='flex flex-col gap-8'>
			<div className='flex flex-col gap-3'>
				<Typography
					as={titleAs}
					id={titleId}
					variant='h2'
				>
					{t('title')}
				</Typography>
				<Typography
					variant='lead'
					tone='muted'
				>
					{t('description')}
				</Typography>
			</div>

			<Alert variant='warning'>
				<TriangleAlert />
				<AlertTitle>{t('placeholderTitle')}</AlertTitle>
				<AlertDescription>{t('placeholderBody')}</AlertDescription>
			</Alert>

			<div className='flex flex-col gap-3'>
				<Typography
					as={titleAs === 'h1' ? 'h2' : 'h3'}
					variant='h4'
				>
					{t('checklistTitle')}
				</Typography>
				<ul className='flex list-disc flex-col gap-2 pl-5'>
					{checklist.map(item => (
						<li key={item}>
							<Typography variant='bodySm'>{item}</Typography>
						</li>
					))}
				</ul>
			</div>

			<Typography
				variant='caption'
				tone='muted'
			>
				{t('contact', { email: siteConfig.contact.email })}
			</Typography>
		</div>
	)
}
