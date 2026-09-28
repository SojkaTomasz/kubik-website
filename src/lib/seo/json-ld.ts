import isNil from 'lodash/isNil'
import type {
	Article,
	BreadcrumbList,
	FAQPage,
	ItemAvailability,
	LocalBusiness,
	Organization,
	Person,
	Product,
	Service,
	Thing,
	WebPage,
	WebSite,
	WithContext,
} from 'schema-dts'

import { companyConfig } from '@/company.config'
import { absoluteUrl, siteConfig } from '@/site.config'

/**
 * Dane strukturalne (JSON-LD). Dwie zasady: stabilne `@id` (inaczej Organization
 * z podstrony i ze strony głównej to dla Google dwie różne firmy) oraz brak
 * pustych kluczy (`"name": ""` jest dla Google błędem, nie brakiem danych).
 */

/** Pojedyncza encja schema.org gotowa do osadzenia w stronie. */
export type JsonLdEntity = WithContext<Thing>

/**
 * Graf encji. `schema-dts` nie modeluje `@graph`, więc opisujemy go tutaj —
 * elementy grafu to te same encje, tylko bez powtórzonego `@context`.
 */
export interface JsonLdGraph {
	'@context': 'https://schema.org'
	'@graph': Record<string, unknown>[]
}

/** Kotwice `@id` — jedno miejsce, żeby identyfikatory nie rozjechały się między plikami. */
export const jsonLdIds = {
	organization: absoluteUrl('/#organization'),
	website: absoluteUrl('/#website'),
	page: (path: string) => `${absoluteUrl(path)}#webpage`,
	breadcrumb: (path: string) => `${absoluteUrl(path)}#breadcrumb`,
	article: (path: string) => `${absoluteUrl(path)}#article`,
} as const

/** Usuwa klucze o wartości `undefined`, `null`, `''` oraz puste tablice. */
function optional<T extends Record<string, unknown>>(input: T): Partial<T> {
	const output: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(input)) {
		if (isNil(value) || value === '') continue
		if (Array.isArray(value) && value.length === 0) continue
		output[key] = value
	}

	return output as Partial<T>
}

/** Firma stojąca za stroną. Baza dla panelu wiedzy Google. */
export function organizationJsonLd(): WithContext<Organization> {
	const { address } = companyConfig

	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': jsonLdIds.organization,
		name: companyConfig.name,
		url: siteConfig.url,
		...optional({
			legalName: companyConfig.legalName,
			description: companyConfig.description,
			logo: companyConfig.logo ? absoluteUrl(companyConfig.logo) : undefined,
			email: companyConfig.email ?? siteConfig.contact.email,
			telephone: companyConfig.phone ?? siteConfig.contact.phone,
			taxID: companyConfig.taxId,
			sameAs: companyConfig.socialProfiles,
			areaServed: companyConfig.areaServed,
			address: address
				? {
						'@type': 'PostalAddress' as const,
						...optional({
							streetAddress: address.streetAddress,
							postalCode: address.postalCode,
							addressLocality: address.addressLocality,
							addressRegion: address.addressRegion,
							addressCountry: address.addressCountry,
						}),
					}
				: undefined,
		}),
	}
}

/**
 * Firma z lokalizacją i godzinami otwarcia.
 *
 * Używaj zamiast `organizationJsonLd()` tam, gdzie klient przychodzi pod adres —
 * to ten typ zasila wizytówkę w Mapach Google i wyniki lokalne.
 */
export function localBusinessJsonLd(): WithContext<LocalBusiness> {
	const organization = organizationJsonLd()

	return {
		// Rzutowanie przez Record: WithContext<Organization> to unia typów leaf,
		// a TypeScript nie pozwala rozłożyć unii operatorem spread.
		...(organization as unknown as Record<string, unknown>),
		'@type': 'LocalBusiness',
		...optional({
			priceRange: companyConfig.priceRange,
			openingHours: companyConfig.openingHours,
		}),
	} as WithContext<LocalBusiness>
}

/** Serwis jako całość. `potentialAction` zgłasza wewnętrzną wyszukiwarkę, jeśli istnieje. */
export function websiteJsonLd(options?: { searchUrlTemplate?: string }): WithContext<WebSite> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': jsonLdIds.website,
		url: siteConfig.url,
		name: siteConfig.name,
		description: siteConfig.description,
		publisher: { '@id': jsonLdIds.organization },
		inLanguage: [...siteConfig.locales],
		...optional({
			potentialAction: options?.searchUrlTemplate
				? {
						'@type': 'SearchAction' as const,
						target: {
							'@type': 'EntryPoint' as const,
							urlTemplate: options.searchUrlTemplate,
						},
						// Ta dziwna składnia to wymóg Google, nie literówka:
						// nazwa parametru musi być zadeklarowana właśnie w ten sposób.
						'query-input': 'required name=search_term_string',
					}
				: undefined,
		}),
	}
}

/** Pojedyncza podstrona, powiązana z serwisem i firmą. */
export function webPageJsonLd(input: {
	path: string
	name: string
	description?: string
	locale?: string
}): WithContext<WebPage> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'@id': jsonLdIds.page(input.path),
		url: absoluteUrl(input.path),
		name: input.name,
		isPartOf: { '@id': jsonLdIds.website },
		about: { '@id': jsonLdIds.organization },
		...optional({
			description: input.description,
			inLanguage: input.locale,
		}),
	}
}

/**
 * Okruszki nawigacyjne — Google pokazuje je zamiast surowego URL-a w wynikach.
 * Pierwszy element powinien być stroną główną.
 */
export function breadcrumbJsonLd(
	items: { name: string; path: string }[],
	pagePath?: string
): WithContext<BreadcrumbList> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		'@id': jsonLdIds.breadcrumb(pagePath ?? items.at(-1)?.path ?? '/'),
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path),
		})),
	}
}

/** Wpis blogowy lub artykuł. */
export function articleJsonLd(input: {
	path: string
	headline: string
	description?: string
	image?: string
	datePublished: string
	dateModified?: string
	authorName?: string
	locale?: string
	keywords?: string[]
}): WithContext<Article> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		'@id': jsonLdIds.article(input.path),
		headline: input.headline,
		url: absoluteUrl(input.path),
		datePublished: input.datePublished,
		mainEntityOfPage: { '@id': jsonLdIds.page(input.path) },
		publisher: { '@id': jsonLdIds.organization },
		...optional({
			description: input.description,
			image: input.image ? absoluteUrl(input.image) : undefined,
			dateModified: input.dateModified ?? input.datePublished,
			inLanguage: input.locale,
			keywords: input.keywords,
			author: input.authorName
				? { '@type': 'Person' as const, name: input.authorName }
				: { '@id': jsonLdIds.organization },
		}),
	}
}

/**
 * Sekcja FAQ.
 *
 * Odpowiedzi muszą być pełnymi zdaniami widocznymi na stronie — Google odrzuca
 * dane strukturalne opisujące treść, której użytkownik nie zobaczy.
 */
export function faqJsonLd(items: { question: string; answer: string }[]): WithContext<FAQPage> {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map(item => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: { '@type': 'Answer', text: item.answer },
		})),
	}
}

/** Pojedyncza usługa z oferty. */
export function serviceJsonLd(input: {
	name: string
	description?: string
	path?: string
	serviceType?: string
	areaServed?: string[]
}): WithContext<Service> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: input.name,
		provider: { '@id': jsonLdIds.organization },
		...optional({
			description: input.description,
			url: input.path ? absoluteUrl(input.path) : undefined,
			serviceType: input.serviceType,
			areaServed: input.areaServed ?? companyConfig.areaServed,
		}),
	}
}

/** Osoba — do stron „o mnie" i profili zespołu. */
export function personJsonLd(input: {
	name: string
	jobTitle?: string
	image?: string
	path?: string
	sameAs?: string[]
}): WithContext<Person> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: input.name,
		worksFor: { '@id': jsonLdIds.organization },
		...optional({
			jobTitle: input.jobTitle,
			image: input.image ? absoluteUrl(input.image) : undefined,
			url: input.path ? absoluteUrl(input.path) : undefined,
			sameAs: input.sameAs,
		}),
	}
}

/** Produkt z ceną i dostępnością. */
export function productJsonLd(input: {
	name: string
	description?: string
	image?: string
	sku?: string
	price?: number
	currency?: string
	availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
}): WithContext<Product> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: input.name,
		...optional({
			description: input.description,
			image: input.image ? absoluteUrl(input.image) : undefined,
			sku: input.sku,
			brand: { '@type': 'Brand' as const, name: companyConfig.name },
			offers:
				input.price === undefined
					? undefined
					: {
							'@type': 'Offer' as const,
							price: String(input.price),
							priceCurrency: input.currency ?? 'PLN',
							availability:
								`https://schema.org/${input.availability ?? 'InStock'}` as ItemAvailability,
						},
		}),
	}
}

/**
 * Łączy kilka encji w jeden graf.
 *
 * Jeden `<script>` z grafem jest dla Google czytelniejszy niż kilka osobnych —
 * relacje przez `@id` rozwiązują się wtedy w obrębie jednego dokumentu.
 */
export function jsonLdGraph(...entities: JsonLdEntity[]): JsonLdGraph {
	return {
		'@context': 'https://schema.org',
		'@graph': entities.map(entity => {
			const { '@context': _context, ...rest } = entity as Record<string, unknown>
			return rest
		}),
	}
}
