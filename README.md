# Nestor Tools

Herbruikbare interactieve tools (vraag-en-antwoord). Eén bronbestand per tool,
overal ingesloten met een klein snippet. Eén keer aanpassen = overal bijgewerkt.

## Tools

| Bestand | Tool | Mount-div |
|---|---|---|
| `flexi-job.js` | Flexi-Job check | `<div id="flexi-job-tool">` |
| _(volgt)_ | Tool 2 | |
| _(volgt)_ | Tool 3 | |

## Insluiten op een pagina (HubSpot of elke andere site)

Plak dit waar de tool moet verschijnen. Vervang `USER` door je GitHub-gebruikersnaam.

```html
<div id="flexi-job-tool"></div>
<script src="https://cdn.jsdelivr.net/gh/USER/nestor-tools@v1/flexi-job.js" defer></script>
```

- Staat er geen `<div id="flexi-job-tool">` op de pagina, dan doet het script niets.
- De CSS zit in het script en is afgeschermd (prefix `fjt-`), dus het botst niet
  met de rest van je site.

## Inhoud aanpassen

Open het tool-bestand en pas alleen het **`CONFIG`-blok** bovenaan aan
(vragen, keuzes, resultaatteksten, de "zoek"-link en kleuren). De logica eronder
hoef je niet aan te raken.

## Een nieuwe versie uitbrengen

jsDelivr cachet een versie-tag ~7 dagen. Werk daarom met versie-tags:

```bash
git add -A
git commit -m "flexi-job: tekst bijgewerkt"
git tag v2          # nieuwe versie
git push origin main --tags
```

Werk daarna in de snippets `@v1` bij naar `@v2`. Eénmaal de URL is opgehaald,
blijft die versie stabiel gecachet (caching-probleem opgelost).

### Alternatief: automatisch bijwerken zonder snippets aan te raken

Gebruik `@latest` in plaats van een versie-tag:

```html
<script src="https://cdn.jsdelivr.net/gh/USER/nestor-tools@latest/flexi-job.js" defer></script>
```

Dan komt elke push automatisch overal door (kortere cache, iets trager).
Afweging: gemak vs. controle over wanneer een wijziging live gaat.

## Lokaal testen

Open `test-flexi-job.html` in je browser (of via een lokale server). Dat bestand
gebruikt het lokale `flexi-job.js`; op je site wordt dat de jsDelivr-URL.
