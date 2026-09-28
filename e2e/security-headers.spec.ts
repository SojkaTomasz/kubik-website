import { expect, test } from './fixtures'

/**
 * Nagłówki bezpieczeństwa. Warstwa łamie się BEZOBJAWOWO — strona wygląda
 * i działa identycznie z nagłówkami i bez nich.
 *
 * Ten plik pilnuje polityki zbyt LUŹNEJ. Zbyt ciasną wyłapuje kontrola konsoli
 * z `fixtures.ts`: naruszenie CSP wypisuje komunikat, a ten wywraca test.
 */

/** Rozbija nagłówek CSP na mapę `dyrektywa → wartości`. */
function parsePolicy(header: string): Record<string, string[]> {
	const directives: Record<string, string[]> = {}

	for (const part of header.split(';')) {
		const [name, ...values] = part.trim().split(/\s+/)
		if (name) directives[name] = values
	}

	return directives
}

async function policyFor(request: import('@playwright/test').APIRequestContext, path = '/') {
	const response = await request.get(path)
	const header = response.headers()['content-security-policy']

	expect(header, `brak nagłówka Content-Security-Policy pod ${path}`).toBeTruthy()

	return parsePolicy(header ?? '')
}

test.describe('nagłówki bezpieczeństwa', () => {
	test('docierają na stronę', async ({ request }) => {
		const headers = (await request.get('/')).headers()

		expect(headers['content-security-policy']).toBeTruthy()
		expect(headers['cross-origin-opener-policy']).toBe('same-origin')
		expect(headers['x-frame-options']).toBe('DENY')
		expect(headers['x-content-type-options']).toBe('nosniff')
		expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
		expect(headers['permissions-policy']).toContain('camera=()')
		expect(headers['strict-transport-security']).toContain('max-age=')
	})

	test('nie zdradzają stosu technologicznego', async ({ request }) => {
		const headers = (await request.get('/')).headers()

		expect(headers['x-powered-by'], 'nagłówek X-Powered-By wrócił').toBeUndefined()
	})

	test('obejmują pliki z public, nie tylko strony', async ({ request }) => {
		// Zawężenie wzorca `source` do samych tras strony jest łatwym błędem,
		// a przy plikach serwowanych wprost nagłówki mają największe znaczenie.
		const headers = (await request.get('/embed-preview.html')).headers()

		expect(headers['content-security-policy']).toBeTruthy()
		expect(headers['x-content-type-options']).toBe('nosniff')
	})
})

test.describe('polityka bezpieczeństwa treści', () => {
	test('zamyka drogi eskalacji po wstrzyknięciu skryptu', async ({ request }) => {
		// NAJWAŻNIEJSZA asercja w pliku. `script-src` ma świadomie `'unsafe-inline'`
		// (powód w `next.config.ts`), więc całą robotę wykonują te cztery
		// dyrektywy — rozluźnienie którejkolwiek zostawia politykę bez zębów.
		const policy = await policyFor(request)

		expect(policy['object-src']).toEqual(["'none'"])
		expect(policy['base-uri']).toEqual(["'self'"])
		expect(policy['form-action']).toEqual(["'self'"])
		expect(policy['frame-ancestors']).toEqual(["'none'"])
	})

	test('nie dopuszcza dokumentów data: w ramkach', async ({ request }) => {
		// `frame-src data:` pozwala osadzić dowolny wstrzyknięty dokument
		// w kontekście strony. Z tego powodu podgląd osadzenia na `/dev`
		// przeniósł się z adresu `data:` do pliku w `public/`.
		const policy = await policyFor(request)

		expect(policy['frame-src']).not.toContain('data:')
	})

	test('nie pozwala na eval w produkcyjnym buildzie', async ({ request }) => {
		// `'unsafe-eval'` tylko w trybie dev (Turbopack). Wyciek do produkcji
		// byłby niewidoczny, a znosiłby dużą część ochrony.
		test.skip(process.env.E2E_DEV === '1', 'Tryb deweloperski wymaga eval')

		const policy = await policyFor(request)

		expect(policy['script-src']).not.toContain("'unsafe-eval'")
		expect(policy['connect-src']).not.toContain('ws:')
	})

	test('przepuszcza to, czego strona faktycznie potrzebuje', async ({ request }) => {
		// Polityka zbyt ciasna łamie się głośno — w konsoli — ale dopiero na
		// stronie, która danego zasobu użyje. Te trzy dyrektywy dotyczą rzeczy
		// obecnych na każdej podstronie, więc warto je sprawdzić wprost.
		const policy = await policyFor(request)

		// Rozmyte podglądy `next/image` to adresy `data:`.
		expect(policy['img-src']).toContain('data:')
		// Base UI pozycjonuje warstwy atrybutem `style`.
		expect(policy['style-src']).toContain("'unsafe-inline'")
		// Fonty są self-hostowane z `public/fonts`.
		expect(policy['font-src']).toEqual(["'self'"])
	})

	test('obowiązuje tak samo w drugim języku', async ({ request }) => {
		// Trasy językowe przechodzą przez `proxy.ts`. Przepisanie adresu jest
		// miejscem, w którym nagłówki potrafią zniknąć.
		const policy = await policyFor(request, '/en')

		expect(policy['frame-ancestors']).toEqual(["'none'"])
	})
})

test.describe('pułapki tej warstwy', () => {
	test('polityka NIE podnosi żądań na https', async ({ request }) => {
		/*
		 * `upgrade-insecure-requests` kusi, ale podnosi http na https także pod
		 * `http://localhost`. Objaw jest mylący: pierwsza strona ładuje się
		 * normalnie, a ładunek RSC pada na `ERR_SSL_PROTOCOL_ERROR` i router
		 * schodzi po cichu do pełnego przeładowania. Https dla własnej domeny
		 * wymusza `Strict-Transport-Security`.
		 */
		const response = await request.get('/')
		const header = response.headers()['content-security-policy'] ?? ''

		expect(header).not.toContain('upgrade-insecure-requests')
	})
})
