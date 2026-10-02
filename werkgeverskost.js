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

    // HubSpot Forms API (publiek endpoint, geen geheim).
    hubspot: {
      portalId: "7551812",
      formGuid: "3df4559c-5ce5-4835-bd46-195983326f2d",
      region: "eu1",
      pageName: "Rekentool werkgeverskost flexi-job"
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
    placeholders: { bedrijf: "Bedrijf", naam: "Naam", email: "E-mail", tel: "Telefoonnummer" },
    submitLabel: "Bezorg mij de berekening",
    sendingLabel: "Verzenden...",

    thanksTitle: "Bedankt!",
    thanksText: "We bezorgen je de volledige werkgeverskost-berekening zo snel mogelijk per e-mail.",
    resetLabel: "Opnieuw berekenen",

    errorEmail: "Gelieve een geldig e-mailadres in te vullen.",
    errorSend: "Er ging iets mis. Probeer het later opnieuw.",
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
${P}${ROOT} input{width:100%;padding:12px 14px;border:1px solid #575757;border-radius:14px;background:#3d3d3a;color:#f6f4ef;font-size:15px;font-weight:600;outline:none;font-family:inherit}
${P}${ROOT} input:focus{border-color:#f73109}
${P}${ROOT}-capture input{background:#2c2c2a;font-size:14px;font-weight:400}
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

  function hubspotCookie() {
    var m = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
    return m ? m[1] : null;
  }

  function submitToHubSpot(fields) {
    var h = CONFIG.hubspot;
    var context = { pageUri: location.href, pageName: h.pageName };
    var hutk = hubspotCookie();
    if (hutk) context.hutk = hutk;
    var url = "https://api-" + h.region + ".hsforms.com/submissions/v3/integration/submit/" + h.portalId + "/" + h.formGuid;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: fields, context: context })
    }).then(function (res) {
      if (!res.ok) throw new Error("HubSpot " + res.status);
    });
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
          '<div class="' + ROOT + '-stack">' +
            '<input data-bedrijf type="text" autocomplete="organization" placeholder="' + esc(ph.bedrijf) + '">' +
            '<input data-naam type="text" autocomplete="name" placeholder="' + esc(ph.naam) + '">' +
            '<input data-email type="email" autocomplete="email" placeholder="' + esc(ph.email) + '">' +
            '<input data-tel type="tel" autocomplete="tel" placeholder="' + esc(ph.tel) + '">' +
            '<p data-err class="' + ROOT + '-err" style="display:none"></p>' +
            '<button type="button" data-submit class="' + ROOT + '-btn">' + esc(C.submitLabel) + "</button>" +
          "</div>" +
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
    var ul = q("uurloon"), ur = q("uren"), err = q("err"), btn = q("submit");

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

    function val(a) { return (q(a).value || "").trim(); }

    ul.addEventListener("input", calc);
    ur.addEventListener("input", calc);
    calc();

    q("reveal").addEventListener("click", function () { show("capture"); });

    btn.addEventListener("click", function () {
      var email = val("email");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = CONFIG.errorEmail;
        err.style.display = "block";
        return;
      }
      err.style.display = "none";
      btn.disabled = true;
      btn.textContent = CONFIG.sendingLabel;

      submitToHubSpot([
        { name: "email", value: email },
        { name: "firstname", value: val("naam") },
        { name: "phone", value: val("tel") },
        { name: "company", value: val("bedrijf") }
      ])
        .then(function () {
          show("thanks");
          if (typeof window.dataLayer !== "undefined") {
            window.dataLayer.push({ event: "werkgeverskost_lead", uurloon: num(ul.value), uren: num(ur.value) });
          }
        })
        .catch(function (e) {
          if (window.console) console.error("Werkgeverskost:", e);
          err.textContent = CONFIG.errorSend;
          err.style.display = "block";
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = CONFIG.submitLabel;
        });
    });

    q("reset").addEventListener("click", function () {
      ["bedrijf", "naam", "email", "tel"].forEach(function (a) { q(a).value = ""; });
      err.style.display = "none";
      show("teaser");
    });
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
