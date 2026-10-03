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
			title: 'Milling the screed',
			description:
				'We mill the floor with a vacuum-fed machine: a pipe-sized channel, with no dust in the house.',
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
			question: 'Is underfloor heating worth it in an old house?',
			answer:
				"Yes, it's our most common job. You don't raise the floor level, you don't replace doors and you don't wait a month for a new screed. There is one condition: the screed is at least 4 cm thick and laid on insulation.",
		},
		{
			question: 'Will milling weaken the screed?',
			answer:
				'The channel is as deep as a single pipe, so an untouched layer of screed stays underneath it. That is why we ask about the thickness of the screed and the insulation below when we quote. If the screed is thinner than 4 cm, cracked or laid straight onto lean concrete, we say plainly that it is not suitable rather than risk cracks.',
		},
		{
			question: 'How much does floor milling for underfloor heating cost per m²?',
			answer:
				'We do not publish rates, because every floor is priced differently. It depends on the area, the hardness and thickness of the screed and the travel, and the larger the area, the lower the rate per square metre. Send us the area and your town and we will call back with a price, with no obligation.',
		},
		{
			question: 'Can underfloor heating be fitted in a block of flats?',
			answer:
				"Yes. There's no room for a thicker screed in a block of flats, and milling doesn't raise the floor by even a centimetre. The dust goes straight into the vacuum, so none of it ends up on the staircase.",
		},
		{
			question: 'Which is better: underfloor heating or radiators?',
			answer:
				'Underfloor heating warms the whole surface, so the heat spreads evenly and a lower water temperature is enough. Radiators react faster to temperature changes, but they take up space under the windows and mostly heat the air by the wall.',
		},
		{
			question: 'Is milled underfloor heating enough on its own?',
			answer:
				'In an insulated house and in a flat it usually is, because the floor gives off heat across its whole surface. In a building with uninsulated walls it is safer to keep radiators in the coldest rooms. A heating engineer works out how much heat the house needs, and we prepare the floor.',
		},
		{
			question: 'Underfloor heating: what are the pros and cons?',
			answer:
				'Pros: even warmth across the whole room, free walls and a low flow temperature that cuts your bills. Cons: it reacts to setting changes more slowly than a radiator, and it heats less under rugs and heavy furniture.',
		},
		{
			question: 'Can underfloor heating run off a radiator system?',
			answer:
				'It can be connected to the system your radiators use today, but you need a manifold with a mixing valve to lower the water temperature. The connection is best discussed with a heating engineer, and we prepare the floor.',
		},
		{
			question: 'Are a heat pump and underfloor heating a good match?',
			answer:
				"Yes, it's the best combination. Underfloor heating warms a large surface, so a low water temperature is enough, and a heat pump runs cheapest at low temperatures.",
		},
		{
			question: 'Modernising the heating in an old house: where do you start?',
			answer:
				'With the screed, because it decides whether the channels can be milled without breaking anything up. If it is at least 4 cm thick and sits on insulation, the underfloor heating goes into it and the rest of the house stays untouched. The heat source, a heat pump for example, comes later.',
		},
		{
			question: 'Which floor coverings can go over underfloor heating?',
			answer:
				'Tiles and porcelain stoneware conduct heat best, and vinyl or laminate panels work well too. There is one condition: the manufacturer has to approve the covering for underfloor heating, otherwise you lose the warranty. Thick rugs and furniture without legs cover the floor, so it heats less in those spots.',
		},
		{
			question: 'When can I lay panels after milling?',
			answer:
				"You only wait for the compound in the channels to dry, not for a whole new screed. The exact time depends on the compound and conditions in the house; we'll tell you when we quote.",
		},
		{
			question: 'Can I stay at home while you mill?',
			answer:
				'Yes, and that is usually how it goes. The milling machine runs with an industrial vacuum, so the dust ends up in the bag rather than on your furniture and in your cupboards. We finish around 50 m² in a day, so the noise does not last long either.',
		},
	],
	stats: [
		{ value: '1200+', label: 'Jobs' },
		{ value: '15', label: 'thousand m² of floors' },
		{ value: '0', label: 'Complaints' },
	],
}
