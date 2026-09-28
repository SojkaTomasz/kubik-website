import type { JsonLdEntity, JsonLdGraph } from '@/lib/seo/json-ld'

/**
 * Osadza dane strukturalne. Escapowanie `<` nie jest ozdobnikiem: bez niego
 * treść z CMS-a albo formularza mogłaby zamknąć `</script>` i wstrzyknąć kod.
 * Zalecenie z dokumentacji Next.js (01-app/02-guides/json-ld.md).
 */
export function JsonLd({ data }: { data: JsonLdEntity | JsonLdEntity[] | JsonLdGraph }) {
	const payload = JSON.stringify(data).replace(/</g, '\\u003c')

	return (
		<script
			type='application/ld+json'
			// eslint-disable-next-line react/no-danger -- jedyny sposób osadzenia JSON-LD; treść jest escapowana wyżej
			dangerouslySetInnerHTML={{ __html: payload }}
		/>
	)
}
