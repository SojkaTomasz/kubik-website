'use client'

import { Copy, Scissors, Settings, Trash2, TriangleAlert, User } from 'lucide-react'
import { useState } from 'react'

import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from '@/components/ui/command'
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarGroup,
	MenubarItem,
	MenubarLabel,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from '@/components/ui/menubar'
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import { Typography } from '@/components/ui/typography'

export function GroupOverlays() {
	const [commandValue, setCommandValue] = useState('')
	const [paletteOpen, setPaletteOpen] = useState(false)

	return (
		<Showcase
			id='overlays'
			index='04'
			title='Warstwy nakładane'
			description='Dialog przerywa pracę i wymaga decyzji; Sheet i Drawer dokładają kontekst z boku lub od dołu; Popover i HoverCard tylko uzupełniają. Im mocniej warstwa przerywa, tym rzadziej powinna się pojawiać — AlertDialog zarezerwuj dla działań nieodwracalnych.'
		>
			<ShowcaseItem title='Dialog'>
				<Dialog>
					<DialogTrigger render={<Button variant='outline'>Otwórz dialog</Button>} />
					<DialogContent className='sm:max-w-md'>
						<DialogHeader>
							<DialogTitle>Edycja profilu</DialogTitle>
							<DialogDescription>
								Zmiany zapiszą się po zatwierdzeniu formularza.
							</DialogDescription>
						</DialogHeader>
						<div className='flex flex-col gap-2'>
							<Label htmlFor='dlg-name'>Nazwa wyświetlana</Label>
							<Input
								id='dlg-name'
								defaultValue='Jan Kowalski'
							/>
						</div>
						{/*
						 * „Anuluj" to `DialogClose`, nie zwykły `Button`. Sam przycisk
						 * niczego nie zamyka — dialog zostawał otwarty, bo nic nie
						 * odwoływało się do jego stanu. `render` podmienia element
						 * wynikowy, więc wygląd zostaje ten sam.
						 */}
						<DialogFooter>
							<DialogClose render={<Button variant='outline'>Anuluj</Button>} />
							<Button>Zapisz</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</ShowcaseItem>

			<ShowcaseItem
				title='AlertDialog'
				note='wyłącznie dla działań nieodwracalnych'
			>
				<AlertDialog>
					<AlertDialogTrigger render={<Button variant='destructive'>Usuń konto</Button>} />
					<AlertDialogContent>
						<AlertDialogHeader>
							{/* Ikona w `AlertDialogMedia`, nie luzem w nagłówku: przy
							    `size='default'` zajmuje własną kolumnę siatki i tekst
							    układa się obok niej, a nie pod spodem. */}
							<AlertDialogMedia>
								<TriangleAlert />
							</AlertDialogMedia>
							<AlertDialogTitle>Usunąć konto na stałe?</AlertDialogTitle>
							<AlertDialogDescription>
								Wszystkie dane zostaną skasowane. Tej operacji nie da się cofnąć.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Anuluj</AlertDialogCancel>
							<AlertDialogAction>Usuń bezpowrotnie</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</ShowcaseItem>

			<ShowcaseItem title='Sheet i Drawer'>
				<Sample label='Sheet — wysuwa z boku'>
					<Sheet>
						<SheetTrigger render={<Button variant='outline'>Otwórz panel</Button>} />
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Filtry</SheetTitle>
								<SheetDescription>Zawęź listę wyników.</SheetDescription>
							</SheetHeader>
							<SheetFooter>
								<SheetClose render={<Button variant='outline'>Wyczyść</Button>} />
								<Button>Pokaż wyniki</Button>
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</Sample>

				{/*
				 * `showSwipeHandle` włącza uchwyt przeciągania — `DrawerContent`
				 * renderuje wtedy `DrawerSwipeHandle` u siebie. To props szuflady,
				 * nie element do wstawienia ręcznie: uchwyt musi stanąć poza treścią,
				 * po stronie, z której szuflada wjeżdża.
				 */}
				<Sample label='Drawer — wysuwa od dołu'>
					<Drawer showSwipeHandle>
						<DrawerTrigger render={<Button variant='outline'>Otwórz szufladę</Button>} />
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>Szybkie akcje</DrawerTitle>
								<DrawerDescription>
									Wariant naturalny na urządzeniach dotykowych.
								</DrawerDescription>
							</DrawerHeader>
							<DrawerFooter>
								<Button>Zapisz</Button>
								<DrawerClose render={<Button variant='outline'>Anuluj</Button>} />
							</DrawerFooter>
						</DrawerContent>
					</Drawer>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem title='Popover i HoverCard'>
				<Sample label='Popover — otwiera się kliknięciem'>
					<Popover>
						<PopoverTrigger render={<Button variant='outline'>Ustawienia</Button>} />
						<PopoverContent className='w-72'>
							<PopoverHeader>
								<PopoverTitle>Widok listy</PopoverTitle>
								<PopoverDescription>Ustawienia zapisują się od razu.</PopoverDescription>
							</PopoverHeader>
						</PopoverContent>
					</Popover>
				</Sample>

				<Sample label='HoverCard — otwiera się najechaniem'>
					<HoverCard>
						<HoverCardTrigger render={<Button variant='link'>@jan_kowalski</Button>} />
						<HoverCardContent className='w-64'>
							<Typography variant='bodySm'>
								Podgląd profilu. Treść tylko uzupełniająca — na dotyku nie ma najechania,
								więc nic ważnego nie może istnieć wyłącznie tutaj.
							</Typography>
						</HoverCardContent>
					</HoverCard>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem title='Menu'>
				<Sample label='DropdownMenu'>
					<DropdownMenu>
						<DropdownMenuTrigger render={<Button variant='outline'>Menu</Button>} />
						{/* Pozycje NIEKONTROLOWANE: `checked` bez handlera dałoby martwą
							demonstrację. `DropdownMenuGroup` niesie `role='group'` i wiąże
							etykietę z pozycjami. */}
						<DropdownMenuContent>
							<DropdownMenuGroup>
								<DropdownMenuLabel>Konto</DropdownMenuLabel>
								<DropdownMenuItem>
									<User />
									Profil
									<DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Settings />
									Ustawienia
									<DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
								</DropdownMenuItem>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />

							<DropdownMenuGroup>
								<DropdownMenuLabel>Widok</DropdownMenuLabel>
								<DropdownMenuCheckboxItem defaultChecked>
									Pokaż pasek boczny
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem>Pokaż numery wierszy</DropdownMenuCheckboxItem>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />

							<DropdownMenuRadioGroup defaultValue='sredni'>
								<DropdownMenuLabel>Gęstość</DropdownMenuLabel>
								<DropdownMenuRadioItem value='zwarty'>Zwarta</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value='sredni'>Średnia</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value='luzny'>Luźna</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>

							<DropdownMenuSeparator />

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Udostępnij</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuItem>Skopiuj link</DropdownMenuItem>
									<DropdownMenuItem>Wyślij e-mailem</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSeparator />

							<DropdownMenuItem variant='destructive'>
								<Trash2 />
								Usuń
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</Sample>

				<Sample label='ContextMenu — prawy przycisk myszy'>
					<ContextMenu>
						<ContextMenuTrigger
							render={
								<div className='flex h-20 w-56 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground'>
									Kliknij prawym przyciskiem
								</div>
							}
						/>
						<ContextMenuContent>
							<ContextMenuGroup>
								<ContextMenuLabel>Schowek</ContextMenuLabel>
								<ContextMenuItem>
									<Copy />
									Kopiuj
									<ContextMenuShortcut>⌘C</ContextMenuShortcut>
								</ContextMenuItem>
								<ContextMenuItem>
									<Scissors />
									Wytnij
									<ContextMenuShortcut>⌘X</ContextMenuShortcut>
								</ContextMenuItem>
							</ContextMenuGroup>

							<ContextMenuSeparator />

							<ContextMenuCheckboxItem defaultChecked>Przypnij</ContextMenuCheckboxItem>

							<ContextMenuRadioGroup defaultValue='nazwa'>
								<ContextMenuLabel>Sortuj po</ContextMenuLabel>
								<ContextMenuRadioItem value='nazwa'>Nazwie</ContextMenuRadioItem>
								<ContextMenuRadioItem value='data'>Dacie</ContextMenuRadioItem>
							</ContextMenuRadioGroup>

							<ContextMenuSeparator />

							<ContextMenuSub>
								<ContextMenuSubTrigger>Przenieś do</ContextMenuSubTrigger>
								<ContextMenuSubContent>
									<ContextMenuItem>Projekty</ContextMenuItem>
									<ContextMenuItem>Archiwum</ContextMenuItem>
								</ContextMenuSubContent>
							</ContextMenuSub>

							<ContextMenuSeparator />

							<ContextMenuItem variant='destructive'>
								<Trash2 />
								Usuń
							</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Menubar'
				note='pasek menu znany z aplikacji desktopowych'
				className='flex-col items-stretch'
			>
				<Menubar>
					<MenubarMenu>
						<MenubarTrigger>Plik</MenubarTrigger>
						<MenubarContent>
							<MenubarItem>Nowy</MenubarItem>
							<MenubarItem>Otwórz</MenubarItem>
							<MenubarSeparator />
							<MenubarItem>Zapisz</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger>Edycja</MenubarTrigger>
						<MenubarContent>
							<MenubarGroup>
								<MenubarLabel>Historia</MenubarLabel>
								<MenubarItem>
									Cofnij
									<MenubarShortcut>⌘Z</MenubarShortcut>
								</MenubarItem>
								<MenubarItem>
									Ponów
									<MenubarShortcut>⇧⌘Z</MenubarShortcut>
								</MenubarItem>
							</MenubarGroup>
							<MenubarSeparator />
							<MenubarSub>
								<MenubarSubTrigger>Znajdź</MenubarSubTrigger>
								<MenubarSubContent>
									<MenubarItem>W pliku</MenubarItem>
									<MenubarItem>W projekcie</MenubarItem>
								</MenubarSubContent>
							</MenubarSub>
						</MenubarContent>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger>Widok</MenubarTrigger>
						<MenubarContent>
							<MenubarCheckboxItem defaultChecked>Pasek stanu</MenubarCheckboxItem>
							<MenubarCheckboxItem>Podgląd</MenubarCheckboxItem>
							<MenubarSeparator />
							<MenubarRadioGroup defaultValue='jasny'>
								<MenubarLabel>Motyw</MenubarLabel>
								<MenubarRadioItem value='jasny'>Jasny</MenubarRadioItem>
								<MenubarRadioItem value='ciemny'>Ciemny</MenubarRadioItem>
							</MenubarRadioGroup>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
			</ShowcaseItem>

			<ShowcaseItem
				title='Command'
				note='paleta poleceń — zwykle otwierana skrótem Ctrl+K'
				className='flex-col items-stretch'
			>
				{/* Zaznaczenie startuje PUSTE: cmdk przewija pierwszą pozycję do widoku
					przez `scrollIntoView`, a ta przewija wszystkich przodków — wejście na
					stronę otwierało ją przewiniętą w środek. */}
				<Command
					value={commandValue}
					onValueChange={setCommandValue}
					className='rounded-lg border md:max-w-md'
				>
					<CommandInput placeholder='Wpisz polecenie…' />
					<CommandList>
						<CommandEmpty>Brak wyników.</CommandEmpty>
						<CommandGroup heading='Konto'>
							<CommandItem>
								<User />
								Profil
								<CommandShortcut>⌘P</CommandShortcut>
							</CommandItem>
							<CommandItem>
								<Settings />
								Ustawienia
								<CommandShortcut>⌘,</CommandShortcut>
							</CommandItem>
						</CommandGroup>
						{/* Separator MIĘDZY grupami. cmdk ukrywa go razem z sąsiadującą
						    grupą, gdy filtrowanie nie zostawi w niej żadnej pozycji. */}
						<CommandSeparator />
						<CommandGroup heading='Dokumenty'>
							<CommandItem>
								<Copy />
								Duplikuj
							</CommandItem>
							<CommandItem>
								<Trash2 />
								Usuń
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</ShowcaseItem>

			<ShowcaseItem
				title='CommandDialog'
				note='ta sama paleta w warstwie nakładanej — postać, w której używa się jej naprawdę'
			>
				{/*
				 * `CommandDialog` sam składa `Dialog` z ukrytym nagłówkiem: warstwa
				 * nakładana musi mieć nazwę dostępną, a w palecie nie ma na nią
				 * miejsca. Dlatego tytuł i opis idą propsami, nie dziećmi.
				 */}
				<Button
					variant='outline'
					onClick={() => setPaletteOpen(true)}
				>
					Otwórz paletę
				</Button>
				<CommandDialog
					open={paletteOpen}
					onOpenChange={setPaletteOpen}
					title='Paleta poleceń'
					description='Wyszukaj polecenie do uruchomienia'
				>
					<CommandInput placeholder='Wpisz polecenie…' />
					<CommandList>
						<CommandEmpty>Brak wyników.</CommandEmpty>
						<CommandGroup heading='Nawigacja'>
							<CommandItem>
								<User />
								Przejdź do profilu
							</CommandItem>
							<CommandItem>
								<Settings />
								Przejdź do ustawień
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</CommandDialog>
			</ShowcaseItem>
		</Showcase>
	)
}
