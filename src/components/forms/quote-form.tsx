'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'
import { type FieldErrors, useForm } from 'react-hook-form'

import { companyConfig } from '@/company.config'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { toast } from '@/components/ui/toast'
import { Typography } from '@/components/ui/typography'
import { usePathname } from '@/i18n/navigation'
import { sendQuoteRequest } from '@/lib/actions/send-quote'
import { phoneLinks } from '@/lib/phone'
import { cn } from '@/lib/utils'
import { quoteDefaults, type QuoteInput, quoteSchema } from '@/lib/validation/quote'

/**
 * Formularz wyceny — metraż, telefon, miejscowość. Wzorzec warstwy dla czytnika
 * ekranu jak w `contact-form.tsx`: podsumowanie błędów z fokusem, opis błędu
 * wskazany z pola, obszar `status` obecny zawsze.
 *
 * Układy z projektu:
 *   stack    — pola jedno pod drugim, przycisk na całą szerokość (Kontakt)
 *   wide     — metraż i telefon obok siebie, notka i przycisk w jednym rzędzie
 *   compact  — okienko wyceny: tylko metraż i telefon (docs/teksty.md)
 *
 * `city` — na stronie miasta pole miejscowości znika, a wartość idzie ukryta.
 */

export interface QuoteFormProps {
	layout?: 'stack' | 'wide' | 'compact'
	/** Miasto podstawiane bez pytania — strony miast. */
	city?: string
	/** Po udanej wysyłce — okienko wyceny się zamyka. */
	onSuccess?: () => void
	className?: string
}

const FIELD_ORDER = ['area', 'phone', 'city'] as const

type FieldName = (typeof FIELD_ORDER)[number]

/** Skleja `aria-describedby`, pomijając opisy, których nie ma w drzewie. */
function describedBy(...ids: (string | false | undefined)[]): string | undefined {
	const present = ids.filter((id): id is string => Boolean(id))
	return present.length > 0 ? present.join(' ') : undefined
}

export function QuoteForm({ layout = 'wide', city, onSuccess, className }: QuoteFormProps) {
	const t = useTranslations('quote')
	const tv = useTranslations('validation')
	const pathname = usePathname()
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone).display : ''

	const [submitError, setSubmitError] = useState<string | null>(null)
	const [invalidFields, setInvalidFields] = useState<FieldName[]>([])
	const [resetCount, setResetCount] = useState(0)
	const formId = useId()
	const summaryRef = useRef<HTMLDivElement>(null)
	const errorRef = useRef<HTMLDivElement>(null)

	const askForCity = layout !== 'compact' && !city

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<QuoteInput>({
		resolver: zodResolver(quoteSchema),
		defaultValues: { ...quoteDefaults, city: city ?? '' },
		mode: 'onBlur',
		// Fokus idzie do podsumowania błędów, nie do pierwszego pola — powód
		// opisany w `contact-form.tsx`.
		shouldFocusError: false,
	})

	// Znacznik czasu i adres podstrony ustawiane na kliencie: strona jest
	// prerenderowana, więc w renderze serwera nie ma ani czasu wejścia, ani
	// pewności co do adresu.
	useEffect(() => {
		setValue('renderedAt', Date.now())
		setValue('page', pathname)
	}, [setValue, pathname, resetCount])

	const fieldId = (name: FieldName) => `${formId}-${name}`
	const errorId = (name: FieldName) => `${formId}-${name}-error`
	const translateError = (key?: string) => (key ? tv(key) : undefined)

	const onSubmit = handleSubmit(
		async values => {
			setSubmitError(null)
			setInvalidFields([])

			const result = await sendQuoteRequest(values)

			if (result.status === 'ok') {
				toast.add({ title: t('successTitle'), description: t('successBody') })
				reset({ ...quoteDefaults, city: city ?? '' })
				setResetCount(count => count + 1)
				onSuccess?.()
				return
			}

			const text =
				result.code === 'rateLimit'
					? t('errors.rateLimit', { seconds: result.retryAfterSeconds ?? 60 })
					: t(`errors.${result.code}`, { phone })

			setSubmitError(text)
			toast.add({ title: t('errorTitle'), description: text, type: 'error' })
		},
		(formErrors: FieldErrors<QuoteInput>) => {
			setSubmitError(null)
			setInvalidFields(FIELD_ORDER.filter(name => Boolean(formErrors[name])))
		}
	)

	useEffect(() => {
		if (invalidFields.length > 0) summaryRef.current?.focus()
	}, [invalidFields])

	useEffect(() => {
		if (submitError) errorRef.current?.focus()
	}, [submitError])

	const areaField = (
		<Field
			data-invalid={errors.area ? true : undefined}
			className={cn(layout === 'compact' && 'sm:w-44 sm:shrink-0')}
		>
			<FieldLabel htmlFor={fieldId('area')}>{t('fields.area')}</FieldLabel>
			<InputGroup>
				<InputGroupInput
					id={fieldId('area')}
					inputMode='decimal'
					autoComplete='off'
					appearance='display'
					placeholder={t('placeholders.area')}
					required
					aria-invalid={errors.area ? true : undefined}
					aria-describedby={describedBy(errors.area && errorId('area'))}
					{...register('area')}
				/>
				<InputGroupAddon align='inline-end'>{t('unit')}</InputGroupAddon>
			</InputGroup>
			<FieldError id={errorId('area')}>{translateError(errors.area?.message)}</FieldError>
		</Field>
	)

	const phoneField = (
		<Field data-invalid={errors.phone ? true : undefined}>
			<FieldLabel htmlFor={fieldId('phone')}>{t('fields.phone')}</FieldLabel>
			<Input
				id={fieldId('phone')}
				type='tel'
				autoComplete='tel'
				placeholder={t('placeholders.phone')}
				required
				aria-invalid={errors.phone ? true : undefined}
				aria-describedby={describedBy(errors.phone && errorId('phone'))}
				{...register('phone')}
			/>
			<FieldError id={errorId('phone')}>{translateError(errors.phone?.message)}</FieldError>
		</Field>
	)

	const privacyNote = (
		<Typography
			variant='bodySm'
			tone='muted'
		>
			{t('privacy')}{' '}
			<Button
				href='/polityka-prywatnosci'
				variant='link'
				size='none'
			>
				{t('privacyLink')}
			</Button>
			.
		</Typography>
	)

	const submitButton = (
		<Button
			type='submit'
			size='xl'
			icon={<ArrowRight />}
			iconPosition='right'
			iconEffect='shiftRight'
			isLoading={isSubmitting}
			className={cn(layout === 'wide' ? 'w-full sm:w-auto sm:shrink-0' : 'w-full')}
		>
			{isSubmitting ? t('submitting') : t('submit')}
		</Button>
	)

	return (
		<form
			noValidate
			onSubmit={onSubmit}
			className={cn('flex flex-col gap-6', className)}
		>
			{/* Pole-pułapka — ukryte potrójnie, bo samo `display:none` automaty rozpoznają. */}
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
			<input
				type='hidden'
				{...register('page')}
			/>
			{!askForCity && (
				<input
					type='hidden'
					{...register('city')}
				/>
			)}

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
									<a
										href={`#${fieldId(name)}`}
										className='underline underline-offset-4'
									>
										{t(`fields.${name}`)}: {translateError(errors[name]?.message)}
									</a>
								</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{submitError && (
				<Alert
					ref={errorRef}
					variant='destructive'
					role='alert'
					tabIndex={-1}
				>
					<AlertTitle>{t('errorTitle')}</AlertTitle>
					<AlertDescription>{submitError}</AlertDescription>
				</Alert>
			)}

			<FieldGroup className='gap-4'>
				{layout === 'stack' ? (
					<>
						{areaField}
						{phoneField}
					</>
				) : (
					<div className='flex flex-col gap-4 sm:flex-row'>
						{areaField}
						{phoneField}
					</div>
				)}

				{askForCity && (
					<Field data-invalid={errors.city ? true : undefined}>
						<FieldLabel htmlFor={fieldId('city')}>{t('fields.city')}</FieldLabel>
						<Input
							id={fieldId('city')}
							autoComplete='address-level2'
							placeholder={t('placeholders.city')}
							aria-invalid={errors.city ? true : undefined}
							aria-describedby={describedBy(errors.city && errorId('city'))}
							{...register('city')}
						/>
						<FieldError id={errorId('city')}>{translateError(errors.city?.message)}</FieldError>
					</Field>
				)}
			</FieldGroup>

			{layout === 'wide' ? (
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
					{privacyNote}
					{submitButton}
				</div>
			) : (
				<div className='flex flex-col gap-3.5'>
					{submitButton}
					{privacyNote}
				</div>
			)}

			{/* Obszar istnieje ZAWSZE, zmienia się tylko treść — inaczej czytnik go pomija. */}
			<Typography
				variant='bodySm'
				tone='success'
				role='status'
				// Widocznie potwierdza toast; tu zostaje ogłoszenie dla czytnika ekranu.
				className='sr-only'
			>
				{isSubmitSuccessful && !submitError ? t('successBody') : ''}
			</Typography>
		</form>
	)
}
