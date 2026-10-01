/**
 * Strony miast — `/frezowanie-pod-ogrzewanie-podlogowe/<slug>`.
 *
 * Każde miasto ma treść pisaną osobno (docs/seo.md: „nie kopiujemy treści
 * usługi 1:1"), a nie szablon z podmienioną nazwą — Google traktuje takie strony
 * jak duplikaty. Wzorem jest Kraków z docs/teksty.md.
 *
 * ⚠️ DO POTWIERDZENIA Z KLIENTEM: lista 12 miast (docs/zakres.md), czasy
 * dojazdu (szacunki od bazy w Małopolsce), typowe wylewki i miejscowości
 * w okolicy. O bazie mówimy „Małopolska" — klient nie promuje swojej
 * miejscowości.
 *
 * Wersja angielska: `data/en/cities.ts`, kluczowana slugiem. Widoki biorą
 * miasta przez `localizedCities` / `findCity` z językiem strony.
 */

import { citiesEn } from '@/data/en/cities'
import { SERVICE_PATH } from '@/data/service'
import type { Locale } from '@/site.config'

export interface CityFaq {
	question: string
	answer: string
}

export interface City {
	slug: string
	/** Mianownik — „Kraków". */
	name: string
	/** Z przyimkiem i w miejscowniku — „w Krakowie", „we Wrocławiu". */
	inCity: string
	region: string
	/** Opis do `<meta name="description">` — poniżej 160 znaków. */
	description: string
	lead: string
	localTitle: string
	localBody: string
	travel: string
	screed: string
	nearby: string[]
	faq: CityFaq[]
}

/** Pola tłumaczone — slug i okoliczne miejscowości są wspólne dla języków. */
export type CityText = Omit<City, 'slug' | 'nearby'>

export const cities: City[] = [
	{
		slug: 'warszawa',
		name: 'Warszawa',
		inCity: 'w Warszawie',
		region: 'mazowieckie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Warszawie: mieszkania, apartamenty i domy pod miastem, bez skuwania wylewki. Darmowa wycena.',
		lead: 'W Warszawie najczęściej frezujemy nowe mieszkania od dewelopera, zanim właściciele położą podłogi. Robimy to w wylewce, która już jest, więc nie czekasz tygodniami na nową.',
		localTitle: 'Mieszkania w stanie deweloperskim i domy pod Warszawą.',
		localBody:
			'Kupujesz mieszkanie z gotową wylewką i grzejnikami, a chcesz podłogówkę? Nie musisz zrywać posadzki. Wyfrezujemy rowki, ułożymy rury i podłączymy je do rozdzielacza. W domach pod Warszawą często robimy to przy przejściu z kotła na pompę ciepła.',
		travel: 'ok. 5 h',
		screed: 'cementowa i anhydrytowa, 5–6 cm',
		nearby: ['Piaseczno', 'Pruszków', 'Legionowo'],
		faq: [
			{
				question: 'Czy da się zrobić podłogówkę w mieszkaniu od dewelopera?',
				answer:
					'Tak, to jeden z najczęstszych przypadków. Frezujemy w wylewce dewelopera, więc poziom podłogi przy drzwiach się nie zmienia. Warto zrobić to przed układaniem paneli i płytek.',
			},
			{
				question: 'Czy wspólnota musi się zgodzić?',
				answer:
					'Zwykle nie, bo nie ruszamy instalacji wspólnych ani konstrukcji stropu. Frezujemy tylko wierzchnią warstwę wylewki w Twoim lokalu. Przy podłączeniu do ogrzewania miejskiego zapytaj administratora o zasady.',
			},
		],
	},
	{
		slug: 'krakow',
		name: 'Kraków',
		inCity: 'w Krakowie',
		region: 'małopolskie',
		description:
			'Frezowanie pod podłogówkę w Krakowie: w blokach, kamienicach i domach, bez podnoszenia podłogi. Darmowa wycena.',
		lead: 'W Krakowie najczęściej robimy podłogówkę w blokach i kamienicach, gdzie liczy się każdy centymetr wysokości. Frezujemy w obecnej wylewce, więc podłoga się nie podnosi.',
		localTitle: 'Najczęściej frezujemy tu mieszkania w blokach, kamienice i domy pod miastem.',
		localBody:
			'W bloku czy kamienicy nie ma miejsca na nową, grubszą wylewkę, a frezowanie nie podnosi podłogi nawet o centymetr. Pod Krakowem robimy domy, które przechodzą z pieca na pompę ciepła.',
		travel: 'ok. 1,5 h',
		screed: 'cementowa, 5–7 cm',
		nearby: ['Wieliczka', 'Skawina', 'Niepołomice'],
		faq: [
			{
				question: 'Czy podłogówka zmieści się w kamienicy?',
				answer:
					'Tak, jeśli w kamienicy jest wylewka grubości co najmniej 4 cm z izolacją pod spodem. Frezujemy w niej rowki na rury, więc nie dokładamy żadnej warstwy i nie podnosimy podłogi.',
			},
			{
				question: 'Czy frezowanie w bloku przeszkadza sąsiadom?',
				answer:
					'Frezarka pracuje głośno, ale krótko: 50 m² zamykamy w jeden dzień. Pył od razu trafia do odkurzacza, więc nie ma go na klatce schodowej.',
			},
		],
	},
	{
		slug: 'wroclaw',
		name: 'Wrocław',
		inCity: 'we Wrocławiu',
		region: 'dolnośląskie',
		description:
			'Frezowanie pod ogrzewanie podłogowe we Wrocławiu: poddasza, domy i mieszkania, bez skuwania posadzki. Darmowa wycena.',
		lead: 'We Wrocławiu i okolicach często frezujemy poddasza adaptowane na pokoje. Rury układamy w wylewce, która już jest, więc nie znosimy gruzu po schodach.',
		localTitle: 'Poddasza, domy na przedmieściach i mieszkania w nowych osiedlach.',
		localBody:
			'Na poddaszu każdy worek gruzu trzeba znieść na dół, a nowa wylewka obciąża strop. Frezowanie omija oba problemy. W domach pod Wrocławiem robimy podłogówkę przy modernizacji ogrzewania, zanim wejdą podłogi.',
		travel: 'ok. 4,5 h',
		screed: 'cementowa, 5–7 cm',
		nearby: ['Oława', 'Długołęka', 'Kobierzyce'],
		faq: [
			{
				question: 'Czy na poddaszu da się zrobić podłogówkę bez nowej wylewki?',
				answer:
					'Tak, jeśli istniejąca wylewka ma co najmniej 4 cm i izolację pod spodem. Frezujemy w niej rowki, więc strop nie dostaje dodatkowego ciężaru nowej warstwy.',
			},
			{
				question: 'Ile trwa podłogówka na poddaszu?',
				answer:
					'Około 50 m² robimy w jeden dzień. Większe poddasza, z wieloma pomieszczeniami, zwykle w dwa dni. Po wyschnięciu masy można kłaść podłogi.',
			},
		],
	},
	{
		slug: 'lodz',
		name: 'Łódź',
		inCity: 'w Łodzi',
		region: 'łódzkie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Łodzi: domy, mieszkania i lofty, bez skuwania wylewki. Darmowa wycena.',
		lead: 'W Łodzi robimy podłogówkę w domach jednorodzinnych i mieszkaniach po remoncie. Grzejniki znikają ze ścian, a wylewka zostaje na miejscu.',
		localTitle: 'Domy jednorodzinne i mieszkania, w których grzejniki mają zniknąć.',
		localBody:
			'Najczęściej przychodzą do nas osoby, które mają dość grzejników pod oknami i chcą równego ciepła w całym domu. Nie trzeba do tego nowej wylewki. Frezujemy rowki w obecnej i układamy w nich rury.',
		travel: 'ok. 4,5 h',
		screed: 'cementowa, 5–6 cm',
		nearby: ['Zgierz', 'Pabianice', 'Konstantynów Łódzki'],
		faq: [
			{
				question: 'Czy mogę zamienić grzejniki na podłogówkę w starym domu?',
				answer:
					'Tak, jeśli wylewka ma co najmniej 4 cm i leży na izolacji. Frezujemy w niej rowki, układamy rury i podłączamy je do rozdzielacza. Grzejniki można potem zdemontować.',
			},
			{
				question: 'Co z drzwiami i progami po frezowaniu?',
				answer:
					'Nic się nie zmienia. Frezowanie nie dokłada warstwy, więc poziom podłogi zostaje ten sam, a drzwi nie trzeba podcinać.',
			},
		],
	},
	{
		slug: 'katowice',
		name: 'Katowice',
		inCity: 'w Katowicach',
		region: 'śląskie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Katowicach i na Śląsku: domy, poddasza i mieszkania, bez skuwania. Darmowa wycena.',
		lead: 'Na Śląsku często frezujemy w domach, które przechodzą z kotła na węgiel na pompę ciepła. Podłogówka w istniejącej wylewce to najprostsza droga do niskiej temperatury zasilania.',
		localTitle: 'Domy po wymianie kotła i poddasza w zabudowie śląskiej.',
		localBody:
			'Pompa ciepła najlepiej pracuje z ogrzewaniem podłogowym. W starszych domach na Śląsku wylewka zwykle jest wystarczająco gruba, żeby wyfrezować w niej rowki bez skuwania i bez podnoszenia podłogi.',
		travel: 'ok. 2,5 h',
		screed: 'cementowa, 5–8 cm',
		nearby: ['Chorzów', 'Tychy', 'Mikołów'],
		faq: [
			{
				question: 'Czy podłogówka pasuje do pompy ciepła po wymianie kotła?',
				answer:
					'Tak, to dobre połączenie. Podłogówka grzeje dużą powierzchnią, więc wystarcza jej niska temperatura wody, a na niskiej temperaturze pompa ciepła pracuje najtaniej.',
			},
			{
				question: 'Czy da się frezować w starej, twardej wylewce?',
				answer:
					'Tak. Twarda i gruba wylewka wydłuża frezowanie, ale nie jest przeszkodą. Ma to wpływ na cenę, dlatego pytamy o nią przy wycenie.',
			},
		],
	},
	{
		slug: 'rzeszow',
		name: 'Rzeszów',
		inCity: 'w Rzeszowie',
		region: 'podkarpackie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Rzeszowie: nowe mieszkania i domy, bez podnoszenia podłogi. Darmowa wycena.',
		lead: 'W Rzeszowie najczęściej robimy podłogówkę w nowych mieszkaniach, zanim właściciele położą podłogi. Frezujemy w wylewce dewelopera, więc poziom przy drzwiach zostaje ten sam.',
		localTitle: 'Nowe mieszkania na osiedlach i domy wokół Rzeszowa.',
		localBody:
			'W mieszkaniu od dewelopera nie da się dołożyć grubej warstwy pod rury, bo drzwi wejściowe stoją już na swoim miejscu. Frezowanie rozwiązuje to w jeden dzień. Pod miastem robimy domy w budowie i po remoncie.',
		travel: 'ok. 2,5 h',
		screed: 'cementowa, 5–6 cm',
		nearby: ['Łańcut', 'Boguchwała', 'Głogów Małopolski'],
		faq: [
			{
				question: 'Kiedy najlepiej frezować w nowym mieszkaniu?',
				answer:
					'Po wylaniu i wyschnięciu wylewki, a przed układaniem paneli i płytek. Wtedy nic nie trzeba zrywać ani zabezpieczać.',
			},
			{
				question: 'Czy po frezowaniu trzeba długo czekać na podłogi?',
				answer:
					'Czeka się tylko na wyschnięcie masy w rowkach, a nie całej wylewki. To znacznie krócej niż przy wylewaniu nowej posadzki.',
			},
		],
	},
	{
		slug: 'kielce',
		name: 'Kielce',
		inCity: 'w Kielcach',
		region: 'świętokrzyskie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Kielcach: nowe domy i remonty, bez skuwania posadzki. Darmowa wycena.',
		lead: 'W Kielcach i okolicy frezujemy głównie nowe domy, w których decyzja o podłogówce zapadła już po wylaniu posadzki. Nie trzeba wylewać jej drugi raz.',
		localTitle: 'Nowe domy, w których posadzka była gotowa przed decyzją o podłogówce.',
		localBody:
			'Wylewka wyschła, a Ty dopiero zdecydowałeś się na ogrzewanie podłogowe? To częsta sytuacja. Wyfrezujemy rowki od rozdzielacza do każdego pokoju i ułożymy rury, a budowa przesunie się tylko o czas schnięcia masy.',
		travel: 'ok. 3 h',
		screed: 'cementowa, 5–7 cm',
		nearby: ['Masłów', 'Sitkówka-Nowiny', 'Morawica'],
		faq: [
			{
				question: 'Czy mogę zdecydować się na podłogówkę po wylaniu posadzki?',
				answer:
					'Tak, właśnie po to jest frezowanie. Wycinamy rowki w gotowej wylewce, więc nie trzeba jej zrywać ani wylewać od nowa.',
			},
			{
				question: 'Gdzie powinien stać rozdzielacz?',
				answer:
					'Najlepiej w miejscu, z którego pętle rozejdą się do wszystkich pokoi bez długich przejść, zwykle w korytarzu. Pomagamy to zaplanować przed frezowaniem.',
			},
		],
	},
	{
		slug: 'opole',
		name: 'Opole',
		inCity: 'w Opolu',
		region: 'opolskie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Opolu: domy z pompą ciepła i duże salony, bez skuwania. Darmowa wycena.',
		lead: 'W Opolu często robimy podłogówkę w nowych domach z pompą ciepła. Frezujemy w gotowej wylewce, więc nie trzeba wylewać jej ponownie.',
		localTitle: 'Domy z pompą ciepła i duże salony z przeszkleniami.',
		localBody:
			'Pompa ciepła potrzebuje dużej powierzchni grzewczej, a duży salon z oknami do podłogi nie ma miejsca na grzejniki. Podłogówka w istniejącej wylewce rozwiązuje oba problemy naraz.',
		travel: 'ok. 3,5 h',
		screed: 'cementowa i anhydrytowa, 5–7 cm',
		nearby: ['Komprachcice', 'Prószków', 'Dobrzeń Wielki'],
		faq: [
			{
				question: 'Czy da się frezować wylewkę anhydrytową?',
				answer:
					'Tak, frezujemy zarówno wylewki cementowe, jak i anhydrytowe. Ważne, żeby miała co najmniej 4 cm i izolację pod spodem.',
			},
			{
				question: 'Czy przy dużych oknach podłogówka wystarczy?',
				answer:
					'Tak. Przy przeszkleniach układamy pętle gęściej, żeby oddać więcej ciepła tam, gdzie dom traci go najwięcej.',
			},
		],
	},
	{
		slug: 'torun',
		name: 'Toruń',
		inCity: 'w Toruniu',
		region: 'kujawsko-pomorskie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Toruniu: mieszkania w blokach i wieżowcach, bez skuwania i bez kurzu. Darmowa wycena.',
		lead: 'W Toruniu robimy podłogówkę w mieszkaniach w blokach i wieżowcach. Frezujemy z odkurzaczem, więc kurz nie trafia na klatkę ani do sąsiadów.',
		localTitle: 'Mieszkania w blokach i wieżowcach, gdzie nie ma miejsca na grubszą podłogę.',
		localBody:
			'W bloku z wielkiej płyty podłoga nie może urosnąć, a każdy worek gruzu trzeba znieść windą. Frezowanie nie podnosi podłogi i nie zostawia gruzu, a pył od razu trafia do odkurzacza przemysłowego.',
		travel: 'ok. 6 h',
		screed: 'cementowa, 4–6 cm',
		nearby: ['Lubicz', 'Obrowo', 'Wielka Nieszawka'],
		faq: [
			{
				question: 'Czy w bloku z wielkiej płyty da się zrobić podłogówkę?',
				answer:
					'Najczęściej tak, jeśli wylewka ma co najmniej 4 cm i izolację pod spodem. Sprawdzimy to przy wycenie, a w razie wątpliwości oglądamy podłogę na miejscu.',
			},
			{
				question: 'Co z kurzem na klatce schodowej?',
				answer:
					'Frezarka jest podłączona do odkurzacza przemysłowego, więc pył nie rozchodzi się po mieszkaniu ani klatce. Nie wynosimy też gruzu, bo go nie ma.',
			},
		],
	},
	{
		slug: 'kalisz',
		name: 'Kalisz',
		inCity: 'w Kaliszu',
		region: 'wielkopolskie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Kaliszu: domy jednorodzinne i remonty, bez skuwania wylewki. Darmowa wycena.',
		lead: 'W Kaliszu i okolicy robimy podłogówkę w domach jednorodzinnych, często tam, gdzie duże drzwi balkonowe nie zostawiają miejsca na grzejnik.',
		localTitle: 'Domy jednorodzinne z dużymi przeszkleniami i wyjściami na taras.',
		localBody:
			'Przy drzwiach balkonowych do podłogi grzejnik zasłania wyjście albo wcale się nie mieści. Podłogówka grzeje od spodu, a przy przeszkleniu układamy pętle gęściej, żeby nie było tam chłodniej.',
		travel: 'ok. 5 h',
		screed: 'cementowa, 5–7 cm',
		nearby: ['Ostrów Wielkopolski', 'Opatówek', 'Nowe Skalmierzyce'],
		faq: [
			{
				question: 'Czy przy drzwiach balkonowych nie będzie zimno?',
				answer:
					'Przy przeszkleniach układamy pętle gęściej. Dzięki temu podłoga oddaje tam więcej ciepła i przy drzwiach jest tak samo ciepło jak w środku pokoju.',
			},
			{
				question: 'Czy mogę grzać podłogówką tylko część domu?',
				answer:
					'Tak. Możesz zrobić podłogówkę tylko w wybranych pomieszczeniach, a w pozostałych zostawić grzejniki. Ustalamy to przy planowaniu pętli.',
			},
		],
	},
	{
		slug: 'gdansk',
		name: 'Gdańsk',
		inCity: 'w Gdańsku',
		region: 'pomorskie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Gdańsku i Trójmieście: remonty domów i mieszkań, bez skuwania. Darmowa wycena.',
		lead: 'W Gdańsku i całym Trójmieście frezujemy przy remontach domów i mieszkań. Stare grzejniki znikają, a wylewka zostaje na miejscu.',
		localTitle: 'Remonty domów i mieszkań w Trójmieście.',
		localBody:
			'Przy remoncie skuwanie posadzki to najbrudniejszy i najdłuższy etap. Frezowanie go omija: w jeden dzień wycinamy rowki, układamy rury i zalewamy je masą, a remont idzie dalej.',
		travel: 'ok. 8 h',
		screed: 'cementowa, 5–7 cm',
		nearby: ['Sopot', 'Gdynia', 'Pruszcz Gdański'],
		faq: [
			{
				question: 'Czy przyjedziecie z Małopolski do Trójmiasta?',
				answer:
					'Tak, pracujemy w całej Polsce. Dojazd liczymy w cenie, dlatego przy dalszych miastach łączymy kilka zleceń w jednym wyjeździe.',
			},
			{
				question: 'Na jakim etapie remontu frezować?',
				answer:
					'Po zdjęciu starych podłóg, a przed układaniem nowych. Ściany mogą być już wykończone, bo frezowanie nie brudzi ich pyłem.',
			},
		],
	},
	{
		slug: 'lublin',
		name: 'Lublin',
		inCity: 'w Lublinie',
		region: 'lubelskie',
		description:
			'Frezowanie pod ogrzewanie podłogowe w Lublinie: poddasza i domy w remoncie, bez skuwania posadzki. Darmowa wycena.',
		lead: 'W Lublinie często frezujemy poddasza w trakcie remontu. Robimy to w istniejącej posadzce, więc nie wnosimy wilgoci świeżej wylewki do wykończonych ścian.',
		localTitle: 'Poddasza w remoncie i domy, w których ściany są już gotowe.',
		localBody:
			'Nowa wylewka to woda, która wsiąka w świeże płyty gipsowo-kartonowe, i tygodnie schnięcia. Frezowanie wymaga tylko zalania wąskich rowków, więc remont może iść dalej niemal od razu.',
		travel: 'ok. 4,5 h',
		screed: 'cementowa, 4–6 cm',
		nearby: ['Świdnik', 'Lubartów', 'Łęczna'],
		faq: [
			{
				question: 'Czy frezowanie zniszczy wykończone ściany?',
				answer:
					'Nie. Frezarka pracuje z odkurzaczem, więc pył nie osiada na ścianach, a masa w rowkach nie zawilgaca pomieszczeń tak jak nowa wylewka.',
			},
			{
				question: 'Ile trwa frezowanie na poddaszu?',
				answer:
					'Poddasze do 50 m² robimy zwykle w jeden dzień. Po wyschnięciu masy w rowkach można kłaść podłogi.',
			},
		],
	},
]

/** Miasto w języku strony. Brak tłumaczenia zostawia wersję polską — pilnuje tego test. */
function localizeCity(city: City, locale: Locale): City {
	const text = locale === 'en' ? citiesEn[city.slug] : undefined

	return text ? { ...city, ...text } : city
}

/** Wszystkie miasta w języku strony. */
export function localizedCities(locale: Locale): City[] {
	return cities.map(city => localizeCity(city, locale))
}

/** Miasto po adresie — `undefined` dla nieznanego daje 404. */
export function findCity(slug: string, locale: Locale): City | undefined {
	const city = cities.find(candidate => candidate.slug === slug)

	return city && localizeCity(city, locale)
}

/** Ścieżka strony miasta — zagnieżdżona pod usługą (docs/zakres.md, „Mapa strony"). */
export function cityPath(city: Pick<City, 'slug'>): string {
	return `${SERVICE_PATH}/${city.slug}`
}
