import { Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { companyConfig } from '@/company.config'
import { Button } from '@/components/ui/button'
import { Rating } from '@/components/ui/rating'
import { phoneLinks } from '@/lib/phone'

/**
 * Rząd pod leadem hero usługi i miasta (Paper) — „Darmowa wycena", „Zadzwoń"
 * i ocena. Na telefonie przyciski chowają się: tę rolę gra przyklejony pasek.
 */
export function HeroActions() {
	const t = useTranslations('nav')
	const rating = useTranslations('rating')
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined

	return (
		<div className='flex flex-wrap items-center gap-x-6 gap-y-4 pt-2'>
			<div className='hidden gap-2 sm:flex'>
				<Button
					href='#wycena'
					size='xl'
				>
					{t('quote')}
				</Button>
				{phone && (
					<Button
						href={phone.href}
						variant='call'
						size='xl'
						icon={<Phone />}
					>
						{t('call')}
					</Button>
				)}
			</div>
			{companyConfig.rating && (
				<Rating
					value={companyConfig.rating.value}
					label={rating('long', { count: companyConfig.rating.count })}
				/>
			)}
		</div>
	)
}
