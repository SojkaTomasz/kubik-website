'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'
import { type FieldErrors, useForm, useWatch } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { Typography } from '@/components/ui/typography'
import { sendContactMessage } from '@/lib/actions/send-contact'
import { contactDefaults, type ContactInput, contactSchema } from '@/lib/validation/contact'
import { LIMITS } from '@/lib/validation/fields'

/**
 * Formularz kontaktowy — wzorzec do kopiowania. Ten sam schemat zod po obu
 * stronach, komunikaty jako klucze tłumaczeń, wynik akcji dyskryminowany
 * zamiast wyjątku.
 *
 * Warstwa dla czytnika ekranu jest tu ROZBUDOWANA i to celowo: formularz jest
 * jedynym miejscem, w którym użytkownik coś wpisuje, więc każda niedopowiedziana
 * usterka kończy się porzuceniem kontaktu. Trzy mechanizmy, każdy na inną
 * sytuację — opisane przy swoich fragmentach niżej.
 */

/** Pola w kolejności, w jakiej stoją w formularzu — podsumowanie błędów trzyma ten porządek. */
const FIELD_ORDER = ['name', 'email', 'phone', 'subject', 'message', 'consent'] as const

type FieldName = (typeof FIELD_ORDER)[number]

/**
 * Skleja listę `aria-describedby`, pomijając opisy, których nie ma w drzewie.
 *
 * Wskazanie nieistniejącego identyfikatora nie jest kosmetyczne: część czytników
 * pomija wtedy CAŁY atrybut, więc razem z brakującym opisem znika też ten, który
 * istnieje. Axe zgłasza to jako `aria-valid-attr-value`.
 */
function describedBy(...ids: (string | false | undefined)[]): string | undefined {
	const present = ids.filter((id): id is string => Boolean(id))
	return present.length > 0 ? present.join(' ') : undefined
}

export function ContactForm() {
	const t = useTranslations('contact')
	const tv = useTranslations('validation')

	const [submitError, setSubmitError] = useState<string | null>(null)
	/**
	 * Pola odrzucone przy ostatniej próbie wysłania. Zdjęte ze stanu, nie
	 * czytane wprost z `errors`: lista przerysowywana przy każdym naciśnięciu
	 * klawisza kazałaby czytnikowi ogłaszać ją od nowa w trakcie poprawiania.
	 */
	const [invalidFields, setInvalidFields] = useState<FieldName[]>([])
	/** Zmienia się po każdym wyczyszczeniu formularza — odświeża znacznik czasu. */
	const [resetCount, setResetCount] = useState(0)
	const formId = useId()

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<ContactInput>({
		resolver: zodResolver(contactSchema),
		defaultValues: contactDefaults,
		// Walidacja po opuszczeniu pola, nie przy każdym znaku: translateError
		// pojawiający się w trakcie pisania jest irytujący i zwykle przedwczesny.
		mode: 'onBlur',
		/*
		 * Fokus po nieudanej wysyłce idzie do PODSUMOWANIA, nie do pierwszego
		 * błędnego pola.
		 *
		 * react-hook-form domyślnie robi to drugie i wygląda to rozsądnie, ale
		 * zostawia użytkownika czytnika ekranu w środku formularza z jednym
		 * komunikatem i bez pojęcia, ile jeszcze pól czeka. Podsumowanie podaje
		 * pełną listę od razu. Bez tej flagi biblioteka przestawia fokus PO naszym
		 * efekcie i cały mechanizm wygląda na działający, bo komunikat jest
		 * widoczny — tylko kursor stoi gdzie indziej.
		 */
		shouldFocusError: false,
	})

	// Znacznik czasu ustawiany na kliencie (strona jest prerenderowana) i w
	// efekcie, nie w renderze. Powtarza się po wyczyszczeniu, inaczej kolejne
	// zgłoszenie miałoby znacznik z pierwszego wejścia.
	useEffect(() => {
		setValue('renderedAt', Date.now())
	}, [setValue, resetCount])

	// `useWatch`, nie `watch()`: to drugie przerysowuje CAŁY formularz przy
	// każdym naciśnięciu klawisza.
	const messageValue = useWatch({ control, name: 'message' })
	const consentChecked = useWatch({ control, name: 'consent' })

	const messageLength = messageValue?.length ?? 0
	const counterId = `${formId}-count`
	const consentLabelId = `${formId}-consent-label`
	const summaryRef = useRef<HTMLDivElement>(null)
	const errorSummaryRef = useRef<HTMLDivElement>(null)

	const fieldId = (name: FieldName) => `${formId}-${name}`
	/** Identyfikator komunikatu pola — wskazuje go `aria-describedby` tego pola. */
	const errorId = (name: FieldName) => `${formId}-${name}-error`

	/** Zamienia key błędu ze schematu na zdanie w języku strony. */
	const translateError = (key?: string) => (key ? tv(key) : undefined)

	const onSubmit = handleSubmit(
		async values => {
			setSubmitError(null)
			setInvalidFields([])

			const result = await sendContactMessage(values)

			if (result.status === 'ok') {
				toast.add({ title: t('successTitle'), description: t('successBody') })
				reset(contactDefaults)
				setResetCount(count => count + 1)
				return
			}

			const text =
				result.code === 'rateLimit'
					? t('errors.rateLimit', { seconds: result.retryAfterSeconds ?? 60 })
					: t(`errors.${result.code}`)

			setSubmitError(text)
			toast.add({ title: t('errorTitle'), description: text, type: 'error' })
		},
		/*
		 * Podsumowanie błędów walidacji.
		 *
		 * Bez niego osoba niewidoma po nieudanej wysyłce nie wie NIC: przycisk nie
		 * reaguje widocznie, a komunikaty leżą przy polach, których w danym
		 * momencie nie czyta. Podsumowanie zbiera je w jedno miejsce, dostaje
		 * fokus i niesie odnośniki prowadzące wprost do pól — wzorzec z serwisów
		 * rządowych, bo to najlepiej sprawdzona odpowiedź na ten problem.
		 */
		(formErrors: FieldErrors<ContactInput>) => {
			setSubmitError(null)
			setInvalidFields(FIELD_ORDER.filter(name => Boolean(formErrors[name])))
		}
	)

	// Efekt, nie wywołanie po `setState`: referencja jest wtedy jeszcze pusta.
	// `role='alert'` odczyta komunikat, ale nie przeniesie kursora — bez tego
	// użytkownik klawiatury zostaje na przycisku, w oderwaniu od odczytanej treści.
	useEffect(() => {
		if (invalidFields.length > 0) summaryRef.current?.focus()
	}, [invalidFields])

	useEffect(() => {
		if (submitError) errorSummaryRef.current?.focus()
	}, [submitError])

	return (
		<form
			noValidate
			onSubmit={onSubmit}
			className='flex flex-col gap-6'
		>
			{/* Pole-pułapka. Ukryte potrójnie, bo samo `display:none` bywa przez
				automaty rozpoznawane. */}
			<div
				aria-hidden='true'
				className='absolute left-[-9999px] h-0 w-0 overflow-hidden'
			>
				<label htmlFor={`${formId}-website`}>Nie wypełniaj tego pola</label>
				<input
					id={`${formId}-website`}
					type='text'
					tabIndex={-1}
					autoComplete='off'
					{...register('website')}
				/>
			</div>

			<input
				type='hidden'
				{...register('renderedAt')}
			/>

			{invalidFields.length > 0 && (
				<Alert
					ref={summaryRef}
					variant='destructive'
					role='alert'
					tabIndex={-1}
				>
					<AlertTitle>{t('errorSummaryTitle')}</AlertTitle>
					<AlertDescription>
						<Typography variant='bodySm'>{t('errorSummaryIntro')}</Typography>
						<ul className='mt-2 flex list-disc flex-col gap-1 ps-5'>
							{invalidFields.map(name => (
								<li key={name}>
									{/* Zwykła kotwica: przeglądarka przenosi fokus na pole
									    wskazane fragmentem, więc działa też bez JavaScriptu. */}
									<a
										href={`#${fieldId(name)}`}
										className='underline underline-offset-4'
									>
										{t(`fields.${name}`)} — {translateError(errors[name]?.message)}
									</a>
								</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{submitError && (
				<Alert
					ref={errorSummaryRef}
					variant='destructive'
					role='alert'
					tabIndex={-1}
				>
					<AlertTitle>{t('errorTitle')}</AlertTitle>
					<AlertDescription>{submitError}</AlertDescription>
				</Alert>
			)}

			<FieldGroup>
				<div className='grid gap-6 sm:grid-cols-2'>
					<Field data-invalid={errors.name ? true : undefined}>
						<FieldLabel htmlFor={fieldId('name')}>{t('fields.name')}</FieldLabel>
						<Input
							id={fieldId('name')}
							autoComplete='name'
							required
							aria-invalid={errors.name ? true : undefined}
							// Bez tego czytnik ogłasza „nieprawidłowa wartość" i nic więcej:
							// treść komunikatu leży w osobnym elemencie, którego nie czyta.
							aria-describedby={describedBy(errors.name && errorId('name'))}
							{...register('name')}
						/>
						<FieldError id={errorId('name')}>
							{translateError(errors.name?.message)}
						</FieldError>
					</Field>

					<Field data-invalid={errors.email ? true : undefined}>
						<FieldLabel htmlFor={fieldId('email')}>{t('fields.email')}</FieldLabel>
						<Input
							id={fieldId('email')}
							type='email'
							autoComplete='email'
							required
							aria-invalid={errors.email ? true : undefined}
							aria-describedby={describedBy(errors.email && errorId('email'))}
							{...register('email')}
						/>
						<FieldError id={errorId('email')}>
							{translateError(errors.email?.message)}
						</FieldError>
					</Field>
				</div>

				<div className='grid gap-6 sm:grid-cols-2'>
					<Field data-invalid={errors.phone ? true : undefined}>
						<FieldLabel htmlFor={fieldId('phone')}>
							{t('fields.phone')}{' '}
							<Typography
								as='span'
								variant='caption'
								tone='muted'
							>
								{t('optional')}
							</Typography>
						</FieldLabel>
						<Input
							id={fieldId('phone')}
							type='tel'
							autoComplete='tel'
							aria-invalid={errors.phone ? true : undefined}
							aria-describedby={describedBy(errors.phone && errorId('phone'))}
							{...register('phone')}
						/>
						<FieldError id={errorId('phone')}>
							{translateError(errors.phone?.message)}
						</FieldError>
					</Field>

					<Field data-invalid={errors.subject ? true : undefined}>
						<FieldLabel htmlFor={fieldId('subject')}>{t('fields.subject')}</FieldLabel>
						<Input
							id={fieldId('subject')}
							required
							aria-invalid={errors.subject ? true : undefined}
							aria-describedby={describedBy(errors.subject && errorId('subject'))}
							{...register('subject')}
						/>
						<FieldError id={errorId('subject')}>
							{translateError(errors.subject?.message)}
						</FieldError>
					</Field>
				</div>

				<Field data-invalid={errors.message ? true : undefined}>
					<FieldLabel htmlFor={fieldId('message')}>{t('fields.message')}</FieldLabel>
					<Textarea
						id={fieldId('message')}
						rows={6}
						required
						aria-invalid={errors.message ? true : undefined}
						// Licznik znaków I komunikat błędu. Kolejność ma znaczenie:
						// czytnik odczyta opisy w tej, w jakiej stoją w atrybucie.
						aria-describedby={describedBy(counterId, errors.message && errorId('message'))}
						{...register('message')}
					/>
					<FieldDescription id={counterId}>
						{t('counter', { current: messageLength, max: LIMITS.message })}
					</FieldDescription>
					<FieldError id={errorId('message')}>
						{translateError(errors.message?.message)}
					</FieldError>
				</Field>

				<Field data-invalid={errors.consent ? true : undefined}>
					<div className='flex items-start gap-3'>
						{/* `aria-labelledby`, nie `htmlFor`: Base UI renderuje rolę na
							elemencie z własnym id, więc `for` nie nadaje nazwy dostępnej. */}
						<Checkbox
							id={fieldId('consent')}
							required
							aria-labelledby={consentLabelId}
							aria-invalid={errors.consent ? true : undefined}
							aria-describedby={describedBy(errors.consent && errorId('consent'))}
							checked={consentChecked === true}
							onCheckedChange={checked =>
								setValue('consent', checked as true, { shouldValidate: true })
							}
						/>
						<FieldLabel
							id={consentLabelId}
							htmlFor={fieldId('consent')}
							className='text-sm leading-snug font-normal'
						>
							{t('fields.consent')}
						</FieldLabel>
					</div>
					<FieldError id={errorId('consent')}>
						{translateError(errors.consent?.message)}
					</FieldError>
				</Field>
			</FieldGroup>

			<div className='flex flex-wrap items-center gap-4'>
				<Button
					type='submit'
					size='lg'
					icon={<Send />}
					isLoading={isSubmitting}
				>
					{isSubmitting ? t('submitting') : t('submit')}
				</Button>

				{/*
					Obszar na potwierdzenie istnieje ZAWSZE, a zmienia się tylko jego
					treść. `role='status'` dostawiony do drzewa razem z gotowym tekstem
					bywa przez czytniki pomijany — ogłaszają zmianę obszaru, który już
					obserwowały, a nie pojawienie się nowego.
				*/}
				<Typography
					variant='bodySm'
					tone='success'
					role='status'
				>
					{isSubmitSuccessful && !submitError ? t('successBody') : ''}
				</Typography>
			</div>
		</form>
	)
}
