import { expect, test } from './fixtures'

declare global {
	interface Window {
		/** Licznik zmian obszaru `aria-live`, zakładany przez test niżej. */
		__liveChanges: { value: number }
	}
}

/**
 * Warstwa dla czytnika ekranu.
 *
 * Wszystko, co tu jest sprawdzane, łamie się CAŁKOWICIE CICHO: strona wygląda
 * identycznie, lint milczy, testy zachowania przechodzą, a audyt axe też —
 * bo brak `aria-current` albo zła nazwa dostępna nie są naruszeniem żadnej
 * reguły, tylko utratą informacji. Widać to wyłącznie uchem, z włączonym
 * czytnikiem — czyli w praktyce nigdy, dopóki nie pilnuje tego test.
 *
 * `a11y.spec.ts` odpowiada na pytanie „czy nie ma naruszeń".
 * Ten plik odpowiada na pytanie „czy da się z tego korzystać".
 */

test.describe('orientacja na stronie', () => {
	test('pozycja menu prowadząca do bieżącej strony jest oznaczona', async ({ page }) => {
		await page.goto('/kontakt')

		// `aria-current` to JEDYNA informacja o bieżącej stronie, jaką dostaje
		// czytnik ekranu — podświetlenie pozycji widzi wyłącznie oko.
		await expect(page.getByRole('link', { name: 'Kontakt' }).first()).toHaveAttribute(
			'aria-current',
			'page'
		)
	})

	test('pozycje prowadzące gdzie indziej NIE są oznaczone', async ({ page }) => {
		await page.goto('/kontakt')

		// Oznaczenie wszystkiego jest gorsze niż nieoznaczenie niczego: czytnik
		// ogłasza wtedy każdą pozycję jako bieżącą i traci się punkt odniesienia.
		await expect(page.getByRole('link', { name: 'Blog' }).first()).not.toHaveAttribute(
			'aria-current'
		)
	})

	test('wpis bloga oznacza pozycję sekcji, nie stronę', async ({ page }) => {
		await page.goto('/blog/pierwszy-wpis')

		// `true`, a nie `page`: czytamy wpis, nie listę wpisów. `page` na liście
		// mówiłoby, że jesteśmy na stronie, której nie ma na ekranie.
		await expect(page.getByRole('link', { name: 'Blog' }).first()).toHaveAttribute(
			'aria-current',
			'true'
		)
	})

	test('pominięcie nawigacji przenosi fokus do treści', async ({ page }) => {
		await page.goto('/')

		await page.keyboard.press('Tab')
		await expect(page.getByRole('link', { name: 'Przejdź do treści' })).toBeFocused()

		await page.keyboard.press('Enter')

		// Sam skok do kotwicy przewija stronę, ale zostawia kursor klawiatury na
		// linku — kolejny Tab wracałby wtedy do menu, przez które użytkownik
		// właśnie przeszedł. Fokus na `<main>` daje to, co obiecuje link.
		await expect(page.locator('main')).toBeFocused()
	})
})

test.describe('nazwy dostępne', () => {
	test('nazwą linku do wpisu jest sam tytuł', async ({ page }) => {
		await page.goto('/blog')

		const links = page.getByRole('link', {
			name: 'Jak zacząć nowy projekt na tym starterze',
		})

		// Bez `aria-labelledby` nazwa powstaje z CAŁEJ treści karty: data, czas
		// czytania, tytuł, opis i tagi zlewają się w jeden ciąg, a lista linków
		// (popularny sposób przeglądania strony czytnikiem) staje się bezużyteczna.
		await expect(links).toHaveCount(1)
		await expect(links).toHaveAttribute('href', '/blog/pierwszy-wpis')
	})

	test('data wpisu jest zapisana słowami, a nie ciągiem cyfr', async ({ page }) => {
		await page.goto('/blog')

		// Surowe `2026-09-01` synteza mowy czyta jako działanie arytmetyczne.
		// Wersja maszynowa zostaje w atrybucie `dateTime` — dla robotów.
		const date = page.locator('time').first()

		await expect(date).toHaveAttribute('dateTime', /^\d{4}-\d{2}-\d{2}$/)
		await expect(date).not.toHaveText(/^\s*\d{4}-\d{2}-\d{2}\s*$/)
	})

	test('przełącznik motywu ogłasza, co jest ustawione', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: 'Zmień motyw' }).click()

		// `menuitemradio` niesie stan zaznaczenia. Zwykłe `menuitem` wygląda tak
		// samo i działa tak samo, ale nie mówi, który motyw jest wybrany.
		await expect(page.getByRole('menuitemradio', { name: 'Systemowy' })).toHaveAttribute(
			'aria-checked',
			'true'
		)
		await expect(page.getByRole('menuitemradio', { name: 'Ciemny' })).toHaveAttribute(
			'aria-checked',
			'false'
		)
	})

	test('przełącznik języka ogłasza język bieżący', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: 'Zmień język' }).click()

		// Wcześniej bieżący język był `disabled`, czyli czytnik mówił
		// „niedostępny" — brzmi jak usterka, nie jak „to jest ustawione teraz".
		await expect(page.getByRole('menuitemradio', { name: 'Polski' })).toHaveAttribute(
			'aria-checked',
			'true'
		)
		await expect(page.getByRole('menuitemradio', { name: 'Polski' })).toBeEnabled()
	})
})

test.describe('napisy, które czyta wyłącznie czytnik ekranu', () => {
	test('są po polsku na polskiej wersji', async ({ page }) => {
		await page.goto('/dev/components')

		// Rejestr shadcn przychodzi z angielskimi napisami wpisanymi wprost w kod
		// i `shadcn add --overwrite` przywraca je przy każdej aktualizacji.
		// Strona wygląda wtedy identycznie, a polska synteza mowy mówi „Close".
		const englishLeftovers = [
			'Close',
			'Loading',
			'Previous slide',
			'Next slide',
			'More pages',
			'Toggle Sidebar',
		]

		for (const text of englishLeftovers) {
			await expect(
				page.getByText(text, { exact: true }),
				`„${text}" został w kodzie nieprzetłumaczony`
			).toHaveCount(0)
		}
	})

	test('link do nowej karty zapowiada to czytnikowi ekranu', async ({ page }) => {
		await page.goto('/dev/components')

		// Nowa karta bez ostrzeżenia to zmiana kontekstu bez ostrzeżenia
		// (WCAG 3.2.5). Osoba widząca zauważy ją sama, czytnik nie powie nic.
		const external = page.locator('a[target="_blank"]').first()

		await expect(external).toHaveAccessibleName(/otwiera się w nowej karcie/)
	})
})

test.describe('formularz kontaktowy', () => {
	test('komunikat błędu jest powiązany z polem', async ({ page }) => {
		await page.goto('/kontakt')

		const email = page.getByLabel('Adres e-mail', { exact: true })
		await email.fill('to-nie-jest-adres')
		await page.getByLabel('Temat', { exact: true }).click()

		// `aria-invalid` mówi tylko „coś nie tak". Bez `aria-describedby`
		// wskazującego komunikat czytnik nie podaje POWODU, a leży on w osobnym
		// elemencie, którego przy polu nie czyta.
		await expect(email).toHaveAttribute('aria-invalid', 'true')
		await expect(email).toHaveAccessibleDescription(/Podaj poprawny adres e-mail/)
	})

	test('nieudana wysyłka daje podsumowanie z fokusem i odnośnikami do pól', async ({ page }) => {
		await page.goto('/kontakt')

		await page.getByRole('button', { name: 'Wyślij wiadomość' }).click()

		const summary = page.getByRole('alert').filter({ hasText: 'Formularz zawiera błędy' })

		// Bez podsumowania osoba niewidoma po kliknięciu „Wyślij" nie wie NIC:
		// przycisk nie reaguje widocznie, a komunikaty leżą przy polach,
		// których w tym momencie nie czyta.
		await expect(summary).toBeVisible()
		await expect(summary).toBeFocused()

		// Odnośnik prowadzi wprost do pola — przeglądarka przenosi fokus na cel
		// fragmentu, więc poprawianie nie wymaga szukania pola od nowa.
		const firstLink = summary.getByRole('link').first()
		await expect(firstLink).toHaveAttribute('href', /#/)

		await firstLink.click()
		await expect(page.getByLabel('Imię i nazwisko', { exact: true })).toBeFocused()
	})

	test('opis licznika znaków dociera do pola wiadomości', async ({ page }) => {
		await page.goto('/kontakt')

		await expect(page.getByLabel('Wiadomość', { exact: true })).toHaveAccessibleDescription(
			/znaków/
		)
	})
})

/* Blok wyłącza zaziarnienie zgody — oglądamy sam baner. */
test.describe('baner zgody', () => {
	test.use({ consentSeeded: false })

	test('odcina tło od czytnika ekranu', async ({ page }) => {
		await page.goto('/')
		await expect(page.getByRole('dialog', { name: 'Zgoda na pliki cookie' })).toBeFocused()

		// `aria-modal` deklaruje, że pod oknem nic nie ma, ale czytniki traktują
		// tę deklarację różnie — NVDA w trybie przeglądania zjeżdża strzałkami na
		// treść pod banerem. `inert` wyjmuje gałąź z drzewa dostępności NA PEWNO.
		await expect(page.locator('body > header')).toHaveAttribute('inert', '')
		await expect(page.locator('body > main')).toHaveAttribute('inert', '')
		await expect(page.locator('body > footer')).toHaveAttribute('inert', '')
	})

	test('okno zgód pozostaje dostępne, choć tło jest odcięte', async ({ page }) => {
		await page.goto('/')

		// Okna portalują się do `<body>` PO założeniu `inert` na rodzeństwo,
		// więc nie mogą go odziedziczyć. Gdyby odziedziczyły, jedyna droga do
		// odmowy zgody przestałaby działać.
		await page.getByRole('button', { name: 'Ustawienia', exact: true }).click()

		await expect(page.getByRole('dialog', { name: /Ustawienia plików cookie/ })).toBeVisible()
		await expect(page.getByRole('button', { name: 'Zapisz' })).toBeEnabled()
	})

	test('po decyzji strona wraca do drzewa dostępności', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: 'Akceptuję' }).click()

		// Gdyby `inert` został, cała strona byłaby martwa dla klawiatury i dla
		// czytnika — przy niewidocznym już banerze. Najgorsza możliwa usterka
		// tej warstwy, stąd osobny test.
		await expect(page.locator('body > main')).not.toHaveAttribute('inert')
		await expect(page.getByRole('link', { name: 'Kontakt' }).first()).toBeVisible()
	})

	test('próba ominięcia banera jest ogłaszana, nie tylko pokazywana', async ({ page }) => {
		await page.goto('/')
		await expect(page.getByRole('dialog', { name: 'Zgoda na pliki cookie' })).toBeFocused()

		await page.keyboard.press('Escape')

		// Pulsowanie karty widzi wyłącznie oko. Bez komunikatu osoba niewidoma
		// naciska Escape, nic się nie dzieje i ma prawo sądzić, że strona zawisła.
		await expect(page.getByRole('status')).toContainText(/Akceptuję|Ustawienia/)
	})

	test('KAŻDA próba ominięcia jest ogłaszana, nie tylko pierwsza', async ({ page }) => {
		await page.goto('/')
		await expect(page.getByRole('dialog', { name: 'Zgoda na pliki cookie' })).toBeFocused()
		await expect(page.getByRole('status')).toBeAttached()

		// Obszar `aria-live` ogłasza ZMIANĘ treści. Ustawienie tego samego zdania
		// po raz drugi nie rusza DOM-u, więc druga próba przeszłaby bez słowa —
		// i wyglądałoby to na działające, bo komunikat wciąż tam wisi. Liczymy
		// zatem faktyczne zmiany węzła, a nie jego zawartość.
		await page.evaluate(() => {
			const region = document.querySelector('[data-slot="cookie-banner"] [role="status"]')
			if (!region) throw new Error('brak obszaru aria-live w banerze')

			const counter = { value: 0 }
			Object.assign(window, { __liveChanges: counter })

			new MutationObserver(() => {
				counter.value += 1
			}).observe(region, { childList: true, characterData: true, subtree: true })
		})

		await page.keyboard.press('Escape')
		await expect(page.getByRole('status')).toContainText(/Akceptuję|Ustawienia/)
		const afterFirst = await page.evaluate(() => window.__liveChanges.value)

		await page.keyboard.press('Escape')
		await expect(page.getByRole('status')).toContainText(/Akceptuję|Ustawienia/)

		await expect
			.poll(() => page.evaluate(() => window.__liveChanges.value), {
				message: 'druga próba ominięcia nie zmieniła treści obszaru aria-live',
			})
			.toBeGreaterThan(afterFirst)
	})

	test('opis banera mówi, czego dotyczy decyzja', async ({ page }) => {
		await page.goto('/')

		const dialog = page.getByRole('dialog', { name: 'Zgoda na pliki cookie' })

		// Bez `aria-describedby` czytnik ogłasza nazwę okna i pierwszy przycisk,
		// a zdanie wyjaśniające trafia do użytkownika tylko wtedy, gdy sam po nie
		// przejdzie — w oknie, którego nie da się zamknąć bez decyzji.
		await expect(dialog).toHaveAccessibleDescription(/plików cookie/)
	})
})

test.describe('ustawienia zgód', () => {
	test('przełącznik niesie opis kategorii', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Ustawienia cookies' }).click()

		await expect(page.getByRole('switch', { name: 'Analityczne' })).toHaveAccessibleDescription(
			/które podstrony są odwiedzane/
		)
	})

	test('kategoria zablokowana wyjaśnia, dlaczego', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Ustawienia cookies' }).click()

		// Czytnik ogłasza przy `disabled` samo „niedostępny", co brzmi jak
		// usterka strony. Osoba widząca ma obok akapit z wyjaśnieniem i wiąże
		// jedno z drugim wzrokiem — bez tego opisu ta informacja nie dociera.
		await expect(page.getByRole('switch', { name: 'Niezbędne' })).toHaveAccessibleDescription(
			/nie można jej wyłączyć/
		)
	})
})
