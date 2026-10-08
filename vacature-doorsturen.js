/* =====================================================================
 * Nestor – Waarom Nestor + stuur je vacature door (formulier → HubSpot)
 * Eén zelfstandig bestand. Sluit overal in met:
 *
 *   <div id="vacature-doorsturen-tool"></div>
 *   <script src="https://tibodeblaere-ai.github.io/tools-website/vacature-doorsturen.js" defer></script>
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

    // HubSpot-formulier. Wordt via HubSpot's eigen embed-script getoond, zodat CAPTCHA en
    // eventuele toestemmingsvakjes blijven werken. Velden, verplichte velden en de bedankpagina
    // (redirect) pas je dus aan in HubSpot zelf, niet hier.
    hubspot: {
      portalId: "7551812",
      formId: "3df4559c-5ce5-4835-bd46-195983326f2d",
      region: "eu1"
    },

    title: "Op zoek naar een flexi? Nestor regelt het.",
    intro: "Twee beloftes waarop je als bedrijf kan rekenen.",
    beloftes: [
      { titel: "No cure, no pay", tekst: "Je betaalt pas wanneer we de juiste flexi-jobber voor je vinden. Geen match, geen kosten." },
      { titel: "Binnen de 2 weken opgestart", tekst: "Van vacature tot opstart: gemiddeld heb je binnen twee weken iemand aan de slag." }
    ],

    formTitle: "Stuur je vacature door",
    formIntro: "Dan zoeken we meteen naar een match in onze database.",
    loadError: "Het formulier kon niet geladen worden. Herlaad de pagina of mail ons je vacature."
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
${P}${ROOT}-err{color:#d92b07;font-size:13px;margin:0}
${P}${ROOT} .hs-form-field{margin-bottom:14px}
${P}${ROOT} fieldset{max-width:none!important;border:0;padding:0;margin:0}
${P}${ROOT} fieldset.form-columns-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0 14px}
${P}${ROOT} fieldset .hs-form-field{width:auto!important;float:none!important}
${P}${ROOT} fieldset .input{margin:0!important}
${P}${ROOT} .hs-form label{display:block;font-size:13px;font-weight:600;color:#575757;margin-bottom:6px}
${P}${ROOT} .hs-form-required{color:#f73109;margin-left:2px}
${P}${ROOT} .hs-field-desc{font-size:12px;color:rgba(87,87,87,.62);margin-bottom:6px}
${P}${ROOT} .hs-input:not([type=checkbox]):not([type=radio]):not([type=file]){width:100%!important;padding:12px 14px;border:1px solid rgba(87,87,87,.14);border-radius:14px;background:#f6f4ef;color:#575757;font-size:14px;outline:none;font-family:inherit}
${P}${ROOT} .hs-input:focus{border-color:#f73109}
${P}${ROOT} textarea.hs-input{min-height:96px;resize:vertical;line-height:1.5}
${P}${ROOT} input[type=file].hs-input{font-size:13px;color:#575757;font-family:inherit}
${P}${ROOT} .hs-error-msgs{list-style:none;padding:0;margin:4px 0 0}
${P}${ROOT} .hs-error-msg,${P}${ROOT} .hs-main-font-element{color:#d92b07;font-size:12px}
${P}${ROOT} .inputs-list{list-style:none;padding:0;margin:0 0 8px}
${P}${ROOT} .inputs-list label{font-weight:600}
${P}${ROOT} .hs-form a{color:#f73109}
${P}${ROOT} .legal-consent-container{font-size:12px;line-height:1.5;color:rgba(87,87,87,.8)}
${P}${ROOT} .hs-button{border:none;background:#f73109;color:#fff;border-radius:999px;padding:14px 32px;font-weight:700;font-size:15px;cursor:pointer;margin-top:4px;font-family:inherit;-webkit-appearance:none}
${P}${ROOT} .hs-button:hover{background:#d92b07}
${P}${ROOT} .submitted-message{background:#feeae6;border-radius:18px;padding:24px;text-align:center;color:#575757}
@media (max-width:640px){${P}${ROOT}-col.right{border-left:none;border-top:1px solid rgba(87,87,87,.14)}${P}${ROOT}-col{padding:28px 22px}}`;
    var style = document.createElement("style");
    style.id = ROOT + "-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
          '<div id="' + ROOT + '-hsform"></div>' +
        "</div>" +
      "</div>";
  }

  function run(mount) {
    build(mount);
    var h = CONFIG.hubspot;
    var target = mount.querySelector("#" + ROOT + "-hsform");
    loadHubSpot(h.region, function () {
      window.hbspt.forms.create({
        region: h.region,
        portalId: h.portalId,
        formId: h.formId,
        target: "#" + ROOT + "-hsform",
        css: "", // HubSpot-standaardstijl uit, onze eigen stijl hierboven
        onFormSubmitted: function () {
          if (typeof window.dataLayer !== "undefined") window.dataLayer.push({ event: "vacature_doorgestuurd" });
        }
      });
    }, function () {
      target.innerHTML = '<p class="' + ROOT + '-err">' + esc(CONFIG.loadError) + "</p>";
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
