import { Mail, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import { ContactForm } from '@/components/forms/contact-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { Typography } from '@/components/ui/typography'
import { breadcrumbJsonLd, jsonLdGraph, webPageJsonLd } from '@/lib/seo/json-ld'
import { JsonLd } from '@/lib/seo/json-ld-component'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { type Locale, siteConfig } from '@/site.config'

export async function generateMetadata({
	params,
}: PageProps<'/[locale]/kontakt'>): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'contact' })

	return buildPageMetadata({
		title: t('title'),
		description: t('description'),
		path: '/kontakt',
		locale: locale as Locale,
	})
}

export default async function ContactPage({ params }: PageProps<'/[locale]/kontakt'>) {
	const { locale } = await params
	const t = await getTranslations('contact')
	const nav = await getTranslations('nav')

	/* Stały identyfikator, nie `useId()`: strona jest komponentem serwerowym. */
	const directTitleId = 'contact-direct-title'

	return (
		<>
			<JsonLd
				data={jsonLdGraph(
					webPageJsonLd({
						path: '/kontakt',
						name: t('title'),
						description: t('description'),
						locale,
					}),
					breadcrumbJsonLd([
						{ name: nav('home'), path: '/' },
						{ name: t('title'), path: '/kontakt' },
					])
				)}
			/>

			<Section>
				<div className='flex flex-col gap-10'>
					<div className='flex max-w-2xl flex-col gap-3'>
						<Typography
							as='h1'
							variant='h2'
						>
							{t('title')}
						</Typography>
						<Typography
							variant='lead'
							tone='muted'
						>
							{t('lead')}
						</Typography>
					</div>

					<div className='grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16'>
						<div className='flex flex-col gap-6'>
							<Typography
								as='h2'
								variant='h5'
							>
								{t('formTitle')}
							</Typography>
							<ContactForm />
						</div>

						{/*
							Kontakt bezpośredni obok formularza, nie zamiast niego.
							Część osób nie ufa formularzom, część korzysta z narzędzi,
							w których formularz jest niewygodny — a niedziałająca wysyłka
							nie może odciąć jedynej drogi kontaktu.
						*/}
						{/*
							`aria-labelledby` wskazuje widoczny nagłówek: `<aside>` jest
							punktem orientacyjnym, a czytnik wypisuje je jako listę.
							Bez nazwy pozycja na tej liście brzmi „uzupełnienie treści"
							i nie mówi nic o zawartości.
						*/}
						<aside
							aria-labelledby={directTitleId}
							className='flex flex-col gap-4'
						>
							<Typography
								as='h2'
								id={directTitleId}
								variant='h5'
							>
								{t('directTitle')}
							</Typography>

							<Card>
								<CardHeader>
									<CardTitle className='text-sm font-normal'>
										{t('fields.email')}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Button
										href={`mailto:${siteConfig.contact.email}`}
										variant='link'
										size='none'
										icon={<Mail />}
									>
										{siteConfig.contact.email}
									</Button>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='text-sm font-normal'>
										{t('fields.phone')}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Button
										href={`tel:${siteConfig.contact.phone}`}
										variant='link'
										size='none'
										icon={<Phone />}
									>
										{siteConfig.contact.phone}
									</Button>
								</CardContent>
							</Card>
						</aside>
					</div>
				</div>
			</Section>
		</>
	)
}
