# Nestor Tools

Herbruikbare interactieve tools (vraag-en-antwoord). Eén bronbestand per tool,
overal ingesloten met een klein snippet. Eén keer aanpassen = overal bijgewerkt.

## Tools

| Bestand | Tool | Mount-div |
|---|---|---|
| `flexi-job.js` | Flexi-Job check | `<div id="flexi-job-tool">` |
| `inkomsten-limiet.js` | Hoeveel mag je bijverdienen? | `<div id="inkomsten-limiet-tool">` |
| `flexi-pc-checker.js` | PC-checker + lead-formulier | `<div id="flexi-checker-container-leadgen">` |
| `werkgeverskost.js` | Rekentool werkgeverskost + lead-formulier | `<div id="werkgeverskost-tool">` |
| `vacature-doorsturen.js` | Waarom Nestor + stuur je vacature door | `<div id="vacature-doorsturen-tool">` |

> - `flexi-pc-checker.js` stuurt e-mailleads naar een Google Apps Script (`scriptUrl` in CONFIG).
> - `werkgeverskost.js` en `vacature-doorsturen.js` sturen leads naar een HubSpot-formulier (`hubspot` in CONFIG).
>
> Dat zijn publieke endpoints: geen geheim, maar wel zichtbaar in de repo.

## Insluiten op een pagina (HubSpot of elke andere site)

Plak de mount-div en het script waar de tool moet verschijnen, bijvoorbeeld:

```html
<div id="flexi-job-tool"></div>
<script src="https://cdn.jsdelivr.net/gh/tibodeblaere-ai/tools-website@main/flexi-job.js" defer></script>
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

De snippets laden altijd `@main`. Push (of merge) je naar `main`, dan leegt de
GitHub Action `Purge jsDelivr cache` meteen de cache van de gewijzigde bestanden.
Binnen een minuut staat de nieuwe versie overal live, zonder iets in het CMS aan te passen.

Zie je de wijziging toch niet? Start de Action dan handmatig via
**Actions → Purge jsDelivr cache → Run workflow**. Die leegt de cache van alle bestanden.

## Lokaal testen

Open een `test-*.html`-bestand in je browser (of via een lokale server). Dat bestand
gebruikt het lokale tool-bestand; op je site wordt dat de jsDelivr-URL.
