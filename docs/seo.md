# SEO: słowa kluczowe na stronach

Źródło: `../analiza słów.pdf` (Google Keyword Planner, 2 404 frazy). Liczby to wyszukania
miesięcznie w Polsce. Zasada: jedna fraza główna, warianty w nagłówkach i treści strony usługi,
pytania problemowe w FAQ. Frazy muszą brzmieć naturalnie, bez upychania.

## Mapa fraz na strony

| Fraza                                         | Wyszukań | Gdzie jest                                                   |
| --------------------------------------------- | -------- | ------------------------------------------------------------ |
| frezowanie pod ogrzewanie podłogowe           | 5 000    | adres i H1 usługi, H1 każdej strony miasta, title            |
| frezowane ogrzewanie podłogowe                | 500      | nad H1 na głównej (w kodzie część H1), stopka, nazwa firmy   |
| ogrzewanie podłogowe frezowane                | 500      | title i description głównej                                  |
| frezowanie wylewki pod ogrzewanie podłogowe   | 500      | lead głównej („Frezujemy wylewkę pod ogrzewanie podłogowe…”) |
| frezowanie wylewki                            | 500      | „Jak to działa” („Frezowanie wylewki robimy maszyną…”)       |
| frezowanie posadzki (pod ogrzewanie)          | 500      | lead usługi, „Jak to działa” („w posadzce”)                  |
| frezowanie pod podłogówkę                     | 500      | H2 ceny („Frezowanie pod podłogówkę: cena za m²”)            |
| … cena / cena za m2                           | 500      | H2 ceny, description usługi                                  |
| ogrzewanie podłogowe w istniejącej wylewce    | 50       | lead usługi (dosłownie)                                      |
| ogrzewanie podłogowe w starym domu            | 500      | FAQ                                                          |
| ogrzewanie podłogowe w bloku                  | 500      | FAQ                                                          |
| podłogówka czy grzejniki                      | 500      | FAQ                                                          |
| podłogówka / ogrzewanie podłogowe z grzejnika | 500      | FAQ                                                          |
| pompa ciepła ogrzewanie podłogowe             | 500      | FAQ, lead strony miasta                                      |
| ogrzewanie podłogowe wady i zalety            | 500      | FAQ                                                          |
| frezowanie pod ogrzewanie podłogowe + miasto  | 50+      | H1, title i adres każdej strony miasta                       |

**Nie używamy** fraz „frezarka do…”, „maszyna do frezowania…”. To ruch osób kupujących maszynę (przy
reklamach Google: wykluczyć od pierwszego dnia).

## Tytuły i opisy (do `metadata` w Next.js)

| Strona                                        | title                                                       | description                                                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                           | Frezowane ogrzewanie podłogowe bez skuwania · Kubik         | Ogrzewanie podłogowe frezowane w wylewce, którą już masz. 50 m² w jeden dzień, bez kurzu. 5,0 w Google, 70+ opinii. Cała Polska. |
| `/frezowanie-pod-ogrzewanie-podlogowe`        | Frezowanie pod ogrzewanie podłogowe: cena, przebieg · Kubik | Frezowanie wylewki pod ogrzewanie podłogowe bez skuwania. Sprawdź, od czego zależy cena za m², i zamów darmową wycenę.           |
| `/frezowanie-pod-ogrzewanie-podlogowe/krakow` | Frezowanie pod ogrzewanie podłogowe Kraków · Kubik          | Frezowanie pod podłogówkę w Krakowie: w blokach, kamienicach i domach, bez podnoszenia podłogi. Darmowa wycena.                  |
| `/realizacje`                                 | Realizacje: frezowane ogrzewanie podłogowe · Kubik          | 12 podłóg z metrażem, rodzajem wylewki i czasem pracy. Zdjęcia z prawdziwych budów.                                              |
| `/realizacje/<miasto>-<metraż>m2`             | Frezowanie pod podłogówkę, <Miasto>, <metraż> m² · Kubik    | Przebieg frezowania wylewki pod ogrzewanie podłogowe: <obiekt>, <metraż> m², <czas>.                                             |
| `/kontakt`                                    | Kontakt i darmowa wycena · Kubik                            | Zadzwoń: 507 125 794, całą dobę. Albo zostaw numer, oddzwonimy z ceną.                                                           |

## H1

- Główna: w kodzie jeden `<h1>` z dwiema częściami: mały nadtytuł „Frezowane ogrzewanie podłogowe” i
  duże „Ciepła podłoga bez skuwania posadzki.”. Wygląd bez zmian, fraza w H1.
- Usługa: „Frezowanie pod ogrzewanie podłogowe.”
- Miasto: „Frezowanie pod ogrzewanie podłogowe w <Mieście>.”

## Strony miast

Każda strona pisana osobno (dojazd, zabudowa, typowe wylewki, realizacje z okolicy). Nie kopiujemy
treści usługi 1:1. Dziś w projekcie strona Krakowa powtarza teksty „Jak to działa” i FAQ ze strony
usługi. Przy budowie trzeba je przeredagować dla każdego miasta.

## Dane strukturalne

`LocalBusiness` (nazwa, adres, telefon, NIP, obszar: Polska, ocena 5,0 / liczba opinii), `Service`
na stronie usługi, `FAQPage` na FAQ, `BreadcrumbList` na miastach i realizacjach.
