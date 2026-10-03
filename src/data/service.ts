/**
 * Treść usługi — wspólna dla strony usługi, stron miast i strony głównej.
 * Źródło: docs/teksty.md (wersja z 29.09.2026) i projekt w Paperze.
 *
 * Kroki opisują to, co firma faktycznie robi — próby ciśnienia klient nie
 * robi (29.09.2026), więc nie ma jej na liście. „Rura w jednym kawałku" jest
 * nadal do potwierdzenia (docs/teksty.md, „Nadal do potwierdzenia").
 *
 * Wersja angielska: `data/en/service.ts`. Typ `ServiceContent` pilnuje, żeby
 * obie miały komplet pól.
 */

import { serviceContentEn } from '@/data/en/service'
import type { Locale } from '@/site.config'

/** Adres strony usługi — z frazą główną (docs/seo.md). */
export const SERVICE_PATH = '/frezowanie-pod-ogrzewanie-podlogowe'

export interface ServiceContent {
	steps: { title: string; description: string }[]
	/** „Nadaje się" — wiersz z dopiskiem mono z prawej. */
	suitableFor: { label: string; note: string }[]
	/** „Nie nadaje się" — warunek techniczny potwierdzony przez klienta 29.09.2026. */
	notSuitableFor: string[]
	/** Co wpływa na cenę — bez stawek (docs/zakres.md). Jednostka jako ozdobny znak. */
	priceFactors: { unit: string; title: string; description: string }[]
	/**
	 * FAQ usługi — pytania z analizy fraz (docs/seo.md) ORAZ z tego, co ludzie
	 * faktycznie pytają w sieci (przegląd forów i poradników, 3.10.2026): czy
	 * frezowanie nie osłabi wylewki, ile to kosztuje za m², czy podłogówka
	 * wystarczy jako jedyne ogrzewanie. Trafiają też do JSON-LD `FAQPage`, więc
	 * odpowiedź ma być pełnym zdaniem, a nie odesłaniem do formularza.
	 *
	 * Pierwsze TRZY pozycje dociąga każda strona miasta (`faq.slice(0, 3)`), więc
	 * na początku stoją pytania uniwersalne, nie powiązane z typem budynku.
	 */
	faq: { question: string; answer: string }[]
	/** Liczby od klienta (docs/dane-firmy.md, 29.09.2026). */
	stats: { value: string; label: string }[]
}

const serviceContentPl: ServiceContent = {
	steps: [
		{
			title: 'Rozplanowanie pętli',
			description:
				'Rozplanowujemy pętle od rozdzielacza do każdego pokoju, żeby ciepło rozkładało się równo.',
		},
		{
			title: 'Frezowanie wylewki',
			description:
				'Frezujemy posadzkę maszyną z odkurzaczem: rowek na grubość rury, bez kurzu w domu.',
		},
		{
			title: 'Układanie rury',
			description:
				'Rurę wciskamy w rowek w jednym kawałku, więc pod podłogą nie ma żadnego łączenia.',
		},
		{
			title: 'Zalewanie',
			description: 'Zalewamy rowki masą. Gdy wyschnie, możesz kłaść panele albo płytki.',
		},
	],
	suitableFor: [
		{ label: 'Wylewka cementowa i anhydrytowa', note: 'od 4 cm' },
		{ label: 'Zamiana grzejników na podłogówkę', note: 'remont' },
		{ label: 'Pod pompę ciepła', note: 'niska temp.' },
		{ label: 'Mieszkanie w bloku', note: 'bez podnoszenia' },
	],
	notSuitableFor: [
		'Wylewka cieńsza niż 4 cm albo bez izolacji pod spodem',
		'Podłoga drewniana na legarach',
	],
	priceFactors: [
		{
			unit: 'm²',
			title: 'Metraż',
			description: 'Im większa powierzchnia, tym niższa stawka za metr.',
		},
		{
			unit: 'cm',
			title: 'Rodzaj wylewki',
			description: 'Im twardsza i grubsza wylewka, tym dłużej trwa frezowanie.',
		},
		{
			unit: 'km',
			title: 'Dojazd',
			description: 'Liczymy go od naszej bazy w Małopolsce. Pracujemy w całej Polsce.',
		},
	],
	faq: [
		{
			question: 'Czy warto robić ogrzewanie podłogowe w starym domu?',
			answer:
				'Tak, to u nas najczęstszy przypadek. Nie podnosisz poziomu podłogi, nie wymieniasz drzwi i nie czekasz miesiąca na nową wylewkę. Warunek jest jeden: wylewka ma co najmniej 4 cm i leży na izolacji.',
		},
		{
			question: 'Czy frezowanie nie osłabi wylewki?',
			answer:
				'Rowek ma głębokość jednej rury, więc pod nim zostaje nienaruszona warstwa posadzki. Dlatego przy wycenie pytamy o grubość wylewki i o izolację pod spodem. Jeśli wylewka jest cieńsza niż 4 cm, spękana albo leży wprost na chudym betonie, mówimy wprost, że się nie nadaje, zamiast ryzykować pęknięcia.',
		},
		{
			question: 'Ile kosztuje frezowanie pod ogrzewanie podłogowe za m²?',
			answer:
				'Stawek nie podajemy na stronie, bo każda podłoga liczy się inaczej. Cena zależy od metrażu, twardości i grubości wylewki oraz dojazdu, a im większa powierzchnia, tym niższa stawka za metr. Podaj metraż i miejscowość, a oddzwonimy z ceną, do niczego się nie zobowiązując.',
		},
		{
			question: 'Czy da się zrobić ogrzewanie podłogowe w bloku?',
			answer:
				'Tak. W bloku nie ma miejsca na grubszą wylewkę, a frezowanie nie podnosi podłogi ani o centymetr. Pył od razu trafia do odkurzacza, więc nie ma go na klatce schodowej.',
		},
		{
			question: 'Co lepsze: podłogówka czy grzejniki?',
			answer:
				'Podłogówka grzeje całą powierzchnią, więc ciepło rozkłada się równo i wystarcza jej niższa temperatura wody. Grzejniki szybciej reagują na zmianę temperatury, ale zabierają miejsce pod oknami i grzeją głównie powietrze przy ścianie.',
		},
		{
			question: 'Czy frezowane ogrzewanie podłogowe wystarczy jako jedyne ogrzewanie?',
			answer:
				'W ocieplonym domu i w mieszkaniu w bloku zwykle tak, bo podłoga oddaje ciepło całą powierzchnią. W budynku bez ocieplenia ścian bezpieczniej zostawić grzejniki w najzimniejszych pomieszczeniach. Zapotrzebowanie domu na ciepło liczy instalator, a my przygotowujemy podłogę.',
		},
		{
			question: 'Ogrzewanie podłogowe: jakie ma wady i zalety?',
			answer:
				'Zalety: równe ciepło w całym pomieszczeniu, wolne ściany, niska temperatura zasilania, która obniża rachunki. Wady: wolniej reaguje na zmianę ustawień niż grzejnik, a pod dywanami i grubymi meblami grzeje słabiej.',
		},
		{
			question: 'Czy można zrobić podłogówkę z grzejnika?',
			answer:
				'Można podłączyć podłogówkę do instalacji, na której dziś pracują grzejniki, ale potrzebny jest rozdzielacz z mieszaniem, który obniży temperaturę wody. O podłączeniu najlepiej porozmawiać z instalatorem, a my przygotujemy podłogę.',
		},
		{
			question: 'Czy pompa ciepła i ogrzewanie podłogowe to dobre połączenie?',
			answer:
				'Tak, to najlepsze połączenie. Podłogówka grzeje dużą powierzchnią, więc wystarcza jej niska temperatura wody, a na niskiej temperaturze pompa ciepła pracuje najtaniej.',
		},
		{
			question: 'Modernizacja ogrzewania w starym domu: od czego zacząć?',
			answer:
				'Od sprawdzenia wylewki, bo od niej zależy, czy rowki da się wyfrezować bez skuwania. Jeśli ma co najmniej 4 cm i leży na izolacji, podłogówkę robimy w niej i nie ruszamy reszty domu. Źródło ciepła, na przykład pompę ciepła, dobiera się później.',
		},
		{
			question: 'Jakie podłogi można położyć na ogrzewaniu podłogowym?',
			answer:
				'Najlepiej przewodzą ciepło płytki i gres, dobrze pracują też panele winylowe i laminowane. Warunek jest jeden: producent musi dopuścić daną podłogę do ogrzewania podłogowego, bo inaczej traci się gwarancję. Grube dywany i meble bez nóżek zasłaniają podłogę, więc w tych miejscach grzeje ona słabiej.',
		},
		{
			question: 'Kiedy po frezowaniu mogę położyć panele?',
			answer:
				'Czekasz tylko na wyschnięcie masy, którą zalewamy rowki, a nie na schnięcie całej nowej wylewki. Dokładny czas zależy od masy i warunków w domu, podajemy go przy wycenie.',
		},
		{
			question: 'Czy mogę mieszkać w domu, kiedy frezujecie?',
			answer:
				'Tak i zwykle tak to wygląda. Frezarka pracuje z odkurzaczem przemysłowym, więc pył trafia do worka, a nie na meble i do szafek. Około 50 m² zamykamy w jeden dzień, więc hałas też nie trwa długo.',
		},
	],
	stats: [
		{ value: '1200+', label: 'Zleceń' },
		{ value: '15', label: 'tys. m² podłóg' },
		{ value: '0', label: 'Reklamacji' },
	],
}

/** Treść usługi w języku strony. */
export const serviceContent: Record<Locale, ServiceContent> = {
	pl: serviceContentPl,
	en: serviceContentEn,
}
