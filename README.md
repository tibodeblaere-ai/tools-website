# Nestor Tools

Herbruikbare interactieve tools (vraag-en-antwoord). Eén bronbestand per tool,
overal ingesloten met een klein snippet. Eén keer aanpassen = overal bijgewerkt.

## Tools

| Bestand | Tool | Mount-div |
|---|---|---|
| `flexi-job.js` | Flexi-Job check | `<div id="flexi-job-tool">` |
| `inkomsten-limiet.js` | Hoeveel mag je bijverdienen? | `<div id="inkomsten-limiet-tool">` |
| `flexi-pc-checker.js` | PC-checker + lead-formulier | `<div id="flexi-checker-container-leadgen">` |
| `werkgeverskost.js` | Wat kost een medewerker? (aanvraag berekening) | `<div id="werkgeverskost-tool">` |
| `vacature-doorsturen.js` | Waarom Nestor + stuur je vacature door | `<div id="vacature-doorsturen-tool">` |

> - `flexi-pc-checker.js` stuurt e-mailleads naar een Google Apps Script (`scriptUrl` in CONFIG).
> - `werkgeverskost.js` en `vacature-doorsturen.js` sturen leads naar een HubSpot-formulier (`hubspot` in CONFIG).
>
> Dat zijn publieke endpoints: geen geheim, maar wel zichtbaar in de repo.

## Insluiten op een pagina (HubSpot of elke andere site)

Plak de mount-div en het script waar de tool moet verschijnen, bijvoorbeeld:

```html
<div id="flexi-job-tool"></div>
<script src="https://tibodeblaere-ai.github.io/tools-website/flexi-job.js" defer></script>
```

Voor de andere tools vervang je de mount-div en de bestandsnaam volgens de tabel.

- Staat de mount-div niet op de pagina, dan doet het script niets.
- De CSS zit in het script en is afgeschermd met een eigen prefix, dus het botst niet
  met de rest van je site.

## Inhoud aanpassen

Open het tool-bestand en pas alleen het **`CONFIG`-blok** bovenaan aan
(vragen, keuzes, resultaatteksten, de "zoek"-link en kleuren). De logica eronder
hoef je niet aan te raken.

## Een aanpassing live zetten

De tools worden geladen via **GitHub Pages** (`https://tibodeblaere-ai.github.io/tools-website/…`).
Push (of merge) je naar `main`, dan staat de nieuwe versie binnen ongeveer een minuut online.
Browsers bewaren het bestand maximaal 10 minuten, dus na ten laatste ~10 minuten ziet iedereen de nieuwe versie.
Je hoeft niets in het CMS aan te passen.

> Vroeger liepen de snippets via jsDelivr (`cdn.jsdelivr.net/gh/…@main/…`). Dat bleek onbetrouwbaar:
> browsers bewaarden het bestand tot 7 dagen en jsDelivr bleef soms uren een oude versie leveren.
> Staat er in het CMS nog een jsDelivr-link, vervang die dan door de GitHub Pages-link.
> De Action `Purge jsDelivr cache` blijft voorlopig bestaan voor die oude links.

## Lokaal testen

Open een `test-*.html`-bestand in je browser (of via een lokale server). Dat bestand
gebruikt het lokale tool-bestand; op je site wordt dat de jsDelivr-URL.
