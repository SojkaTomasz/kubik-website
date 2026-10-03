import p20240814_111442 from '@/assets/photos/20240814_111442.jpg'
import p20240814_111452 from '@/assets/photos/20240814_111452.jpg'
import p20240814_140723 from '@/assets/photos/20240814_140723.jpg'
import p20241210_075605 from '@/assets/photos/20241210_075605.jpg'
import p20241210_091315 from '@/assets/photos/20241210_091315.jpg'
import p20241210_092126 from '@/assets/photos/20241210_092126.jpg'
import p20241210_143129 from '@/assets/photos/20241210_143129.jpg'
import p20250718_134833 from '@/assets/photos/20250718_134833.jpg'
import p20250721_134637 from '@/assets/photos/20250721_134637.jpg'
import p20250825_112007 from '@/assets/photos/20250825_112007.jpg'
import p20250825_123139 from '@/assets/photos/20250825_123139.jpg'
import p20250825_123153 from '@/assets/photos/20250825_123153.jpg'
import p20250825_134859 from '@/assets/photos/20250825_134859.jpg'
import p20250825_142557 from '@/assets/photos/20250825_142557.jpg'
import p20251015_144844 from '@/assets/photos/20251015_144844.jpg'
import p20251015_144855 from '@/assets/photos/20251015_144855.jpg'
import p20251017_081801 from '@/assets/photos/20251017_081801.jpg'
import p20260127_121901 from '@/assets/photos/20260127_121901.jpg'
import p20260127_121910 from '@/assets/photos/20260127_121910.jpg'
import p20260520_134312 from '@/assets/photos/20260520_134312.jpg'
import p20260520_145932 from '@/assets/photos/20260520_145932.jpg'
import p20260520_150406 from '@/assets/photos/20260520_150406.jpg'
import p20260528_114912 from '@/assets/photos/20260528_114912.jpg'
import p20260528_131015 from '@/assets/photos/20260528_131015.jpg'
import p20260528_140802 from '@/assets/photos/20260528_140802.jpg'
import p20260530_082538 from '@/assets/photos/20260530_082538.jpg'
import p20260819_124347 from '@/assets/photos/20260819_124347.jpg'
import p20260820_101133 from '@/assets/photos/20260820_101133.jpg'
import p20260820_101137 from '@/assets/photos/20260820_101137.jpg'
import p20260901_113809 from '@/assets/photos/20260901_113809.jpg'
import p20260901_113818 from '@/assets/photos/20260901_113818.jpg'
import p20260901_120948 from '@/assets/photos/20260901_120948.jpg'
import p20260901_131708 from '@/assets/photos/20260901_131708.jpg'
import p20260901_131712 from '@/assets/photos/20260901_131712.jpg'
import p20260901_131716 from '@/assets/photos/20260901_131716.jpg'
import p20260904_094729 from '@/assets/photos/20260904_094729.jpg'
import p20260904_094737 from '@/assets/photos/20260904_094737.jpg'
import p20260904_111903 from '@/assets/photos/20260904_111903.jpg'
import p20260904_111905 from '@/assets/photos/20260904_111905.jpg'
import p20260904_144337 from '@/assets/photos/20260904_144337.jpg'
import p20260907_104642 from '@/assets/photos/20260907_104642.jpg'
import p20260907_120108 from '@/assets/photos/20260907_120108.jpg'
import p20260907_143047 from '@/assets/photos/20260907_143047.jpg'
import p20260907_143055 from '@/assets/photos/20260907_143055.jpg'
import p20260907_143113 from '@/assets/photos/20260907_143113.jpg'
import p20260908_104613 from '@/assets/photos/20260908_104613.jpg'
import p20260908_110123 from '@/assets/photos/20260908_110123.jpg'
import { projectsEn } from '@/data/en/projects'
import type { ImageSource } from '@/components/ui/image'
import type { Locale } from '@/site.config'

/**
 * Realizacje — 12 podłóg, po jednej na miasto (docs/zakres.md, „Realizacje:
 * przydział zdjęć").
 *
 * ⚠️ DO POTWIERDZENIA Z KLIENTEM: miasta są przypisane decyzją projektu, a nie
 * według faktycznego miejsca roboty; metraż, wylewka i czas to szacunki ze
 * zdjęć; trzy akapity opisu trzeba napisać od nowa po rozmowie z klientem.
 * Pewny jest wyłącznie wzór z Wrocławia (docs/teksty.md).
 *
 * Zdjęcia: wersje webowe z `../image/` w `assets/photos` (`scripts/optimize-photos.mjs`).
 * Pierwsze zdjęcie listy jest okładką — kadr podłogi, nie bus ani rozdzielacz. Galeria pokazuje
 * wyłącznie zdjęcia z TEJ SAMEJ roboty (data i GPS oryginału), bez prawie identycznych ujęć.
 *
 * Wersja angielska opisów: `data/en/projects.ts`, kluczowana slugiem. Widoki
 * biorą realizacje przez `localizedProjects` / `findProject` z językiem strony.
 */

/** Rodzaj obiektu — filtr na liście realizacji. */
export type ProjectKind = 'dom' | 'mieszkanie' | 'poddasze'

/** Kolejność żetonów filtra na liście realizacji. */
export const projectKinds: ProjectKind[] = ['dom', 'mieszkanie', 'poddasze']

export interface Project {
	/** Adres: `/realizacje/<slug>`, w formacie `<miasto>-<metraż>m2`. */
	slug: string
	/** Klucz miasta z `data/cities.ts` — strona miasta pokazuje swoją realizację. */
	city: string
	/** Nazwa miasta w mianowniku, do etykiet. */
	cityName: string
	/** Krótki tytuł obiektu — „Ocieplone poddasze". */
	title: string
	kind: ProjectKind
	/** Metraż w m². */
	area: number
	/** Czas pracy w dniach. */
	days: number
	screed: string
	/** Wstęp pod danymi — kto, co, po co. */
	intro: string
	/** Opis w trzech krokach: punkt wyjścia, co zrobiliśmy, efekt. */
	story: [string, string, string]
	photos: ImageSource[]
}

/** Pola tłumaczone — dane techniczne i zdjęcia są wspólne dla języków. */
export type ProjectText = Pick<Project, 'cityName' | 'title' | 'screed' | 'intro' | 'story'>

export const projects: Project[] = [
	{
		slug: 'wroclaw-50m2',
		city: 'wroclaw',
		cityName: 'Wrocław',
		title: 'Ocieplone poddasze',
		kind: 'poddasze',
		area: 50,
		days: 2,
		screed: 'Cementowa',
		intro: 'Ocieplone poddasze pod skosem, kilka pomieszczeń. Właściciele chcieli ciepłą podłogę na całym piętrze, zanim położą panele.',
		story: [
			'Wylewka na poddaszu była już gotowa. Skuwanie oznaczałoby gruz znoszony po schodach i czekanie na nową wylewkę.',
			'Laserem wyznaczyliśmy pętle, wyfrezowaliśmy rowki w każdym pomieszczeniu, ułożyliśmy rurki i zalaliśmy je masą.',
			'Dwa dni pracy i całe poddasze ma podłogówkę. Po wyschnięciu masy można kłaść panele.',
		],
		photos: [
			p20260907_143055,
			p20260907_104642,
			p20260907_120108,
			p20260907_143047,
			p20260907_143113,
			p20260908_104613,
			p20260908_110123,
		],
	},
	{
		slug: 'lodz-60m2',
		city: 'lodz',
		cityName: 'Łódź',
		title: 'Dom, cztery pokoje',
		kind: 'dom',
		area: 60,
		days: 1,
		screed: 'Cementowa',
		intro: 'Parter domu jednorodzinnego, cztery pokoje. Grzejniki zajmowały miejsce pod oknami, a właściciele chcieli równego ciepła w całym domu.',
		story: [
			'Wylewka cementowa leżała od lat i była w dobrym stanie. Szkoda było ją zrywać tylko po to, żeby zmieścić rury.',
			'Wyfrezowaliśmy pętle we wszystkich czterech pokojach, ułożyliśmy rury od rozdzielacza i zalaliśmy rowki masą.',
			'Jeden dzień pracy, a dom grzeje się od podłogi. Grzejniki mogą zniknąć ze ścian.',
		],
		photos: [
			p20260901_113809,
			p20260901_113818,
			p20260901_120948,
			p20260901_131708,
			p20260901_131712,
			p20260901_131716,
		],
	},
	{
		slug: 'krakow-90m2',
		city: 'krakow',
		cityName: 'Kraków',
		title: 'Salon z dużymi oknami',
		kind: 'dom',
		area: 90,
		days: 2,
		screed: 'Cementowa',
		intro: 'Otwarta przestrzeń z przeszkleniem na całą ścianę. Przy takich oknach grzejnik nie miał gdzie stanąć, a podłoga przy szybie wychładzała się najszybciej.',
		story: [
			'Duże przeszklenie i salon połączony z kuchnią. Wylewka gotowa, okna zamontowane, wykończenie tuż przed nami.',
			'Rozplanowaliśmy gęstsze pętle przy oknach, wyfrezowaliśmy rowki w całej otwartej przestrzeni i ułożyliśmy rury.',
			'Ciepło rozkłada się równo także przy szybie. Salon nie potrzebuje ani jednego grzejnika.',
		],
		photos: [p20260820_101133, p20260819_124347, p20260820_101137],
	},
	{
		slug: 'kielce-50m2',
		city: 'kielce',
		cityName: 'Kielce',
		title: 'Nowy dom',
		kind: 'dom',
		area: 50,
		days: 1,
		screed: 'Cementowa',
		intro: 'Nowy dom, trzy pokoje i rozdzielacz w korytarzu. Wylewka była już wylana, gdy właściciele zdecydowali się na podłogówkę.',
		story: [
			'Decyzja o ogrzewaniu podłogowym zapadła po wylaniu posadzki. Nowa wylewka oznaczałaby kolejne tygodnie schnięcia.',
			'Poprowadziliśmy pętle od rozdzielacza do trzech pokoi, wyfrezowaliśmy rowki i ułożyliśmy rury jednym odcinkiem.',
			'W jeden dzień dom dostał podłogówkę, a harmonogram budowy przesunął się tylko o czas schnięcia masy.',
		],
		photos: [
			p20250825_123139,
			p20250825_123153,
			p20250825_134859,
			p20250825_142557,
			p20250825_112007,
		],
	},
	{
		slug: 'rzeszow-60m2',
		city: 'rzeszow',
		cityName: 'Rzeszów',
		title: 'Nowe mieszkanie',
		kind: 'mieszkanie',
		area: 60,
		days: 1,
		screed: 'Cementowa',
		intro: 'Nowe mieszkanie w stanie deweloperskim. Właściciele chcieli podłogówki, zanim położą podłogi, ale bez podnoszenia poziomu przy drzwiach.',
		story: [
			'Mieszkanie od dewelopera, z gotową wylewką i drzwiami wejściowymi na swoim miejscu. Grubsza podłoga nie wchodziła w grę.',
			'Wyfrezowaliśmy rowki w istniejącej wylewce, ułożyliśmy rury we wszystkich pomieszczeniach i zalaliśmy je masą.',
			'Poziom podłogi został ten sam, a mieszkanie grzeje się od spodu. Można kłaść panele i płytki.',
		],
		photos: [p20241210_092126, p20241210_091315, p20241210_143129, p20241210_075605],
	},
	{
		slug: 'torun-60m2',
		city: 'torun',
		cityName: 'Toruń',
		title: 'Mieszkanie w wieżowcu',
		kind: 'mieszkanie',
		area: 60,
		days: 1,
		screed: 'Cementowa',
		intro: 'Mieszkanie na wysokim piętrze bloku. W wieżowcu nie ma miejsca na grubszą wylewkę, a każdy worek gruzu trzeba znieść windą.',
		story: [
			'Blok z wielkiej płyty i wylewka, która nie mogła urosnąć ani o centymetr. Skuwanie w wieżowcu to hałas dla całego pionu.',
			'Frezowaliśmy z odkurzaczem przemysłowym, pomieszczenie po pomieszczeniu, a potem ułożyliśmy rury i zalaliśmy rowki.',
			'Bez gruzu na klatce i bez kurzu u sąsiadów. Po jednym dniu mieszkanie ma ogrzewanie podłogowe.',
		],
		photos: [p20240814_111442, p20240814_111452, p20240814_140723],
	},
	{
		slug: 'katowice-70m2',
		city: 'katowice',
		cityName: 'Katowice',
		title: 'Poddasze, 8 pętli',
		kind: 'poddasze',
		area: 70,
		days: 2,
		screed: 'Cementowa',
		intro: 'Wykończone poddasze z rozdzielaczem na osiem pętli. Każde pomieszczenie dostało własny obieg, żeby dało się je grzać osobno.',
		story: [
			'Poddasze było już ocieplone i otynkowane. Skuwanie posadzki zniszczyłoby świeże wykończenie ścian.',
			'Rozplanowaliśmy osiem pętli od jednego rozdzielacza, wyfrezowaliśmy rowki i ułożyliśmy rury bez łączeń pod podłogą.',
			'Każde pomieszczenie ma swój obieg i swoją temperaturę, a ściany zostały nietknięte.',
		],
		photos: [p20260127_121910, p20260127_121901],
	},
	{
		slug: 'opole-80m2',
		city: 'opole',
		cityName: 'Opole',
		title: 'Dom z dużym salonem',
		kind: 'dom',
		area: 80,
		days: 2,
		screed: 'Cementowa',
		intro: 'Nowy dom z dużym salonem na parterze. Właściciele postawili na pompę ciepła, więc podłogówka była naturalnym wyborem.',
		story: [
			'Pompa ciepła najlepiej pracuje na niskiej temperaturze zasilania, a do tego potrzebna jest duża powierzchnia grzewcza.',
			'Wyfrezowaliśmy pętle w salonie i pozostałych pomieszczeniach parteru, ułożyliśmy rury i zalaliśmy rowki.',
			'Cały parter grzeje podłoga, a pompa ciepła pracuje na niskiej temperaturze, czyli najtaniej.',
		],
		photos: [p20260528_114912, p20260528_131015, p20260528_140802, p20260530_082538],
	},
	{
		slug: 'kalisz-60m2',
		city: 'kalisz',
		cityName: 'Kalisz',
		title: 'Dom z wyjściem na balkon',
		kind: 'dom',
		area: 60,
		days: 1,
		screed: 'Cementowa',
		intro: 'Dom z dużymi drzwiami balkonowymi. Przy przeszkleniu do podłogi grzejnik zasłaniałby wyjście, więc ciepło musiało iść od spodu.',
		story: [
			'Drzwi balkonowe zajmowały całą ścianę, a wylewka była gotowa. Nie było gdzie powiesić grzejnika.',
			'Wyfrezowaliśmy rowki z gęstszymi pętlami przy przeszkleniu, ułożyliśmy rury i zalaliśmy je masą.',
			'Wyjście na balkon zostało wolne, a przy drzwiach jest tak samo ciepło jak w środku pokoju.',
		],
		photos: [
			p20260904_094737,
			p20260904_094729,
			p20260904_111903,
			p20260904_111905,
			p20260904_144337,
		],
	},
	{
		slug: 'lublin-45m2',
		city: 'lublin',
		cityName: 'Lublin',
		title: 'Poddasze w remoncie',
		kind: 'poddasze',
		area: 45,
		days: 1,
		screed: 'Cementowa',
		intro: 'Poddasze w trakcie remontu, ściany z płyt gipsowo-kartonowych. Podłogówka weszła w remont, zanim przyszła kolej na podłogi.',
		story: [
			'Remont poddasza był w toku, a płyty na ścianach już zamontowane. Nowa wylewka oznaczałaby wilgoć i czekanie.',
			'Wyfrezowaliśmy rowki w istniejącej posadzce, ułożyliśmy rury i zalaliśmy je, nie ruszając świeżych ścian.',
			'Jeden dzień i remont mógł iść dalej. Poddasze grzeje się od podłogi.',
		],
		photos: [p20260520_150406, p20260520_134312, p20260520_145932],
	},
	{
		slug: 'gdansk-90m2',
		city: 'gdansk',
		cityName: 'Gdańsk',
		title: 'Remont domu z tarasem',
		kind: 'dom',
		area: 90,
		days: 2,
		screed: 'Cementowa',
		intro: 'Remont domu z otwartą strefą dzienną i wyjściem na taras. Stare grzejniki zostały zdjęte, a ciepło miało iść od podłogi.',
		story: [
			'Dom po latach na grzejnikach. Wylewka była w dobrym stanie, więc nie było powodu jej skuwać.',
			'Wyfrezowaliśmy rowki w całej otwartej przestrzeni, ułożyliśmy rury i zalaliśmy je masą.',
			'Strefa dzienna grzeje się równo, a ściany są wolne od grzejników.',
		],
		photos: [p20250718_134833, p20250721_134637],
	},
	{
		slug: 'warszawa-50m2',
		city: 'warszawa',
		cityName: 'Warszawa',
		title: 'Poddasze pod skosem',
		kind: 'poddasze',
		area: 50,
		days: 1,
		screed: 'Cementowa',
		intro: 'Poddasze pod skosem z dwoma rozdzielaczami. Niskie ściany kolankowe nie zostawiały miejsca na grzejniki.',
		story: [
			'Pod skosem każdy centymetr wysokości się liczy, a grzejnik pod niską ścianą grzeje głównie dach.',
			'Rozplanowaliśmy pętle z dwóch rozdzielaczy, wyfrezowaliśmy rowki i ułożyliśmy rury w całym poddaszu.',
			'Poddasze grzeje się od podłogi, a pod skosami zostało miejsce na meble.',
		],
		photos: [p20251015_144855, p20251015_144844, p20251017_081801],
	},
]

/** Realizacja w języku strony. Brak tłumaczenia zostawia wersję polską — pilnuje tego test. */
function localizeProject(project: Project, locale: Locale): Project {
	const text = locale === 'en' ? projectsEn[project.slug] : undefined

	return text ? { ...project, ...text } : project
}

/** Wszystkie realizacje w języku strony. */
export function localizedProjects(locale: Locale): Project[] {
	return projects.map(project => localizeProject(project, locale))
}

/** Realizacja po adresie — `undefined` dla nieznanego daje 404. */
export function findProject(slug: string, locale: Locale): Project | undefined {
	const project = projects.find(candidate => candidate.slug === slug)

	return project && localizeProject(project, locale)
}

/** Adres listy realizacji (docs/zakres.md, „Mapa strony"). */
export const PROJECTS_PATH = '/realizacje'

/** Ścieżka realizacji — jedno miejsce, z którego linkuje lista, slider i miasto. */
export function projectPath(project: Pick<Project, 'slug'>): string {
	return `${PROJECTS_PATH}/${project.slug}`
}
