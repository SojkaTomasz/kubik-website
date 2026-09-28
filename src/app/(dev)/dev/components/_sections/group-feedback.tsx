'use client'

import {
	CheckCircle2,
	CircleAlert,
	FileText,
	Info,
	type LucideIcon,
	TriangleAlert,
	X,
} from 'lucide-react'

import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
	alertVariants,
} from '@/components/ui/alert'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { variantKeys } from '@/lib/cva'

/* Listy czytane z komponentów — patrz komentarz w group-actions.tsx. */
const badgeVariantList = variantKeys(badgeVariants, 'variant')
const badgeRoundings = variantKeys(badgeVariants, 'rounded')
const alertVariantList = variantKeys(alertVariants, 'variant')

/** Ikona pasująca do wariantu alertu. Nowy wariant bez wpisu dostaje Info. */
const alertIcons: Record<string, LucideIcon> = {
	destructive: CircleAlert,
	success: CheckCircle2,
	warning: TriangleAlert,
	info: Info,
}

export function GroupFeedback() {
	return (
		<Showcase
			id='feedback'
			index='03'
			title='Komunikaty i stany'
			description='Alert komunikuje stan strony i zostaje na widoku; toast potwierdza skutek akcji i znika. Pomylenie ich to najczęstszy błąd w tej warstwie — komunikat o błędzie walidacji w toaście znika, zanim użytkownik zdąży poprawić formularz.'
		>
			<ShowcaseItem
				title='Alert'
				className='flex-col items-stretch gap-3'
			>
				{alertVariantList.map(variant => {
					const Icon = alertIcons[variant] ?? Info

					return (
						<Alert
							key={variant}
							variant={variant}
						>
							<Icon />
							<AlertTitle>Wariant &bdquo;{variant}&rdquo;</AlertTitle>
							<AlertDescription>
								Kolor jest tu nośnikiem znaczenia, więc ikona jest obowiązkowa — sam odcień
								tła nie dociera do osób nierozróżniających barw.
							</AlertDescription>
						</Alert>
					)
				})}
			</ShowcaseItem>

			<ShowcaseItem
				title='Alert z akcją'
				note='AlertAction — róg komunikatu, zwykle zamknięcie'
				className='flex-col items-stretch'
			>
				{/*
				 * `AlertAction` jest pozycjonowany absolutnie w prawym górnym rogu,
				 * więc stoi POZA układem tekstu i nie skraca opisu. Przycisk wstawiony
				 * między tytuł a opis rozbijałby siatkę, na której stoi ikona.
				 */}
				<Alert variant='info'>
					<Info />
					<AlertTitle>Nowa wersja startera</AlertTitle>
					<AlertDescription>
						Zmiany opisuje CHANGELOG. Aktualizacja nie wymaga migracji danych.
					</AlertDescription>
					<AlertAction>
						<Button
							variant='ghost'
							size='icon-xs'
							aria-label='Zamknij komunikat'
						>
							<X />
						</Button>
					</AlertAction>
				</Alert>
			</ShowcaseItem>

			<ShowcaseItem
				title='Badge'
				note='status lub kategoria — nigdy akcja do kliknięcia'
			>
				{badgeVariantList.map(variant => (
					<Sample
						key={variant}
						label={variant}
					>
						<Badge variant={variant}>Etykieta</Badge>
					</Sample>
				))}
				<Sample label='z ikoną'>
					<Badge variant='secondary'>
						<CheckCircle2 />
						Opłacone
					</Badge>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Badge — zaokrąglenie'
				note='oś rounded, niezależna od wariantu koloru'
			>
				{badgeRoundings.map(rounded => (
					<Sample
						key={rounded}
						label={rounded}
					>
						<Badge rounded={rounded}>Etykieta</Badge>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Progress'
				className='flex-col items-stretch gap-4'
			>
				<Progress
					value={30}
					aria-label='Postęp wgrywania pliku'
				/>
				<Progress
					value={72}
					aria-label='Postęp konfiguracji konta'
				/>
			</ShowcaseItem>

			<ShowcaseItem
				title='Progress z podpisem'
				note='ProgressLabel + ProgressValue — nazwa dostępna z etykiety, bez aria-label'
				className='flex-col items-stretch gap-4'
			>
				{/* `aria-labelledby` JAWNIE: samoczynne wiązanie Base UI nie dociera
					w tej kompozycji do korzenia i pasek zostaje bezimienny
					(axe: `aria-progressbar-name`). */}
				<Progress
					value={30}
					aria-labelledby='progress-upload-label'
				>
					<ProgressLabel id='progress-upload-label'>Wgrywanie pliku</ProgressLabel>
					<ProgressValue />
				</Progress>
				<Progress
					value={72}
					aria-labelledby='progress-setup-label'
				>
					<ProgressLabel id='progress-setup-label'>Konfiguracja konta</ProgressLabel>
					{/*
					 * Funkcja dostaje SFORMATOWANY ciąg jako pierwszy argument, a surową
					 * liczbę dopiero jako drugi. Licząc na pierwszym, dostaje się
					 * działanie arytmetyczne na napisie „72%".
					 */}
					<ProgressValue>
						{(_formatted, value) => `zostało ${100 - (value ?? 0)}%`}
					</ProgressValue>
				</Progress>
			</ShowcaseItem>

			<ShowcaseItem
				title='Skeleton'
				note='zastępuje treść na czas ładowania — kształtem, nie kręcącym się kółkiem'
				className='flex-col items-stretch gap-3'
			>
				<div className='flex items-center gap-3'>
					<Skeleton className='size-10 rounded-full' />
					<div className='flex flex-1 flex-col gap-2'>
						<Skeleton className='h-4 w-1/3' />
						<Skeleton className='h-3 w-2/3' />
					</div>
				</div>
			</ShowcaseItem>

			<ShowcaseItem
				title='Empty'
				note='stan pusty powinien podpowiadać następny krok, nie tylko stwierdzać brak'
				className='flex-col items-stretch'
			>
				<Empty className='border'>
					<EmptyHeader>
						<EmptyMedia variant='icon'>
							<FileText />
						</EmptyMedia>
						<EmptyTitle>Brak dokumentów</EmptyTitle>
						<EmptyDescription>
							Nie dodano jeszcze żadnego pliku do tego projektu.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button size='sm'>Dodaj pierwszy dokument</Button>
					</EmptyContent>
				</Empty>
			</ShowcaseItem>

			<ShowcaseItem
				title='Toast'
				note='Toaster jest zamontowany w Providers — tutaj tylko go wywołujemy'
			>
				<Button
					variant='outline'
					onClick={() =>
						toast.add({ title: 'Zapisano', description: 'Zmiany są już widoczne.' })
					}
				>
					Powiadomienie
				</Button>
				<Button
					variant='outline'
					onClick={() =>
						toast.add({
							title: 'Nie udało się wysłać',
							description: 'Spróbuj ponownie za chwilę.',
							type: 'error',
						})
					}
				>
					Powiadomienie o błędzie
				</Button>
			</ShowcaseItem>

			<ShowcaseItem
				title='Tooltip'
				note='wyłącznie treść uzupełniająca — nigdy informacja niezbędna do działania'
			>
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant='outline'
								size='icon'
								aria-label='Ostrzeżenie'
							>
								<TriangleAlert />
							</Button>
						}
					/>
					<TooltipContent>Faktura wymaga uzupełnienia NIP-u</TooltipContent>
				</Tooltip>
			</ShowcaseItem>
		</Showcase>
	)
}
