import type { ServiceContent } from '@/data/service'

/**
 * Treść usługi po angielsku — ten sam kształt co wersja polska w
 * `data/service.ts`. Typ pilnuje, żeby niczego nie brakowało.
 */
export const serviceContentEn: ServiceContent = {
	steps: [
		{
			title: 'Planning the loops',
			description:
				'We plan the loops from the manifold to every room, so the heat spreads evenly.',
		},
		{
			title: 'Milling',
			description:
				'A milling machine with a vacuum cuts pipe-sized channels into the screed, with no dust in the house.',
		},
		{
			title: 'Laying the pipe',
			description:
				'We press the pipe into the channel in one piece, so there are no joints under the floor.',
		},
		{
			title: 'Filling',
			description:
				'We fill the channels with compound. Once it has dried, you can lay panels or tiles.',
		},
	],
	suitableFor: [
		{ label: 'Cement and anhydrite screed', note: 'from 4 cm' },
		{ label: 'Replacing radiators with underfloor heating', note: 'renovation' },
		{ label: 'For a heat pump', note: 'low temp.' },
		{ label: 'Apartment in a block of flats', note: 'no height gain' },
	],
	notSuitableFor: [
		'Screed thinner than 4 cm or without insulation underneath',
		'Wooden floor on joists',
	],
	priceFactors: [
		{
			unit: 'm²',
			title: 'Floor area',
			description: 'The larger the area, the lower the rate per square metre.',
		},
		{
			unit: 'cm',
			title: 'Screed type',
			description: 'The harder and thicker the screed, the longer the milling takes.',
		},
		{
			unit: 'km',
			title: 'Travel',
			description: 'Counted from our base in Lesser Poland. We work all over Poland.',
		},
	],
	faq: [
		{
			question: 'Underfloor heating in an old house: is it worth it?',
			answer:
				"Yes, it's the most common case. You don't raise the floor level, you don't replace doors and you don't wait a month for a new screed. The condition: the screed is at least 4 cm thick and laid on insulation.",
		},
		{
			question: 'Underfloor heating or radiators?',
			answer:
				'Underfloor heating warms the whole surface, so the heat spreads evenly and a lower water temperature is enough. Radiators react faster to temperature changes, but they take up space under the windows and mostly heat the air by the wall.',
		},
		{
			question: 'Can underfloor heating be fitted in a block of flats?',
			answer:
				"Yes. There's no room for a thicker screed in a block of flats, and milling doesn't raise the floor by even a centimetre. The dust goes straight into the vacuum, so none of it ends up on the staircase.",
		},
		{
			question: 'Underfloor heating: pros and cons?',
			answer:
				'Pros: even warmth across the whole room, free walls and a low flow temperature that cuts your bills. Cons: it reacts to setting changes more slowly than a radiator, and it heats less under rugs and heavy furniture.',
		},
		{
			question: 'Can underfloor heating run off a radiator system?',
			answer:
				'It can be connected to the system your radiators use today, but you need a manifold with a mixing valve to lower the water temperature. The connection is best discussed with a heating engineer — we prepare the floor.',
		},
		{
			question: 'Heat pump and underfloor heating: a good match?',
			answer:
				"Yes, it's the best combination. Underfloor heating warms a large surface, so a low water temperature is enough — and a heat pump runs cheapest at low temperatures.",
		},
		{
			question: 'How long before I can lay panels?',
			answer:
				"You only wait for the compound in the channels to dry, not for a whole new screed. The exact time depends on the compound and conditions in the house; we'll tell you when we quote.",
		},
	],
	stats: [
		{ value: '1200+', label: 'Jobs' },
		{ value: '15', label: 'thousand m² of floors' },
		{ value: '0', label: 'Complaints' },
	],
}
