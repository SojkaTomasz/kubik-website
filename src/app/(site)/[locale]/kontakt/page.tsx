import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import bus from '@/assets/photos/bus.jpg'
import { companyConfig } from '@/company.config'
import { QuoteForm } from '@/components/forms/quote-form'
import { QuoteNextSteps } from '@/components/sections/quote-next-steps'
import { ServiceArea } from '@/components/sections/service-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Image } from '@/components/ui/image'
import { Section } from '@/components/ui/section'
import { Typography } from '@/components/ui/typography'
import { phoneLinks } from '@/lib/phone'
import {
	breadcrumbJsonLd,
	buildPageMetadata,
	JsonLd,
	jsonLdGraph,
	localBusinessJsonLd,
	webPageJsonLd,
} from '@/lib/seo'
import { formatTaxId } from '@/lib/tax-id'
import type { Locale } from '@/site.config'

const CONTACT_PATH = '/kontakt'

export async function generateMetadata({
	params,
}: PageProps<'/[locale]/kontakt'>): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'contactPage' })
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone).display : ''

	return buildPageMetadata({
		title: t('title'),
		description: t('description', { phone }),
		path: CONTACT_PATH,
		locale: locale as Locale,
	})
}

/**
 * Kontakt (Paper: „Kontakt") — telefon jako główna droga, formularz w karcie
 * obok, bus, po którym ekipę poznaje się pod domem, i miasta, w których
 * pracujemy najczęściej.
 *
 * Adres firmy stoi WYŁĄCZNIE w „Danych firmy" — klient nie promuje swojej
 * miejscowości, więc nie ma go w nagłówkach ani w treści (company.config.ts).
 */
export default async function ContactPage({ params }: PageProps<'/[locale]/kontakt'>) {
	const { locale } = await params
	const t = await getTranslations('contactPage')
	const nav = await getTranslations('nav')
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined
	const { address } = companyConfig

	return (
		<>
			<JsonLd
				data={jsonLdGraph(
					webPageJsonLd({ path: CONTACT_PATH, name: t('heading'), locale }),
					localBusinessJsonLd(),
					breadcrumbJsonLd([
						{ name: nav('home'), path: '/' },
						{ name: nav('contact'), path: CONTACT_PATH },
					])
				)}
			/>

			<Section aria-labelledby='contact-title'>
				<div className='grid gap-12 lg:grid-cols-2 lg:gap-20'>
					<div className='flex flex-col gap-8 lg:gap-10'>
						<div className='flex flex-col gap-5'>
							<Typography
								variant='overline'
								tone='primary'
							>
								{t('eyebrow')}
							</Typography>
							<Typography
								as='h1'
								id='contact-title'
								variant='displayXl'
							>
								{t('heading')}
							</Typography>
						</div>

						{phone && (
							<div className='flex flex-col gap-3 border-t pt-8'>
								<Typography
									variant='overline'
									tone='muted'
								>
									{t('phoneLabel')}
								</Typography>
								<Button
									href={phone.href}
									variant='link'
									size='none'
									className='self-start font-heading text-[2.5rem] leading-tight tracking-[-0.03em] font-extrabold text-foreground no-underline hover:text-hot-text md:text-[3.5rem]'
								>
									{phone.display}
								</Button>
								<Typography
									variant='body'
									tone='muted'
									className='max-w-md'
								>
									{t('phoneNote')}
								</Typography>
							</div>
						)}

						<div className='grid gap-8 border-t pt-8 sm:grid-cols-[auto_1fr] sm:gap-12'>
							{companyConfig.email && (
								<div className='flex flex-col gap-2'>
									<Typography
										variant='overline'
										tone='muted'
									>
										{t('emailLabel')}
									</Typography>
									<Button
										href={`mailto:${companyConfig.email}`}
										variant='link'
										size='none'
										className='self-start text-base font-semibold text-foreground no-underline hover:text-hot-text'
									>
										{companyConfig.email}
									</Button>
								</div>
							)}
							<div className='flex flex-col gap-2'>
								<Typography
									variant='overline'
									tone='muted'
								>
									{t('companyLabel')}
								</Typography>
								<Typography
									as='address'
									variant='bodySm'
									className='not-italic'
								>
									{companyConfig.name}
									{address && (
										<>
											<br />
											{address.streetAddress}, {address.postalCode}{' '}
											{address.addressLocality}
										</>
									)}
									{companyConfig.taxId && (
										<>
											<br />
											{t('taxId', { taxId: formatTaxId(companyConfig.taxId) })}
										</>
									)}
								</Typography>
							</div>
						</div>
					</div>

					<Card
						size='lg'
						className='self-start'
						aria-labelledby='contact-form-title'
						role='region'
					>
						<CardContent className='flex flex-col gap-8'>
							<Typography
								as='h2'
								id='contact-form-title'
								variant='h2'
							>
								{t('formTitle')}
							</Typography>
							<QuoteForm layout='stack' />
							<QuoteNextSteps />
						</CardContent>
					</Card>
				</div>
			</Section>

			<Section
				deferLayout
				spacing='none'
				className='pb-section lg:pb-section-lg'
			>
				<div className='relative'>
					<Image
						src={bus}
						alt={t('busAlt')}
						ratio='video'
						sizes='(min-width: 1440px) 1280px, 100vw'
						placeholder='blur'
						className='aspect-[4/3] md:aspect-[16/7]'
						style={{ objectPosition: '50% 55%' }}
					/>
					<Badge
						variant='pipe'
						className='absolute bottom-4 left-4 px-3.5 py-2.5 text-[0.8125rem] md:bottom-6 md:left-6'
					>
						{t('busBadge')}
					</Badge>
				</div>
			</Section>

			<ServiceArea />
		</>
	)
}
