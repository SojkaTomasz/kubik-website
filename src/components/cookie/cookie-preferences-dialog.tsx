'use client'

import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { cookieCategories } from '@/components/cookie/cookie-categories'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Typography } from '@/components/ui/typography'
import type { ConsentCategories } from '@/lib/analytics/consent'

export interface CookiePreferencesDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** Stan wyjściowy przełączników — zapisana zgoda lub wartości domyślne. */
	initial: ConsentCategories
	onSave: (categories: ConsentCategories) => void
}

/**
 * Formularz zgód.
 *
 * Wydzielony z dialogu celowo: Base UI odmontowuje zawartość zamkniętego okna,
 * więc stan przełączników odtwarza się sam przy każdym otwarciu. Synchronizacja
 * przez `useEffect` byłaby tu zbędną kaskadą renderów.
 */
function CookiePreferencesForm({
	initial,
	onCommit,
}: {
	initial: ConsentCategories
	onCommit: (categories: ConsentCategories) => void
}) {
	const [draft, setDraft] = useState<ConsentCategories>(initial)
	const t = useTranslations('cookies')
	const baseId = useId()

	/** Identyfikator akapitu z opisem kategorii — wskazuje go jej przełącznik. */
	const descriptionId = (key: string) => `${baseId}-${key}-description`
	/** Wspólne wyjaśnienie dla kategorii, których nie można wyłączyć. */
	const lockedHintId = `${baseId}-locked`

	return (
		<>
			<div className='flex flex-col gap-1'>
				{cookieCategories.map((category, index) => (
					<div key={category.key}>
						{index > 0 && <Separator className='my-3' />}
						<div className='flex items-start justify-between gap-4'>
							<div className='flex flex-col gap-1'>
								<Label htmlFor={`cookie-${category.key}`}>
									{t(`categories.${category.key}.label`)}
								</Label>
								<Typography
									id={descriptionId(category.key)}
									variant='caption'
									tone='muted'
								>
									{t(`categories.${category.key}.description`)}
								</Typography>
							</div>
							<Switch
								id={`cookie-${category.key}`}
								checked={category.required ? true : draft[category.key]}
								disabled={category.required}
								aria-label={t(`categories.${category.key}.label`)}
								/*
								 * Opis kategorii jako opis przełącznika, a dla kategorii
								 * zablokowanej dodatkowo zdanie o tym, DLACZEGO nie da się
								 * jej wyłączyć.
								 *
								 * Czytnik ogłasza przy `disabled` samo „niedostępny", co
								 * brzmi jak usterka strony, a nie jak wymóg techniczny.
								 * Osoba widząca ma obok akapit z wyjaśnieniem i wiąże
								 * jedno z drugim wzrokiem — bez tego atrybutu ta sama
								 * informacja nie dociera nigdzie.
								 */
								aria-describedby={
									category.required
										? `${descriptionId(category.key)} ${lockedHintId}`
										: descriptionId(category.key)
								}
								onCheckedChange={checked =>
									setDraft(current => ({ ...current, [category.key]: checked }))
								}
							/>
						</div>
					</div>
				))}
			</div>

			{/*
				Wyjaśnienie wskazywane przez `aria-describedby` zablokowanych
				przełączników. Jedno na cały formularz — treść jest dla wszystkich
				kategorii wymaganych taka sama.
			*/}
			<p
				id={lockedHintId}
				className='sr-only'
			>
				{t('lockedSwitch')}
			</p>

			{/*
				Jeden przycisk, nie trzy.

				Skróty „Odrzuć wszystkie" i „Zaakceptuj wszystkie" zostały stąd
				zdjęte celowo — panel ma być miejscem na wybór świadomy, a nie
				drugim banerem. Kto chce zgodzić się na wszystko jednym kliknięciem,
				robi to w banerze; kto wszedł tutaj, przestawia przełączniki
				i zapisuje.
			*/}
			<DialogFooter>
				<Button onClick={() => onCommit(draft)}>{t('saveChoice')}</Button>
			</DialogFooter>
		</>
	)
}

/**
 * Szczegółowe ustawienia zgód — i JEDYNA droga do odmowy.
 *
 * Baner nie ma przycisku odrzucenia (powód i konsekwencje prawne opisuje
 * nagłówek `cookie-banner.tsx`), więc odmowa polega na wejściu tutaj,
 * zostawieniu przełączników wyłączonych i zapisaniu. Panel musi więc być
 * osiągalny zawsze i z każdego miejsca: z banera oraz z linku w stopce
 * (`cookie-settings-button.tsx`).
 */
export function CookiePreferencesDialog({
	open,
	onOpenChange,
	initial,
	onSave,
}: CookiePreferencesDialogProps) {
	const t = useTranslations('cookies')

	const commit = (categories: ConsentCategories) => {
		onSave(categories)
		onOpenChange(false)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>{t('dialogTitle')}</DialogTitle>
					<DialogDescription>{t('dialogDescription')}</DialogDescription>
				</DialogHeader>

				<CookiePreferencesForm
					initial={initial}
					onCommit={commit}
				/>
			</DialogContent>
		</Dialog>
	)
}
