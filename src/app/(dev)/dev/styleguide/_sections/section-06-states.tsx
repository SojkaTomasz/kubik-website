import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button.variants'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { Typography } from '@/components/ui/typography'
import { variantKeys } from '@/lib/cva'

/* Listy czytane z komponentu — patrz komentarz w group-actions.tsx. */
const variants = variantKeys(buttonVariants, 'variant')
const sizes = variantKeys(buttonVariants, 'size').filter(size => !size.startsWith('icon'))

export function SectionStates() {
	return (
		<Showcase
			id='states'
			index='06'
			title='Stany interaktywne'
			description='Najczęściej zaniedbywana część systemu — projekty przechodzą przegląd w stanie spoczynku, a rozjeżdżają się na hover i focus. Stany deklaratywne (disabled, invalid, loading) są tu pokazane wprost; hover i focus sprawdź myszą i klawiszem Tab, bo tylko wtedy widzisz to, co zobaczy użytkownik.'
		>
			<ShowcaseItem
				title='Przyciski — wszystkie warianty'
				note='najedź i przejdź Tabem, żeby zobaczyć hover i pierścień fokusa'
				className='flex-col items-stretch gap-4'
			>
				{variants.map(variant => (
					<div
						key={variant}
						className='flex flex-wrap items-center gap-3'
					>
						<span className='w-24 shrink-0 font-mono text-[11px] text-muted-foreground'>
							{variant}
						</span>
						<Button variant={variant}>Domyślny</Button>
						<Button
							variant={variant}
							disabled
						>
							Zablokowany
						</Button>
						<Button
							variant={variant}
							disabled
						>
							<Spinner />
							Wysyłanie
						</Button>
					</div>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Rozmiary przycisku'
				note='rozmiary ikonowe są kwadratowe — używaj ich do przycisków bez tekstu'
			>
				{sizes.map(size => (
					<Sample
						key={size}
						label={size}
					>
						<Button size={size}>Przycisk</Button>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Pola formularza'
				className='flex-col items-stretch gap-4'
			>
				<div className='grid gap-4 sm:grid-cols-2'>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='sg-input'>Stan spoczynku</Label>
						<Input
							id='sg-input'
							placeholder='Jan Kowalski'
						/>
					</div>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='sg-input-filled'>Wypełnione</Label>
						<Input
							id='sg-input-filled'
							defaultValue='Zażółć gęślą jaźń'
						/>
					</div>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='sg-input-invalid'>Błąd walidacji</Label>
						<Input
							id='sg-input-invalid'
							aria-invalid
							defaultValue='niepoprawny@'
						/>
						<Typography
							variant='caption'
							tone='destructive'
						>
							Podaj poprawny adres e-mail.
						</Typography>
					</div>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='sg-input-disabled'>Zablokowane</Label>
						<Input
							id='sg-input-disabled'
							disabled
							defaultValue='Niedostępne'
						/>
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<Label htmlFor='sg-textarea'>Pole wieloliniowe</Label>
					<Textarea
						id='sg-textarea'
						placeholder='Treść wiadomości…'
						rows={3}
					/>
				</div>
			</ShowcaseItem>

			<ShowcaseItem
				title='Karty'
				note='karta klikalna musi mieć widoczny fokus — sprawdź Tabem'
			>
				<Card className='w-64'>
					<CardContent>
						<Typography variant='bodySm'>Karta w spoczynku</Typography>
					</CardContent>
				</Card>
				<Card className='w-64 cursor-pointer transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'>
					<CardContent>
						<Typography variant='bodySm'>Karta interaktywna</Typography>
					</CardContent>
				</Card>
			</ShowcaseItem>
		</Showcase>
	)
}
