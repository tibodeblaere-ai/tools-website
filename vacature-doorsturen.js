/* =====================================================================
 * Nestor – Waarom Nestor + stuur je vacature door (formulier → HubSpot)
 * Eén zelfstandig bestand. Sluit overal in met:
 *
 *   <div id="vacature-doorsturen-tool"></div>
 *   <script src="https://cdn.jsdelivr.net/gh/tibodeblaere-ai/tools-website@main/vacature-doorsturen.js" defer></script>
 *
 * Inhoud aanpassen? Pas alleen het CONFIG-blok hieronder aan.
 * De logica eronder hoef je normaal niet aan te raken.
 * ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   *  CONFIG — hier pas je teksten, beloftes en het HubSpot-formulier aan
   * ------------------------------------------------------------------ */
  var CONFIG = {
    mountId: "vacature-doorsturen-tool",

    // HubSpot Forms API (publiek endpoint, geen geheim).
    // formGuid: het ID van het HubSpot-formulier waar de vacatures in moeten komen.
    // Het formulier moet de velden hieronder (fieldNames) bevatten, anders weigert HubSpot de inzending.
    hubspot: {
      portalId: "7551812",
      formGuid: "3df4559c-5ce5-4835-bd46-195983326f2d",
      region: "eu1",
      pageName: "Stuur je vacature door"
    },
    fieldNames: { firstname: "firstname", lastname: "lastname", email: "email", company: "company", vacature: "vacature" },

    title: "Op zoek naar een flexi? Nestor regelt het.",
    intro: "Twee beloftes waarop je als bedrijf kan rekenen.",
    beloftes: [
      { titel: "No cure, no pay", tekst: "Je betaalt pas wanneer we de juiste flexi-jobber voor je vinden. Geen match, geen kosten." },
      { titel: "Binnen de 2 weken opgestart", tekst: "Van vacature tot opstart: gemiddeld heb je binnen twee weken iemand aan de slag." }
    ],

    formTitle: "Stuur je vacature door",
    formIntro: "Dan zoeken we meteen naar een match in onze database.",
    labels: { firstname: "Voornaam", lastname: "Naam", email: "E-mail", company: "Bedrijf", vacature: "Omschrijving vacature" },
    placeholders: { firstname: "Voornaam", lastname: "Naam", email: "jij@bedrijf.be", company: "Bedrijfsnaam", vacature: "Welke functie, welk profiel, hoeveel uren…" },
    submitLabel: "Verstuur vacature",
    sendingLabel: "Verzenden...",

    thanksTitle: "Bedankt!",
    thanksText: "We hebben je vacature goed ontvangen en gaan meteen op zoek naar een match.",

    errorEmail: "Gelieve een geldig e-mailadres in te vullen.",
    errorVacature: "Gelieve je vacature kort te omschrijven.",
    errorSend: "Er ging iets mis. Probeer het later opnieuw.",
    errorConfig: "Configuratiefout: HubSpot-formulier ontbreekt."
  };

  /* ------------------------------------------------------------------ *
   *  Vanaf hier: logica + styling. Normaal niet aanpassen.
   * ------------------------------------------------------------------ */

  var ROOT = "vdt"; // class-prefix, voorkomt botsing met de rest van de site

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
${P}${ROOT}{font-family:'DM Sans',system-ui,sans-serif;background:#f6f4ef;color:#575757;border-radius:28px;overflow:hidden;border:1px solid rgba(87,87,87,.10);display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
${P}${ROOT} *{box-sizing:border-box}
${P}${ROOT}-col{padding:36px}
${P}${ROOT}-col.left{display:flex;flex-direction:column;justify-content:center}
${P}${ROOT}-col.right{background:#fff;border-left:1px solid rgba(87,87,87,.14)}
${P}${ROOT} h3{font-family:'Baloo Paaji 2',sans-serif;font-weight:700;color:#f73109;margin:0 0 10px;line-height:1.1;font-size:26px}
${P}${ROOT}-col.right h3{font-size:24px;margin-bottom:8px;line-height:1.2}
${P}${ROOT}-muted{color:rgba(87,87,87,.62);font-size:14px;line-height:1.5;margin:0 0 24px}
${P}${ROOT}-beloftes{display:flex;flex-direction:column;gap:16px}
${P}${ROOT}-belofte{display:flex;gap:16px;align-items:flex-start;background:#feeae6;border-radius:18px;padding:20px}
${P}${ROOT}-nr{font-family:'Baloo Paaji 2',sans-serif;font-weight:800;font-size:26px;color:#f73109;line-height:1;flex:none}
${P}${ROOT}-bt{font-family:'Baloo Paaji 2',sans-serif;font-weight:700;font-size:18px;color:#f73109;margin-bottom:4px}
${P}${ROOT}-bx{color:#575757;font-size:14px;line-height:1.5}
${P}${ROOT}-form{display:flex;flex-direction:column;gap:14px}
${P}${ROOT}-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px}
${P}${ROOT} label{display:block;font-size:13px;font-weight:600;color:#575757;margin-bottom:6px}
${P}${ROOT} input,${P}${ROOT} textarea{width:100%;padding:12px 14px;border:1px solid rgba(87,87,87,.14);border-radius:14px;background:#f6f4ef;color:#575757;font-size:14px;outline:none;font-family:inherit}
${P}${ROOT} input:focus,${P}${ROOT} textarea:focus{border-color:#f73109}
${P}${ROOT} textarea{min-height:96px;resize:vertical;line-height:1.5}
${P}${ROOT}-btn{align-self:flex-start;border:none;background:#f73109;color:#fff;border-radius:999px;padding:14px 32px;font-weight:700;font-size:15px;cursor:pointer;margin-top:4px;font-family:inherit}
${P}${ROOT}-btn:disabled{opacity:.6;cursor:not-allowed}
${P}${ROOT}-err{color:#d92b07;font-size:13px;margin:0}
${P}${ROOT}-thanks{background:#feeae6;border-radius:18px;padding:24px;text-align:center}
${P}${ROOT}-thanks div:first-child{font-family:'Baloo Paaji 2',sans-serif;font-weight:700;font-size:19px;color:#f73109;margin-bottom:6px}
@media (max-width:640px){${P}${ROOT}-col.right{border-left:none;border-top:1px solid rgba(87,87,87,.14)}${P}${ROOT}-col{padding:28px 22px}}`;
    var style = document.createElement("style");
    style.id = ROOT + "-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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

  function field(key, type) {
    var L = CONFIG.labels, ph = CONFIG.placeholders;
    var id = ROOT + "-" + key;
    var auto = { firstname: "given-name", lastname: "family-name", email: "email", company: "organization" }[key];
    var ctrl = type === "textarea"
      ? '<textarea id="' + id + '" data-f="' + key + '" placeholder="' + esc(ph[key]) + '"></textarea>'
      : '<input id="' + id + '" data-f="' + key + '" type="' + type + '"' + (auto ? ' autocomplete="' + auto + '"' : "") + ' placeholder="' + esc(ph[key]) + '">';
    return '<div><label for="' + id + '">' + esc(L[key]) + "</label>" + ctrl + "</div>";
  }

  function build(mount) {
    var C = CONFIG;
    var beloftes = C.beloftes.map(function (b, i) {
      var nr = (i + 1 < 10 ? "0" : "") + (i + 1);
      return '<div class="' + ROOT + '-belofte"><span class="' + ROOT + '-nr">' + nr + "</span>" +
        '<div><div class="' + ROOT + '-bt">' + esc(b.titel) + '</div><div class="' + ROOT + '-bx">' + esc(b.tekst) + "</div></div></div>";
    }).join("");

    mount.innerHTML =
      '<div class="' + ROOT + '">' +
        '<div class="' + ROOT + '-col left">' +
          "<h3>" + esc(C.title) + "</h3>" +
          '<p class="' + ROOT + '-muted">' + esc(C.intro) + "</p>" +
          '<div class="' + ROOT + '-beloftes">' + beloftes + "</div>" +
        "</div>" +
        '<div class="' + ROOT + '-col right">' +
          "<h3>" + esc(C.formTitle) + "</h3>" +
          '<p class="' + ROOT + '-muted" style="margin-bottom:22px">' + esc(C.formIntro) + "</p>" +
          '<form class="' + ROOT + '-form" novalidate>' +
            '<div class="' + ROOT + '-grid">' + field("firstname", "text") + field("lastname", "text") + "</div>" +
            field("email", "email") + field("company", "text") + field("vacature", "textarea") +
            '<p data-err class="' + ROOT + '-err" style="display:none"></p>' +
            '<button type="submit" class="' + ROOT + '-btn">' + esc(C.submitLabel) + "</button>" +
          "</form>" +
          '<div data-thanks class="' + ROOT + '-thanks" style="display:none"><div>' + esc(C.thanksTitle) + "</div><div>" + esc(C.thanksText) + "</div></div>" +
        "</div>" +
      "</div>";
  }

  function run(mount) {
    build(mount);
    var form = mount.querySelector("form");
    var err = mount.querySelector("[data-err]");
    var btn = form.querySelector("button");
    var val = function (k) { return (form.querySelector('[data-f="' + k + '"]').value || "").trim(); };

    function fail(msg) {
      err.textContent = msg;
      err.style.display = "block";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) return fail(CONFIG.errorEmail);
      if (!val("vacature")) return fail(CONFIG.errorVacature);
      if (!CONFIG.hubspot.formGuid || CONFIG.hubspot.formGuid.indexOf("PLAK_HIER") !== -1) return fail(CONFIG.errorConfig);
      err.style.display = "none";
      btn.disabled = true;
      btn.textContent = CONFIG.sendingLabel;

      var fields = Object.keys(CONFIG.fieldNames).map(function (k) {
        return { name: CONFIG.fieldNames[k], value: val(k) };
      });

      submitToHubSpot(fields)
        .then(function () {
          form.style.display = "none";
          mount.querySelector("[data-thanks]").style.display = "block";
          if (typeof window.dataLayer !== "undefined") window.dataLayer.push({ event: "vacature_doorgestuurd" });
        })
        .catch(function (e) {
          if (window.console) console.error("Vacature doorsturen:", e);
          fail(CONFIG.errorSend);
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = CONFIG.submitLabel;
        });
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
