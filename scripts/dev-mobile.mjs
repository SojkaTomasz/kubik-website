/**
 * `pnpm dev:mobile` — serwer deweloperski plus przekaźnik lustra przewijania
 * i kliknięć, w jednym terminalu.
 *
 * Otwórz stronę na komputerze (http://localhost:3000) i na telefonie w tej
 * samej sieci (adres „Network" wypisany przez Next). Przewijanie i kliknięcia
 * z jednego urządzenia powtarza drugie — `components/dev/mirror-sync-client.tsx`.
 *
 * Przekaźnik tylko przesyła wiadomości `{type: 'scroll' | 'click'}` między
 * kartami. NIE stoi przed `next dev` jako proxy: proxy psuje WebSocket HMR
 * Turbopacka i React w ogóle się nie hydratuje — strona wygląda na działającą,
 * a nic nie reaguje, bez błędu w konsoli.
 *
 * Porty: MIRROR_PORT (domyślnie 4001), PORT dla Next (domyślnie 3000).
 * Telefon w sieci lokalnej wymaga `allowedDevOrigins` w next.config.ts.
 */
import { spawn } from 'node:child_process'
import { networkInterfaces } from 'node:os'
import { WebSocketServer } from 'ws'

const mirrorPort = Number(process.env.MIRROR_PORT) || 4001
const nextPort = Number(process.env.PORT) || 3000

/** Sieć lokalna (Wi-Fi, kabel) — adres, który wpisuje się na telefonie w tej samej sieci. */
const PRIVATE_LAN = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/

/**
 * Adresy IPv4 maszyny, sieć lokalna NAJPIERW. Pierwszy adres z listy bywa
 * adresem VPN (Tailscale: 100.x.x.x) — telefon w domowej sieci by go nie
 * osiągnął, a wyglądałoby to na niedziałający serwer.
 */
function machineAddresses() {
	const addresses = Object.values(networkInterfaces())
		.flat()
		.filter(address => address && address.family === 'IPv4' && !address.internal)
		.map(address => address.address)

	return [
		...addresses.filter(address => PRIVATE_LAN.test(address)),
		...addresses.filter(address => !PRIVATE_LAN.test(address)),
	]
}

const log = message => process.stdout.write(`[mirror] ${message}\n`)

const relay = new WebSocketServer({ port: mirrorPort })

relay.on('connection', socket => {
	log(`klient połączony (${relay.clients.size} aktywnych)`)

	socket.on('message', data => {
		for (const client of relay.clients) {
			if (client !== socket && client.readyState === client.OPEN) client.send(data.toString())
		}
	})

	socket.on('close', () => log(`klient rozłączony (${relay.clients.size} aktywnych)`))
})

log(`przekaźnik przewijania i kliknięć na porcie ${mirrorPort}`)
const [lan, ...other] = machineAddresses()
log(
	`otwórz http://localhost:${nextPort} na komputerze i http://${lan ?? '<adres LAN>'}:${nextPort} na telefonie`
)
for (const address of other) log(`inny adres tej maszyny (np. VPN): http://${address}:${nextPort}`)

/*
 * `NEXT_PUBLIC_DEV_MIRROR_PORT` włącza klienta lustra w layoucie. Przy zwykłym
 * `pnpm dev` go nie ma, więc strona nie próbuje łączyć się z przekaźnikiem.
 */
// Jeden napis, nie lista argumentów: na Windowsie `pnpm` to plik .cmd, który wymaga
// powłoki, a powłoka z listą argumentów daje ostrzeżenie Node (DEP0190).
const next = spawn(`pnpm exec next dev --port ${nextPort}`, {
	stdio: 'inherit',
	shell: true,
	env: { ...process.env, NEXT_PUBLIC_DEV_MIRROR_PORT: String(mirrorPort) },
})

function shutdown(code = 0) {
	relay.close()
	if (!next.killed) next.kill()
	process.exit(code)
}

next.on('exit', code => shutdown(code ?? 0))
process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
