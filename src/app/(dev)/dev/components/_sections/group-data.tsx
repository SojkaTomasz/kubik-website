'use client'

import { MoreHorizontal } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import SAMPLE_IMAGE from '@/assets/samples/landscape.png'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
	Avatar,
	AvatarBadge,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	cardVariants,
} from '@/components/ui/card'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel'
import { CarouselDots } from '@/components/ui/carousel-dots'
import { CarouselProgress } from '@/components/ui/carousel-progress'
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart'
import { Image, imageVariants } from '@/components/ui/image'
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemGroup,
	ItemHeader,
	ItemMedia,
	ItemSeparator,
	ItemTitle,
} from '@/components/ui/item'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { separatorVariants } from '@/components/ui/separator.variants'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Typography } from '@/components/ui/typography'
import { variantKeys } from '@/lib/cva'

const separatorVariantNames = variantKeys(separatorVariants, 'variant')

/* Listy czytane z komponentów — patrz komentarz w group-actions.tsx. */
const cardVariantList = variantKeys(cardVariants, 'variant')
const imageRatios = variantKeys(imageVariants, 'ratio')
const imageFits = variantKeys(imageVariants, 'fit')
const imageRoundings = variantKeys(imageVariants, 'rounded')

/*
 * Portret dla `AvatarImage` jako data URI, a nie plik ani adres zewnętrzny.
 * Próbka ma pokazywać komponent, nie sprawdzać, czy sieć odpowiada: zewnętrzny
 * adres wywracałby testy e2e przy pracy bez internetu, a plik w `public/`
 * dokładałby zasób, którym nikt później nie zarządza.
 */
const SAMPLE_PORTRAIT =
	"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='%23c7d2fe'/><circle cx='32' cy='24' r='12' fill='%234338ca'/><path d='M8 64c0-13 11-22 24-22s24 9 24 22z' fill='%234338ca'/></svg>"

const invoices = [
	['FV/2026/01', 'Opłacona', '4 920,00 zł'],
	['FV/2026/02', 'Oczekuje', '1 230,00 zł'],
	['FV/2026/03', 'Po terminie', '860,00 zł'],
] as const

/*
 * Kolory biorą się z tokenów wykresu, nie z wartości wpisanych na sztywno.
 * Dzięki temu wykres przełącza się razem z motywem — paleta zaszyta w kodzie
 * zostawałaby jasna na ciemnym tle.
 */
const CHART_CONFIG = {
	organic: { label: 'Z wyszukiwarki', color: 'var(--chart-1)' },
	direct: { label: 'Wejścia bezpośrednie', color: 'var(--chart-2)' },
} satisfies ChartConfig

const TRAFFIC = [
	{ month: 'Sty', organic: 186, direct: 80 },
	{ month: 'Lut', organic: 305, direct: 200 },
	{ month: 'Mar', organic: 237, direct: 120 },
	{ month: 'Kwi', organic: 273, direct: 190 },
	{ month: 'Maj', organic: 209, direct: 130 },
	{ month: 'Cze', organic: 314, direct: 240 },
]

export function GroupData() {
	return (
		<Showcase
			id='data'
			index='06'
			title='Prezentacja danych'
			description='Tabela jest dla danych porównywalnych kolumnami; karta i Item dla treści, którą czyta się osobno. Lista kart udająca tabelę utrudnia porównywanie, a tabela z jedną kolumną to zwykła lista.'
		>
			<ShowcaseItem
				title='Table'
				className='flex-col items-stretch'
			>
				<Table>
					<TableCaption>Faktury z bieżącego kwartału</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Numer</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className='text-right'>Kwota</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invoices.map(([number, status, amount]) => (
							<TableRow key={number}>
								<TableCell className='font-medium'>{number}</TableCell>
								<TableCell>
									<Badge variant={status === 'Po terminie' ? 'destructive' : 'secondary'}>
										{status}
									</Badge>
								</TableCell>
								<TableCell className='text-right tabular-nums'>{amount}</TableCell>
							</TableRow>
						))}
					</TableBody>
					{/*
					 * Podsumowanie idzie do `TableFooter`, nie do zwykłego wiersza
					 * w `TableBody`. To `<tfoot>`, więc czytnik ekranu ogłasza sekcję
					 * podsumowania, a przy druku wielostronicowym przeglądarka
					 * powtarza ją na każdej stronie — wiersz w `<tbody>` nie robi
					 * ani jednego, ani drugiego.
					 */}
					<TableFooter>
						<TableRow>
							<TableCell colSpan={2}>Razem</TableCell>
							<TableCell className='text-right tabular-nums'>7 010,00 zł</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</ShowcaseItem>

			<ShowcaseItem
				title='Card — warianty'
				note='interactive wymaga widocznego fokusa, bo karta jest wtedy celem klawiatury'
			>
				{cardVariantList.map(variant => (
					<Sample
						key={variant}
						label={variant}
					>
						<Card
							variant={variant}
							className='w-44'
							tabIndex={variant === 'interactive' ? 0 : undefined}
						>
							<CardContent>
								<Typography variant='bodySm'>Treść karty</Typography>
							</CardContent>
						</Card>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem title='Card — pełna kompozycja'>
				<Card className='w-80'>
					<CardHeader>
						<CardTitle>Pakiet rozszerzony</CardTitle>
						<CardDescription>Dla firm prowadzących stałe działania online.</CardDescription>
						<CardAction>
							<Badge>Popularny</Badge>
						</CardAction>
					</CardHeader>
					<CardContent>
						<Typography variant='h3'>1 200 zł</Typography>
						<Typography
							variant='caption'
							tone='muted'
						>
							miesięcznie, płatne z góry
						</Typography>
					</CardContent>
					<CardFooter>
						<Button className='w-full'>Wybierz pakiet</Button>
					</CardFooter>
				</Card>
			</ShowcaseItem>

			<ShowcaseItem
				title='Item'
				note='wiersz listy z ikoną, treścią i akcją — lżejszy od karty'
				className='flex-col items-stretch gap-2'
			>
				<Item className='border'>
					<ItemMedia>
						<Avatar>
							<AvatarFallback>JK</AvatarFallback>
						</Avatar>
					</ItemMedia>
					<ItemContent>
						<ItemTitle>Jan Kowalski</ItemTitle>
						<ItemDescription>Ostatnia aktywność: 2 godziny temu</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Button
							variant='ghost'
							size='icon-sm'
							aria-label='Więcej opcji'
						>
							<MoreHorizontal />
						</Button>
					</ItemActions>
				</Item>
			</ShowcaseItem>

			<ShowcaseItem
				title='ItemGroup — lista z nagłówkiem i stopką'
				note='ItemGroup ma role="list", więc czytnik ekranu zapowiada liczbę pozycji'
				className='flex-col items-stretch'
			>
				{/* `role='listitem'` jest OBOWIĄZKOWE wewnątrz `ItemGroup` (`role='list'`) —
					bez niego axe zgłasza `aria-required-children`. Poza grupą byłoby równie
					niepoprawne, więc nie siedzi w samym `Item`. Stąd też `ItemSeparator`
					stoi POZA grupą. */}
				<ItemGroup className='w-full'>
					<Item
						role='listitem'
						className='border'
					>
						<ItemHeader>
							<Badge variant='secondary'>Zgłoszenie #128</Badge>
							<Typography
								variant='caption'
								tone='muted'
							>
								2 godziny temu
							</Typography>
						</ItemHeader>
						<ItemMedia>
							<Avatar>
								<AvatarFallback>JK</AvatarFallback>
							</Avatar>
						</ItemMedia>
						<ItemContent>
							<ItemTitle>Formularz kontaktowy nie wysyła załączników</ItemTitle>
							<ItemDescription>Zgłoszone przez Jana Kowalskiego</ItemDescription>
						</ItemContent>
						<ItemFooter>
							<Typography
								variant='caption'
								tone='muted'
							>
								Przypisane do zespołu frontend
							</Typography>
							<Button
								variant='ghost'
								size='xs'
							>
								Otwórz
							</Button>
						</ItemFooter>
					</Item>

					<Item
						role='listitem'
						className='border'
					>
						<ItemMedia>
							<Avatar>
								<AvatarFallback>AN</AvatarFallback>
							</Avatar>
						</ItemMedia>
						<ItemContent>
							<ItemTitle>Anna Nowak</ItemTitle>
							<ItemDescription>Pozycja bez nagłówka i stopki</ItemDescription>
						</ItemContent>
					</Item>
				</ItemGroup>

				{/* ItemSeparator poza grupą — kreska między pozycjami, które nie
				    tworzą listy w rozumieniu drzewa dostępności. */}
				<ItemSeparator />

				<Item className='border'>
					<ItemContent>
						<ItemTitle>Pozycja pod kreską</ItemTitle>
						<ItemDescription>Poza ItemGroup, więc bez roli listy</ItemDescription>
					</ItemContent>
				</Item>
			</ShowcaseItem>

			<ShowcaseItem title='Avatar'>
				<Sample label='pojedynczy'>
					<Avatar>
						<AvatarFallback>AB</AvatarFallback>
					</Avatar>
				</Sample>
				{/*
				 * `AvatarFallback` zostaje OBOK `AvatarImage`, nie zamiast niego.
				 * Base UI pokazuje go, dopóki obraz się nie wczyta, i wraca do
				 * niego, gdy wczytać się nie da — awatar bez fallbacku zostawia
				 * w tym miejscu pustą dziurę.
				 */}
				<Sample label='ze zdjęciem'>
					<Avatar>
						<AvatarImage
							src={SAMPLE_PORTRAIT}
							alt=''
						/>
						<AvatarFallback>AB</AvatarFallback>
					</Avatar>
				</Sample>
				{/* Świadomie BEZ próbki z niedziałającym obrazem: każdy sposób zepsucia
					źródła zostawia w konsoli błąd sieciowy, a pakiet e2e wymaga jej czystej. */}
				{/* `role='img'` nie jest ozdobnikiem: `AvatarBadge` to goły `<span>`,
					a na elemencie bez roli `aria-label` jest ZABRONIONY (axe:
					`aria-prohibited-attr`). */}
				<Sample label='ze znacznikiem statusu'>
					<Avatar>
						<AvatarFallback>EF</AvatarFallback>
						<AvatarBadge
							role='img'
							aria-label='Dostępny'
						/>
					</Avatar>
				</Sample>
				<Sample label='grupa'>
					<AvatarGroup>
						<Avatar>
							<AvatarFallback>AB</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarFallback>CD</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarFallback>EF</AvatarFallback>
						</Avatar>
					</AvatarGroup>
				</Sample>
				<Sample label='grupa z licznikiem reszty'>
					<AvatarGroup>
						<Avatar>
							<AvatarFallback>AB</AvatarFallback>
						</Avatar>
						<Avatar>
							<AvatarFallback>CD</AvatarFallback>
						</Avatar>
						<AvatarGroupCount>+7</AvatarGroupCount>
					</AvatarGroup>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Separator'
				className='flex-col items-stretch gap-3'
			>
				{separatorVariantNames.map(variant => (
					<Sample
						key={variant}
						label={variant}
					>
						<div className='flex flex-col gap-3'>
							<Typography variant='bodySm'>Treść nad separatorem</Typography>
							<Separator variant={variant} />
							<Typography variant='bodySm'>Treść pod separatorem</Typography>
						</div>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='AspectRatio'
				note='rezerwuje miejsce przed załadowaniem obrazu — zapobiega przeskokowi układu'
			>
				<div className='w-72'>
					<AspectRatio
						ratio={16 / 9}
						className='flex items-center justify-center rounded-lg bg-muted font-mono text-xs text-muted-foreground'
					>
						16 / 9
					</AspectRatio>
				</div>
			</ShowcaseItem>

			<ShowcaseItem
				title='Image — proporcje'
				note='oś ratio; przy każdej innej niż auto obraz dostaje fill i wypełnia ramkę'
			>
				{imageRatios.map(ratio => (
					<Sample
						key={ratio}
						label={ratio}
					>
						<Image
							src={SAMPLE_IMAGE}
							alt=''
							ratio={ratio}
							sizes='192px'
							className='w-48'
						/>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Image — kadrowanie i zaokrąglenie'
				note='fit działa tylko przy wymuszonych proporcjach — przy ratio="auto" nie ma czego kadrować'
			>
				{imageFits.map(fit => (
					<Sample
						key={fit}
						label={`fit="${fit}"`}
					>
						<Image
							src={SAMPLE_IMAGE}
							alt=''
							ratio='square'
							fit={fit}
							sizes='128px'
							className='w-32'
						/>
					</Sample>
				))}
				{imageRoundings.map(rounded => (
					<Sample
						key={rounded}
						label={`rounded="${rounded}"`}
					>
						<Image
							src={SAMPLE_IMAGE}
							alt=''
							ratio='square'
							rounded={rounded}
							sizes='128px'
							className='w-32'
						/>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Image — import statyczny kontra adres'
				note='import daje wymiary i rozmyty podgląd; przy adresie trzeba je podać ręcznie'
				className='flex-col items-stretch gap-4'
			>
				{/* `placeholder='blur'` działa TYLKO przy imporcie statycznym.
					Bez `eager`: React 19 wstawia dla takiego obrazu `preload`, a próbka
					leży daleko pod pierwszym ekranem, w sekcji odroczonej przez
					`content-visibility` — przeglądarka zgłaszała nieużyty preload. */}
				<Sample label="ratio='auto' + placeholder='blur'">
					<Image
						src={SAMPLE_IMAGE}
						alt='Przykładowa grafika: gradient z rozświetleniem'
						placeholder='blur'
						sizes='(min-width: 768px) 24rem, 100vw'
						className='w-96'
					/>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='ScrollArea'
				note='przewijanie ze stylizowanym paskiem, spójne między systemami'
			>
				{/* Etykieta opisuje obszar przewijania czytnikowi ekranu.
				    O samą osiągalność z klawiatury dba już komponent. */}
				<ScrollArea
					className='h-40 w-72 rounded-lg border p-4'
					aria-label='Lista pozycji'
				>
					<div className='flex flex-col gap-2'>
						{Array.from({ length: 12 }, (_unused, index) => (
							<Typography
								key={index}
								variant='bodySm'
							>
								Pozycja listy numer {index + 1}
							</Typography>
						))}
					</div>
				</ScrollArea>
			</ShowcaseItem>

			<ShowcaseItem
				title='Resizable'
				className='flex-col items-stretch'
			>
				{/*
					react-resizable-panels 4 przeszedł z `direction` na `orientation`,
					a proporcje przeniósł z propsa `defaultSize` panelu na `defaultLayout`
					grupy — mapę `{ idPanelu: procent }`. Bez podania jej panele dzielą
					przestrzeń po równo, co dla podglądu wystarcza.
				*/}
				<ResizablePanelGroup
					orientation='horizontal'
					className='h-40 rounded-lg border'
				>
					<ResizablePanel>
						<div className='flex h-full items-center justify-center font-mono text-xs'>
							Panel A
						</div>
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel>
						<div className='flex h-full items-center justify-center font-mono text-xs'>
							Panel B
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</ShowcaseItem>

			<ShowcaseItem
				title='Carousel'
				note='oparty na embla-carousel — obsługuje gesty dotykowe i klawiaturę'
				className='flex-col items-stretch'
			>
				<Carousel className='mx-12 w-auto'>
					<CarouselContent>
						{Array.from({ length: 5 }, (_unused, index) => (
							<CarouselItem
								key={index}
								className='basis-1/2 md:basis-1/3'
							>
								<div className='flex h-28 items-center justify-center rounded-lg bg-muted font-mono text-xs text-muted-foreground'>
									{index + 1}
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
					{/* `CarouselDots` czyta liczbę PRZYSTANKÓW z kontekstu: pięć kart
						po dwie naraz daje mniej kropek niż slajdów. */}
					<CarouselDots className='pt-4' />
					{/* Licznik z paskiem — wersja Kubika: czyta pozycję z tego samego kontekstu. */}
					<CarouselProgress
						total={5}
						className='pt-4'
					/>
				</Carousel>
			</ShowcaseItem>

			<ShowcaseItem
				title='Chart'
				note='kolory z tokenów wykresu (--chart-1…5), nie wpisane na sztywno — dzięki temu wykres reaguje na motyw'
				className='flex-col items-stretch'
			>
				<ChartContainer
					config={CHART_CONFIG}
					className='h-64 w-full'
				>
					<BarChart data={TRAFFIC}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey='month'
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							dataKey='organic'
							fill='var(--color-organic)'
							radius={4}
						/>
						<Bar
							dataKey='direct'
							fill='var(--color-direct)'
							radius={4}
						/>
					</BarChart>
				</ChartContainer>
			</ShowcaseItem>
		</Showcase>
	)
}
