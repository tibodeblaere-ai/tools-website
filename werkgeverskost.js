/* =====================================================================
 * Nestor – Wat kost een medewerker? (aanvraag berekening → HubSpot)
 * Eén zelfstandig bestand. Sluit overal in met:
 *
 *   <div id="werkgeverskost-tool"></div>
 *   <script src="https://cdn.jsdelivr.net/gh/tibodeblaere-ai/tools-website@main/werkgeverskost.js" defer></script>
 *
 * De tool toont GEEN bedrag: de bezoeker vult zijn situatie en gegevens in,
 * Nestor bezorgt de berekening per e-mail. Coëfficiënten staan dus niet in deze (publieke) code.
 *
 * Inhoud aanpassen? Pas alleen het CONFIG-blok hieronder aan.
 * De logica eronder hoef je normaal niet aan te raken.
 * ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   *  CONFIG — hier pas je teksten, keuzes en het HubSpot-formulier aan
   * ------------------------------------------------------------------ */
  var CONFIG = {
    mountId: "werkgeverskost-tool",

    // HubSpot-formulier, getoond via HubSpot's eigen embed-script (CAPTCHA en toestemming blijven werken).
    // De contactvelden (e-mail, onderneming, BTW-nummer, telefoon, ...) beheer je in HubSpot zelf.
    // De keuzes uit de tool hieronder worden in VERBORGEN velden van dat formulier gezet:
    // voeg die velden met exact deze interne namen als "verborgen veld" toe aan het formulier.
    hubspot: {
      portalId: "7551812",
      formId: "3f04e1ec-065f-4adc-a6b4-372fef4a2f1d",
      region: "eu1",
      hideFields: [], // velden van het formulier die je in deze tool niet wil tonen
      // Teksten die we over die van HubSpot heen zetten (key = interne veldnaam). Enkel de zichtbare tekst
      // verandert; het veld zelf blijft hetzelfde, dus antwoorden komen in de juiste eigenschap terecht.
      labels: {
        firstname: "Voornaam",
        lastname: "Achternaam",
        email: "E-mail",
        company: "Naam onderneming",
        btw_nummer: "BTW-nummer",
        phone: "Telefoonnummer"
      },
      submitText: "Verstuur mijn aanvraag",
      locale: "nl", // taal van HubSpot's foutmeldingen
      hiddenFields: {
        uurloon: "bruto_uurloon____uur__",
        statuut: "statuut",
        dienst: "dienst",
        niveau: "functieniveau",
        medewerkers: "aantal_medewerkers",
        uren: "uren_per_week"
      }
    },

    title: "Wat kost een medewerker?",
    intro: "Vul je situatie in en we bezorgen je de volledige berekening per e-mail.",

    uurloon: { label: "Bruto-uurloon", hint: "€/uur", placeholder: "Bv. 15,00" },

    statuut: {
      label: "Statuut",
      options: [
        { value: "arbeider_bediende", label: "Arbeider/Bediende" },
        { value: "flexi", label: "Flexi-job" }
      ]
    },

    dienst: {
      label: "Wat heb je nodig?",
      options: [
        { value: "selectie", label: "Nestor zoekt de medewerker" },
        { value: "payroll", label: "Ik heb zelf al iemand (payroll)" }
      ]
    },

    // Enkel zichtbaar bij dienst = selectie.
    niveau: {
      label: "Type functie",
      options: [
        { value: "uitvoerend_admin", label: "Uitvoerend / Admin", desc: "Bv. orderpicker, chauffeur, bediende, onthaal, facturatie" },
        { value: "gespecialiseerd", label: "Gespecialiseerd", desc: "Bv. handige harry, sales, keukenmedewerker, magazijnier" },
        { value: "expert", label: "Expert", desc: "Bv. chauffeur C, boekhouder, onderhoudsmecanicien, teamleader, heftruckchauffeur" }
      ]
    },

    medewerkers: { label: "Aantal medewerkers", min: 1, max: 20, start: 1, maxLabel: "20+" },
    uren: { label: "Aantal uur per week per medewerker", min: 1, max: 38, start: 20 },

    nextLabel: "Ontvang mijn berekening",
    missingText: "Vul nog in: ",
    missingNames: { uurloon: "het bruto-uurloon", statuut: "het statuut", dienst: "wat je nodig hebt", niveau: "het type functie" },
    contactTitle: "Waar mogen we de berekening naartoe sturen?",
    backLabel: "Wijzig",
    thanksText: "Bedankt! We bezorgen je de volledige berekening zo snel mogelijk per e-mail.",
    loadError: "Het formulier kon niet geladen worden. Herlaad de pagina en probeer opnieuw.",

    // Rechterpaneel
    side: {
      title: "Zo werkt het",
      steps: [
        "Je geeft het uurloon, het statuut en het aantal uren door.",
        "We berekenen de totale kost voor jouw situatie.",
        "Je ontvangt de berekening per e-mail, zonder verplichtingen."
      ]
    }
  };

  /* ------------------------------------------------------------------ *
   *  Vanaf hier: logica + styling. Normaal niet aanpassen.
   * ------------------------------------------------------------------ */

  var ROOT = "wgk"; // class-prefix, voorkomt botsing met de rest van de site
  var HS_SCRIPT_ID = "nestor-hs-forms-v2";

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
${P}${ROOT}{font-family:'DM Sans',system-ui,sans-serif;background:#fff;color:#575757;border-radius:28px;overflow:hidden;border:1px solid rgba(87,87,87,.10);display:grid;grid-template-columns:minmax(0,1.7fr) minmax(260px,1fr)}
${P}${ROOT} *{box-sizing:border-box}
${P}${ROOT}-main{padding:36px}
${P}${ROOT}-side{background:linear-gradient(160deg,#f73109,#c42505);color:#fff;padding:36px;display:flex;flex-direction:column;justify-content:flex-start}
${P}${ROOT} h3{font-family:'Baloo Paaji 2',sans-serif;font-weight:700;color:#f73109;margin:0 0 8px;font-size:26px;line-height:1.15}
${P}${ROOT}-side h3{color:#fff}
${P}${ROOT} h4{font-family:'Baloo Paaji 2',sans-serif;font-weight:700;color:#f73109;margin:8px 0 14px;font-size:19px;line-height:1.2}
${P}${ROOT}-muted{color:rgba(87,87,87,.62);font-size:14px;line-height:1.5;margin:0 0 24px}
${P}${ROOT}-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px 24px;margin-bottom:22px}
${P}${ROOT}-field{margin-bottom:22px}
${P}${ROOT}-grid .${ROOT}-field{margin-bottom:0}
${P}${ROOT}-lbl{display:block;font-size:14px;font-weight:700;color:#575757;margin-bottom:8px}
${P}${ROOT}-lbl small{font-weight:600;color:rgba(87,87,87,.62);margin-left:6px}
${P}${ROOT}-lbl b{float:right;font-family:'Baloo Paaji 2',sans-serif;font-size:20px;color:#f73109;line-height:1}
${P}${ROOT}-money{position:relative}
${P}${ROOT}-money span{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-weight:600;color:rgba(87,87,87,.62)}
${P}${ROOT}-money input{padding-left:30px!important}
${P}${ROOT} .${ROOT}-txt,${P}${ROOT} .hs-input:not([type=checkbox]):not([type=radio]):not([type=file]){width:100%!important;padding:12px 14px;border:1px solid rgba(87,87,87,.14);border-radius:14px;background:#f6f4ef;color:#575757;font-size:15px;outline:none;font-family:inherit}
${P}${ROOT} .${ROOT}-txt:focus,${P}${ROOT} .hs-input:focus{border-color:#f73109}
${P}${ROOT}-opts{display:flex;flex-direction:column;gap:8px}
${P}${ROOT}-opt{display:flex;gap:10px;align-items:flex-start;cursor:pointer;font-size:15px;color:#575757;padding:10px 12px;border:1px solid rgba(87,87,87,.14);border-radius:14px;background:#f6f4ef}
${P}${ROOT}-opt.on{border-color:#f73109;background:#feeae6}
${P}${ROOT}-opt input{accent-color:#f73109;margin:3px 0 0;flex:none;width:16px;height:16px}
${P}${ROOT}-opt small{display:block;font-size:12px;color:rgba(87,87,87,.62);margin-top:2px}
${P}${ROOT} input[type=range]{width:100%;accent-color:#f73109;margin:6px 0 0}
${P}${ROOT}-scale{display:flex;justify-content:space-between;font-size:12px;color:rgba(87,87,87,.5)}
${P}${ROOT}-next{border:none;background:#f73109;color:#fff;border-radius:999px;padding:14px 32px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit}
${P}${ROOT}-next:hover{background:#d92b07}
${P}${ROOT}-missing{font-size:13px;color:#d92b07;margin:10px 0 0}
${P}${ROOT}-summary{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;background:#f6f4ef;border-radius:14px;padding:12px 14px;font-size:13px;line-height:1.5;margin-bottom:18px}
${P}${ROOT}-back{background:none;border:none;color:#f73109;font-weight:700;font-size:13px;cursor:pointer;padding:0;font-family:inherit;flex:none;text-decoration:underline}
${P}${ROOT}-contact{animation:${ROOT}FadeIn .35s ease-out}
@keyframes ${ROOT}FadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
${P}${ROOT}-steps{list-style:none;padding:0;margin:8px 0 0;display:flex;flex-direction:column;gap:18px;counter-reset:s}
${P}${ROOT}-steps li{counter-increment:s;display:flex;gap:14px;align-items:flex-start;font-size:15px;line-height:1.5}
${P}${ROOT}-steps li::before{content:counter(s,decimal-leading-zero);font-family:'Baloo Paaji 2',sans-serif;font-weight:800;font-size:24px;line-height:1;flex:none;opacity:.85}
${P}${ROOT}-err{color:#d92b07;font-size:13px;margin:0}
${P}${ROOT} .hs-form-field{margin-bottom:14px}
${P}${ROOT} fieldset{max-width:none!important;border:0;padding:0;margin:0}
${P}${ROOT} fieldset.form-columns-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0 14px}
${P}${ROOT} fieldset .hs-form-field{width:auto!important;float:none!important}
${P}${ROOT} fieldset .input{margin:0!important}
${P}${ROOT} .hs-form label{display:block;font-size:13px;font-weight:600;color:#575757;margin-bottom:6px}
${P}${ROOT} .hs-form-required{color:#f73109;margin-left:2px}
${P}${ROOT} .hs-error-msgs{list-style:none;padding:0;margin:4px 0 0}
${P}${ROOT} .hs-form .hs-error-msgs label,${P}${ROOT} .hs-error-msg,${P}${ROOT} .hs-main-font-element{color:#d92b07;font-size:12px;font-weight:500;margin:0}
${P}${ROOT} .inputs-list{list-style:none;padding:0;margin:0 0 8px}
${P}${ROOT} .inputs-list label{font-weight:600}
${P}${ROOT} .hs-form a{color:#f73109}
${P}${ROOT} .legal-consent-container{font-size:12px;line-height:1.5;color:rgba(87,87,87,.8)}
${P}${ROOT} .hs-button{border:none;background:#f73109;color:#fff;border-radius:999px;padding:14px 32px;font-weight:700;font-size:15px;cursor:pointer;margin-top:4px;font-family:inherit;-webkit-appearance:none}
${P}${ROOT} .hs-button:hover{background:#d92b07}
${P}${ROOT} .hs-button:disabled{opacity:.5;cursor:not-allowed}
${P}${ROOT} .submitted-message{background:#feeae6;border-radius:18px;padding:24px;text-align:center;color:#575757;font-size:15px}
@media (max-width:760px){${P}${ROOT}{grid-template-columns:1fr}${P}${ROOT}-main,${P}${ROOT}-side{padding:28px 22px}}`;
    css += CONFIG.hubspot.hideFields.map(function (n) { return P + ROOT + " .hs_" + n + "{display:none!important}"; }).join("");
    var style = document.createElement("style");
    style.id = ROOT + "-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

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

  // Zet een waarde in een (verborgen) HubSpot-veld, zodat HubSpot's eigen formulierlogica het ook ziet.
  var nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  function setHsValue(form, name, value) {
    var input = form.querySelector('input[name="' + name + '"]');
    if (!input) return false;
    if (input.value === value) return true;
    nativeSetter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  // Zet onze labels en knoptekst in het HubSpot-formulier. HubSpot kan het formulier opnieuw tekenen
  // (bv. bij foutmeldingen), daarom passen we dit ook toe na elke wijziging in het formulier.
  function applyLabels(form) {
    var labels = CONFIG.hubspot.labels || {};
    Object.keys(labels).forEach(function (name) {
      var field = form.querySelector(".hs_" + name + " > label span:first-child");
      if (field && field.textContent !== labels[name]) field.textContent = labels[name];
    });
    var btn = form.querySelector("input.hs-button");
    if (btn && CONFIG.hubspot.submitText && btn.value !== CONFIG.hubspot.submitText) btn.value = CONFIG.hubspot.submitText;
  }

  function radios(key, cfg) {
    return '<div class="' + ROOT + '-field"><span class="' + ROOT + '-lbl">' + esc(cfg.label) + "</span>" +
      '<div class="' + ROOT + '-opts">' + cfg.options.map(function (o) {
        return '<label class="' + ROOT + '-opt"><input type="radio" name="' + ROOT + "-" + key + '" value="' + esc(o.value) + '">' +
          "<span>" + esc(o.label) + (o.desc ? "<small>" + esc(o.desc) + "</small>" : "") + "</span></label>";
      }).join("") + "</div></div>";
  }

  function slider(key, cfg) {
    return '<div class="' + ROOT + '-field"><span class="' + ROOT + '-lbl">' + esc(cfg.label) + ' <b data-out="' + key + '"></b></span>' +
      '<input type="range" data-in="' + key + '" min="' + cfg.min + '" max="' + cfg.max + '" step="1" value="' + cfg.start + '" aria-label="' + esc(cfg.label) + '">' +
      '<div class="' + ROOT + '-scale"><span>' + cfg.min + "</span><span>" + esc(cfg.maxLabel || cfg.max) + "</span></div></div>";
  }

  function build(mount) {
    var C = CONFIG;
    mount.innerHTML =
      '<div class="' + ROOT + '">' +
        '<div class="' + ROOT + '-main">' +
          "<h3>" + esc(C.title) + "</h3>" +
          '<p class="' + ROOT + '-muted">' + esc(C.intro) + "</p>" +
          '<div data-step1>' +
          '<div class="' + ROOT + '-grid">' +
            '<div class="' + ROOT + '-field"><label class="' + ROOT + '-lbl" for="' + ROOT + '-uurloon">' + esc(C.uurloon.label) +
              "<small>" + esc(C.uurloon.hint) + "</small></label>" +
              '<div class="' + ROOT + '-money"><span>€</span><input id="' + ROOT + '-uurloon" class="' + ROOT + '-txt" data-in="uurloon" type="text" inputmode="decimal" placeholder="' + esc(C.uurloon.placeholder) + '"></div></div>' +
            radios("statuut", C.statuut) +
          "</div>" +
          radios("dienst", C.dienst) +
          '<div data-niveau style="display:none">' + radios("niveau", C.niveau) + "</div>" +
          '<div class="' + ROOT + '-grid">' + slider("medewerkers", C.medewerkers) + slider("uren", C.uren) + "</div>" +
          '<button type="button" data-next class="' + ROOT + '-next">' + esc(C.nextLabel) + "</button>" +
          '<p data-missing class="' + ROOT + '-missing" style="display:none"></p>' +
        "</div>" +
        // Stap 2: contactgegevens. Vervangt stap 1 op dezelfde plek na een klik op de knop.
        '<div data-step2 class="' + ROOT + '-contact" style="display:none">' +
          "<h4>" + esc(C.contactTitle) + "</h4>" +
          '<div class="' + ROOT + '-summary"><span data-summary></span><button type="button" data-back class="' + ROOT + '-back">' + esc(C.backLabel) + "</button></div>" +
          '<div id="' + ROOT + '-hsform"></div>' +
        "</div>" +
        "</div>" +
        '<div class="' + ROOT + '-side"><h3>' + esc(C.side.title) + '</h3><ol class="' + ROOT + '-steps">' +
          C.side.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
        "</ol></div>" +
      "</div>";
  }

  function run(mount) {
    build(mount);
    var C = CONFIG, h = C.hubspot;
    var q = function (sel) { return mount.querySelector(sel); };
    var target = q("#" + ROOT + "-hsform");
    var hsForm = null;
    var submitted = false;

    function radioVal(key) {
      var el = q('input[name="' + ROOT + "-" + key + '"]:checked');
      return el ? el.value : "";
    }

    function uurloon() {
      var n = parseFloat(String(q('[data-in="uurloon"]').value).replace(/\s|€/g, "").replace(",", "."));
      return isNaN(n) || n <= 0 ? null : Math.round(n * 100) / 100;
    }

    function values() {
      var med = +q('[data-in="medewerkers"]').value;
      var dienst = radioVal("dienst");
      return {
        uurloon: uurloon(),
        statuut: radioVal("statuut"),
        dienst: dienst,
        niveau: dienst === "selectie" ? radioVal("niveau") : "",
        medewerkers: med >= C.medewerkers.max && C.medewerkers.maxLabel ? C.medewerkers.maxLabel : String(med),
        uren: q('[data-in="uren"]').value
      };
    }

    function complete(v) {
      return v.uurloon !== null && v.statuut && v.dienst && (v.dienst !== "selectie" || v.niveau);
    }

    function optLabel(cfg, value) {
      for (var i = 0; i < cfg.options.length; i++) if (cfg.options[i].value === value) return cfg.options[i].label;
      return "";
    }

    function summary(v) {
      return [
        optLabel(C.statuut, v.statuut),
        optLabel(C.dienst, v.dienst) + (v.niveau ? " (" + optLabel(C.niveau, v.niveau) + ")" : ""),
        "€ " + v.uurloon.toFixed(2).replace(".", ",") + "/uur",
        v.medewerkers + " medewerker" + (v.medewerkers === "1" ? "" : "s"),
        v.uren + " uur/week"
      ].join(" · ");
    }

    function showStep(n) {
      q("[data-step1]").style.display = n === 1 ? "block" : "none";
      q("[data-step2]").style.display = n === 2 ? "block" : "none";
      var top = mount.getBoundingClientRect().top;
      if (top < 0) mount.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function update() {
      var v = values();
      q('[data-out="medewerkers"]').textContent = v.medewerkers;
      q('[data-out="uren"]').textContent = v.uren;
      q("[data-niveau]").style.display = v.dienst === "selectie" ? "block" : "none";
      Array.prototype.forEach.call(mount.querySelectorAll("." + ROOT + "-opt"), function (l) {
        l.classList.toggle("on", l.querySelector("input").checked);
      });
      var ok = complete(v);
      if (ok) q("[data-missing]").style.display = "none";
      if (!hsForm) return;
      var btn = hsForm.querySelector(".hs-button");
      if (btn) btn.disabled = !ok;
      Object.keys(h.hiddenFields).forEach(function (k) {
        var val = k === "uurloon" ? (v.uurloon === null ? "" : String(v.uurloon)) : v[k];
        setHsValue(hsForm, h.hiddenFields[k], val);
      });
    }

    function onOwnInput(e) { if (!target.contains(e.target)) update(); }
    mount.addEventListener("input", onOwnInput);
    mount.addEventListener("change", onOwnInput);
    update();

    q("[data-next]").addEventListener("click", function () {
      var v = values();
      if (!complete(v)) {
        var missing = [];
        if (v.uurloon === null) missing.push(C.missingNames.uurloon);
        if (!v.statuut) missing.push(C.missingNames.statuut);
        if (!v.dienst) missing.push(C.missingNames.dienst);
        if (v.dienst === "selectie" && !v.niveau) missing.push(C.missingNames.niveau);
        var m = q("[data-missing]");
        m.textContent = C.missingText + missing.join(", ") + ".";
        m.style.display = "block";
        return;
      }
      update();
      q("[data-summary]").textContent = summary(v);
      showStep(2);
    });

    q("[data-back]").addEventListener("click", function () { showStep(1); });

    loadHubSpot(h.region, function () {
      window.hbspt.forms.create({
        region: h.region,
        portalId: h.portalId,
        formId: h.formId,
        target: "#" + ROOT + "-hsform",
        css: "", // HubSpot-standaardstijl uit, onze eigen stijl hierboven
        inlineMessage: C.thanksText, // geen redirect naar de bedankpagina van het formulier
        submitText: h.submitText,
        locale: h.locale,
        onFormReady: function () {
          hsForm = target.querySelector("form");
          if (hsForm) {
            applyLabels(hsForm);
            new MutationObserver(function () { applyLabels(hsForm); })
              .observe(hsForm, { childList: true, subtree: true, characterData: true });
          }
          if (hsForm && window.console) {
            Object.keys(h.hiddenFields).forEach(function (k) {
              if (!hsForm.querySelector('input[name="' + h.hiddenFields[k] + '"]')) {
                console.warn("Werkgeverskost: verborgen veld '" + h.hiddenFields[k] + "' ontbreekt in het HubSpot-formulier; deze keuze wordt niet doorgestuurd.");
              }
            });
          }
          update();
        },
        onBeforeFormSubmit: function () { update(); },
        onFormSubmitted: function () {
          submitted = true;
          q("." + ROOT + "-summary").style.display = "none";
          if (typeof window.dataLayer !== "undefined") {
            var v = values();
            window.dataLayer.push({ event: "werkgeverskost_lead", statuut: v.statuut, dienst: v.dienst, functieniveau: v.niveau, aantal_medewerkers: v.medewerkers, uren_per_week: v.uren });
          }
        }
      });
    }, function () {
      target.innerHTML = '<p class="' + ROOT + '-err">' + esc(C.loadError) + "</p>";
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
