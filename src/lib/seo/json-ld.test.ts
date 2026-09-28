import { describe, expect, it } from 'vitest'

import { companyConfig } from '@/company.config'
import {
	articleJsonLd,
	breadcrumbJsonLd,
	faqJsonLd,
	jsonLdGraph,
	jsonLdIds,
	localBusinessJsonLd,
	organizationJsonLd,
	personJsonLd,
	productJsonLd,
	serviceJsonLd,
	webPageJsonLd,
	websiteJsonLd,
} from '@/lib/seo/json-ld'

/**
 * Dane strukturalne psują się cicho.
 *
 * Google nie zgłasza błędu na stronie — po prostu ignoruje encję albo,
 * przy pustych kluczach, oznacza ją w Search Console jako nieprawidłową.
 * Dwie rzeczy pilnujemy tu najmocniej: stabilności `@id` (bez niej Google
 * widzi kilka firm zamiast jednej) i braku pustych pól.
 */

/** Rzutowanie do zwykłego obiektu — schema-dts typuje pola zbyt wąsko na asercje. */
function asRecord(value: unknown): Record<string, unknown> {
	return value as Record<string, unknown>
}

describe('stabilność identyfikatorów @id', () => {
	it('firma ma ten sam @id niezależnie od miejsca użycia', () => {
		// Gdyby @id zależało od podstrony, Google zobaczyłby tyle firm,
		// ile podstron — i rozproszył sygnały zamiast je sumować.
		expect(asRecord(organizationJsonLd())['@id']).toBe(jsonLdIds.organization)
		expect(asRecord(localBusinessJsonLd())['@id']).toBe(jsonLdIds.organization)
	})

	it('@id podstrony wywodzi się z jej adresu', () => {
		expect(asRecord(webPageJsonLd({ path: '/kontakt', name: 'Kontakt' }))['@id']).toBe(
			'https://example.com/kontakt#webpage'
		)
	})

	it('artykuł wskazuje na podstronę, na której leży', () => {
		const article = asRecord(
			articleJsonLd({ path: '/blog/wpis', headline: 'Wpis', datePublished: '2026-01-01' })
		)

		expect(article['mainEntityOfPage']).toEqual({ '@id': jsonLdIds.page('/blog/wpis') })
	})
})

describe('pomijanie pustych wartości', () => {
	it('nie emituje kluczy o wartości pustego stringa', () => {
		// companyConfig.legalName jest w starterze pustym stringiem.
		expect(companyConfig.legalName).toBe('')
		expect(asRecord(organizationJsonLd())).not.toHaveProperty('legalName')
	})

	it('nie emituje kluczy z pustą tablicą', () => {
		expect(companyConfig.socialProfiles).toEqual([])
		expect(asRecord(organizationJsonLd())).not.toHaveProperty('sameAs')
	})

	it('zachowuje wartości faktycznie podane', () => {
		const organization = asRecord(organizationJsonLd())

		expect(organization['name']).toBe(companyConfig.name)
		expect(organization['areaServed']).toEqual(['Polska'])
	})

	it('adres pocztowy zawiera wyłącznie wypełnione pola', () => {
		const address = asRecord(asRecord(organizationJsonLd())['address'])

		expect(address).toEqual({ '@type': 'PostalAddress', addressCountry: 'PL' })
	})
})

describe('powiązania między encjami', () => {
	it('serwis wskazuje firmę jako wydawcę', () => {
		expect(asRecord(websiteJsonLd())['publisher']).toEqual({ '@id': jsonLdIds.organization })
	})

	it('podstrona należy do serwisu i opisuje firmę', () => {
		const page = asRecord(webPageJsonLd({ path: '/', name: 'Start' }))

		expect(page['isPartOf']).toEqual({ '@id': jsonLdIds.website })
		expect(page['about']).toEqual({ '@id': jsonLdIds.organization })
	})

	it('usługa wskazuje firmę jako dostawcę', () => {
		expect(asRecord(serviceJsonLd({ name: 'Strony WWW' }))['provider']).toEqual({
			'@id': jsonLdIds.organization,
		})
	})

	it('artykuł bez podanego autora przypisuje autorstwo firmie', () => {
		const article = asRecord(
			articleJsonLd({ path: '/blog/a', headline: 'A', datePublished: '2026-01-01' })
		)

		expect(article['author']).toEqual({ '@id': jsonLdIds.organization })
	})

	it('artykuł z podanym autorem tworzy encję Person', () => {
		const article = asRecord(
			articleJsonLd({
				path: '/blog/a',
				headline: 'A',
				datePublished: '2026-01-01',
				authorName: 'Jan Kowalski',
			})
		)

		expect(article['author']).toEqual({ '@type': 'Person', name: 'Jan Kowalski' })
	})
})

describe('wyszukiwarka wewnętrzna', () => {
	it('nie deklaruje akcji wyszukiwania, gdy strona jej nie ma', () => {
		expect(asRecord(websiteJsonLd())).not.toHaveProperty('potentialAction')
	})

	it('deklaruje ją w formacie wymaganym przez Google', () => {
		const action = asRecord(
			asRecord(websiteJsonLd({ searchUrlTemplate: 'https://example.com/szukaj?q={q}' }))[
				'potentialAction'
			]
		)

		// Ta nazwa parametru to wymóg Google, nie nasza konwencja.
		expect(action['query-input']).toBe('required name=search_term_string')
	})
})

describe('okruszki nawigacyjne', () => {
	it('numeruje pozycje od jedynki', () => {
		const breadcrumb = asRecord(
			breadcrumbJsonLd([
				{ name: 'Start', path: '/' },
				{ name: 'Blog', path: '/blog' },
				{ name: 'Wpis', path: '/blog/wpis' },
			])
		)

		expect(breadcrumb['itemListElement']).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Start', item: 'https://example.com' },
			{ '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://example.com/blog' },
			{ '@type': 'ListItem', position: 3, name: 'Wpis', item: 'https://example.com/blog/wpis' },
		])
	})
})

describe('FAQ', () => {
	it('zamienia pary pytanie-odpowiedź na strukturę Question/Answer', () => {
		const faq = asRecord(faqJsonLd([{ question: 'Ile to trwa?', answer: 'Dwa tygodnie.' }]))

		expect(faq['mainEntity']).toEqual([
			{
				'@type': 'Question',
				name: 'Ile to trwa?',
				acceptedAnswer: { '@type': 'Answer', text: 'Dwa tygodnie.' },
			},
		])
	})
})

describe('produkt', () => {
	it('pomija ofertę, gdy nie podano ceny', () => {
		expect(asRecord(productJsonLd({ name: 'Pakiet' }))).not.toHaveProperty('offers')
	})

	it('buduje ofertę z ceną w PLN i dostępnością jako URL schema.org', () => {
		const offers = asRecord(asRecord(productJsonLd({ name: 'Pakiet', price: 1200 }))['offers'])

		expect(offers).toEqual({
			'@type': 'Offer',
			price: '1200',
			priceCurrency: 'PLN',
			availability: 'https://schema.org/InStock',
		})
	})
})

describe('osoba', () => {
	it('wiąże osobę z firmą', () => {
		expect(asRecord(personJsonLd({ name: 'Jan Kowalski' }))['worksFor']).toEqual({
			'@id': jsonLdIds.organization,
		})
	})
})

describe('graf encji', () => {
	it('łączy encje i usuwa powtórzony @context', () => {
		const graph = jsonLdGraph(organizationJsonLd(), websiteJsonLd())

		expect(graph['@context']).toBe('https://schema.org')
		expect(graph['@graph']).toHaveLength(2)

		for (const entity of graph['@graph']) {
			expect(entity).not.toHaveProperty('@context')
			expect(entity).toHaveProperty('@type')
		}
	})

	it('daje się zserializować do poprawnego JSON-a', () => {
		// To dokładnie ta operacja, którą wykonuje komponent <JsonLd>.
		const serialized = JSON.stringify(jsonLdGraph(organizationJsonLd(), websiteJsonLd()))

		expect(() => JSON.parse(serialized)).not.toThrow()
	})
})
