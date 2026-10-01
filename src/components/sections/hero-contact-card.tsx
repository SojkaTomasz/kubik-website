import { Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { companyConfig } from '@/company.config'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Rating } from '@/components/ui/rating'
import { phoneLinks } from '@/lib/phone'

/**
 * Blok z prawej w hero (Paper: hero strony głównej i usługi) — ocena i dwa
 * wyjścia: telefon i wycena. Od desktopu; na telefonie tę rolę gra
 * przyklejony pasek u dołu ekranu.
 */
export function HeroContactCard({ className }: { className?: string }) {
	const t = useTranslations('nav')
	const rating = useTranslations('rating')
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined

	return (
		<Card
			className={
				className ?? 'hidden shrink-0 items-end gap-5 border bg-background/90 p-6 lg:flex'
			}
		>
			{companyConfig.rating && (
				<Rating
					value={companyConfig.rating.value}
					label={rating('long', { count: companyConfig.rating.count })}
				/>
			)}
			<div className='flex gap-2'>
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
				<Button
					href='#wycena'
					size='xl'
				>
					{t('quote')}
				</Button>
			</div>
		</Card>
	)
}
