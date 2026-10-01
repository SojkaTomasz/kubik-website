/**
 * Opinie z wizytówki Google (docs/dane-firmy.md, stan z 28.09.2026), wszystkie
 * 5/5. Pisownia poprawiona tylko tam, gdzie to literówka; podpis imieniem
 * i inicjałem nazwiska, jak ustalono z klientem.
 */

export interface Review {
	author: string
	text: string
}

export const reviews: Review[] = [
	{
		author: 'Mariusz N.',
		text: 'Robią to niezwykle profesjonalnie. Zero kurzu. Frezowali poddasze i mimo otwartej klatki schodowej na parterze można było normalnie funkcjonować: gotować, prać, przyjmować gości.',
	},
	{
		author: 'Sławomir W.',
		text: 'Świetna ekipa, pełen profesjonalizm, konkretny sprzęt, zero kurzu. Polecam każdemu.',
	},
	{
		author: 'Artur P.',
		text: 'Szybko, sprawnie i profesjonalnie usługa wykonana, super kontakt z klientem przed wykonaniem. Polecam z całego serca.',
	},
	{
		author: 'Katarzyna C.',
		text: 'Bardzo profesjonalna i solidna firma! Zostawiają po sobie dobre wrażenie, porządek i dobrą robotę.',
	},
	{
		author: 'Justyna M.',
		text: 'Usługa wykonana terminowo, sprawnie, super kontakt oraz super cena!',
	},
	{
		author: 'Marta K.',
		text: 'Co najważniejsze: szybko, sprawnie, bez pyłu i kurzu. Praca wykonana 10/10.',
	},
	{ author: 'Bartek T.', text: 'Szybka realizacja. Fachowość. Bez kurzu. Polecam w 100%.' },
	{
		author: 'Bartłomiej G.',
		text: 'Panowie są terminowi i słowni. Mają ogromne doświadczenie w tym, co robią, i dodatkowo potrafią dobrze doradzić.',
	},
	{
		author: 'Adrian K.',
		text: 'Wykonali perfekcyjną robotę: terminowi, rzetelni, chętnie udzielali wskazówek.',
	},
	{
		author: 'Kinga G.',
		text: 'Fachowy i sympatyczny kontakt, szybki termin, wykonanie bez zastrzeżeń. Gorąco polecam!',
	},
	{
		author: 'Janusz L.',
		text: 'Super ekipa, widać doświadczenie i profesjonalizm. Szybko, sprawnie i czysto.',
	},
	{
		author: 'Piotr J.',
		text: 'Frezowanie wykonane zgodnie z planem, w umówionym terminie, żadnych problemów.',
	},
	{ author: 'K. Pająk', text: 'Kontakt bardzo dobry, usługa wykonana profesjonalnie i terminowo.' },
	{
		author: 'Lucjan S.',
		text: 'Sprawna i profesjonalna ekipa. Jestem bardzo zadowolony z realizacji.',
	},
	{
		author: 'Ewa R.',
		text: 'Jestem zadowolona z efektu ich pracy. Wszystko zgodnie z deklaracją.',
	},
]
