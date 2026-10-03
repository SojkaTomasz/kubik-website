import type { CityText } from '@/data/cities'

/**
 * Treść stron miast po angielsku, kluczowana slugiem miasta. Komplet slugów
 * pilnuje `data/localized.test.ts` — brakujące miasto pokazałoby się po
 * polsku na angielskiej stronie.
 *
 * Nazwy miast: angielska forma tam, gdzie jest w powszechnym użyciu
 * (Warsaw), w pozostałych polska pisownia z diakrytykami — tak piszą je
 * anglojęzyczne media. Okoliczne miejscowości zostają w `data/cities.ts`.
 */
export const citiesEn: Record<string, CityText> = {
	warszawa: {
		name: 'Warsaw',
		inCity: 'in Warsaw',
		region: 'Masovia',
		description:
			'Floor milling for underfloor heating in Warsaw: apartments and houses around the city, without breaking up the screed. Free quote.',
		lead: 'In Warsaw we mostly mill new apartments straight from the developer, before the owners lay their floors. We work in the screed that is already there, so you don’t wait weeks for a new one.',
		localTitle: 'Developer-finish apartments and houses around Warsaw.',
		localBody:
			'Bought an apartment with a finished screed and radiators, but want underfloor heating? No need to rip up the floor. We mill the channels, lay the pipes and connect them to the manifold. In houses around Warsaw we often do this when switching from a boiler to a heat pump.',
		travel: 'approx. 5 h',
		screed: 'cement and anhydrite, 5–6 cm',
		faq: [
			{
				question: 'Can underfloor heating be fitted in a new developer apartment?',
				answer:
					'Yes, it’s one of the most common cases. We mill into the developer’s screed, so the floor level at the door doesn’t change. It’s best done before panels and tiles go down.',
			},
			{
				question: 'Does the housing association have to agree?',
				answer:
					'Usually not, because we don’t touch shared installations or the floor slab. We only mill the top layer of the screed inside your apartment. If you are connecting to district heating, check the rules with the building manager.',
			},
		],
	},
	krakow: {
		name: 'Kraków',
		inCity: 'in Kraków',
		region: 'Lesser Poland',
		description:
			'Floor milling for underfloor heating in Kraków: blocks of flats, tenement houses and family homes, without raising the floor. Free quote.',
		lead: 'In Kraków we mostly fit underfloor heating in blocks of flats and tenement houses, where every centimetre of height counts. We mill into the existing screed, so the floor doesn’t rise.',
		localTitle: 'Mostly apartments in blocks, tenement houses and homes outside the city.',
		localBody:
			'In a block of flats or a tenement there’s no room for a new, thicker screed, and milling doesn’t raise the floor by even a centimetre. Outside Kraków we work on houses switching from a boiler to a heat pump.',
		travel: 'approx. 1.5 h',
		screed: 'cement, 5–7 cm',
		faq: [
			{
				question: 'Will underfloor heating fit in a tenement house?',
				answer:
					'Yes, if the tenement has a screed at least 4 cm thick with insulation underneath. We mill channels for the pipes into it, so we add no extra layer and don’t raise the floor.',
			},
			{
				question: 'Does milling in a block of flats disturb the neighbours?',
				answer:
					'The milling machine is loud, but not for long: we finish 50 m² in one day. The dust goes straight into the vacuum, so none of it ends up on the staircase.',
			},
		],
	},
	wroclaw: {
		name: 'Wrocław',
		inCity: 'in Wrocław',
		region: 'Lower Silesia',
		description:
			'Floor milling for underfloor heating in Wrocław: attics, houses and apartments, without breaking up the floor. Free quote.',
		lead: 'In and around Wrocław we often mill attics converted into rooms. We lay the pipes in the screed that is already there, so no rubble gets carried down the stairs.',
		localTitle: 'Attics, suburban houses and apartments on new estates.',
		localBody:
			'In an attic every bag of rubble has to be carried downstairs, and a new screed loads the ceiling below. Milling avoids both problems. In houses around Wrocław we fit underfloor heating while the heating is being upgraded, before the floors go in.',
		travel: 'approx. 4.5 h',
		screed: 'cement, 5–7 cm',
		faq: [
			{
				question: 'Can an attic get underfloor heating without a new screed?',
				answer:
					'Yes, if the existing screed is at least 4 cm thick with insulation underneath. We mill channels into it, so the ceiling below doesn’t carry the extra weight of a new layer.',
			},
			{
				question: 'How long does underfloor heating in an attic take?',
				answer:
					'We do about 50 m² in one day. Larger attics with many rooms usually take two days. Once the compound has dried, the floors can go down.',
			},
		],
	},
	lodz: {
		name: 'Łódź',
		inCity: 'in Łódź',
		region: 'Łódź Province',
		description:
			'Floor milling for underfloor heating in Łódź: houses, apartments and lofts, without breaking up the screed. Free quote.',
		lead: 'In Łódź we fit underfloor heating in family homes and renovated apartments. The radiators come off the walls and the screed stays where it is.',
		localTitle: 'Family homes and apartments where the radiators are meant to go.',
		localBody:
			'Most people who come to us are tired of radiators under the windows and want even warmth throughout the house. That doesn’t need a new screed. We mill channels into the existing one and lay the pipes in them.',
		travel: 'approx. 4.5 h',
		screed: 'cement, 5–6 cm',
		faq: [
			{
				question: 'Can I swap radiators for underfloor heating in an old house?',
				answer:
					'Yes, if the screed is at least 4 cm thick and laid on insulation. We mill channels into it, lay the pipes and connect them to the manifold. The radiators can come off afterwards.',
			},
			{
				question: 'What about doors and thresholds after milling?',
				answer:
					'Nothing changes. Milling adds no layer, so the floor level stays the same and the doors don’t need trimming.',
			},
		],
	},
	katowice: {
		name: 'Katowice',
		inCity: 'in Katowice',
		region: 'Silesia',
		description:
			'Floor milling for underfloor heating in Katowice and Silesia: houses, attics and apartments, without demolition. Free quote.',
		lead: 'In Silesia we often mill in houses switching from a coal boiler to a heat pump. Underfloor heating in the existing screed is the simplest route to a low flow temperature.',
		localTitle: 'Houses after a boiler replacement and attics in Silesian homes.',
		localBody:
			'A heat pump works best with underfloor heating. In older Silesian houses the screed is usually thick enough to mill channels into it without breaking it up or raising the floor.',
		travel: 'approx. 2.5 h',
		screed: 'cement, 5–8 cm',
		faq: [
			{
				question: 'Does underfloor heating suit a heat pump after a boiler replacement?',
				answer:
					'Yes, it’s a good match. Underfloor heating warms a large surface, so a low water temperature is enough, and a heat pump runs cheapest at low temperatures.',
			},
			{
				question: 'Can an old, hard screed be milled?',
				answer:
					'Yes. A hard, thick screed makes milling take longer, but it isn’t an obstacle. It does affect the price, which is why we ask about it when quoting.',
			},
		],
	},
	rzeszow: {
		name: 'Rzeszów',
		inCity: 'in Rzeszów',
		region: 'Subcarpathia',
		description:
			'Floor milling for underfloor heating in Rzeszów: new apartments and houses, without raising the floor. Free quote.',
		lead: 'In Rzeszów we mostly fit underfloor heating in new apartments, before the owners lay their floors. We mill into the developer’s screed, so the level at the door stays the same.',
		localTitle: 'New apartments on estates and houses around Rzeszów.',
		localBody:
			'In a developer apartment you can’t add a thick layer for the pipes, because the front door is already in place. Milling solves this in one day. Outside the city we work on houses under construction and after renovation.',
		travel: 'approx. 2.5 h',
		screed: 'cement, 5–6 cm',
		faq: [
			{
				question: 'When is the best time to mill in a new apartment?',
				answer:
					'After the screed has been poured and has dried, and before panels and tiles go down. Then nothing needs ripping up or protecting.',
			},
			{
				question: 'Is there a long wait for the floors after milling?',
				answer:
					'You only wait for the compound in the channels to dry, not the whole screed. That’s much shorter than pouring a new floor.',
			},
		],
	},
	kielce: {
		name: 'Kielce',
		inCity: 'in Kielce',
		region: 'Świętokrzyskie',
		description:
			'Floor milling for underfloor heating in Kielce: new houses and renovations, without breaking up the floor. Free quote.',
		lead: 'In and around Kielce we mostly mill new houses where the decision on underfloor heating came after the screed was poured. There’s no need to pour it a second time.',
		localTitle: 'New houses where the floor was ready before the decision on underfloor heating.',
		localBody:
			'The screed has dried and only now have you decided on underfloor heating? It happens a lot. We mill channels from the manifold to every room and lay the pipes, and the build only moves by the drying time of the compound.',
		travel: 'approx. 3 h',
		screed: 'cement, 5–7 cm',
		faq: [
			{
				question: 'Can I decide on underfloor heating after the screed is poured?',
				answer:
					'Yes, that’s exactly what milling is for. We cut channels into the finished screed, so there’s no need to rip it up or pour it again.',
			},
			{
				question: 'Where should the manifold go?',
				answer:
					'Ideally somewhere the loops can reach every room without long runs, usually a hallway. We help plan this before milling.',
			},
		],
	},
	opole: {
		name: 'Opole',
		inCity: 'in Opole',
		region: 'Opole Province',
		description:
			'Floor milling for underfloor heating in Opole: houses with heat pumps and large living rooms, without demolition. Free quote.',
		lead: 'In Opole we often fit underfloor heating in new houses with heat pumps. We mill into the finished screed, so it doesn’t need pouring again.',
		localTitle: 'Houses with heat pumps and large living rooms with glazing.',
		localBody:
			'A heat pump needs a large heating surface, and a big living room with floor-to-ceiling windows has no room for radiators. Underfloor heating in the existing screed solves both problems at once.',
		travel: 'approx. 3.5 h',
		screed: 'cement and anhydrite, 5–7 cm',
		faq: [
			{
				question: 'Can an anhydrite screed be milled?',
				answer:
					'Yes, we mill both cement and anhydrite screeds. What matters is that it’s at least 4 cm thick with insulation underneath.',
			},
			{
				question: 'Is underfloor heating enough with large windows?',
				answer:
					'Yes. Along the glazing we lay the loops closer together, to give off more heat where the house loses the most.',
			},
		],
	},
	torun: {
		name: 'Toruń',
		inCity: 'in Toruń',
		region: 'Kuyavia-Pomerania',
		description:
			'Floor milling for underfloor heating in Toruń: apartments in blocks and high-rises, no demolition and no dust. Free quote.',
		lead: 'In Toruń we fit underfloor heating in apartments in blocks and high-rises. We mill with a vacuum, so no dust reaches the staircase or the neighbours.',
		localTitle: 'Apartments in blocks and high-rises with no room for a thicker floor.',
		localBody:
			'In a prefabricated block the floor can’t get any higher, and every bag of rubble has to go down in the lift. Milling doesn’t raise the floor or leave rubble, and the dust goes straight into an industrial vacuum.',
		travel: 'approx. 6 h',
		screed: 'cement, 4–6 cm',
		faq: [
			{
				question: 'Can a prefabricated block of flats have underfloor heating?',
				answer:
					'Usually yes, if the screed is at least 4 cm thick with insulation underneath. We check this when quoting, and if in doubt we look at the floor on site.',
			},
			{
				question: 'What about dust on the staircase?',
				answer:
					'The milling machine is connected to an industrial vacuum, so dust doesn’t spread through the apartment or the staircase. We don’t carry out rubble either, because there isn’t any.',
			},
		],
	},
	kalisz: {
		name: 'Kalisz',
		inCity: 'in Kalisz',
		region: 'Greater Poland',
		description:
			'Floor milling for underfloor heating in Kalisz: family homes and renovations, without breaking up the screed. Free quote.',
		lead: 'In and around Kalisz we fit underfloor heating in family homes, often where large balcony doors leave no room for a radiator.',
		localTitle: 'Family homes with large glazing and doors onto the terrace.',
		localBody:
			'With floor-length balcony doors a radiator either blocks the way out or doesn’t fit at all. Underfloor heating warms from below, and along the glazing we lay the loops closer together so it isn’t colder there.',
		travel: 'approx. 5 h',
		screed: 'cement, 5–7 cm',
		faq: [
			{
				question: 'Won’t it be cold by the balcony doors?',
				answer:
					'Along the glazing we lay the loops closer together. The floor gives off more heat there, so it’s as warm by the doors as in the middle of the room.',
			},
			{
				question: 'Can I heat only part of the house with underfloor heating?',
				answer:
					'Yes. You can have underfloor heating in selected rooms only and keep radiators in the rest. We settle this when planning the loops.',
			},
		],
	},
	gdansk: {
		name: 'Gdańsk',
		inCity: 'in Gdańsk',
		region: 'Pomerania',
		description:
			'Floor milling for underfloor heating in Gdańsk and the Tri-City: house and apartment renovations, without demolition. Free quote.',
		lead: 'In Gdańsk and across the Tri-City we mill during house and apartment renovations. The old radiators go, and the screed stays where it is.',
		localTitle: 'House and apartment renovations in the Tri-City.',
		localBody:
			'In a renovation, breaking up the floor is the dirtiest and longest stage. Milling skips it: in one day we cut the channels, lay the pipes and fill them with compound, and the renovation carries on.',
		travel: 'approx. 8 h',
		screed: 'cement, 5–7 cm',
		faq: [
			{
				question: 'Will you travel from Lesser Poland to the Tri-City?',
				answer:
					'Yes, we work all over Poland. Travel is included in the price, which is why for distant cities we combine several jobs in one trip.',
			},
			{
				question: 'At what stage of a renovation should milling happen?',
				answer:
					'After the old floors come up and before the new ones go down. The walls can already be finished, because milling doesn’t cover them in dust.',
			},
		],
	},
	lublin: {
		name: 'Lublin',
		inCity: 'in Lublin',
		region: 'Lublin Province',
		description:
			'Floor milling for underfloor heating in Lublin: attics and houses under renovation, without breaking up the floor. Free quote.',
		lead: 'In Lublin we often mill attics during a renovation. We work in the existing floor, so no moisture from a fresh screed gets into finished walls.',
		localTitle: 'Attics under renovation and houses where the walls are already done.',
		localBody:
			'A new screed means water soaking into fresh plasterboard and weeks of drying. Milling only needs the narrow channels filled, so the renovation can carry on almost straight away.',
		travel: 'approx. 4.5 h',
		screed: 'cement, 4–6 cm',
		faq: [
			{
				question: 'Will milling damage finished walls?',
				answer:
					'No. The milling machine works with a vacuum, so dust doesn’t settle on the walls, and the compound in the channels doesn’t make rooms damp the way a new screed does.',
			},
			{
				question: 'How long does milling an attic take?',
				answer:
					'We usually do an attic of up to 50 m² in one day. Once the compound in the channels has dried, the floors can go down.',
			},
		],
	},
}
