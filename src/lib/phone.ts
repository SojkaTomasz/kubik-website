/**
 * Numer telefonu w dwóch postaciach z jednego zapisu w `company.config.ts`.
 *
 * Na ekranie bez kierunkowego, jak w projekcie i na busie („507 125 794"),
 * w `tel:` pełny i bez spacji — dialer na telefonie nie zgadnie kraju sam.
 */
export function phoneLinks(phone: string): { display: string; href: string } {
	return {
		display: phone.replace(/^\+48\s*/, ''),
		href: `tel:${phone.replace(/\s/g, '')}`,
	}
}
