'use client'

import { ChevronDown } from 'lucide-react'

import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Typography } from '@/components/ui/typography'

const faq = [
	{
		question: 'Ile trwa realizacja strony?',
		answer:
			'Typowa strona wizytówkowa powstaje w dwa do czterech tygodni, licząc od zatwierdzenia projektu graficznego.',
	},
	{
		question: 'Czy mogę samodzielnie edytować treści?',
		answer:
			'Tak. Treści trzymamy w plikach MDX w repozytorium, a w projektach wymagających panelu podłączamy system CMS.',
	},
	{
		question: 'Co z pozycjonowaniem?',
		answer:
			'Warstwa techniczna SEO — metadane, dane strukturalne, sitemap i szybkość ładowania — jest częścią każdego wdrożenia.',
	},
] as const

const OFFER_LINKS = [
	{ label: 'Strony wizytówki', hint: 'Jedna sekcja, szybkie wdrożenie', href: '#navigation' },
	{ label: 'Sklepy', hint: 'Katalog, koszyk, płatności', href: '#navigation' },
	{ label: 'Aplikacje', hint: 'Panel klienta i integracje', href: '#navigation' },
]

export function GroupNavigation() {
	return (
		<Showcase
			id='navigation'
			index='05'
			title='Nawigacja i ujawnianie treści'
			description='Akordeon i zakładki chowają treść, więc obniżają jej wagę — nie wkładaj tam niczego, co użytkownik musi zobaczyć. Wyjątkiem jest FAQ: tam zwijanie jest oczekiwane i pomaga skanować listę pytań.'
		>
			<ShowcaseItem
				title='Breadcrumb'
				note='Google pokazuje okruszki zamiast surowego adresu — zestaw z breadcrumbJsonLd()'
				className='flex-col items-stretch'
			>
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href='/'>Start</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href='/dev'>Dev</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Komponenty</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				{/*
				 * `BreadcrumbEllipsis` zastępuje ŚRODEK długiej ścieżki. Skracamy
				 * środek, a nie koniec: pierwsze i ostatnie ogniwo niosą całą
				 * orientację — gdzie jestem i skąd zacząłem — a poziomy pośrednie
				 * rzadko coś wnoszą. Wielokropek ma `aria-hidden` i `sr-only`
				 * z podpisem, więc czytnik ekranu nie czyta trzech kropek.
				 */}
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href='/'>Start</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbEllipsis />
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href='/dev'>Dev</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Komponenty</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</ShowcaseItem>

			<ShowcaseItem
				title='Pagination'
				className='flex-col items-stretch'
			>
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious href='#navigation' />
						</PaginationItem>
						<PaginationItem>
							<PaginationLink href='#navigation'>1</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationLink
								href='#navigation'
								isActive
							>
								2
							</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationLink href='#navigation'>3</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationEllipsis />
						</PaginationItem>
						<PaginationItem>
							<PaginationNext href='#navigation' />
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</ShowcaseItem>

			<ShowcaseItem
				title='Tabs'
				className='flex-col items-stretch'
			>
				<Tabs defaultValue='opis'>
					<TabsList>
						<TabsTrigger value='opis'>Opis</TabsTrigger>
						<TabsTrigger value='parametry'>Parametry</TabsTrigger>
						<TabsTrigger value='dostawa'>Dostawa</TabsTrigger>
					</TabsList>
					<TabsContent value='opis'>
						<Typography variant='bodySm'>
							Zakładki dzielą treść równorzędną. Jeśli któraś zakładka jest ważniejsza od
							pozostałych, jej treść powinna być widoczna od razu.
						</Typography>
					</TabsContent>
					<TabsContent value='parametry'>
						<Typography variant='bodySm'>Dane techniczne produktu.</Typography>
					</TabsContent>
					<TabsContent value='dostawa'>
						<Typography variant='bodySm'>Czas i koszt wysyłki.</Typography>
					</TabsContent>
				</Tabs>
			</ShowcaseItem>

			<ShowcaseItem
				title='Accordion'
				note='naturalne miejsce na FAQ — zestaw z faqJsonLd()'
				className='flex-col items-stretch'
			>
				<Accordion className='w-full'>
					{faq.map(item => (
						<AccordionItem
							key={item.question}
							value={item.question}
						>
							<AccordionTrigger>{item.question}</AccordionTrigger>
							<AccordionContent>{item.answer}</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</ShowcaseItem>

			<ShowcaseItem
				title='Collapsible'
				note='pojedyncza sekcja do rozwinięcia, bez grupy'
			>
				<Sample label='Collapsible'>
					<Collapsible>
						<CollapsibleTrigger
							render={
								<Button variant='outline'>
									Szczegóły
									<ChevronDown />
								</Button>
							}
						/>
						<CollapsibleContent className='pt-3'>
							<Typography variant='bodySm'>
								Treść dodatkowa, ukryta do momentu rozwinięcia.
							</Typography>
						</CollapsibleContent>
					</Collapsible>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='NavigationMenu'
				note='rozwijane menu główne — treść w panelu, nie tylko lista linków'
				className='min-h-40 items-start'
			>
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuTrigger>Oferta</NavigationMenuTrigger>
							<NavigationMenuContent className='w-80'>
								<ul className='flex flex-col gap-1'>
									{OFFER_LINKS.map(link => (
										<li key={link.label}>
											<NavigationMenuLink
												href={link.href}
												className='flex flex-col gap-0.5 rounded-md p-2 hover:bg-muted'
											>
												<span className='text-sm font-medium'>{link.label}</span>
												<span className='text-xs text-muted-foreground'>
													{link.hint}
												</span>
											</NavigationMenuLink>
										</li>
									))}
								</ul>
							</NavigationMenuContent>
						</NavigationMenuItem>

						<NavigationMenuItem>
							<NavigationMenuLink href='#navigation'>Kontakt</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</ShowcaseItem>
		</Showcase>
	)
}
