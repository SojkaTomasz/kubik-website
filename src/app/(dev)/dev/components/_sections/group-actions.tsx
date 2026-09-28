import { ArrowRight, Bold, Copy, Download, Italic, RefreshCw, Send, Underline } from 'lucide-react'

import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import { Button } from '@/components/ui/button'
import { type ButtonIconEffect, buttonVariants } from '@/components/ui/button.variants'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Spinner } from '@/components/ui/spinner'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { variantKeys } from '@/lib/cva'

/*
 * Listy wariantów czytane wprost z komponentu, nie przepisane tutaj.
 *
 * Dopisanie wariantu w `buttonVariants` pokazuje go na tej stronie od razu.
 * Ręczna kopia rozjeżdżałaby się po cichu — nikt nie porównuje dwóch list,
 * a TypeScript nie ma czego sprawdzić, skoro obie są poprawne osobno.
 * Test e2e pilnuje, żeby liczba próbek na stronie zgadzała się z komponentem.
 */
const buttonVariantList = variantKeys(buttonVariants, 'variant')
const allSizes = variantKeys(buttonVariants, 'size')
const radii = variantKeys(buttonVariants, 'radius')

/** Rozmiary ikonowe rozpoznajemy po prefiksie — reszta to rozmiary z tekstem. */
const iconSizes = allSizes.filter(size => size.startsWith('icon'))
const buttonSizes = allSizes.filter(size => !size.startsWith('icon'))

const iconEffects: readonly (readonly [ButtonIconEffect, string])[] = [
	['none', 'bez animacji'],
	['shiftRight', 'strzałka „dalej"'],
	['shiftLeft', 'strzałka „wstecz"'],
	['scale', 'podkreślenie akcji'],
	['translateY', 'pobieranie, wysyłka w górę'],
	['rotate', 'odświeżanie, ponowna próba'],
] as const

export function GroupActions() {
	return (
		<Showcase
			id='actions'
			index='01'
			title='Akcje'
			description='Jeden komponent Button obsługuje przycisk i link. Podanie href zmienia element wynikowy — next/link dla adresów wewnętrznych, kotwica z płynnym przewijaniem dla #hash, zewnętrzny link z rel zabezpieczającym okno źródłowe. Dzięki temu widok nie musi wiedzieć, czym dana akcja jest technicznie.'
		>
			<ShowcaseItem
				title='Warianty'
				note='components/ui/button.tsx'
			>
				{buttonVariantList.map(variant => (
					<Sample
						key={variant}
						label={variant}
					>
						<Button variant={variant}>Przycisk</Button>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem title='Rozmiary'>
				{buttonSizes.map(size => (
					<Sample
						key={size}
						label={size}
					>
						<Button size={size}>Przycisk</Button>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Rozmiary ikonowe'
				note='przycisk bez tekstu wymaga aria-label — inaczej czytnik ekranu przeczyta samą nazwę pliku SVG'
			>
				{iconSizes.map(size => (
					<Sample
						key={size}
						label={size}
					>
						<Button
							size={size}
							variant='outline'
							aria-label='Kopiuj'
							icon={<Copy />}
						/>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Zaokrąglenie'
				note='domyślne "theme" bierze wartość z tokenu --button-radius'
			>
				{radii.map(radius => (
					<Sample
						key={radius}
						label={radius}
					>
						<Button
							variant='outline'
							radius={radius}
						>
							Przycisk
						</Button>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Ikona i jej pozycja'
				note='props icon + iconPosition — ikona nie musi być wpisywana w children'
			>
				<Sample label='iconPosition="left"'>
					<Button icon={<Download />}>Pobierz</Button>
				</Sample>
				<Sample label='iconPosition="right"'>
					<Button
						variant='outline'
						icon={<ArrowRight />}
						iconPosition='right'
					>
						Dalej
					</Button>
				</Sample>
				<Sample label='sama ikona'>
					<Button
						size='icon'
						variant='ghost'
						aria-label='Odśwież'
						icon={<RefreshCw />}
					/>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Animacja ikony'
				note='najedź kursorem — efekt reaguje na hover całego przycisku, nie samej ikony'
			>
				{iconEffects.map(([effect, usage]) => (
					<Sample
						key={effect}
						label={`${effect} — ${usage}`}
					>
						<Button
							variant='outline'
							icon={<ArrowRight />}
							iconPosition='right'
							iconEffect={effect}
						>
							Akcja
						</Button>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Stan ładowania'
				note='isLoading blokuje przycisk, ustawia aria-busy i podmienia ikonę na spinner'
			>
				<Sample label='z ikoną → spinner w jej miejscu'>
					<Button
						icon={<Send />}
						isLoading
					>
						Wysyłanie
					</Button>
				</Sample>
				<Sample label='bez ikony → spinner przed tekstem'>
					<Button
						variant='outline'
						isLoading
					>
						Zapisywanie
					</Button>
				</Sample>
				<Sample label='stan spoczynku dla porównania'>
					<Button icon={<Send />}>Wyślij</Button>
				</Sample>
				<Sample label='zablokowany'>
					<Button disabled>Niedostępny</Button>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Przycisk jako link'
				note='element wynikowy dobiera się z kształtu href'
			>
				<Sample label='href="/dev" → next/link'>
					<Button href='/dev'>Link wewnętrzny</Button>
				</Sample>
				<Sample label='href="#actions" → płynne przewijanie'>
					<Button
						href='#actions'
						variant='outline'
					>
						Kotwica
					</Button>
				</Sample>
				<Sample label='href="https://…" → nowa karta + rel'>
					<Button
						href='https://ui.shadcn.com'
						variant='secondary'
						icon={<ArrowRight />}
						iconPosition='right'
						iconEffect='shiftRight'
					>
						Link zewnętrzny
					</Button>
				</Sample>
				<Sample label='href="mailto:…" → klient poczty'>
					<Button
						href='mailto:kontakt@example.com'
						variant='ghost'
					>
						Napisz do nas
					</Button>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='ButtonGroup'
				note='przyciski stykające się bokami — jedna decyzja, kilka opcji'
			>
				<ButtonGroup>
					<Button variant='outline'>Lewy</Button>
					<Button variant='outline'>Środkowy</Button>
					<Button variant='outline'>Prawy</Button>
				</ButtonGroup>
				<ButtonGroup>
					<ButtonGroupText>PLN</ButtonGroupText>
					<ButtonGroupSeparator />
					<Button variant='outline'>Przelicz</Button>
				</ButtonGroup>
			</ShowcaseItem>

			<ShowcaseItem
				title='Toggle i ToggleGroup'
				note='przełącznik stanu włączony/wyłączony, nie akcja'
			>
				<Sample label='Toggle'>
					<Toggle aria-label='Pogrubienie'>
						<Bold />
					</Toggle>
				</Sample>
				{/*
				 * Dzieckiem grupy jest `ToggleGroupItem`, nie `Toggle`. Różnica jest
				 * niewidoczna do pierwszej zmiany osi: `ToggleGroupItem` czyta
				 * `variant`, `size` i `spacing` z kontekstu grupy, więc `spacing={0}`
				 * niżej skleja przyciski w jeden pasek i zdejmuje wewnętrzne
				 * obramowania. Grupa złożona z `Toggle` wygląda tak samo dopóty,
				 * dopóki wszystko zostaje na wartościach domyślnych.
				 */}
				<Sample label='ToggleGroup'>
					<ToggleGroup>
						<ToggleGroupItem aria-label='Pogrubienie'>
							<Bold />
						</ToggleGroupItem>
						<ToggleGroupItem aria-label='Kursywa'>
							<Italic />
						</ToggleGroupItem>
						<ToggleGroupItem aria-label='Podkreślenie'>
							<Underline />
						</ToggleGroupItem>
					</ToggleGroup>
				</Sample>
				<Sample label='ToggleGroup — spacing={0}, variant=outline'>
					<ToggleGroup
						variant='outline'
						spacing={0}
					>
						<ToggleGroupItem aria-label='Pogrubienie'>
							<Bold />
						</ToggleGroupItem>
						<ToggleGroupItem aria-label='Kursywa'>
							<Italic />
						</ToggleGroupItem>
						<ToggleGroupItem aria-label='Podkreślenie'>
							<Underline />
						</ToggleGroupItem>
					</ToggleGroup>
				</Sample>
				<Sample label='ToggleGroup — orientation=vertical'>
					<ToggleGroup orientation='vertical'>
						<ToggleGroupItem aria-label='Pogrubienie'>
							<Bold />
						</ToggleGroupItem>
						<ToggleGroupItem aria-label='Kursywa'>
							<Italic />
						</ToggleGroupItem>
					</ToggleGroup>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Kbd i Spinner'
				note='Kbd opisuje skrót klawiszowy, nie stylizuje kodu'
			>
				{/*
				 * Skróty składa `KbdGroup`, nie ręczny `<span>` z klasami. Właśnie
				 * takim obejściem kończy się komponent, którego nie widać na tej
				 * stronie — a `KbdGroup` istniał w rejestrze od początku.
				 */}
				<Sample label='Kbd w KbdGroup'>
					<KbdGroup>
						<Kbd>Ctrl</Kbd>
						<Kbd>K</Kbd>
					</KbdGroup>
				</Sample>
				<Sample label='Spinner'>
					<Spinner />
				</Sample>
			</ShowcaseItem>
		</Showcase>
	)
}
