import type { Review } from '@/data/reviews'

/**
 * Opinie z Google przetłumaczone na angielski — ta sama kolejność i ci sami
 * autorzy co w `data/reviews.ts`. Sekcja opinii dopisuje pod nimi, że to
 * tłumaczenie z polskiego, żeby nie udawać, że klienci pisali po angielsku.
 */
export const reviewsEn: Review[] = [
	{
		author: 'Mariusz N.',
		text: 'They do it extremely professionally. Zero dust. They milled our attic and despite the open staircase on the ground floor we could carry on as normal: cooking, doing laundry, having guests over.',
	},
	{
		author: 'Sławomir W.',
		text: 'Great team, total professionalism, proper equipment, zero dust. I recommend them to everyone.',
	},
	{
		author: 'Artur P.',
		text: 'Quick, efficient and professional service, and great contact before the job. I recommend them wholeheartedly.',
	},
	{
		author: 'Katarzyna C.',
		text: 'A very professional and reliable company! They leave a good impression, a tidy site and good work behind them.',
	},
	{
		author: 'Justyna M.',
		text: 'Done on time and efficiently, great contact and a great price!',
	},
	{
		author: 'Marta K.',
		text: 'Most importantly: fast, efficient, with no dust at all. A 10/10 job.',
	},
	{ author: 'Bartek T.', text: 'Fast job. Real expertise. No dust. 100% recommended.' },
	{
		author: 'Bartłomiej G.',
		text: 'They are punctual and keep their word. They have huge experience in what they do and give good advice too.',
	},
	{
		author: 'Adrian K.',
		text: 'They did a perfect job: punctual, reliable and happy to give advice.',
	},
	{
		author: 'Kinga G.',
		text: 'Expert and friendly contact, a quick date, flawless work. Highly recommended!',
	},
	{
		author: 'Janusz L.',
		text: 'Great team, you can see the experience and professionalism. Fast, efficient and clean.',
	},
	{
		author: 'Piotr J.',
		text: 'The milling was done to plan, on the agreed date, with no problems at all.',
	},
	{
		author: 'K. Pająk',
		text: 'Very good contact, the service was done professionally and on time.',
	},
	{
		author: 'Lucjan S.',
		text: 'An efficient and professional team. I am very happy with the job.',
	},
	{
		author: 'Ewa R.',
		text: 'I am happy with the result of their work. Everything as promised.',
	},
]
