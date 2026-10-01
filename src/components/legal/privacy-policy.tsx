import padStart from 'lodash/padStart'
import { useTranslations } from 'next-intl'

import { companyConfig } from '@/company.config'
import { CookieSettingsButton } from '@/components/cookie/cookie-settings-button'
import { Card, CardContent } from '@/components/ui/card'
import { Item } from '@/components/ui/item'
import { SpecList, SpecListItem } from '@/components/ui/spec-list'
import { Typography } from '@/components/ui/typography'
import { formatTaxId } from '@/lib/tax-id'
import { cn } from '@/lib/utils'

/*
 * Treść polityki — JEDNO źródło dla strony i dla okna z banera. Rozjazd
 * w dokumencie, na który użytkownik wyraża zgodę, jest usterką prawną, nie
 * kosmetyczną. Bez `Section` i `Container`: o układ dba miejsce użycia —
 * strona dokłada spis treści i hero, okno przewijanie.
 *
 * ⚠️ Treść jest roboczą wersją z projektu w Paperze. Przed wdrożeniem MUSI ją
 * zweryfikować prawnik — zwłaszcza okresy przechowywania i listę odbiorców
 * danych, które trzeba zestawić z faktycznie używanymi narzędziami.
 */

/** Kolejność sekcji — wspólna dla treści i spisu treści, który do nich prowadzi. */
const SECTIONS = [
	'administrator',
	'data',
	'purposes',
	'retention',
	'recipients',
	'cookies',
	'rights',
] as const

type SectionKey = (typeof SECTIONS)[number]

const DATA_ITEMS = ['phone', 'area', 'technical'] as const

/** Kotwica sekcji — `polityka-prywatnosci#cookies` da się podlinkować z banera czy maila. */
const sectionAnchor = (key: SectionKey) => `privacy-${key}`

/** „01", „02"… — numer sekcji w nagłówku i w spisie treści. */
const sectionNumber = (index: number) => padStart(String(index + 1), 2, '0')

export interface PrivacyPolicyHeaderProps {
	/** `h1` na stronie, `h2` w oknie — strona pod spodem ma już własny `h1`. */
	titleAs?: 'h1' | 'h2'
	/** Okno wskazuje go w `aria-labelledby` — nazwa okna to dokładnie to, co widać. */
	titleId?: string
	/** `page` — duży tytuł hero; `dialog` — tytuł okna. */
	size?: 'page' | 'dialog'
	className?: string
}

/** Etykieta, tytuł, wstęp i data obowiązywania. */
export function PrivacyPolicyHeader({
	titleAs = 'h2',
	titleId,
	size = 'dialog',
	className,
}: PrivacyPolicyHeaderProps) {
	const t = useTranslations('privacy')
	const isPage = size === 'page'

	return (
		<div
			className={cn(
				'flex flex-col gap-5',
				isPage && 'lg:flex-row lg:items-end lg:justify-between lg:gap-20',
				className
			)}
		>
			<div className='flex flex-col gap-4 md:gap-6'>
				<Typography
					variant='overline'
					tone='primary'
				>
					{t('eyebrow')}
				</Typography>
				<Typography
					as={titleAs}
					id={titleId}
					variant={isPage ? 'displayLg' : 'displaySm'}
				>
					{t('title')}
				</Typography>
			</div>

			<div className={cn('flex flex-col gap-4', isPage && 'lg:w-100 lg:shrink-0 lg:pb-2')}>
				<Typography
					variant='lead'
					tone='muted'
				>
					{t('description')}
				</Typography>
				<Typography
					variant='overline'
					tone='muted'
				>
					{t('effective')}
				</Typography>
			</div>
		</div>
	)
}

/** Spis treści — lista odnośników do sekcji, z numerami jak w nagłówkach. */
export function PrivacyPolicyToc({ className }: { className?: string }) {
	const t = useTranslations('privacy')

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
							render={<a href={`#${sectionAnchor(key)}`} />}
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

export interface PrivacyPolicySectionsProps {
	/** Poziom nagłówków sekcji — o jeden niżej niż tytuł dokumentu. */
	headingAs?: 'h2' | 'h3'
	className?: string
}

/** Siedem sekcji polityki. `data-slot` porównuje e2e: strona i okno muszą mieć tę samą treść. */
export function PrivacyPolicySections({ headingAs = 'h3', className }: PrivacyPolicySectionsProps) {
	const t = useTranslations('privacy')
	const email = companyConfig.email ?? ''

	const body = (key: SectionKey) => (
		<Typography
			variant='body'
			tone='muted'
		>
			{t(`sections.${key}.body`, { email })}
		</Typography>
	)

	return (
		<div
			data-slot='privacy-policy-sections'
			className={cn('flex flex-col gap-12 md:gap-16', className)}
		>
			{SECTIONS.map((key, index) => (
				<section
					key={key}
					id={sectionAnchor(key)}
					aria-labelledby={`${sectionAnchor(key)}-title`}
					// Sekcja nie chowa się pod przyklejonym nagłówkiem przy skoku z kotwicy.
					className='flex scroll-mt-28 flex-col gap-5'
				>
					<Typography
						as={headingAs}
						id={`${sectionAnchor(key)}-title`}
						variant='displaySm'
						className='flex items-baseline gap-4'
					>
						{/* Numer jest ozdobą — kolejność sekcji niesie już dokument. */}
						<Typography
							as='span'
							variant='overline'
							tone='primary'
							aria-hidden
						>
							{sectionNumber(index)}
						</Typography>
						{t(`sections.${key}.title`)}
					</Typography>

					{body(key)}

					{key === 'administrator' && (
						<Card variant='accent'>
							<CardContent className='flex flex-col gap-6 sm:flex-row sm:gap-12'>
								<div className='flex flex-col gap-2'>
									<Typography
										as='p'
										variant='overline'
										tone='muted'
									>
										{t('sections.administrator.companyLabel')}
									</Typography>
									<Typography
										as='address'
										variant='body'
										className='not-italic'
									>
										{companyConfig.name}
										<br />
										{companyConfig.address?.streetAddress},{' '}
										{companyConfig.address?.postalCode}{' '}
										{companyConfig.address?.addressLocality}
										<br />
										{t('sections.administrator.taxId', {
											taxId: formatTaxId(companyConfig.taxId ?? ''),
										})}
									</Typography>
								</div>
								<div className='flex flex-col gap-2'>
									<Typography
										as='p'
										variant='overline'
										tone='muted'
									>
										{t('sections.administrator.contactLabel')}
									</Typography>
									<Typography
										as='address'
										variant='body'
										className='font-semibold not-italic'
									>
										{companyConfig.email}
										<br />
										{companyConfig.phone}
									</Typography>
								</div>
							</CardContent>
						</Card>
					)}

					{key === 'data' && (
						<SpecList appearance='definition'>
							{DATA_ITEMS.map(item => (
								<SpecListItem
									key={item}
									label={t(`sections.data.items.${item}.label`)}
									value={t(`sections.data.items.${item}.purpose`)}
								/>
							))}
						</SpecList>
					)}

					{key === 'cookies' && (
						<CookieSettingsButton
							variant='outline'
							size='xl'
							className='self-start'
						>
							{t('sections.cookies.cta')}
						</CookieSettingsButton>
					)}
				</section>
			))}
		</div>
	)
}

export interface PrivacyPolicyProps {
	titleAs?: 'h1' | 'h2'
	titleId?: string
}

/** Cały dokument w jednej kolumnie — wersja do okna z banera. */
export function PrivacyPolicy({ titleAs = 'h2', titleId }: PrivacyPolicyProps) {
	return (
		<div className='flex flex-col gap-10'>
			<PrivacyPolicyHeader
				titleAs={titleAs}
				titleId={titleId}
			/>
			<PrivacyPolicySections headingAs={titleAs === 'h1' ? 'h2' : 'h3'} />
		</div>
	)
}
