/* =====================================================================
 * Nestor – Flexi-Job PC-checker (met lead-formulier)
 * Eén zelfstandig bestand. Sluit overal in met:
 *
 *   <div id="flexi-checker-container-leadgen"></div>
 *   <script src="https://cdn.jsdelivr.net/gh/USER/nestor-tools@v1/flexi-pc-checker.js" defer></script>
 *
 * Inhoud aanpassen? Pas alleen het CONFIG-blok hieronder aan.
 * De logica eronder hoef je normaal niet aan te raken.
 * ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   *  CONFIG — hier pas je teksten, sectoren en de Script-URL aan
   * ------------------------------------------------------------------ */
  var CONFIG = {
    mountId: "flexi-checker-container-leadgen",

    // Google Apps Script endpoint dat de e-mailleads opvangt.
    // LET OP: dit is een publiek endpoint (zit ook in de front-end code).
    scriptUrl: "https://script.google.com/macros/s/AKfycbw6iYbawhdjDnP10fz17tTYjLLdVihiIcwBRbbPnKGEzg6BTyBSMDCdy8w7PXH8vmI/exec",

    colors: { primary: "#F73109", primaryHover: "#D92B07", primaryDisabled: "#fabbb0" },

    header: {
      title: "Komt jouw sector in aanmerking voor Flexi-Jobs?",
      intro: "Voer hieronder het nummer van je paritair comité (PC) in en ontdek het meteen."
    },
    placeholder: "Bv: 302, 118.03, ...",
    checkLabel: "Controleer",

    cta: { url: "https://interim.nestor.be/database-tool", label: "Neem een kijkje in onze database →" },

    disclaimer: "<strong>Disclaimer:</strong> Deze tool is louter informatief. Er kunnen geen rechten aan worden ontleend. Raadpleeg altijd de officiële bronnen voor de meest actuele en correcte informatie.",

    // Sectoren die pas VANAF 1 JULI 2026 beschikbaar zijn (bv. zorgberoepen).
    // Komt een ingevoerd PC hierin voor, dan tonen we onderstaande banner bij het resultaat.
    vanafJuli2026: ["330"],
    vanafJuliNote: "⏳ <strong>Let op:</strong> voor (zorg)beroepen in deze sector wordt flexi-jobben pas mogelijk <strong>vanaf 1 juli 2026</strong>.",

    // Algemene boodschap voor sectoren die (nog) niet op de lijst staan.
    alleSectorenNote: "Maar goed nieuws: vanaf <strong>1 juli 2026</strong> wordt flexi-jobben mogelijk in alle sectoren (behalve sectoren met een geldige opt-out, zoals de landbouw). (Onder voorbehoud)",

    // Goedgekeurde paritaire comités (PC's)
    eligiblePCs: [
      "302", "201", "118.03", "312", "314", "330", "223", "303.03", "304", "331",
      "140.01", "112", "118", "118.07", "118.08", "118.09", "118.10", "118.11",
      "118.12", "118.14", "118.21", "118.22", "200", "320", "323", "140.05", "139"
    ],

    // Sectoren met bijzondere voorwaarden (key = PC of trefwoord).
    specialCases: {
      "118": "Ja, de voedingsindustrie (PC 118) komt in grote mate in aanmerking. Hier zijn de belangrijkste subsectoren die in aanmerking komen:" +
        '<ul style="margin-top:8px;list-style-position:inside;list-style-type:disc;">' +
          "<li><strong>PC 118.03:</strong> Bakkerijen en banketbakkerijen</li>" +
          "<li><strong>PC 118.07:</strong> Brouwerijen en mouterijen</li>" +
          "<li><strong>PC 118.08:</strong> Drankennijverheid</li>" +
          "<li><strong>PC 118.09:</strong> Groentenijverheid</li>" +
          "<li><strong>PC 118.11:</strong> Vleesnijverheid</li>" +
          "<li><strong>PC 118.12:</strong> Zuivelproducten</li>" +
          "<li><strong>PC 118.21:</strong> Aardappelverwerkende nijverheid</li>" +
        "</ul>" +
        '<p style="margin-top:8px;">Als uw specifieke sub-PC hierbij staat, komt u in aanmerking.</p>',
      "330": "Ja, de zorgsector (PC 330) komt in aanmerking, maar enkel voor publieke instellingen met specifieke NACE-codes. Controleer dit zorgvuldig.",
      "331": "Ja, kinderopvang (PC 331) komt in aanmerking, op voorwaarde dat de hoofdactiviteit kinderopvang is (NACE 88.91).",
      "200": "Ja, PC 200 komt in aanmerking voor rijscholen en opleidingscentra met NACE-code 85.531.",
      "320": "Ja, voor begrafenisondernemers (PC 320) is dit enkel mogelijk voor gelegenheidsmedewerkers.",
      "onderwijs": "Ja, de onderwijssector komt in aanmerking, zowel het officiële als het gesubsidieerde vrije onderwijs. Dit is niet gebonden aan een specifiek PC-nummer.",
      "events": "Ja, de eventsector komt in aanmerking. Dit is niet gebonden aan één specifiek PC, maar aan specifieke NACE-codes voor evenementenorganisatie. Controleer je NACE-code."
    },

    leadForm: {
      defaultTitle: "Blijf op de hoogte of ontvang hulp",
      defaultDesc: "Laat je e-mailadres achter en wij contacteren je met specifieke info voor jouw sector.",
      nietTitle: "Blijf op de hoogte voor 2026",
      nietDesc: "Wil je als eerste weten wanneer je kan starten? Laat je gegevens achter.",
      emailPlaceholder: "jouw@email.be",
      sendLabel: "Verstuur"
    }
  };

  /* ------------------------------------------------------------------ *
   *  Vanaf hier: logica + styling. Normaal niet aanpassen.
   * ------------------------------------------------------------------ */

  var ROOT = "fpc"; // class-prefix, voorkomt botsing met de rest van de site

  function injectStyles() {
    if (document.getElementById(ROOT + "-styles")) return;
    var P = "#" + CONFIG.mountId;
    var css = `
${P}{--fpc-primary:${CONFIG.colors.primary};--fpc-primary-hover:${CONFIG.colors.primaryHover};--fpc-primary-dis:${CONFIG.colors.primaryDisabled}}
${P} .${ROOT}-wrapper{max-width:650px;margin:20px auto;background:#fff;padding:24px 32px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,.08);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1a202c;box-sizing:border-box}
${P} .${ROOT}-wrapper *{box-sizing:border-box}
${P} .${ROOT}-header{text-align:center;margin-bottom:24px}
${P} .${ROOT}-header h2{margin:0 0 8px;font-size:1.4rem}
${P} .${ROOT}-header p{margin:0;color:#4a5568}
${P} .${ROOT}-form{display:flex;gap:12px;margin-bottom:24px}
${P} .${ROOT}-form input{flex-grow:1;padding:10px 15px;border:1px solid #ccc;border-radius:8px;font-size:16px}
${P} .${ROOT}-btn{flex-shrink:0;border-radius:8px;background:var(--fpc-primary);color:#fff;padding:10px 20px;border:none;cursor:pointer;font-size:16px;transition:background-color .3s ease}
${P} .${ROOT}-btn:hover{background:var(--fpc-primary-hover)}
${P} .${ROOT}-btn:disabled{background:var(--fpc-primary-dis);cursor:not-allowed}
${P} .${ROOT}-result{min-height:0}
${P} .${ROOT}-lead{animation:fpcFadeIn .5s ease-in}
@keyframes fpcFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
${P} .${ROOT}-lead h3{margin:0 0 4px}
${P} .${ROOT}-lead .${ROOT}-lead-desc{font-size:.9em;margin-bottom:15px}
${P} .${ROOT}-disclaimer{margin-top:24px;padding-top:16px;border-top:1px solid #e1e1e1;font-size:.8em;text-align:center;color:#4a5568}
${P} .${ROOT}-note{border-left-width:4px;border-left-style:solid;padding:16px;border-radius:4px;margin-bottom:16px}
${P} .${ROOT}-note.success{background:#F0FFF4;border-color:#48BB78}
${P} .${ROOT}-note.error{background:#FFF5F5;border-color:#F56565}
${P} .${ROOT}-note.info{background:#FFF7ED;border-color:var(--fpc-primary)}
${P} .${ROOT}-note p{margin:0 0 8px}
${P} .${ROOT}-note p:last-child{margin-bottom:0}
${P} .${ROOT}-msg-error{color:var(--fpc-primary);margin-top:8px}
@media (max-width:600px){${P} .${ROOT}-form{flex-direction:column}${P} .${ROOT}-wrapper{padding:24px}}`;
    var style = document.createElement("style");
    style.id = ROOT + "-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function build(mount) {
    var w = el("div", ROOT + "-wrapper");

    var header = el("div", ROOT + "-header");
    header.appendChild(el("h2", null, esc(CONFIG.header.title)));
    header.appendChild(el("p", null, esc(CONFIG.header.intro)));
    w.appendChild(header);

    // PC-check formulier
    var form = el("div", ROOT + "-form");
    var pcInput = el("input");
    pcInput.type = "text";
    pcInput.placeholder = CONFIG.placeholder;
    var pcBtn = el("button", ROOT + "-btn", esc(CONFIG.checkLabel));
    pcBtn.type = "button";
    form.appendChild(pcInput);
    form.appendChild(pcBtn);
    w.appendChild(form);

    var pcResult = el("div", ROOT + "-result");
    w.appendChild(pcResult);

    // Lead-formulier (verborgen tot na check)
    var lead = el("div", ROOT + "-lead");
    lead.style.display = "none";
    lead.appendChild(el("hr", null, "")).setAttribute("style", "margin:20px 0;border:0;border-top:1px solid #eee;");
    var leadTitle = el("h3", null, esc(CONFIG.leadForm.defaultTitle));
    var leadDesc = el("p", ROOT + "-lead-desc", esc(CONFIG.leadForm.defaultDesc));
    lead.appendChild(leadTitle);
    lead.appendChild(leadDesc);
    var emailForm = el("div", ROOT + "-form");
    var emailInput = el("input");
    emailInput.type = "email";
    emailInput.placeholder = CONFIG.leadForm.emailPlaceholder;
    var emailBtn = el("button", ROOT + "-btn", esc(CONFIG.leadForm.sendLabel));
    emailBtn.type = "button";
    emailForm.appendChild(emailInput);
    emailForm.appendChild(emailBtn);
    lead.appendChild(emailForm);
    var emailResult = el("div");
    lead.appendChild(emailResult);
    w.appendChild(lead);

    var disclaimer = el("div", ROOT + "-disclaimer");
    disclaimer.appendChild(el("p", null, CONFIG.disclaimer));
    w.appendChild(disclaimer);

    mount.innerHTML = "";
    mount.appendChild(w);

    return { pcInput: pcInput, pcBtn: pcBtn, pcResult: pcResult, lead: lead,
             leadTitle: leadTitle, leadDesc: leadDesc, emailInput: emailInput,
             emailBtn: emailBtn, emailResult: emailResult };
  }

  function run(mount) {
    var r = build(mount);
    var eligible = new Set(CONFIG.eligiblePCs);
    var vanafJuli = new Set(CONFIG.vanafJuli2026);
    var lastTrackedPCValue = null;

    var ctaLink = '<p style="margin-top:16px;"><a href="' + CONFIG.cta.url +
      '" target="_blank" rel="noopener noreferrer"><u><strong>' + esc(CONFIG.cta.label) +
      "</strong></u></a></p>";

    function track(pcValue, uitkomst) {
      if (typeof window.dataLayer !== "undefined") {
        window.dataLayer.push({ event: "flexijob_pc_check", opzoeking_pc: pcValue, pc_uitkomst: uitkomst });
      }
    }

    function checkPC() {
      var pcValue = r.pcInput.value.trim().toLowerCase();
      var html = "";
      var uitkomst = "";

      if (!pcValue) {
        uitkomst = "geen invoer";
      } else if (!/^\d+(\.\d+)?$/.test(pcValue) && !CONFIG.specialCases.hasOwnProperty(pcValue)) {
        uitkomst = "ongeldige invoer";
      } else if (CONFIG.specialCases[pcValue]) {
        uitkomst = "speciale voorwaarden";
      } else if (eligible.has(pcValue)) {
        uitkomst = "in aanmerking";
      } else {
        uitkomst = "niet in aanmerking";
      }

      var pc = esc(pcValue);
      var juliBanner = vanafJuli.has(pcValue) ? "<p>" + CONFIG.vanafJuliNote + "</p>" : "";

      if (uitkomst === "in aanmerking") {
        html = '<div class="' + ROOT + '-note success"><p><strong>Ja, je komt in aanmerking!</strong></p>' +
          "<p>Jouw sector met PC-nummer <strong>" + pc + "</strong> staat op de lijst van toegelaten sectoren voor flexi-jobs.</p>" +
          juliBanner + ctaLink + "</div>";
      } else if (uitkomst === "speciale voorwaarden") {
        html = '<div class="' + ROOT + '-note success"><p><strong>Ja, met een belangrijke opmerking!</strong></p>' +
          "<div>" + CONFIG.specialCases[pcValue] + "</div>" + juliBanner + ctaLink + "</div>";
      } else if (uitkomst === "niet in aanmerking") {
        html = '<div class="' + ROOT + '-note error">' +
          "<p><strong>Nee, (nog) niet in aanmerking.</strong></p>" +
          "<p>Jouw sector met PC-nummer <strong>" + pc + "</strong> staat momenteel niet op de lijst.</p>" +
          '<p style="margin-top:12px;font-weight:bold;">' + CONFIG.alleSectorenNote + "</p>" +
          '<p style="margin-top:8px;">Laat hieronder je e-mailadres achter, dan houden we je op de hoogte van de startdatum en voorwaarden.</p></div>';
        r.leadTitle.innerText = CONFIG.leadForm.nietTitle;
        r.leadDesc.innerHTML = esc(CONFIG.leadForm.nietDesc);
      } else if (uitkomst === "ongeldige invoer") {
        html = '<div class="' + ROOT + '-note error"><p><strong>Ongeldige invoer</strong></p><p>Voer een geldig paritair comité nummer in (bv: 302, 118.03).</p></div>';
      } else if (uitkomst === "geen invoer") {
        html = '<div class="' + ROOT + '-note error"><p><strong>Geen invoer</strong></p><p>Voer een paritair comité nummer in om te controleren.</p></div>';
      }

      r.pcResult.innerHTML = html;
      r.lead.style.display = (uitkomst === "niet in aanmerking") ? "block" : "none";

      if (pcValue !== lastTrackedPCValue) {
        track(pcValue, uitkomst);
        lastTrackedPCValue = pcValue;
      }
    }

    function sendToSheet() {
      var email = r.emailInput.value.trim();
      var pc = lastTrackedPCValue || r.pcInput.value.trim();

      if (!email || email.indexOf("@") === -1) {
        r.emailResult.innerHTML = '<p class="' + ROOT + '-msg-error">Gelieve een geldig e-mailadres in te vullen.</p>';
        return;
      }
      if (!CONFIG.scriptUrl || CONFIG.scriptUrl.indexOf("PLAK_HIER") !== -1) {
        r.emailResult.innerHTML = '<p style="color:red;">Configuratiefout: Script URL ontbreekt.</p>';
        return;
      }

      r.emailBtn.disabled = true;
      r.emailBtn.textContent = "Verzenden...";

      fetch(CONFIG.scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ email: email, pc: pc })
      })
        .then(function () {
          r.emailResult.innerHTML = '<div class="' + ROOT + '-note success" style="margin-top:10px;"><strong>Bedankt!</strong> We hebben je gegevens ontvangen en houden je op de hoogte.</div>';
          r.emailInput.value = "";
          r.emailBtn.textContent = "Verzonden";
        })
        .catch(function (error) {
          if (window.console) console.error("Error:", error);
          r.emailResult.innerHTML = '<p class="' + ROOT + '-msg-error" style="color:red;">Er ging iets mis. Probeer het later opnieuw.</p>';
          r.emailBtn.disabled = false;
          r.emailBtn.textContent = CONFIG.leadForm.sendLabel;
        });
    }

    r.pcBtn.addEventListener("click", checkPC);
    r.pcInput.addEventListener("keypress", function (e) { if (e.key === "Enter") { e.preventDefault(); checkPC(); } });
    r.emailBtn.addEventListener("click", sendToSheet);
    r.emailInput.addEventListener("keypress", function (e) { if (e.key === "Enter") { e.preventDefault(); sendToSheet(); } });
  }

  function init() {
    var mount = document.getElementById(CONFIG.mountId);
    if (!mount) return;
    injectStyles();
    run(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
