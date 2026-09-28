'use client'

import { CreditCard, Mail, Search } from 'lucide-react'

import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxList,
	ComboboxSeparator,
	ComboboxValue,
	useComboboxAnchor,
} from '@/components/ui/combobox'
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
} from '@/components/ui/input-group'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import {
	NativeSelect,
	NativeSelectOptGroup,
	NativeSelectOption,
} from '@/components/ui/native-select'
import {
	Questionnaire,
	QuestionnaireActions,
	QuestionnaireChoice,
	QuestionnaireChoiceDescription,
	QuestionnaireChoices,
	QuestionnaireDescription,
	QuestionnaireError,
	QuestionnaireInput,
	QuestionnaireItem,
	QuestionnaireNext,
	QuestionnairePrevious,
	QuestionnaireProgress,
	QuestionnaireSkip,
	QuestionnaireSubmit,
	QuestionnaireTitle,
} from '@/components/ui/questionnaire'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const plans = [
	{ value: 'basic', label: 'Podstawowy' },
	{ value: 'pro', label: 'Rozszerzony' },
	{ value: 'enterprise', label: 'Firmowy' },
] as const

/** Lista dłuższa niż kilkanaście pozycji — czyli przypadek, w którym Select przestaje wystarczać. */
const VOIVODESHIPS = [
	'dolnośląskie',
	'kujawsko-pomorskie',
	'lubelskie',
	'lubuskie',
	'łódzkie',
	'małopolskie',
	'mazowieckie',
	'opolskie',
	'podkarpackie',
	'podlaskie',
	'pomorskie',
	'śląskie',
	'świętokrzyskie',
	'warmińsko-mazurskie',
	'wielkopolskie',
	'zachodniopomorskie',
]

/** Kolejność kroków ankiety — musi zgadzać się z nazwami QuestionnaireItem. */
const QUESTIONNAIRE_ITEMS = [{ name: 'goal' }, { name: 'languages' }, { name: 'domain' }] as const

/**
 * Województwa pogrupowane po regionie — materiał dla ComboboxGroup.
 *
 * `ComboboxCollection` czyta pozycje z propsa `items` grupy, więc lista musi
 * mieć tę strukturę; płaska tablica renderowałaby się bez nagłówków.
 */
const VOIVODESHIP_GROUPS = [
	{ region: 'Południe', items: ['dolnośląskie', 'małopolskie', 'opolskie', 'śląskie'] },
	{ region: 'Centrum', items: ['łódzkie', 'mazowieckie', 'świętokrzyskie'] },
	{ region: 'Północ', items: ['pomorskie', 'warmińsko-mazurskie', 'zachodniopomorskie'] },
] as const

/**
 * Tryb wielokrotny — osobny komponent, bo potrzebuje `useComboboxAnchor`: bez
 * niego lista kotwiczy się na polu tekstowym, które przy kilku żetonach jest
 * wąskim paskiem w rogu.
 */
function ComboboxMultipleSample() {
	const anchor = useComboboxAnchor()

	return (
		<Combobox
			items={VOIVODESHIPS}
			multiple
			defaultValue={['mazowieckie', 'pomorskie']}
		>
			<ComboboxChips
				ref={anchor}
				className='w-72'
			>
				{/*
				 * `ComboboxValue` z funkcją dostaje TABLICĘ zaznaczeń, więc to ono
				 * renderuje żetony — nie trzyma się ich w stanie widoku. Dopisanie
				 * własnego `useState` obok rozjeżdżałoby się z wyborem zrobionym
				 * klawiaturą.
				 */}
				<ComboboxValue>
					{(values: string[]) =>
						values.map(value => <ComboboxChip key={value}>{value}</ComboboxChip>)
					}
				</ComboboxValue>
				<ComboboxChipsInput
					placeholder='Dodaj województwo…'
					aria-label='Województwa'
				/>
			</ComboboxChips>
			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>Brak pasujących pozycji.</ComboboxEmpty>
				<ComboboxList>
					{(item: string) => (
						<ComboboxItem
							key={item}
							value={item}
						>
							{item}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}

/**
 * Komponent kliencki, bo część kontrolek Base UI wymaga stanu przeglądarki
 * (kalendarz, pola OTP, filtrowanie w Combobox). Strony /dev i tak nie trafiają
 * do produkcji, więc nie ma tu żadnego kosztu dla użytkownika końcowego.
 */
export function GroupForms() {
	return (
		<Showcase
			id='forms'
			index='02'
			title='Formularze'
			description='Każde pole musi mieć etykietę powiązaną przez htmlFor — placeholder etykiety nie zastępuje, bo znika po wpisaniu pierwszego znaku i przestaje istnieć dla czytników ekranu. Field opakowuje etykietę, opis i błąd w jedną, poprawnie opisaną całość.'
		>
			<ShowcaseItem
				title='Input i Textarea'
				className='flex-col items-stretch gap-4'
			>
				<div className='grid gap-4 sm:grid-cols-2'>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='c-input'>Etykieta</Label>
						<Input
							id='c-input'
							placeholder='Wpisz tekst'
						/>
					</div>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='c-input-invalid'>Stan błędu</Label>
						<Input
							id='c-input-invalid'
							aria-invalid
							defaultValue='niepoprawna wartość'
						/>
					</div>
				</div>
				<div className='flex flex-col gap-2'>
					<Label htmlFor='c-textarea'>Wiadomość</Label>
					<Textarea
						id='c-textarea'
						rows={3}
						placeholder='Treść wiadomości…'
					/>
				</div>
			</ShowcaseItem>

			<ShowcaseItem
				title='InputGroup'
				note='ikona lub akcja wewnątrz ramki pola'
				className='flex-col items-stretch gap-3'
			>
				<InputGroup>
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupInput placeholder='Szukaj…' />
				</InputGroup>
				<InputGroup>
					<InputGroupAddon>
						<Mail />
					</InputGroupAddon>
					<InputGroupInput
						placeholder='adres@example.com'
						type='email'
					/>
					<InputGroupAddon align='inline-end'>
						<InputGroupButton>Wyślij</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>

				{/*
				 * `InputGroupText` to stała treść w ramce — prefiks adresu, jednostka,
				 * waluta. Nie jest polem, więc nie wchodzi w kolejność Tab i nie da
				 * się w nim postawić kursora; tym różni się od drugiego `Input` obok.
				 */}
				<InputGroup>
					<InputGroupAddon>
						<InputGroupText>https://</InputGroupText>
					</InputGroupAddon>
					<InputGroupInput
						placeholder='example.com'
						aria-label='Adres strony'
					/>
					<InputGroupAddon align='inline-end'>
						<InputGroupText>.pl</InputGroupText>
					</InputGroupAddon>
				</InputGroup>

				{/* Ten sam układ wokół pola wielowierszowego — dodatek staje wtedy
				    w rogu ramki, nie na środku jej wysokości. */}
				<InputGroup>
					<InputGroupTextarea
						placeholder='Opisz zgłoszenie…'
						aria-label='Treść zgłoszenia'
						rows={3}
					/>
					<InputGroupAddon align='block-end'>
						<InputGroupText>Maksymalnie 500 znaków</InputGroupText>
						<InputGroupButton className='ms-auto'>Wyślij</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			</ShowcaseItem>

			<ShowcaseItem
				title='Field'
				note='etykieta + opis + błąd jako jedna, poprawnie opisana całość'
				className='flex-col items-stretch'
			>
				<FieldSet>
					<FieldLegend>Dane kontaktowe</FieldLegend>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor='c-field-email'>Adres e-mail</FieldLabel>
							<Input
								id='c-field-email'
								type='email'
								placeholder='adres@example.com'
							/>
							<FieldDescription>
								Wykorzystamy go wyłącznie do odpowiedzi na wiadomość.
							</FieldDescription>
						</Field>
						<Field data-invalid>
							<FieldLabel htmlFor='c-field-nip'>NIP</FieldLabel>
							<Input
								id='c-field-nip'
								aria-invalid
								defaultValue='123'
							/>
							<FieldError>NIP składa się z 10 cyfr.</FieldError>
						</Field>
					</FieldGroup>
				</FieldSet>
			</ShowcaseItem>

			<ShowcaseItem
				title='Field — układ poziomy z opisem'
				note='FieldContent trzyma tytuł i opis w kolumnie obok kontrolki'
				className='flex-col items-stretch'
			>
				{/* `FieldTitle`, nie `FieldLabel`: cały `Field` siedzi wewnątrz etykiety,
					a HTML nie dopuszcza zagnieżdżonych `<label>`. `aria-label` na
					przełączniku jest KONIECZNY mimo widocznego tytułu — Base UI stawia
					rolę na `<span>` z własnym id (axe: `aria-toggle-field-name`). */}
				<FieldGroup>
					<FieldLabel>
						<Field orientation='horizontal'>
							<FieldContent>
								<FieldTitle>Powiadomienia e-mail</FieldTitle>
								<FieldDescription>
									Podsumowanie zgłoszeń raz dziennie, o ósmej rano.
								</FieldDescription>
							</FieldContent>
							<Switch aria-label='Powiadomienia e-mail' />
						</Field>
					</FieldLabel>

					<FieldSeparator>albo</FieldSeparator>

					<FieldLabel>
						<Field orientation='horizontal'>
							<FieldContent>
								<FieldTitle>Powiadomienia w przeglądarce</FieldTitle>
								<FieldDescription>
									Natychmiast, przy każdym nowym zgłoszeniu.
								</FieldDescription>
							</FieldContent>
							<Switch aria-label='Powiadomienia w przeglądarce' />
						</Field>
					</FieldLabel>
				</FieldGroup>
			</ShowcaseItem>

			<ShowcaseItem title='Wybór jednokrotny i wielokrotny'>
				<Sample label='Checkbox'>
					<div className='flex items-center gap-2'>
						<Checkbox
							id='c-check'
							aria-label='Akceptuję regulamin'
						/>
						<Label htmlFor='c-check'>Akceptuję regulamin</Label>
					</div>
				</Sample>

				<Sample label='Switch'>
					<div className='flex items-center gap-2'>
						<Switch
							id='c-switch'
							aria-label='Powiadomienia'
						/>
						<Label htmlFor='c-switch'>Powiadomienia</Label>
					</div>
				</Sample>

				<Sample label='RadioGroup'>
					<RadioGroup defaultValue='pro'>
						{plans.map(plan => (
							<div
								key={plan.value}
								className='flex items-center gap-2'
							>
								<RadioGroupItem
									id={`c-radio-${plan.value}`}
									value={plan.value}
									aria-label={plan.label}
								/>
								<Label htmlFor={`c-radio-${plan.value}`}>{plan.label}</Label>
							</div>
						))}
					</RadioGroup>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Listy wyboru'
				note='NativeSelect na mobile bywa wygodniejszy — otwiera systemowy wybór'
			>
				<Sample label='Select'>
					<Select defaultValue='pro'>
						<SelectTrigger
							className='w-56'
							aria-label='Wybierz pakiet'
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{plans.map(plan => (
								<SelectItem
									key={plan.value}
									value={plan.value}
								>
									{plan.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Sample>

				<Sample label='NativeSelect'>
					<NativeSelect
						className='w-56'
						defaultValue='pro'
						aria-label='Wybierz pakiet'
					>
						{plans.map(plan => (
							<NativeSelectOption
								key={plan.value}
								value={plan.value}
							>
								{plan.label}
							</NativeSelectOption>
						))}
					</NativeSelect>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Listy wyboru z grupowaniem'
				note='SelectGroup + SelectLabel — nagłówek nie jest pozycją do wybrania'
			>
				<Sample label='Select z grupami'>
					<Select defaultValue='mazowieckie'>
						<SelectTrigger
							className='w-56'
							aria-label='Wybierz województwo'
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{VOIVODESHIP_GROUPS.map((group, index) => (
								<SelectGroup key={group.region}>
									{/* Separator tylko MIĘDZY grupami — kreska nad pierwszą
									    wisiałaby przy krawędzi listy bez niczego powyżej. */}
									{index > 0 && <SelectSeparator />}
									<SelectLabel>{group.region}</SelectLabel>
									{group.items.map(name => (
										<SelectItem
											key={name}
											value={name}
										>
											{name}
										</SelectItem>
									))}
								</SelectGroup>
							))}
						</SelectContent>
					</Select>
				</Sample>

				<Sample label='NativeSelect z optgroup'>
					<NativeSelect
						className='w-56'
						defaultValue='mazowieckie'
						aria-label='Wybierz województwo'
					>
						{VOIVODESHIP_GROUPS.map(group => (
							<NativeSelectOptGroup
								key={group.region}
								label={group.region}
							>
								{group.items.map(name => (
									<NativeSelectOption
										key={name}
										value={name}
									>
										{name}
									</NativeSelectOption>
								))}
							</NativeSelectOptGroup>
						))}
					</NativeSelect>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Slider'
				className='flex-col items-stretch'
			>
				<Slider
					defaultValue={40}
					max={100}
					step={5}
					aria-label='Budżet'
				/>
			</ShowcaseItem>

			<ShowcaseItem
				title='InputOTP'
				note='kod jednorazowy — sześć pól, ale jedno pole formularza'
			>
				<InputOTP
					maxLength={6}
					aria-label='Kod jednorazowy'
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
					</InputOTPGroup>
					<InputOTPSeparator />
					<InputOTPGroup>
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
			</ShowcaseItem>

			<ShowcaseItem
				title='Calendar'
				note='do wyboru daty w formularzu połącz z Popover'
			>
				<Calendar className='rounded-lg border' />
			</ShowcaseItem>

			<ShowcaseItem
				title='Pole z ikoną kontekstową'
				note='przykład złożenia InputGroup z ikoną domenową'
			>
				<InputGroup className='w-72'>
					<InputGroupAddon>
						<CreditCard />
					</InputGroupAddon>
					<InputGroupInput
						placeholder='0000 0000 0000 0000'
						inputMode='numeric'
					/>
				</InputGroup>
			</ShowcaseItem>

			<ShowcaseItem
				title='Combobox'
				note='pole z filtrowaniem — do list dłuższych niż kilkanaście pozycji, gdzie Select przestaje wystarczać'
			>
				{/*
					ComboboxInput sam renderuje przycisk rozwijania, więc NIE opakowuje
					się go dodatkowo w ComboboxTrigger. Podwójne opakowanie dawało dwa
					elementy bez nazwy dostępnej — audyt axe zgłaszał to jako dwa błędy
					krytyczne.
				*/}
				<Combobox items={VOIVODESHIPS}>
					<ComboboxInput
						placeholder='Wybierz województwo'
						aria-label='Województwo'
						className='w-64'
					/>
					<ComboboxContent>
						<ComboboxEmpty>Brak pasujących pozycji.</ComboboxEmpty>
						<ComboboxList>
							{(item: string) => (
								<ComboboxItem
									key={item}
									value={item}
								>
									{item}
								</ComboboxItem>
							)}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</ShowcaseItem>

			<ShowcaseItem
				title='Combobox z grupami'
				note='ComboboxGroup + ComboboxCollection — nagłówki zostają widoczne przy filtrowaniu'
			>
				{/* `ComboboxCollection` bierze pozycje z `items` GRUPY — dzięki temu
					nagłówek znika razem z ostatnią pasującą pozycją. */}
				<Combobox items={VOIVODESHIP_GROUPS}>
					<ComboboxInput
						placeholder='Wybierz województwo'
						aria-label='Województwo z podziałem na regiony'
						className='w-64'
					/>
					<ComboboxContent>
						<ComboboxEmpty>Brak pasujących pozycji.</ComboboxEmpty>
						<ComboboxList>
							{(group: (typeof VOIVODESHIP_GROUPS)[number], index: number) => (
								<ComboboxGroup
									key={group.region}
									items={group.items}
								>
									{index > 0 && <ComboboxSeparator />}
									<ComboboxLabel>{group.region}</ComboboxLabel>
									<ComboboxCollection>
										{(item: string) => (
											<ComboboxItem
												key={item}
												value={item}
											>
												{item}
											</ComboboxItem>
										)}
									</ComboboxCollection>
								</ComboboxGroup>
							)}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</ShowcaseItem>

			<ShowcaseItem
				title='Combobox wielokrotny'
				note='ComboboxChips — wybrane pozycje zostają w polu jako usuwalne żetony'
			>
				<ComboboxMultipleSample />
			</ShowcaseItem>

			<ShowcaseItem
				title='Questionnaire'
				note='formularz krok po kroku — jedno pytanie naraz, z paskiem postępu i nawigacją'
				className='flex-col items-stretch'
			>
				<Questionnaire
					items={QUESTIONNAIRE_ITEMS}
					defaultItem='goal'
					className='w-full max-w-lg'
				>
					<QuestionnaireProgress />

					<QuestionnaireItem name='goal'>
						<QuestionnaireTitle>Co budujesz?</QuestionnaireTitle>
						<QuestionnaireDescription>
							Odpowiedź steruje tym, które sekcje startera zostawimy.
						</QuestionnaireDescription>
						{/*
						 * `QuestionnaireChoiceDescription` idzie WEWNĄTRZ odpowiedzi, więc
						 * wchodzi do jej nazwy dostępnej. Opis postawiony obok byłby dla
						 * czytnika ekranu osobnym tekstem, niezwiązanym z wyborem.
						 */}
						<QuestionnaireChoices>
							<QuestionnaireChoice value='wizytowka'>
								Stronę wizytówkę
								<QuestionnaireChoiceDescription>
									Kilka podstron, formularz kontaktowy
								</QuestionnaireChoiceDescription>
							</QuestionnaireChoice>
							<QuestionnaireChoice value='blog'>
								Blog albo bazę wiedzy
								<QuestionnaireChoiceDescription>
									Warstwa treści MDX, sitemap, kanał RSS
								</QuestionnaireChoiceDescription>
							</QuestionnaireChoice>
							<QuestionnaireChoice value='sklep'>Sklep</QuestionnaireChoice>
						</QuestionnaireChoices>
					</QuestionnaireItem>

					<QuestionnaireItem name='languages'>
						<QuestionnaireTitle>Ile języków?</QuestionnaireTitle>
						<QuestionnaireChoices>
							<QuestionnaireChoice value='one'>Jeden</QuestionnaireChoice>
							<QuestionnaireChoice value='many'>Dwa lub więcej</QuestionnaireChoice>
						</QuestionnaireChoices>
					</QuestionnaireItem>

					{/*
					 * Krok z odpowiedzią otwartą. `QuestionnaireInput` to pole tekstowe
					 * podpięte pod stan ankiety, a `QuestionnaireError` pokazuje komunikat
					 * walidacji dopiero po próbie przejścia dalej — nie przy każdym
					 * naciśnięciu klawisza.
					 */}
					<QuestionnaireItem name='domain'>
						<QuestionnaireTitle>Pod jakim adresem stanie strona?</QuestionnaireTitle>
						<QuestionnaireDescription>
							Możesz pominąć — adres da się podać później.
						</QuestionnaireDescription>
						<QuestionnaireInput placeholder='example.com' />
						<QuestionnaireError />
					</QuestionnaireItem>

					<QuestionnaireActions>
						<QuestionnairePrevious>Wstecz</QuestionnairePrevious>
						<QuestionnaireSkip>Pomiń</QuestionnaireSkip>
						<QuestionnaireNext>Dalej</QuestionnaireNext>
						<QuestionnaireSubmit>Zakończ</QuestionnaireSubmit>
					</QuestionnaireActions>
				</Questionnaire>
			</ShowcaseItem>
		</Showcase>
	)
}
