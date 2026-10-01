import type { ProjectText } from '@/data/projects'

/**
 * Opisy realizacji po angielsku, kluczowane slugiem realizacji. Komplet slugów
 * pilnuje `data/localized.test.ts`.
 */
export const projectsEn: Record<string, ProjectText> = {
	'wroclaw-50m2': {
		cityName: 'Wrocław',
		title: 'Insulated attic',
		screed: 'Cement',
		intro: 'An insulated attic under a sloping roof, several rooms. The owners wanted a warm floor across the whole storey before laying panels.',
		story: [
			'The attic screed was already finished. Breaking it up would have meant rubble carried down the stairs and waiting for a new screed.',
			'We marked out the loops with a laser, milled channels in every room, laid the pipes and filled them with compound.',
			'Two days of work and the whole attic has underfloor heating. Once the compound dries, the panels can go down.',
		],
	},
	'lodz-60m2': {
		cityName: 'Łódź',
		title: 'House, four rooms',
		screed: 'Cement',
		intro: 'The ground floor of a family home, four rooms. The radiators took up space under the windows, and the owners wanted even warmth throughout the house.',
		story: [
			'The cement screed had been down for years and was in good condition. It seemed a waste to rip it up just to fit the pipes.',
			'We milled loops in all four rooms, laid pipes from the manifold and filled the channels with compound.',
			'One day of work and the house is heated from the floor. The radiators can come off the walls.',
		],
	},
	'krakow-90m2': {
		cityName: 'Kraków',
		title: 'Living room with large windows',
		screed: 'Cement',
		intro: 'An open-plan space with a full-height glass wall. With windows like that there was nowhere to put a radiator, and the floor by the glass cooled down fastest.',
		story: [
			'Large glazing and a living room open to the kitchen. Screed done, windows fitted, finishing work about to start.',
			'We planned denser loops by the windows, milled channels across the whole open space and laid the pipes.',
			'Heat spreads evenly, even by the glass. The living room doesn’t need a single radiator.',
		],
	},
	'kielce-50m2': {
		cityName: 'Kielce',
		title: 'New house',
		screed: 'Cement',
		intro: 'A new house, three rooms and a manifold in the hallway. The screed had already been poured when the owners decided on underfloor heating.',
		story: [
			'The decision on underfloor heating came after the floor was poured. A new screed would have meant more weeks of drying.',
			'We ran the loops from the manifold to the three rooms, milled the channels and laid the pipes in single runs.',
			'In one day the house got underfloor heating, and the build schedule only moved by the drying time of the compound.',
		],
	},
	'rzeszow-60m2': {
		cityName: 'Rzeszów',
		title: 'New apartment',
		screed: 'Cement',
		intro: 'A new apartment with a developer finish. The owners wanted underfloor heating before laying floors, but without raising the level at the door.',
		story: [
			'A developer apartment with a finished screed and the front door already in place. A thicker floor was out of the question.',
			'We milled channels into the existing screed, laid pipes in every room and filled them with compound.',
			'The floor level stayed the same, and the apartment is heated from below. Panels and tiles can go down.',
		],
	},
	'torun-60m2': {
		cityName: 'Toruń',
		title: 'Apartment in a high-rise',
		screed: 'Cement',
		intro: 'An apartment on a high floor of a block. In a high-rise there’s no room for a thicker screed, and every bag of rubble has to go down in the lift.',
		story: [
			'A prefabricated block and a screed that couldn’t grow by a single centimetre. Breaking up a floor in a high-rise means noise for the whole riser.',
			'We milled with an industrial vacuum, room by room, then laid the pipes and filled the channels.',
			'No rubble on the staircase and no dust at the neighbours’. After one day the apartment has underfloor heating.',
		],
	},
	'katowice-70m2': {
		cityName: 'Katowice',
		title: 'Attic, 8 loops',
		screed: 'Cement',
		intro: 'A finished attic with a manifold for eight loops. Every room got its own circuit, so it can be heated separately.',
		story: [
			'The attic was already insulated and plastered. Breaking up the floor would have ruined the freshly finished walls.',
			'We planned eight loops from one manifold, milled the channels and laid the pipes with no joints under the floor.',
			'Every room has its own circuit and its own temperature, and the walls were left untouched.',
		],
	},
	'opole-80m2': {
		cityName: 'Opole',
		title: 'House with a large living room',
		screed: 'Cement',
		intro: 'A new house with a large living room on the ground floor. The owners chose a heat pump, so underfloor heating was the natural choice.',
		story: [
			'A heat pump runs best at a low flow temperature, and that takes a large heating surface.',
			'We milled loops in the living room and the other ground-floor rooms, laid the pipes and filled the channels.',
			'The whole ground floor is heated by the floor, and the heat pump runs at a low temperature — the cheapest way.',
		],
	},
	'kalisz-60m2': {
		cityName: 'Kalisz',
		title: 'House with balcony doors',
		screed: 'Cement',
		intro: 'A house with large balcony doors. With floor-length glazing a radiator would have blocked the way out, so the heat had to come from below.',
		story: [
			'The balcony doors took up the whole wall, and the screed was finished. There was nowhere to hang a radiator.',
			'We milled channels with denser loops along the glazing, laid the pipes and filled them with compound.',
			'The way onto the balcony stayed clear, and it’s as warm by the doors as in the middle of the room.',
		],
	},
	'lublin-45m2': {
		cityName: 'Lublin',
		title: 'Attic under renovation',
		screed: 'Cement',
		intro: 'An attic under renovation with plasterboard walls. Underfloor heating went in before it was time for the floors.',
		story: [
			'The attic renovation was under way and the wall boards were already up. A new screed would have meant moisture and waiting.',
			'We milled channels into the existing floor, laid the pipes and filled them in without touching the fresh walls.',
			'One day, and the renovation could carry on. The attic is heated from the floor.',
		],
	},
	'gdansk-90m2': {
		cityName: 'Gdańsk',
		title: 'House renovation with a terrace',
		screed: 'Cement',
		intro: 'A house renovation with an open-plan living area and doors onto the terrace. The old radiators came off, and the heat was to come from the floor.',
		story: [
			'A house that had run on radiators for years. The screed was in good condition, so there was no reason to break it up.',
			'We milled channels across the whole open space, laid the pipes and filled them with compound.',
			'The living area heats evenly, and the walls are free of radiators.',
		],
	},
	'warszawa-50m2': {
		cityName: 'Warsaw',
		title: 'Attic under a sloping roof',
		screed: 'Cement',
		intro: 'An attic under a sloping roof with two manifolds. The low knee walls left no room for radiators.',
		story: [
			'Under a slope every centimetre of height counts, and a radiator under a low wall mostly heats the roof.',
			'We planned the loops from two manifolds, milled the channels and laid the pipes throughout the attic.',
			'The attic is heated from the floor, and there’s room for furniture under the slopes.',
		],
	},
}
