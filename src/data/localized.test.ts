import { describe, expect, it } from 'vitest'

import { cities, localizedCities } from '@/data/cities'
import { citiesEn } from '@/data/en/cities'
import { projectsEn } from '@/data/en/projects'
import { localizedProjects, projects } from '@/data/projects'
import { reviewsByLocale } from '@/data/reviews'
import { serviceContent } from '@/data/service'

/**
 * Treść stron w obu językach. Brak tłumaczenia nie wywraca strony — miasto
 * albo realizacja pokazują się wtedy po polsku na angielskiej wersji, czego
 * nikt nie zauważy, dopóki nie trafi tam anglojęzyczny klient.
 */

describe('tłumaczenia danych', () => {
	it('każde miasto ma wersję angielską i nic ponad listę', () => {
		expect(Object.keys(citiesEn).sort()).toEqual(cities.map(city => city.slug).sort())
	})

	it('każda realizacja ma wersję angielską i nic ponad listę', () => {
		expect(Object.keys(projectsEn).sort()).toEqual(projects.map(project => project.slug).sort())
	})

	it('wersja angielska podmienia treść, a zostawia slug i liczby', () => {
		const [pl] = localizedProjects('pl')
		const [en] = localizedProjects('en')

		expect(en?.slug).toBe(pl?.slug)
		expect(en?.area).toBe(pl?.area)
		expect(en?.photos).toBe(pl?.photos)
		expect(en?.title).not.toBe(pl?.title)
	})

	it('FAQ miast ma tyle samo pytań w obu językach', () => {
		const en = localizedCities('en')

		for (const [index, city] of localizedCities('pl').entries()) {
			expect(en[index]?.faq, city.slug).toHaveLength(city.faq.length)
		}
	})

	it('treść usługi ma te same długości list w obu językach', () => {
		for (const key of Object.keys(serviceContent.pl) as (keyof typeof serviceContent.pl)[]) {
			expect(serviceContent.en[key], key).toHaveLength(serviceContent.pl[key].length)
		}
	})

	it('opinie to te same osoby w tej samej kolejności', () => {
		expect(reviewsByLocale.en.map(review => review.author)).toEqual(
			reviewsByLocale.pl.map(review => review.author)
		)
	})
})
