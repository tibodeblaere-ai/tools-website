/* =====================================================================
 * Nestor – Rekentool werkgeverskost flexi-job (met lead-formulier → HubSpot)
 * Eén zelfstandig bestand. Sluit overal in met:
 *
 *   <div id="werkgeverskost-tool"></div>
 *   <script src="https://cdn.jsdelivr.net/gh/tibodeblaere-ai/tools-website@main/werkgeverskost.js" defer></script>
 *
 * Inhoud aanpassen? Pas alleen het CONFIG-blok hieronder aan.
 * De logica eronder hoef je normaal niet aan te raken.
 * ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   *  CONFIG — hier pas je teksten, percentages en het HubSpot-formulier aan
   * ------------------------------------------------------------------ */
  var CONFIG = {
    mountId: "werkgeverskost-tool",

    // HubSpot-formulier. Wordt via HubSpot's eigen embed-script getoond, zodat CAPTCHA en
    // eventuele toestemmingsvakjes blijven werken. Velden pas je aan in HubSpot zelf.
    // hideFields: interne veldnamen die in deze tool verborgen worden (voorlopig zelfde formulier als de vacaturetool).
    hubspot: {
      portalId: "7551812",
      formId: "3df4559c-5ce5-4835-bd46-195983326f2d",
      region: "eu1",
      hideFields: ["vacaturelink", "bijlage"]
    },

    // Berekening: vakantiegeld = % van het brutoloon; RSZ = bijzondere werkgeversbijdrage flexi-jobs (28%)
    // op brutoloon + vakantiegeld. Totaal = brutoloon + vakantiegeld + RSZ.
    rszPct: 0.28,
    rszOpVakantiegeld: true,
    vakantiegeldPct: 0.0767,
    defaultUurloon: 12.29,
    defaultUren: 20,

    title: "Wat kost een flexi-jobber?",
    intro: "Bereken direct de totale werkgeverskost per week.",
    labelUurloon: "Uurloon (€ / uur)",
    labelUren: "Uren per week",
    rowBruto: "Brutoloon",
    rowRsz: "RSZ",
    rowVakantiegeld: "Vakantiegeld",
    rowTotaal: "Totale werkgeverskost",
    teaserTitle: "Je berekening staat klaar",
    revealLabel: "Toon mijn berekening",

    captureTitle: "Nog één stap",
    captureText: "Laat je gegevens achter en we bezorgen je de volledige berekening.",

    thanksTitle: "Bedankt!",
    thanksText: "We bezorgen je de volledige werkgeverskost-berekening zo snel mogelijk per e-mail.",
    resetLabel: "Opnieuw berekenen",

    loadError: "Het formulier kon niet geladen worden. Herlaad de pagina en probeer opnieuw.",
    footnote: "Indicatieve berekening op basis van het opgegeven uurloon en aantal uren."
  };

  /* ------------------------------------------------------------------ *
   *  Vanaf hier: logica + styling. Normaal niet aanpassen.
   * ------------------------------------------------------------------ */

  var ROOT = "wgk"; // class-prefix, voorkomt botsing met de rest van de site

  function injectStyles() {
    if (document.getElementById(ROOT + "-styles")) return;
    if (!document.getElementById("nestor-fonts")) {
      var link = document.createElement("link");
      link.id = "nestor-fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Baloo+Paaji+2:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    var P = "#" + CONFIG.mountId + " .";
    var css = `
${P}${ROOT}{font-family:'DM Sans',system-ui,sans-serif;background:#2c2c2a;color:#f6f4ef;border-radius:28px;overflow:hidden;border:1px solid rgba(87,87,87,.10);padding:30px;box-sizing:border-box}
${P}${ROOT} *{box-sizing:border-box}
${P}${ROOT} h3,${P}${ROOT}-h{font-family:'Baloo Paaji 2',sans-serif;font-weight:700;color:#fff}
${P}${ROOT} h3{font-size:24px;margin:0 0 8px}
${P}${ROOT}-h{font-size:19px;margin-bottom:4px}
${P}${ROOT}-muted{color:#b4b2a9;font-size:14px;line-height:1.5;margin:0 0 22px}
${P}${ROOT}-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px}
${P}${ROOT} label{display:block;font-size:13px;font-weight:600;color:#f6f4ef;margin-bottom:6px}
${P}${ROOT} input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=submit]){width:100%;padding:12px 14px;border:1px solid #575757;border-radius:14px;background:#3d3d3a;color:#f6f4ef;font-size:15px;font-weight:600;outline:none;font-family:inherit}
${P}${ROOT} input:focus{border-color:#f73109}
${P}${ROOT}-capture .hs-form-field{margin-bottom:12px}
${P}${ROOT}-capture fieldset{max-width:none!important;border:0;padding:0;margin:0}
${P}${ROOT}-capture fieldset.form-columns-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0 12px}
${P}${ROOT}-capture fieldset .hs-form-field{width:auto!important;float:none!important}
${P}${ROOT}-capture fieldset .input{margin:0!important}
${P}${ROOT}-capture .hs-form-required{color:#f73109;margin-left:2px}
${P}${ROOT}-capture .hs-input:not([type=checkbox]):not([type=radio]):not([type=file]){width:100%!important;background:#2c2c2a;font-size:14px;font-weight:400}
${P}${ROOT}-capture .hs-error-msgs{list-style:none;padding:0;margin:4px 0 0}
${P}${ROOT}-capture .hs-error-msg,${P}${ROOT}-capture .hs-main-font-element{color:#ff8a70;font-size:12px}
${P}${ROOT}-capture .inputs-list{list-style:none;padding:0;margin:0 0 8px}
${P}${ROOT}-capture .inputs-list label{font-weight:600}
${P}${ROOT}-capture .hs-form a{color:#f73109}
${P}${ROOT}-capture .legal-consent-container{font-size:12px;line-height:1.5;color:#b4b2a9}
${P}${ROOT}-capture .hs-button{border:none;background:#f73109;color:#fff;border-radius:999px;padding:14px 30px;font-weight:700;font-size:15px;cursor:pointer;margin-top:4px;font-family:inherit;-webkit-appearance:none}
${P}${ROOT}-capture .hs-button:hover{background:#d92b07}
${P}${ROOT}-teaser{position:relative;margin-top:20px;border-radius:18px;overflow:hidden}
${P}${ROOT}-rows{background:#3d3d3a;border-radius:18px;padding:8px 22px 20px;filter:blur(8px);user-select:none;pointer-events:none}
${P}${ROOT}-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;font-size:14px}
${P}${ROOT}-row+.${ROOT}-row{border-top:1px solid #575757}
${P}${ROOT}-row span:last-child{font-weight:600}
${P}${ROOT}-row.tot{padding-top:16px;margin-top:4px;border-top:2px solid #f73109}
${P}${ROOT}-row.tot span:first-child{font-weight:600;font-size:15px}
${P}${ROOT}-row.tot span:last-child{font-family:'Baloo Paaji 2',sans-serif;font-weight:800;font-size:30px;color:#f73109;line-height:1}
${P}${ROOT}-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:24px}
${P}${ROOT}-box{background:#3d3d3a;border-radius:18px;padding:24px;margin-top:20px}
${P}${ROOT}-stack{display:flex;flex-direction:column;gap:12px}
${P}${ROOT}-btn{align-self:flex-start;border:none;background:#f73109;color:#fff;border-radius:999px;padding:14px 30px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit}
${P}${ROOT}-btn:disabled{opacity:.6;cursor:not-allowed}
${P}${ROOT}-btn.ghost{border:1px solid #f73109;background:transparent;color:#f73109;padding:11px 26px;font-size:14px}
${P}${ROOT}-err{color:#ff8a70;font-size:13px;margin:0}
${P}${ROOT}-foot{color:#b4b2a9;font-size:12px;line-height:1.4;margin:14px 0 0}`;
    css += CONFIG.hubspot.hideFields.map(function (n) { return P + ROOT + "-capture .hs_" + n + "{display:none!important}"; }).join("");
    var style = document.createElement("style");
    style.id = ROOT + "-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function pct(p) {
    return (Math.round(p * 10000) / 100).toString().replace(".", ",") + "%";
  }

  var HS_SCRIPT_ID = "nestor-hs-forms-v2";

  // Laadt HubSpot's embed-script (één keer per pagina) en roept cb aan zodra het klaar is.
  function loadHubSpot(region, cb, onError) {
    if (window.hbspt && window.hbspt.forms) return cb();
    var sc = document.getElementById(HS_SCRIPT_ID);
    if (!sc) {
      sc = document.createElement("script");
      sc.id = HS_SCRIPT_ID;
      sc.src = "https://js-" + region + ".hsforms.net/forms/embed/v2.js";
      sc.async = true;
      document.head.appendChild(sc);
    }
    sc.addEventListener("load", function () { window.hbspt && window.hbspt.forms ? cb() : onError(); });
    sc.addEventListener("error", onError);
  }

  function build(mount) {
    var C = CONFIG, ph = C.placeholders;
    mount.innerHTML =
      '<div class="' + ROOT + '">' +
        "<h3>" + esc(C.title) + "</h3>" +
        '<p class="' + ROOT + '-muted">' + esc(C.intro) + "</p>" +
        '<div class="' + ROOT + '-grid">' +
          "<div><label>" + esc(C.labelUurloon) + '</label><input data-uurloon type="number" min="0" step="0.01" value="' + C.defaultUurloon + '"></div>' +
          "<div><label>" + esc(C.labelUren) + '</label><input data-uren type="number" min="0" step="1" value="' + C.defaultUren + '"></div>' +
        "</div>" +
        '<div data-teaser class="' + ROOT + '-teaser">' +
          '<div class="' + ROOT + '-rows">' +
            '<div class="' + ROOT + '-row"><span>' + esc(C.rowBruto) + "</span><span data-bruto></span></div>" +
            '<div class="' + ROOT + '-row"><span>' + esc(C.rowRsz) + " (" + pct(C.rszPct) + ")</span><span data-rsz></span></div>" +
            '<div class="' + ROOT + '-row"><span>' + esc(C.rowVakantiegeld) + " (" + pct(C.vakantiegeldPct) + ")</span><span data-vak></span></div>" +
            '<div class="' + ROOT + '-row tot"><span>' + esc(C.rowTotaal) + "</span><span data-totaal></span></div>" +
          "</div>" +
          '<div class="' + ROOT + '-overlay"><div class="' + ROOT + '-h">' + esc(C.teaserTitle) + "</div>" +
            '<button type="button" data-reveal class="' + ROOT + '-btn" style="align-self:center">' + esc(C.revealLabel) + "</button></div>" +
        "</div>" +
        '<div data-capture class="' + ROOT + "-box " + ROOT + '-capture" style="display:none">' +
          '<div class="' + ROOT + '-h">' + esc(C.captureTitle) + "</div>" +
          '<p class="' + ROOT + '-muted" style="margin-bottom:18px">' + esc(C.captureText) + "</p>" +
          '<div id="' + ROOT + '-hsform"></div>' +
        "</div>" +
        '<div data-thanks class="' + ROOT + '-box" style="display:none;text-align:center">' +
          '<div class="' + ROOT + '-h" style="margin-bottom:6px">' + esc(C.thanksTitle) + "</div>" +
          '<div style="font-size:14px;line-height:1.5;margin-bottom:18px">' + esc(C.thanksText) + "</div>" +
          '<button type="button" data-reset class="' + ROOT + '-btn ghost" style="align-self:center">' + esc(C.resetLabel) + "</button>" +
        "</div>" +
        '<p class="' + ROOT + '-foot">' + esc(C.footnote) + "</p>" +
      "</div>";
  }

  function run(mount) {
    build(mount);
    var r = mount;
    var q = function (a) { return r.querySelector("[data-" + a + "]"); };
    var f = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" });
    var ul = q("uurloon"), ur = q("uren");
    var h = CONFIG.hubspot;
    var target = mount.querySelector("#" + ROOT + "-hsform");

    function num(v) { var n = parseFloat(String(v).replace(",", ".")); return isNaN(n) || n < 0 ? 0 : n; }

    function calc() {
      var b = num(ul.value) * num(ur.value), vak = b * CONFIG.vakantiegeldPct;
      var rsz = (CONFIG.rszOpVakantiegeld ? b + vak : b) * CONFIG.rszPct;
      q("bruto").textContent = f.format(b);
      q("rsz").textContent = f.format(rsz);
      q("vak").textContent = f.format(vak);
      q("totaal").textContent = f.format(b + rsz + vak);
    }

    function show(name) {
      ["teaser", "capture", "thanks"].forEach(function (a) { q(a).style.display = a === name ? "block" : "none"; });
    }

    function createForm() {
      target.innerHTML = "";
      loadHubSpot(h.region, function () {
        window.hbspt.forms.create({
          region: h.region,
          portalId: h.portalId,
          formId: h.formId,
          target: "#" + ROOT + "-hsform",
          css: "", // HubSpot-standaardstijl uit, onze eigen stijl hierboven
          inlineMessage: CONFIG.thanksText, // geen redirect naar de bedankpagina van het formulier
          onFormSubmitted: function () {
            show("thanks");
            if (typeof window.dataLayer !== "undefined") {
              window.dataLayer.push({ event: "werkgeverskost_lead", uurloon: num(ul.value), uren: num(ur.value) });
            }
          }
        });
      }, function () {
        target.innerHTML = '<p class="' + ROOT + '-err">' + esc(CONFIG.loadError) + "</p>";
      });
    }

    ul.addEventListener("input", calc);
    ur.addEventListener("input", calc);
    calc();

    q("reveal").addEventListener("click", function () {
      show("capture");
      createForm();
    });

    q("reset").addEventListener("click", function () { show("teaser"); });
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
