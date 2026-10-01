'use client'

import { useLayoutEffect } from 'react'

import {
	clearConsentPending,
	CONSENT_PENDING_CLASS,
	CONSENT_STORAGE_KEY,
	CONSENT_VERSION,
} from '@/lib/analytics/consent'
import { NO_JS_CLASS } from '@/lib/motion'
import { applyThemeOnLoad, DEFAULT_THEME, THEME_STORAGE_KEY } from '@/lib/theme'

/**
 * Powtarza skrypty startowe z `<head>` przy KAŻDYM zamontowaniu dokumentu.
 *
 * Skrypty (`InlineScript`) wykonują się tylko raz, przy pierwszym ładowaniu —
 * na kliencie są celowo nieaktywne. Zmiana języka zmienia jednak parametr
 * root layoutu, więc React montuje `<html>` od nowa, z klasami prosto z
 * serwera: `no-js` i `consent-pending` wracają. Skutek był dotkliwy: baner
 * zgód uznawał decyzję za niepodjętą i zakładał `inert` na nagłówek, treść
 * i stopkę — żaden przycisk nie działał aż do odświeżenia strony. To samo
 * dawał przycisk „wstecz" między wersjami językowymi.
 *
 * `useLayoutEffect`, nie `useEffect`: wykonuje się przed malowaniem, więc
 * baner nie mignie, i PRZED efektem banera — ten leży głębiej w drzewie,
 * a ten komponent stoi w `<body>` przed resztą. Przy pierwszym ładowaniu
 * nic nie zmienia, bo skrypty zrobiły już to samo.
 */
export function DocumentStateSync() {
	useLayoutEffect(() => {
		applyThemeOnLoad(THEME_STORAGE_KEY, DEFAULT_THEME)
		document.documentElement.classList.remove(NO_JS_CLASS)
		clearConsentPending(CONSENT_STORAGE_KEY, CONSENT_VERSION, CONSENT_PENDING_CLASS)
	}, [])

	return null
}
