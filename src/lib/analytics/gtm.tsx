import Script from 'next/script'

import { InlineScript } from '@/components/layout/inline-script'
import { env } from '@/env'
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from '@/lib/analytics/consent'

/**
 * Google Tag Manager z Consent Mode v2. KOLEJNOŚĆ jest tu całym zabezpieczeniem:
 * najpierw skrypt inline w `<head>` (domyślna odmowa + odtworzenie zapisanej
 * zgody), dopiero potem kontener przez `lazyOnload`. Odwrotnie kontener zdążyłby
 * odpalić tagi, zanim dowie się o odmowie; `wait_for_update: 500` daje bufor.
 *
 * Nie używamy `@next/third-parties/GoogleTagManager` — nie pozwala wstawić
 * skryptu zgody przed kontenerem.
 */

/** Zwykły JavaScript w stringu — musi wykonać się przed jakimkolwiek kodem Reacta. */
const consentBootstrap = `
(function () {
	window.dataLayer = window.dataLayer || [];
	function gtag() { window.dataLayer.push(arguments); }
	window.gtag = gtag;

	gtag('consent', 'default', {
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
		analytics_storage: 'denied',
		functionality_storage: 'denied',
		personalization_storage: 'denied',
		security_storage: 'granted',
		wait_for_update: 500
	});

	try {
		var raw = window.localStorage.getItem('${CONSENT_STORAGE_KEY}');
		if (raw) {
			var saved = JSON.parse(raw);
			if (saved && saved.version === ${CONSENT_VERSION}) {
				gtag('consent', 'update', {
					ad_storage: saved.marketing ? 'granted' : 'denied',
					ad_user_data: saved.marketing ? 'granted' : 'denied',
					ad_personalization: saved.marketing ? 'granted' : 'denied',
					analytics_storage: saved.analytics ? 'granted' : 'denied',
					functionality_storage: saved.preferences ? 'granted' : 'denied',
					personalization_storage: saved.preferences ? 'granted' : 'denied',
					security_storage: 'granted'
				});
			}
		}
	} catch (error) {
		// localStorage zablokowany (tryb prywatny) — zostaje domyślna odmowa.
	}
})();
`

const containerScript = (gtmId: string) => `
(function (w, d, s, l, i) {
	w[l] = w[l] || [];
	w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
	var f = d.getElementsByTagName(s)[0],
		j = d.createElement(s),
		dl = l != 'dataLayer' ? '&l=' + l : '';
	j.async = true;
	j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
	f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', '${gtmId}');
`

/**
 * Skrypty GTM-a — montowane w `<head>` root layoutu.
 * Bez `NEXT_PUBLIC_GTM_ID` nie renderuje niczego, więc lokalnie nic się nie ładuje.
 */
export function GoogleTagManager() {
	const gtmId = env.NEXT_PUBLIC_GTM_ID

	if (!gtmId) return null

	return (
		<>
			<InlineScript html={consentBootstrap} />
			<Script
				id='gtm-container'
				strategy='lazyOnload'

				dangerouslySetInnerHTML={{ __html: containerScript(gtmId) }}
			/>
		</>
	)
}

/**
 * Wariant bez JavaScriptu — pierwszy element `<body>`. ⚠️ Ładuje się BEZ oglądania
 * na zgodę, bo nie da się go warunkować. Jeśli kontener ma tagi marketingowe,
 * usuń ten komponent.
 */
export function GoogleTagManagerNoScript() {
	const gtmId = env.NEXT_PUBLIC_GTM_ID

	if (!gtmId) return null

	return (
		<noscript>
			<iframe
				src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
				height='0'
				width='0'
				style={{ display: 'none', visibility: 'hidden' }}
				title='Google Tag Manager'
			/>
		</noscript>
	)
}
