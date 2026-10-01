/** NIP zapisany do JSON-LD jako „PL7352431636" — na stronie w zwyczajowych grupach „735 243 16 36". */
export function formatTaxId(taxId: string): string {
	const digits = taxId.replace(/\D/g, '')

	return digits.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4')
}
