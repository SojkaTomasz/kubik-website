# Zakres strony Kubik

Frezowane ogrzewanie podłogowe Kubik (Tylmanowa). Źródła: `../wycena.pdf` (oferta z 26.08.2026),
`../analiza słów.pdf`, ustalenia z klientem z 28.09.2026.

## Cel

Strona ma doprowadzić do telefonu albo zostawienia numeru. Wszystko inne jest temu podporządkowane.
66% ruchu w branży to telefony, więc projekt zaczyna się od widoku mobilnego.

## Ustalenia

- **Język:** tylko polski (`locales = ['pl']`).
- **Motyw:** wyłącznie ciemny, kolory z logo (czerwień zasilania, niebieski powrotu, grafit).
  Nowoczesny: duża typografia, slidery, animacje przy przewijaniu. Nie może wyglądać „jak z AI”.
- **Miasta:** 12 (6 z oferty + 6 dokupionych). Obszar działania w tekstach: cała Polska.
- **Głos:** firma mówi „my”, bez imienia właściciela na stronie.
- **SMS-y:** tak, obok maila. Pole nadawcy zarejestrować u operatora przed startem (1–2 dni).
- **Bez:** kalkulatora, poradników, listy zapytań w arkuszu, bloga, wersji obcojęzycznych.

## Mapa strony: 29 adresów

| Strona                              | Adres                                           | W menu |
| ----------------------------------- | ----------------------------------------------- | ------ |
| Strona główna                       | `/`                                             | logo   |
| Usługa                              | `/frezowanie-pod-ogrzewanie-podlogowe`          | tak    |
| Realizacje                          | `/realizacje`                                   | tak    |
| Kontakt                             | `/kontakt`                                      | tak    |
| Polityka prywatności                | `/polityka-prywatnosci`                         | stopka |
| 12 stron miast                      | `/frezowanie-pod-ogrzewanie-podlogowe/<miasto>` | nie    |
| 12 realizacji (po jednej na miasto) | `/realizacje/<miasto>-<metraż>m2`               | nie    |

Główna fraza (5 000 wyszukań/mc) w adresie usługi; miasta zagnieżdżone pod nią. Warianty frazy
(„frezowanie wylewki…”, „frezowanie posadzki…”) idą w nagłówki strony usługi, nie w osobne adresy.

### Miasta

Jedno miasto na województwo, według ogłoszeń klienta na OLX (stan z 29.09.2026). 10 województw z OLX
plus 2 duże województwa bez ogłoszeń, żeby było minimum 12. **Do potwierdzenia z klientem.**

| Województwo        | Miasto                                        | Adres                                           |
| ------------------ | --------------------------------------------- | ----------------------------------------------- |
| mazowieckie        | Warszawa                                      | `/frezowanie-pod-ogrzewanie-podlogowe/warszawa` |
| małopolskie        | Kraków                                        | `.../krakow`                                    |
| dolnośląskie       | Wrocław                                       | `.../wroclaw`                                   |
| łódzkie            | Łódź                                          | `.../lodz`                                      |
| śląskie            | Katowice                                      | `.../katowice`                                  |
| podkarpackie       | Rzeszów                                       | `.../rzeszow`                                   |
| świętokrzyskie     | Kielce                                        | `.../kielce`                                    |
| opolskie           | Opole                                         | `.../opole`                                     |
| kujawsko-pomorskie | Toruń                                         | `.../torun`                                     |
| wielkopolskie      | Kalisz (albo Poznań, jeśli klient tam jeździ) | `.../kalisz`                                    |
| pomorskie          | Gdańsk (spoza OLX)                            | `.../gdansk`                                    |
| lubelskie          | Lublin (spoza OLX)                            | `.../lublin`                                    |

Brakujące województwa (zachodniopomorskie, lubuskie, podlaskie, warmińsko-mazurskie) można dołożyć
później, po 350 zł za miasto. Tarnów i Krosno z oferty wypadają, klient musi się zgodzić.

Każda strona miasta pisana osobno (dojazd, zabudowa, typowe wylewki, realizacje z okolicy), a nie
generowana z szablonu z podmienioną nazwą.

## Sekcje

**Wspólne na każdej stronie:** menu (4 pozycje), stopka (linki, dane firmy, telefon, obszar
działania, polityka), formularz (metraż, telefon, miejscowość; bez imienia; na stronach miast
miejscowość wypełnia się sama), przyklejony pasek „Zadzwoń / Darmowa wycena”, okienko wyceny
(metraż + telefon; po ~2/3 strony, na desktopie też przy wyjściu z karty, raz na wizytę, na
telefonie jako pasek od dołu).

**Strona główna:** hero (zdjęcie z roboty, 5,0 z 64 opinii, „ogrzewanie podłogowe w istniejącej
wylewce, bez pyłu, w jeden dzień”), kim jesteśmy, opinie, ostatnie realizacje, formularz.

**Usługa** (najważniejsza): hero → jak to działa → kiedy się nadaje, a kiedy nie → przebieg krok po
kroku → realizacje (dowód) → co wpływa na cenę (bez stawek) → FAQ (stary dom, blok, grzejniki, pompa
ciepła) → formularz.

**Miasto:** układ strony usługi, treść lokalna.

**Realizacje:** galeria: miasto, metraż, wylewka, czas. **Realizacja:** zdjęcie główne, dane, opis w
trzech krokach, galeria wszystkich zdjęć z budowy, CTA.

**Kontakt:** telefon, formularz, dane firmy, obszar działania.

**Opinie:** „jedna z najwyżej ocenianych firm w branży w Polsce” (lider ma 84 opinie; po
przeskoczeniu podmiana na „pierwsze miejsce”).

## Formularz

Po wysłaniu: SMS + mail do właściciela, z informacją, z której strony przyszło zapytanie.

## Realizacje: przydział zdjęć

Zdjęcia w `../image/`. Miasta przypisane decyzją projektu, nie według faktycznego miejsca roboty.
**Do sprawdzenia z klientem:** gdzie faktycznie była każda robota, żeby podpis miasta był prawdziwy.
**Metraż, wylewka i czas to szacunki ze zdjęć, do potwierdzenia z klientem.**

| #   | Miasto   | Adres                       | Obiekt                                     | Metraż (szac.) | Zdjęcia                                     |
| --- | -------- | --------------------------- | ------------------------------------------ | -------------- | ------------------------------------------- |
| 1   | Wrocław  | `/realizacje/wroclaw-50m2`  | poddasze, laser, rowki, rury               | ~50            | `20260907_*`, `20260908_*` (8)              |
| 2   | Łódź     | `/realizacje/lodz-60m2`     | dom, etap zalewania                        | ~60            | `20260901_*` (6)                            |
| 3   | Kraków   | `/realizacje/krakow-90m2`   | budynek z przeszkleniem, open space        | ~90            | `20260819_124347`, `20260820_*` (3 + wideo) |
| 4   | Kielce   | `/realizacje/kielce-50m2`   | nowy dom, 3 pokoje, rozdzielacz            | ~50            | `20250825_*` (5)                            |
| 5   | Rzeszów  | `/realizacje/rzeszow-60m2`  | nowe mieszkanie, para przed/po             | ~60            | `20241210_*` (5)                            |
| 6   | Toruń    | `/realizacje/torun-60m2`    | mieszkanie w wieżowcu, frezarka przy oknie | ~60            | `20240814_*` (5)                            |
| 7   | Katowice | `/realizacje/katowice-70m2` | wykończone poddasze, rozdzielacz 8 pętli   | ~70            | `20260127_*` (3)                            |
| 8   | Opole    | `/realizacje/opole-80m2`    | nowy dom, duży salon                       | ~80            | `20260528_*`, `20260530_082538` (4)         |
| 9   | Kalisz   | `/realizacje/kalisz-60m2`   | dom z kutymi drzwiami balkonowymi          | ~60            | `20260904_*` (6)                            |
| 10  | Lublin   | `/realizacje/lublin-45m2`   | poddasze w remoncie, g-k                   | ~45            | `20260520_*` (3)                            |
| 11  | Gdańsk   | `/realizacje/gdansk-90m2`   | remont domu z tarasem, open space          | ~90            | `20250718_*`, `20250721_134637` (3)         |
| 12  | Warszawa | `/realizacje/warszawa-50m2` | poddasze pod skosem, rozdzielacze          | ~50            | `20251015_*`, `20251017_081801` (3)         |

Wylewka na wszystkich: cementowa (szacunek). Czas: 1 dzień (do potwierdzenia).

**Hero:** `20260908_110123` (spirala rur), `20240814_111442` (frezarka przy oknie),
`20260318_143302` (poddasze w słońcu). **„Bez pyłu”:** `20240212_125915` (frezarka z odkurzaczem w
garderobie). **Rezerwa:** poddasze z belkami `20260127_*`, kościół `20241213_120709`.

## Do uzupełnienia przez klienta

- potwierdzenie listy 12 miast (jedno na województwo) i miejsca każdej realizacji
- metraże i rodzaje wylewek dla 6 realizacji
- domena
