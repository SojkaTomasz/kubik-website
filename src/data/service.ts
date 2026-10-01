/**
 * Treść usługi — wspólna dla strony usługi, stron miast i strony głównej.
 * Źródło: docs/teksty.md (wersja z 29.09.2026) i projekt w Paperze.
 *
 * Kroki opisują to, co firma faktycznie robi — próby ciśnienia klient nie
 * robi (29.09.2026), więc nie ma jej na liście. „Rura w jednym kawałku" jest
 * nadal do potwierdzenia (docs/teksty.md, „Nadal do potwierdzenia").
 */

/** Adres strony usługi — z frazą główną (docs/seo.md). */
export const SERVICE_PATH = '/frezowanie-pod-ogrzewanie-podlogowe'

export const serviceSteps = [
	{
		title: 'Rozplanowanie pętli',
		description:
			'Rozplanowujemy pętle od rozdzielacza do każdego pokoju, żeby ciepło rozkładało się równo.',
	},
	{
		title: 'Frezowanie',
		description:
			'Frezarka z odkurzaczem wycina w wylewce rowki na grubość rury, bez kurzu w domu.',
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
]

/** „Nadaje się" — wiersz z dopiskiem mono z prawej. */
export const suitableFor = [
	{ label: 'Wylewka cementowa i anhydrytowa', note: 'od 4 cm' },
	{ label: 'Zamiana grzejników na podłogówkę', note: 'remont' },
	{ label: 'Pod pompę ciepła', note: 'niska temp.' },
	{ label: 'Mieszkanie w bloku', note: 'bez podnoszenia' },
]

/** „Nie nadaje się" — warunek techniczny potwierdzony przez klienta 29.09.2026. */
export const notSuitableFor = [
	'Wylewka cieńsza niż 4 cm albo bez izolacji pod spodem',
	'Podłoga drewniana na legarach',
]

/** Co wpływa na cenę — bez stawek (docs/zakres.md). Jednostka jako ozdobny znak. */
export const priceFactors = [
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
]

/**
 * FAQ usługi — pytania z analizy fraz (docs/seo.md). Trafiają też do JSON-LD
 * `FAQPage`, więc odpowiedź ma być pełnym zdaniem, a nie odesłaniem do formularza.
 */
export const serviceFaq = [
	{
		question: 'Ogrzewanie podłogowe w starym domu: czy warto?',
		answer:
			'Tak, to najczęstszy przypadek. Nie podnosisz poziomu podłogi, nie wymieniasz drzwi i nie czekasz miesiąca na nową wylewkę. Warunek: wylewka ma co najmniej 4 cm i leży na izolacji.',
	},
	{
		question: 'Podłogówka czy grzejniki?',
		answer:
			'Podłogówka grzeje całą powierzchnią, więc ciepło rozkłada się równo i wystarcza jej niższa temperatura wody. Grzejniki szybciej reagują na zmianę temperatury, ale zabierają miejsce pod oknami i grzeją głównie powietrze przy ścianie.',
	},
	{
		question: 'Czy ogrzewanie podłogowe da się zrobić w bloku?',
		answer:
			'Tak. W bloku nie ma miejsca na grubszą wylewkę, a frezowanie nie podnosi podłogi ani o centymetr. Pył od razu trafia do odkurzacza, więc nie ma go na klatce schodowej.',
	},
	{
		question: 'Ogrzewanie podłogowe: wady i zalety?',
		answer:
			'Zalety: równe ciepło w całym pomieszczeniu, wolne ściany, niska temperatura zasilania, która obniża rachunki. Wady: wolniej reaguje na zmianę ustawień niż grzejnik, a pod dywanami i grubymi meblami grzeje słabiej.',
	},
	{
		question: 'Czy można zrobić podłogówkę z grzejnika?',
		answer:
			'Można podłączyć podłogówkę do instalacji, na której dziś pracują grzejniki, ale potrzebny jest rozdzielacz z mieszaniem, który obniży temperaturę wody. O podłączeniu najlepiej porozmawiać z instalatorem, a my przygotujemy podłogę.',
	},
	{
		question: 'Pompa ciepła i ogrzewanie podłogowe: czy to pasuje?',
		answer:
			'Tak, to najlepsze połączenie. Podłogówka grzeje dużą powierzchnią, więc wystarcza jej niska temperatura wody, a na niskiej temperaturze pompa ciepła pracuje najtaniej.',
	},
	{
		question: 'Ile trwa, zanim położę panele?',
		answer:
			'Czekasz tylko na wyschnięcie masy, którą zalewamy rowki, a nie na schnięcie całej nowej wylewki. Dokładny czas zależy od masy i warunków w domu, podajemy go przy wycenie.',
	},
]

/** Liczby od klienta (docs/dane-firmy.md, 29.09.2026). */
export const companyStats = [
	{ value: '1200+', label: 'Zleceń' },
	{ value: '15', label: 'tys. m² podłóg' },
	{ value: '0', label: 'Reklamacji' },
]
