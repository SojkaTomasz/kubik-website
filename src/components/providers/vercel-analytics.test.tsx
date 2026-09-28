import { describe, expect, it, vi } from 'vitest'

import { render } from '@/test/render'

/**
 * Flaga analityki ma coś WŁĄCZAĆ. Martwy przełącznik jest gorszy od braku
 * przełącznika — nic go nie zgłasza, a dokumentacja obiecuje zachowanie,
 * którego nie ma. Sprawdzamy OBIE strony flagi.
 */

const flag = vi.hoisted(() => ({ enabled: false }))

/*
 * Pozostałe pola są tu, bo `@/test/render` ciągnie `site.config.ts`, a ten czyta
 * adres strony. Sama flaga jest getterem — dzięki temu oba przypadki dostają
 * inną wartość bez przeładowywania modułu.
 */
vi.mock('@/env', () => ({
	env: {
		NODE_ENV: 'test',
		NEXT_PUBLIC_SITE_URL: 'https://example.com',
		NEXT_PUBLIC_CONTACT_EMAIL: 'kontakt@example.com',
		NEXT_PUBLIC_CONTACT_PHONE: '+48123456789',
		NEXT_PUBLIC_GTM_ID: '',
		NEXT_PUBLIC_ENABLE_DEV_PAGES: false,
		get NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS() {
			return flag.enabled
		},
	},
}))

/** Podstawiamy znacznik, który da się znaleźć — prawdziwy skrypt nic nie renderuje w jsdom. */
vi.mock('@vercel/analytics/next', () => ({
	Analytics: () => <div data-testid='vercel-analytics' />,
}))

const { VercelAnalytics } = await import('@/components/providers/vercel-analytics')

describe('VercelAnalytics', () => {
	it('nie renderuje niczego przy wyłączonej fladze', () => {
		flag.enabled = false

		const { queryByTestId } = render(<VercelAnalytics />)

		expect(queryByTestId('vercel-analytics')).toBeNull()
	})

	it('renderuje analitykę przy włączonej fladze', () => {
		flag.enabled = true

		const { queryByTestId } = render(<VercelAnalytics />)

		expect(queryByTestId('vercel-analytics')).not.toBeNull()
	})
})
