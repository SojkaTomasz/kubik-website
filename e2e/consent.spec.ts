import { expect, test } from './fixtures'

/**
 * Zgody na cookies — jedyna warstwa startera, w której błąd jest naruszeniem
 * prawa, a nie usterką.
 *
 * Testy jednostkowe sprawdzają przekład kategorii na sygnały Google; tutaj
 * weryfikujemy, czy sygnały docierają do `dataLayer` i we właściwym momencie.
 * Cały plik ogląda baner, więc wyłącza domyślne zaziarnienie zgody z fixtures.
 */
test.use({ consentSeeded: false })

/** Baner. Nazwa w locatorze odróżnia go od dialogu ustawień, też o roli `dialog`. */
function banner(page: import('@playwright/test').Page) {
	return page.getByRole('dialog', { name: 'Zgoda na pliki cookie' })
}

/** Odczytuje polecenia `gtag('consent', …)` zapisane w dataLayer. */
async function readConsentCommands(page: import('@playwright/test').Page) {
	return page.evaluate(() => {
		const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []

		return layer
			.map(entry => Array.from(entry as ArrayLike<unknown>))
			.filter(args => args[0] === 'consent')
			.map(args => ({ mode: args[1] as string, signals: args[2] as Record<string, string> }))
	})
}

test.describe('domyślna odmowa', () => {
	test('ustawia odmowę zanim cokolwiek zdąży się wykonać', async ({ page }) => {
		await page.goto('/')

		const commands = await readConsentCommands(page)
		const defaults = commands.find(command => command.mode === 'default')

		expect(defaults, 'brak polecenia consent default').toBeTruthy()
		expect(defaults?.signals).toMatchObject({
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: 'denied',
			functionality_storage: 'denied',
			personalization_storage: 'denied',
		})
	})

	test('daje kontenerowi czas na doczekanie decyzji', async ({ page }) => {
		await page.goto('/')

		const defaults = (await readConsentCommands(page)).find(c => c.mode === 'default')

		// Bez wait_for_update container odpaliłby tagi natychmiast po załadowaniu,
		// nie czekając na odpowiedź użytkownika na baner.
		expect(defaults?.signals).toHaveProperty('wait_for_update')
	})

	test('skrypt zgody wykonuje się przed kontenerem GTM', async ({ page }) => {
		await page.goto('/')

		const order = await page.evaluate(() => {
			const html = document.documentElement.innerHTML
			return {
				consentScript: html.indexOf("consent', 'default'"),
				container: html.indexOf('googletagmanager.com/gtm.js'),
			}
		})

		// Odwrotna kolejność oznacza, że container zdąży odpalić tagi
		// marketingowe, zanim dowie się o odmowie.
		expect(order.consentScript).toBeGreaterThanOrEqual(0)
		expect(order.container).toBeGreaterThan(order.consentScript)
	})
})

test.describe('baner', () => {
	test('pokazuje się przy pierwszej wizycie', async ({ page }) => {
		await page.goto('/')

		await expect(banner(page)).toBeVisible()
	})

	test('jest w HTML-u z serwera', async ({ page }) => {
		// Wymóg odwrotny do intuicji: baner renderowany dopiero po hydracji
		// kosztował 15 z 18 straconych punktów wydajności. Przed mignięciem
		// chroni klasa `consent-pending` — sprawdza to test niżej.
		const response = await page.goto('/')
		const html = (await response?.text()) ?? ''

		expect(html).toContain('data-slot="cookie-banner"')
	})

	test('przykrywa treść strony', async ({ page }) => {
		// Sprawdzamy to, co widzi użytkownik: co leży pod kursorem w środku
		// i przy obu krawędziach okna.
		await page.goto('/')
		await expect(banner(page)).toBeVisible()

		const covered = await page.evaluate(() =>
			[
				{ x: window.innerWidth / 2, y: window.innerHeight / 2 },
				{ x: 8, y: 8 },
				{ x: window.innerWidth - 8, y: window.innerHeight - 8 },
			].every(point =>
				Boolean(
					document.elementFromPoint(point.x, point.y)?.closest('[data-slot="cookie-banner"]')
				)
			)
		)

		expect(covered, 'treść strony jest klikalna mimo niepodjętej decyzji').toBe(true)
	})

	// Strona główna mieści się w domyślnym oknie Playwrighta co do piksela, więc
	// bez zwężenia oba testy przewijania przechodziłyby, nie sprawdzając niczego.
	const NARROW_VIEWPORT = { width: 390, height: 500 }

	/**
	 * KÓŁKIEM, nie `window.scrollTo`: `overflow: hidden` odbiera użytkownikowi
	 * mechanizm przewijania, ale nadal pozwala przewinąć element z kodu.
	 */
	async function wheelBy(page: import('@playwright/test').Page, distance: number) {
		await page.mouse.move(NARROW_VIEWPORT.width / 2, NARROW_VIEWPORT.height / 2)
		await page.mouse.wheel(0, distance)

		// Przewijanie po `wheel` jest asynchroniczne. `expect.poll` tu nie pomoże:
		// drugi test sprawdza BRAK ruchu, a na to trzeba poczekać upływem czasu.
		await page.waitForTimeout(300)

		return page.evaluate(() => window.scrollY)
	}

	test('blokuje przewijanie do czasu decyzji', async ({ page }) => {
		await page.setViewportSize(NARROW_VIEWPORT)
		await page.goto('/')
		await expect(banner(page)).toBeVisible()

		// Bez tego sprawdzenia test przechodziłby także wtedy, gdyby strona po
		// prostu mieściła się w oknie i nie miała czego przewijać.
		const contentHeight = await page.evaluate(() => document.documentElement.scrollHeight)
		expect(contentHeight, 'strona mieści się w oknie — test nic nie sprawdza').toBeGreaterThan(
			NARROW_VIEWPORT.height
		)

		expect(await wheelBy(page, 600), 'stronę da się przewinąć mimo niepodjętej decyzji').toBe(0)
	})

	test('po decyzji oddaje stronę użytkownikowi', async ({ page }) => {
		await page.setViewportSize(NARROW_VIEWPORT)
		await page.goto('/')
		await page.getByRole('button', { name: 'Akceptuję' }).click()
		await expect(banner(page)).toBeHidden()

		// Blokada przewijania siedzi na klasie `consent-pending`, więc musi
		// zniknąć razem z nią. Zostawiona blokada unieruchamia całą stronę.
		expect(await wheelBy(page, 600), 'blokada przewijania została po decyzji').toBeGreaterThan(0)
	})

	test('trzyma fokus w środku', async ({ page }) => {
		// `aria-modal` odcina czytnik ekranu, ale nie klawiaturę.
		await page.goto('/')

		// Fokus wjeżdża do banera po hydracji — bez tego pierwszy Tab trafiałby
		// czasem jeszcze w link pomijający nawigację.
		await expect(banner(page)).toBeFocused()

		const insideAfterTabs: boolean[] = []

		for (let i = 0; i < 6; i++) {
			await page.keyboard.press('Tab')
			insideAfterTabs.push(
				await page.evaluate(() =>
					Boolean(document.activeElement?.closest('[data-slot="cookie-banner"]'))
				)
			)
		}

		expect(insideAfterTabs, 'fokus uciekł poza baner').toEqual(Array(6).fill(true))
	})

	test('akceptacja odblokowuje wszystkie kategorie', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Akceptuję' }).click()

		const update = (await readConsentCommands(page)).find(c => c.mode === 'update')

		expect(update?.signals).toMatchObject({
			ad_storage: 'granted',
			ad_user_data: 'granted',
			ad_personalization: 'granted',
			analytics_storage: 'granted',
			functionality_storage: 'granted',
			personalization_storage: 'granted',
		})
	})

	test('znika po decyzji', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Akceptuję' }).click()

		await expect(banner(page)).toBeHidden()
	})

	test('decyzja obowiązuje po przeładowaniu', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Akceptuję' }).click()
		await page.reload()

		await expect(banner(page)).toBeHidden()
	})

	test('powracający użytkownik nie zobaczy mignięcia banera', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Akceptuję' }).click()
		await page.reload()

		await expect(page.locator('html')).not.toHaveClass(/consent-pending/)

		// Selektor, nie `getByRole`: element z `display: none` nie ma roli, więc
		// locator po roli czekałby do końca limitu. Sprawdzamy właśnie styl.
		expect(
			await page
				.locator('[data-slot="cookie-banner"]')
				.evaluate(element => getComputedStyle(element).display)
		).toBe('none')
	})

	test('skrypt zdejmujący klasę stoi w HTML-u przed banerem', async ({ page }) => {
		// Kolejność to jedyny dowód na „przed pierwszym malowaniem": przeglądarka
		// wykonuje skrypt w `<head>`, zanim sparsuje `<body>`.
		const response = await page.goto('/')
		const html = (await response?.text()) ?? ''

		// Szukamy WYWOŁANIA, nie napisu: `consent-pending` jest też klasą na
		// `<html>`, więc test przechodziłby zawsze, niczego nie sprawdzając.
		const scriptAt = html.indexOf(',"consent-pending")')
		const bannerAt = html.indexOf('data-slot="cookie-banner"')

		expect(scriptAt).toBeGreaterThanOrEqual(0)
		expect(bannerAt).toBeGreaterThan(scriptAt)
	})

	test('zapisana consentScript jest odtwarzana przed załadowaniem kontenera', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Akceptuję' }).click()
		await page.reload()

		// Po przeładowaniu skrypt startowy musi sam odtworzyć zgodę z localStorage.
		// Bez tego container wystartowałby z domyślną odmową mimo udzielonej zgody.
		const commands = await readConsentCommands(page)
		const update = commands.find(c => c.mode === 'update')

		expect(update?.signals.analytics_storage).toBe('granted')
	})

	test('proponuje dokładnie dwie drogi dalej', async ({ page }) => {
		// Brak przycisku odrzucenia jest świadomą decyzją o konsekwencjach
		// prawnych (nagłówek `cookie-banner.tsx`). Ten test pilnuje, żeby zmiana
		// układu była decyzją, a nie skutkiem ubocznym.
		await page.goto('/')

		// Przyciski w STOPCE karty: w treści siedzi jeszcze jeden — odnośnik do
		// polityki, który otwiera okno, więc jest przyciskiem.
		const buttons = banner(page).locator('[data-slot="card-footer"]').getByRole('button')

		await expect(buttons).toHaveCount(2)
		await expect(buttons.nth(0)).toHaveText('Ustawienia')
		await expect(buttons.nth(1)).toHaveText('Akceptuję')
	})
})

/** Polityka z banera otwiera się w oknie — przejście na stronę pokazałoby ją pod tym samym banerem. */
test.describe('polityka prywatności z banera', () => {
	/** Okno polityki. Nazwa bierze się z nagłówka wewnątrz treści. */
	function policyDialog(page: import('@playwright/test').Page) {
		return page.getByRole('dialog', { name: 'Polityka prywatności' })
	}

	test('otwiera się w oknie, a nie przenosi na stronę', async ({ page }) => {
		await page.goto('/')
		await banner(page).getByRole('button', { name: 'polityka prywatności' }).click()

		await expect(policyDialog(page)).toBeVisible()
		await expect(page).toHaveURL(/\/$/)
	})

	test('pokazuje tę samą treść co strona', async ({ page }) => {
		// Rozjazd okna ze stroną jest usterką prawną, nie kosmetyczną: użytkownik
		// godzi się na to, co przeczytał w oknie, a reklamacja odwoła się do strony.
		await page.goto('/polityka-prywatnosci')
		const onPage = await page.locator('main li').allInnerTexts()

		await page.goto('/')
		await banner(page).getByRole('button', { name: 'polityka prywatności' }).click()

		// Okno ładuje się leniwie, więc po kliknięciu leci żądanie o jego chunk.
		// `allInnerTexts` nie czeka na nic i odczytałoby pustą listę.
		await expect(policyDialog(page).locator('li').first()).toBeVisible()

		const inDialog = await policyDialog(page).locator('li').allInnerTexts()

		expect(inDialog.length).toBeGreaterThan(0)
		expect(inDialog).toEqual(onPage)
	})

	test('zamknięcie okna zostawia baner na miejscu', async ({ page }) => {
		// Przeczytanie polityki nie jest decyzją i nie ma prawa jej zastąpić.
		await page.goto('/')
		await banner(page).getByRole('button', { name: 'polityka prywatności' }).click()
		await expect(policyDialog(page)).toBeVisible()

		await page.keyboard.press('Escape')

		await expect(policyDialog(page)).toBeHidden()
		await expect(banner(page)).toBeVisible()
	})

	test('poza banerem polityka zostaje zwykłym odnośnikiem', async ({ page }) => {
		// Dokument musi mieć własny adres — inaczej nie da się go ani zalinkować,
		// ani zaindeksować.
		await page.goto('/')
		await page.getByRole('button', { name: 'Akceptuję' }).click()
		await expect(banner(page)).toBeHidden()

		await page.getByRole('link', { name: 'Polityka prywatności' }).first().click()

		await expect(page).toHaveURL(/\/polityka-prywatnosci$/)
	})
})

/* `exact: true` przy „Ustawieniach": stopka niesie drugi przycisk („Ustawienia
 * cookies"), więc bez tego locator trafia w oba i pada na trybie ścisłym. */
test.describe('szczegółowe ustawienia', () => {
	test('są jedyną drogą do odmowy i ta droga działa', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Ustawienia', exact: true }).click()

		// Nic nie przestawiamy — panel otwiera się z wszystkim wyłączonym poza
		// niezbędnym, więc sam zapis jest pełną odmową.
		await page.getByRole('button', { name: 'Zapisz' }).click()

		const update = (await readConsentCommands(page)).find(c => c.mode === 'update')

		expect(update?.signals).toMatchObject({
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: 'denied',
		})
	})

	test('pozwalają zgodzić się wybiórczo', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Ustawienia', exact: true }).click()

		await page.getByRole('switch', { name: 'Analityczne' }).click()
		await page.getByRole('button', { name: 'Zapisz' }).click()

		const update = (await readConsentCommands(page)).find(c => c.mode === 'update')

		// Zgoda na statystyki NIE MOŻE odblokować śledzenia reklamowego —
		// to najgroźniejsza pomyłka w tej warstwie.
		expect(update?.signals.analytics_storage).toBe('granted')
		expect(update?.signals.ad_storage).toBe('denied')
	})

	test('mają jeden przycisk zatwierdzający', async ({ page }) => {
		// Skróty „Odrzuć/Zaakceptuj wszystkie" zdjęte celowo — licznik pilnuje,
		// żeby nie wróciły.
		await page.goto('/')
		await page.getByRole('button', { name: 'Ustawienia', exact: true }).click()

		const footer = page.locator('[data-slot="dialog-footer"]')

		await expect(footer.getByRole('button')).toHaveCount(1)
		await expect(footer.getByRole('button')).toHaveText('Zapisz')
	})

	test('kładą się NA banerze, nie zamiast niego', async ({ page }) => {
		// Chowanie banera pod panelem zabierało razem z nim zasłonę i tło
		// przeskakiwało w połowie ścieżki.
		await page.goto('/')
		await page.getByRole('button', { name: 'Ustawienia', exact: true }).click()

		await expect(page.getByRole('dialog', { name: 'Ustawienia plików cookie' })).toBeVisible()

		// Selektor, nie `getByRole`: Base UI zakłada przy otwartym oknie `inert`
		// na resztę dokumentu, więc baner wypada z drzewa dostępności. Widoczny
		// zostaje — i o to chodzi.
		await expect(page.locator('[data-slot="cookie-banner"]')).toBeVisible()

		await page.keyboard.press('Escape')

		// Wyjście Escape'em nie jest decyzją. Znów z rolą, bo `inert` już zszedł.
		await expect(banner(page)).toBeVisible()
	})

	test('kategoria niezbędna jest zablokowana we włączonej pozycji', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Ustawienia', exact: true }).click()

		const essential = page.getByRole('switch', { name: 'Niezbędne' })

		await expect(essential).toBeDisabled()
		await expect(essential).toBeChecked()
	})

	test('otwierają się ponownie z zapisanym stanem', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Ustawienia', exact: true }).click()
		await page.getByRole('switch', { name: 'Analityczne' }).click()
		await page.getByRole('button', { name: 'Zapisz' }).click()

		await page.evaluate(() => window.dispatchEvent(new CustomEvent('cookie-consent:open')))

		await expect(page.getByRole('switch', { name: 'Analityczne' })).toBeChecked()
		await expect(page.getByRole('switch', { name: 'Marketingowe' })).not.toBeChecked()
	})
})
