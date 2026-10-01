import { Fragment } from 'react'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from '@/i18n/navigation'

export interface BreadcrumbEntry {
	name: string
	/** Bez ścieżki — bieżąca strona, ostatnie ogniwo. */
	path?: string
}

/**
 * Ścieżka nad tytułem strony miasta i realizacji — „Usługa / Kraków".
 * Te same pozycje idą do `breadcrumbJsonLd`, więc Google widzi to, co
 * użytkownik.
 */
export function PageBreadcrumbs({ items }: { items: BreadcrumbEntry[] }) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, index) => (
					<Fragment key={item.name}>
						{index > 0 && <BreadcrumbSeparator />}
						<BreadcrumbItem>
							{item.path ? (
								<BreadcrumbLink render={<Link href={item.path} />}>
									{item.name}
								</BreadcrumbLink>
							) : (
								<BreadcrumbPage>{item.name}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
