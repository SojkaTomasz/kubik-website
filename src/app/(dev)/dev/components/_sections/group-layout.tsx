import { FileText, Home, MoreHorizontal, Plus, Settings } from 'lucide-react'

import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import SAMPLE_IMAGE from '@/assets/samples/landscape.png'
import { Button } from '@/components/ui/button'
import { Container, containerVariants } from '@/components/ui/container'
import { CtaBand } from '@/components/ui/cta-band'
import { DirectionProvider } from '@/components/ui/direction'
import { PageHero } from '@/components/ui/page-hero'
import { Prose } from '@/components/ui/prose'
import { Section, sectionVariants } from '@/components/ui/section'
import { SectionHeading, sectionHeadingVariants } from '@/components/ui/section-heading'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { Typography } from '@/components/ui/typography'
import { variantKeys } from '@/lib/cva'

const sectionHeadingLayouts = variantKeys(sectionHeadingVariants, 'layout')

/* Listy czytane z komponentów — patrz komentarz w group-actions.tsx. */
const containerSizes = variantKeys(containerVariants, 'size')
const containerPaddings = variantKeys(containerVariants, 'padding')
const sectionSpacings = variantKeys(sectionVariants, 'spacing')
const sectionBackgrounds = variantKeys(sectionVariants, 'background')

/**
 * Tło próbki jako data URI — z tego samego powodu co portret w group-data.tsx:
 * żadna próbka na tej stronie nie może zależeć od sieci.
 */
const SAMPLE_BACKGROUND =
	"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 12'><rect width='32' height='12' fill='%23334155'/><circle cx='24' cy='3' r='7' fill='%23f59e0b'/><path d='M0 12 L9 5 L17 12 Z' fill='%230f172a'/></svg>"

const SIDEBAR_ITEMS = [
	{ label: 'Pulpit', icon: Home, active: true, badge: '' },
	{ label: 'Dokumenty', icon: FileText, active: false, badge: '12' },
	{ label: 'Ustawienia', icon: Settings, active: false, badge: '' },
]

export function GroupLayout() {
	return (
		<Showcase
			id='layout'
			index='07'
			title='Layout'
			description='Trzy kompozyty, których nie ma w rejestrze shadcn, a powtarzały się w każdym analizowanym projekcie. Container trzyma szerokość i marginesy, Section — pionowy rytm i tło, Typography — całą decyzję o wyglądzie tekstu.'
		>
			<ShowcaseItem
				title='Container — rozmiary'
				note='components/ui/container.tsx'
				className='flex-col items-stretch gap-2'
			>
				{containerSizes.map(size => (
					<Container
						key={size}
						size={size}
						padding='none'
						className='rounded-md bg-muted py-2 text-center font-mono text-[11px] text-muted-foreground'
					>
						size=&quot;{size}&quot;
					</Container>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Container — marginesy boczne'
				note='oś padding, sterowana tokenami --container-px i --container-px-lg'
			>
				{containerPaddings.map(padding => (
					<Sample
						key={padding}
						label={padding}
					>
						<div className='w-48 rounded-md bg-muted'>
							<Container
								size='full'
								padding={padding}
							>
								<div className='h-8 rounded-sm bg-primary/20' />
							</Container>
						</div>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Section — tła'
				note='oś background'
			>
				{sectionBackgrounds.map(background => (
					<Sample
						key={background}
						label={background}
					>
						<Section
							spacing='none'
							background={background}
							contained={false}
							className='flex h-16 w-40 items-center justify-center rounded-lg border'
						>
							<span className='font-mono text-[11px]'>{background}</span>
						</Section>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Section — odstępy'
				note='wartości z tokenów --section-py i --section-py-lg'
				className='flex-col items-stretch gap-2'
			>
				{sectionSpacings.map(spacing => (
					<div
						key={spacing}
						className='flex items-center gap-3'
					>
						<span className='w-20 font-mono text-[11px] text-muted-foreground'>
							{spacing}
						</span>
						<div className='flex-1 rounded-md bg-muted'>
							<div className='h-2 rounded-md bg-primary/20' />
						</div>
					</div>
				))}
				<Typography
					variant='caption'
					tone='muted'
				>
					Section renderuje własny Container, chyba że ustawisz contained=false — wtedy sekcja
					sama zarządza szerokością, np. przy tle na pełną szerokość ekranu.
				</Typography>
			</ShowcaseItem>

			<ShowcaseItem
				title='Section — zdjęcie w tle'
				note='backgroundImage + overlayClassName; bez przyciemnienia tekst przestaje być czytelny na jaśniejszych kadrach'
				className='flex-col items-stretch gap-4'
			>
				{/*
				 * Podgląd jest przycięty ramką, bo prawdziwa sekcja idzie przez całą
				 * szerokość strony. `fullHeight` też jest tu wyłączony — na próbce
				 * zająłby cały ekran, a pokazać ma się sama warstwa tła.
				 */}
				<div className='overflow-hidden rounded-xl border'>
					<Section
						spacing='sm'
						backgroundImage={SAMPLE_BACKGROUND}
						overlayClassName='bg-black/55'
						className='text-white'
					>
						<Typography
							as='h4'
							variant='h4'
						>
							Nagłówek na zdjęciu
						</Typography>
						<Typography variant='bodySm'>
							Przyciemnienie leży MIĘDZY zdjęciem a treścią — dlatego tekst zostaje czytelny
							niezależnie od kadru.
						</Typography>
					</Section>
				</div>

				<Typography
					variant='caption'
					tone='muted'
				>
					`fullHeight` dokłada `min-h-svh` i wyśrodkowanie w pionie — jednostka `svh`, a nie
					`vh`, bo na telefonie pasek adresu chowa się przy przewijaniu i `100vh` daje sekcję
					wyższą niż widoczny ekran.
				</Typography>
			</ShowcaseItem>

			<ShowcaseItem
				title='SectionHeading'
				note='etykieta z numerem, tytuł i lead — „as" ustala poziom nagłówka, wygląd zostaje ten sam'
				className='flex-col items-stretch gap-8'
			>
				{sectionHeadingLayouts.map(layout => (
					<Sample
						key={layout}
						label={layout}
					>
						<SectionHeading
							layout={layout}
							eyebrow='01 · Jak to działa'
							title='Zamiast skuwać podłogę, wycinamy w niej rowki.'
							lead='Frezarka z odkurzaczem wycina rowki na grubość rury.'
						/>
					</Sample>
				))}
				<Sample label='eyebrowTone="cold" z akcją'>
					<SectionHeading
						layout='split'
						eyebrow='02 · Ostatnie realizacje'
						eyebrowTone='cold'
						title='Sprawdź, czy robiliśmy już dom podobny do Twojego.'
						action={<Button variant='outline'>Wszystkie realizacje</Button>}
					/>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='PageHero'
				note='zdjęcie wchodzi pod pływający nagłówek — na stronie stoi na samej górze'
				className='flex-col items-stretch'
			>
				<PageHero
					image={SAMPLE_IMAGE}
					eyebrow='Usługa · cała Polska'
					title='Frezowanie pod ogrzewanie podłogowe.'
					lead='Wyfrezujemy rowki w wylewce, którą już masz.'
					className='mt-0 min-h-0 pt-10 md:min-h-0 lg:mt-0 lg:min-h-0 lg:pt-10'
				>
					<Button size='xl'>Darmowa wycena</Button>
				</PageHero>
			</ShowcaseItem>

			<ShowcaseItem
				title='CtaBand'
				className='flex-col items-stretch'
			>
				<CtaBand
					title='Podaj metraż, a oddzwonimy z ceną.'
					action={
						<Button
							variant='dark'
							size='xl'
						>
							Darmowa wycena
						</Button>
					}
				/>
			</ShowcaseItem>

			<ShowcaseItem
				title='Typography — polimorfizm'
				note='wariant niesie wygląd, props "as" semantykę'
				className='flex-col items-stretch gap-4'
			>
				<Sample label='as="h2" variant="h2" — zgodne'>
					<Typography
						as='h2'
						variant='h2'
					>
						Nagłówek sekcji
					</Typography>
				</Sample>
				<Sample label='as="h2" variant="h5" — mały wizualnie, poprawny semantycznie'>
					<Typography
						as='h2'
						variant='h5'
					>
						Nagłówek sekcji
					</Typography>
				</Sample>
				<Sample label='variant="overline" — nadtytuł'>
					<Typography variant='overline'>Kategoria</Typography>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Prose'
				note='style treści z Markdowna — jedyne miejsce opisujące wygląd wpisów bloga'
				className='flex-col items-stretch'
			>
				<Prose>
					<h2>Nagłówek w treści</h2>
					<p>
						Akapit ze <strong>wyróżnieniem</strong>, <code>kodem w tekście</code> i{' '}
						<a href='#layout'>linkiem</a>.
					</p>
					<ul>
						<li>Pozycja listy</li>
						<li>Druga pozycja</li>
					</ul>
					<blockquote>Cytat wyróżniony obramowaniem od strony początku wiersza.</blockquote>
				</Prose>
			</ShowcaseItem>

			<ShowcaseItem
				title='Sidebar'
				note='panel boczny z własnym providerem — pełna szerokość, więc próbka jest przycięta ramką'
				className='flex-col items-stretch p-0'
			>
				{/* `transform-gpu` NIE jest optymalizacją — to jedyna rzecz, która
					trzyma tę próbkę na miejscu. Panel jest `position: fixed`, a element
					z transformacją staje się dla niego blokiem zawierającym, więc
					`inset-y-0` liczy się od ramki, a nie od okna. */}
				<div className='relative h-96 transform-gpu overflow-hidden rounded-xl border'>
					<SidebarProvider className='min-h-0'>
						{/* `collapsible='icon'` — dopiero wtedy `SidebarTrigger` i `SidebarRail`
							mają co zwijać. `h-full` wypiera `h-svh` z klasy bazowej przez
							tailwind-merge; bez tego stopka panelu ląduje pod ramką podglądu. */}
						<Sidebar
							collapsible='icon'
							className='h-full'
						>
							<SidebarHeader className='gap-2 px-2 py-2'>
								<Typography
									variant='bodySm'
									className='px-1 font-semibold group-data-[collapsible=icon]:hidden'
								>
									Panel
								</Typography>
								{/* Pole wyszukiwania dostrojone do panelu — węższe i bez własnego
								    tła, żeby nie tworzyło drugiej ramki wewnątrz pierwszej. */}
								<SidebarInput
									placeholder='Szukaj…'
									aria-label='Szukaj w panelu'
									className='group-data-[collapsible=icon]:hidden'
								/>
							</SidebarHeader>

							<SidebarSeparator />

							<SidebarContent>
								<SidebarGroup>
									<SidebarGroupLabel>Sekcje</SidebarGroupLabel>
									{/* Akcja całej grupy — „dodaj", „zwiń". Stoi w rogu nagłówka
									    grupy, poza listą pozycji. */}
									<SidebarGroupAction aria-label='Dodaj sekcję'>
										<Plus />
									</SidebarGroupAction>
									<SidebarGroupContent>
										<SidebarMenu>
											{SIDEBAR_ITEMS.map(item => (
												<SidebarMenuItem key={item.label}>
													<SidebarMenuButton isActive={item.active}>
														<item.icon />
														<span>{item.label}</span>
													</SidebarMenuButton>
													{/*
													 * `SidebarMenuBadge` i `SidebarMenuAction` są
													 * pozycjonowane absolutnie WZGLĘDEM pozycji, nie
													 * wewnątrz przycisku. Inaczej byłby to przycisk
													 * w przycisku, czego HTML nie dopuszcza — a licznik
													 * wszedłby do nazwy dostępnej pozycji.
													 */}
													{item.badge && (
														<SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
													)}
													{!item.badge && (
														<SidebarMenuAction
															showOnHover
															aria-label={`Więcej opcji: ${item.label}`}
														>
															<MoreHorizontal />
														</SidebarMenuAction>
													)}
												</SidebarMenuItem>
											))}

											{/* Podmenu jednego poziomu niżej — własna lista, nie
											    wcięcie klasą na pozycji nadrzędnej. */}
											<SidebarMenuItem>
												<SidebarMenuButton>
													<FileText />
													<span>Raporty</span>
												</SidebarMenuButton>
												<SidebarMenuSub>
													<SidebarMenuSubItem>
														<SidebarMenuSubButton>Miesięczne</SidebarMenuSubButton>
													</SidebarMenuSubItem>
													<SidebarMenuSubItem>
														<SidebarMenuSubButton isActive>
															Kwartalne
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												</SidebarMenuSub>
											</SidebarMenuItem>
										</SidebarMenu>
									</SidebarGroupContent>
								</SidebarGroup>

								<SidebarGroup>
									<SidebarGroupLabel>Wczytywanie</SidebarGroupLabel>
									<SidebarGroupContent>
										{/* Szkielet pozycji na czas pobierania menu. Losuje szerokość
										    przy każdym renderze, żeby lista nie wyglądała na siatkę
										    identycznych prostokątów. */}
										<SidebarMenu>
											{[0, 1].map(index => (
												<SidebarMenuItem key={index}>
													<SidebarMenuSkeleton showIcon />
												</SidebarMenuItem>
											))}
										</SidebarMenu>
									</SidebarGroupContent>
								</SidebarGroup>
							</SidebarContent>

							{/* Tekst stopki znika przy zwinięciu do ikon — w kolumnie szerokiej
							    na jedną ikonę łamałby się na dwa wiersze. */}
							<SidebarFooter className='px-3 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden'>
								wersja 1.0
							</SidebarFooter>

							<SidebarRail />
						</Sidebar>

						<SidebarInset className='flex flex-col gap-3 p-4'>
							<SidebarTrigger />
							<Typography variant='bodySm'>
								Treść obok panelu. <code>SidebarInset</code> dopasowuje szerokość do stanu
								panelu, więc układ nie wymaga ręcznych marginesów. Przycisk wyżej zwija
								panel do samych ikon.
							</Typography>
						</SidebarInset>
					</SidebarProvider>
				</div>
			</ShowcaseItem>

			<ShowcaseItem
				title='DirectionProvider'
				note='kierunek pisma dla poddrzewa — sam nie renderuje niczego, skutek widać na komponentach w środku'
				className='flex-col items-stretch gap-4'
			>
				<Typography
					variant='bodySm'
					tone='muted'
				>
					Cały starter używa właściwości logicznych (<code>ps-*</code>, <code>border-s</code>,{' '}
					<code>text-start</code>) zamiast lewej i prawej, więc wersja arabska czy hebrajska
					nie wymaga osobnych stylów. Poniżej ta sama treść w obu kierunkach.
				</Typography>

				<div className='grid gap-3 sm:grid-cols-2'>
					{(['ltr', 'rtl'] as const).map(direction => (
						<Sample
							key={direction}
							label={direction}
						>
							<DirectionProvider direction={direction}>
								<div
									dir={direction}
									className='w-full rounded-lg border p-3'
								>
									<Prose size='sm'>
										<blockquote>
											Cytat i obramowanie po stronie początku wiersza.
										</blockquote>
										<ul>
											<li>Wcięcie listy też zmienia stronę</li>
										</ul>
									</Prose>
								</div>
							</DirectionProvider>
						</Sample>
					))}
				</div>
			</ShowcaseItem>
		</Showcase>
	)
}
