import { describe, expect, it } from 'vitest'

import { formatTaxId } from '@/lib/tax-id'

describe('formatTaxId', () => {
	it('zdejmuje prefiks kraju i grupuje cyfry 3-3-2-2', () => {
		expect(formatTaxId('PL7352431636')).toBe('735 243 16 36')
	})

	it('nietypową długość zostawia bez grupowania', () => {
		expect(formatTaxId('12345')).toBe('12345')
	})
})
