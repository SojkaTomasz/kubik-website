'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { CookieBanner } from '@/components/cookie/cookie-banner'
import { useCookieConsent } from '@/hooks/use-cookie-consent'
import { useIsOpen } from '@/hooks/use-is-open'
import {
	CONSENT_OPEN_EVENT,
	type ConsentCategories,
	FULL_CONSENT,
	markConsentDecided,
} from '@/lib/analytics/consent'

/*
 * Oba okna leniwie — konwencja z AGENTS.md („Okna modalne"). Tutaj szczególnie:
 * `CookieConsent` siedzi w root layoucie, więc jego statyczne importy lądują
 * w bundlu KAŻDEJ strony. `.then(module => …)`, bo eksporty są nazwane.
 */
const CookiePreferencesDialog = dynamic(() =>
	import('@/components/cookie/cookie-preferences-dialog').then(
		module => module.CookiePreferencesDialog
	)
)

const PrivacyPolicyDialog = dynamic(() =>
	import('@/components/legal/privacy-policy-dialog').then(module => module.PrivacyPolicyDialog)
)

/**
 * Spina baner, okna i zapis zgody.
 *
 * Montowany raz, w root layoucie, na końcu drzewa — baner jest `fixed`, więc nie
 * może siedzieć w kontenerze z `content-visibility` ani `transform`. Nasłuchuje
 * `cookie-consent:open`, dzięki czemu link w stopce nie potrzebuje kontekstu.
 *
 * Baner renderuje się ZAWSZE, także dla osoby po decyzji — o widoczności
 * decydują klasy na `<html>` i `data-hidden`, czyli CSS przed hydracją.
 * Pomiary: `docs/consent-layer.md`.
 */
export function CookieConsent() {
	const { categories, save } = useCookieConsent()
	const settings = useIsOpen()
	const privacy = useIsOpen()

	// Startuje na `false` po obu stronach granicy, więc drzewa są identyczne.
	const [decided, setDecided] = useState(false)

	const openSettings = settings.handleOpen

	useEffect(() => {
		window.addEventListener(CONSENT_OPEN_EVENT, openSettings)
		return () => window.removeEventListener(CONSENT_OPEN_EVENT, openSettings)
	}, [openSettings])

	const apply = (next: ConsentCategories) => {
		save(next)
		setDecided(true)
		settings.handleClose()
		// Klasa na `<html>` jest źródłem prawdy dla CSS-u i musi zniknąć razem
		// z decyzją — inaczej wisiałaby do najbliższego przeładowania.
		markConsentDecided()
	}

	return (
		<>
			{/* `hidden` reaguje wyłącznie na decyzję — otwarte okno kładzie się na
			    banerze, nie zastępuje go. */}
			<CookieBanner
				hidden={decided}
				onAcceptAll={() => apply(FULL_CONSENT)}
				onOpenSettings={settings.handleOpen}
				onOpenPrivacy={privacy.handleOpen}
			/>

			{/* Warunek montażu jest tym, co daje leniwe ładowanie — samo `dynamic`
			    pobiera chunk przy pierwszym renderze komponentu. */}
			{settings.isOpen && (
				<CookiePreferencesDialog
					open={settings.isOpen}
					onOpenChange={settings.handleOpenChange}
					initial={categories}
					onSave={apply}
				/>
			)}

			{privacy.isOpen && (
				<PrivacyPolicyDialog
					open={privacy.isOpen}
					onOpenChange={privacy.handleOpenChange}
				/>
			)}
		</>
	)
}
