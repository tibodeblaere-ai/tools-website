/* =====================================================================
 * Nestor – Inkomsten Limiet Tool ("Hoeveel mag je bijverdienen?")
 * Eén zelfstandig bestand. Sluit overal in met:
 *
 *   <div id="inkomsten-limiet-tool"></div>
 *   <script src="https://cdn.jsdelivr.net/gh/USER/nestor-tools@v1/inkomsten-limiet.js" defer></script>
 *
 * Inhoud aanpassen? Pas alleen het CONFIG-blok hieronder aan.
 * De logica eronder hoef je normaal niet aan te raken.
 * ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   *  CONFIG — hier pas je teksten, vragen, paden en bedragen aan
   * ------------------------------------------------------------------ */
  var CONFIG = {
    mountId: "inkomsten-limiet-tool",
    title: "Hoeveel mag je bijverdienen?",
    jaar: "2026", // verschijnt in "Jouw jaargrens (bruto) voor <jaar>"

    colors: { primary: "#F73109", primaryHover: "#D92B07" },

    cta: {
      heading: "Zin om bij te verdienen?",
      text: "Schrijf je in op ons vacatureplatform en ontdek alle openstaande vacatures!",
      label: "Inschrijven",
      url: "https://mijn.nestor.be/home"
    },

    progress: ["Situatie", "Details", "Kinderen", "Resultaat"],
    startStep: "stap-1",
    resultStep: "stap-resultaat",
    // Welk bolletje (1-4) bij welke stap hoort.
    stepNumbers: {
      "stap-1": 1,
      "stap-2-pensioen": 2,
      "stap-3-partner-pensioen": 2,
      "stap-kinderen-ten-laste": 3,
      "stap-resultaat": 4
    },

    // Vragen. Per keuze: next (volgende stap), path (onthoud pad), result (toon resultaat).
    steps: {
      "stap-1": {
        title: "Aan welke voorwaarden voldoe je?",
        choices: [
          { label: "Ik ben met (vervroegd) pensioen", next: "stap-2-pensioen" },
          { label: "Ik ontvang een overgangsuitkering", result: "overgangsuitkering" }
        ]
      },
      "stap-2-pensioen": {
        title: "Kies de situatie die op jou van toepassing is:",
        choices: [
          { label: "Wettelijk gepensioneerd (of 65 jaar, of 45 jaar loopbaan)", next: "stap-kinderen-ten-laste", path: "pensioen_normaal" },
          { label: "Met vervroegd pensioen (nog geen 65 jaar)", next: "stap-3-partner-pensioen" },
          { label: "Pensioen in een speciaal stelsel (bv. vliegend personeel)", next: "stap-kinderen-ten-laste", path: "speciaal_stelsel" },
          { label: "Een gezinspensioen", next: "stap-kinderen-ten-laste", path: "gezinspensioen" },
          { label: "Ik oefen een flexi-job uit en ben wettelijk gepensioneerd", result: "flexijob_wettelijk" },
          { label: "Ik oefen een flexi-job uit en ben vervroegd gepensioneerd", result: "flexijob_vervroegd" }
        ]
      },
      "stap-3-partner-pensioen": {
        title: "Ontvangt je huwelijkspartner een eigen rustpensioen?",
        choices: [
          { label: "Ja", next: "stap-kinderen-ten-laste", path: "pensioen_wel_partner" },
          { label: "Nee", next: "stap-kinderen-ten-laste", path: "pensioen_geen_partner" }
        ]
      },
      "stap-kinderen-ten-laste": {
        title: "Heb je kinderen ten laste?",
        choices: [
          { label: "Ja", result: "ja" },
          { label: "Nee", result: "nee" }
        ]
      }
    },

    // Resultaten per pad. Per pad een 'ja'/'nee' (kinderen ten laste).
    // Waarde = "onbegrensd"  OF  { werknemer: "...", zelfstandige: "..." }.
    results: {
      pensioen_normaal:     { ja: "onbegrensd", nee: "onbegrensd" },
      overgangsuitkering:   { ja: "onbegrensd", nee: "onbegrensd" },
      pensioen_geen_partner:{ ja: { werknemer: "15.648 EUR", zelfstandige: "12.519 EUR" },
                              nee: { werknemer: "10.432 EUR", zelfstandige: "8.346 EUR" } },
      pensioen_wel_partner: { ja: { werknemer: "35.333 EUR (+5.889 EUR per kind)", zelfstandige: "28.266 EUR (+4.711 EUR per kind)" },
                              nee: { werknemer: "23.555 EUR", zelfstandige: "18.844 EUR" } },
      speciaal_stelsel:     { ja: { werknemer: "36.652 EUR", zelfstandige: "29.321 EUR" },
                              nee: { werknemer: "30.132 EUR", zelfstandige: "24.105 EUR" } },
      gezinspensioen:       { ja: { werknemer: "35.544 EUR", zelfstandige: "28.435 EUR" },
                              nee: { werknemer: "35.544 EUR", zelfstandige: "28.435 EUR" } },
      flexijob_wettelijk:   { ja: "onbegrensd", nee: "onbegrensd" },
      flexijob_vervroegd:   { ja: { werknemer: "8.121 EUR", zelfstandige: "N.v.t." },
                              nee: { werknemer: "8.121 EUR", zelfstandige: "N.v.t." } }
    }
  };

  /* ------------------------------------------------------------------ *
   *  Vanaf hier: logica + styling. Normaal niet aanpassen.
   * ------------------------------------------------------------------ */

  var ROOT = "ilt"; // class-prefix, voorkomt botsing met de rest van de site

  function injectFont() {
    if (document.getElementById(ROOT + "-font")) return;
    var l = document.createElement("link");
    l.id = ROOT + "-font";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Baloo+Paaji+2:wght@400;700&display=swap";
    document.head.appendChild(l);
  }

  function injectStyles() {
    if (document.getElementById(ROOT + "-styles")) return;
    var P = "#" + CONFIG.mountId;
    var css = `
${P}{--ilt-primary:${CONFIG.colors.primary};--ilt-primary-hover:${CONFIG.colors.primaryHover}}
${P} .${ROOT}-tool{max-width:600px;margin:20px auto;background:#fff;color:#1a202c;border-radius:16px;padding:24px 32px 32px;box-shadow:0 10px 30px rgba(0,50,100,.1);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;overflow:hidden;box-sizing:border-box}
${P} .${ROOT}-tool *{box-sizing:border-box}
${P} .${ROOT}-h3{text-align:center;margin:0 0 24px;font-family:'Baloo Paaji 2',sans-serif;font-size:1.5rem;color:#2d3748}
${P} .${ROOT}-progress{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;user-select:none}
${P} .${ROOT}-step{text-align:center;color:#a0aec0;transition:color .4s ease;flex-basis:0;flex-grow:1;position:relative}
${P} .${ROOT}-circle{height:32px;width:32px;border-radius:50%;border:2px solid #e2e8f0;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-weight:700;transition:all .4s ease;background:#fff;z-index:2;position:relative}
${P} .${ROOT}-step-label{font-size:12px;font-weight:500}
${P} .${ROOT}-step.active{color:#2d3748}
${P} .${ROOT}-step.active .${ROOT}-circle,${P} .${ROOT}-step.completed .${ROOT}-circle{border-color:var(--ilt-primary);background:var(--ilt-primary);color:#fff}
${P} .${ROOT}-step.completed{color:#a0aec0}
${P} .${ROOT}-line{height:2px;background:#e2e8f0;position:absolute;top:15px;left:50%;right:-50%;z-index:1;transition:background-color .4s ease}
${P} .${ROOT}-step:last-of-type .${ROOT}-line{display:none}
${P} .${ROOT}-step.completed .${ROOT}-line{background:var(--ilt-primary)}
${P} .${ROOT}-steps{position:relative;min-height:350px}
${P} .${ROOT}-q{transition:opacity .3s ease-in-out,transform .3s ease-in-out}
${P} .${ROOT}-q:not(.active){opacity:0;transform:translateY(15px);position:absolute;top:0;left:0;width:100%;pointer-events:none}
${P} .${ROOT}-title{font-family:'Baloo Paaji 2',sans-serif;text-align:center;margin:0 0 1.5rem;font-size:1.25rem;color:#4a5568;line-height:1.4}
${P} .${ROOT}-choices{display:flex;flex-direction:column;gap:12px}
${P} .${ROOT}-btn{background:var(--ilt-primary);color:#fff;border:1px solid var(--ilt-primary);font-weight:600;transition:background-color .2s,transform .2s;border-radius:8px;padding:14px 20px;cursor:pointer;text-align:center;font-size:1rem;width:100%}
${P} .${ROOT}-btn:hover{background:var(--ilt-primary-hover);border-color:var(--ilt-primary-hover);transform:translateY(-2px)}
${P} .${ROOT}-restart{display:block;text-align:center;margin-top:16px;color:#718096;text-decoration:none;font-size:14px;cursor:pointer;background:none;border:none;width:100%}
${P} .${ROOT}-restart:hover{text-decoration:underline}
${P} .${ROOT}-result{border-radius:8px;color:#1a202c;text-align:left;line-height:1.6;border-left:4px solid var(--ilt-primary);background:#fff5f2;padding:1.25rem}
${P} .${ROOT}-result h4{margin-top:0;font-size:1.2rem;color:#1a202c}
${P} .${ROOT}-result p{margin-bottom:.5rem}
${P} .${ROOT}-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:1rem;text-align:center}
@media (min-width:500px){${P} .${ROOT}-grid{grid-template-columns:1fr 1fr}}
${P} .${ROOT}-box{background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:15px}
${P} .${ROOT}-box-title{font-weight:bold;margin-bottom:8px;font-size:.9rem;color:#4a5568}
${P} .${ROOT}-box-amount{font-size:1.2rem;font-weight:700;color:var(--ilt-primary)}
${P} .${ROOT}-note{font-size:.75rem;color:#718096;margin-top:1rem}
${P} .${ROOT}-cta{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #e2e8f0;text-align:center}
${P} .${ROOT}-cta h5{font-size:1.125rem;font-weight:bold;color:#2d3748;margin:0 0 .5rem}
${P} .${ROOT}-cta p{color:#4a5568;margin:0 0 1rem}
${P} .${ROOT}-cta-link{display:inline-block;background:var(--ilt-primary);color:#fff;border-radius:8px;padding:14px 20px;font-weight:600;text-decoration:none;transition:background-color .2s}
${P} .${ROOT}-cta-link:hover{background:var(--ilt-primary-hover)}`;
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
    var tool = el("div", ROOT + "-tool");
    tool.appendChild(el("h3", ROOT + "-h3", esc(CONFIG.title)));

    // Voortgangsbalk
    var progress = el("div", ROOT + "-progress");
    CONFIG.progress.forEach(function (label, i) {
      var step = el("div", ROOT + "-step" + (i === 0 ? " active" : ""));
      step.setAttribute("data-step", i + 1);
      step.appendChild(el("div", ROOT + "-circle", String(i + 1)));
      step.appendChild(el("div", ROOT + "-step-label", esc(label)));
      step.appendChild(el("div", ROOT + "-line"));
      progress.appendChild(step);
    });
    tool.appendChild(progress);

    // Vragen
    var steps = el("div", ROOT + "-steps");
    Object.keys(CONFIG.steps).forEach(function (id) {
      var data = CONFIG.steps[id];
      var q = el("div", ROOT + "-q" + (id === CONFIG.startStep ? " active" : ""));
      q.id = id;
      q.appendChild(el("h4", ROOT + "-title", data.title));
      var choices = el("div", ROOT + "-choices");
      data.choices.forEach(function (c) {
        var btn = el("button", ROOT + "-btn", esc(c.label));
        btn.type = "button";
        if (c.next) btn.dataset.next = c.next;
        if (c.result) btn.dataset.result = c.result;
        if (c.path) btn.dataset.path = c.path;
        choices.appendChild(btn);
      });
      q.appendChild(choices);
      steps.appendChild(q);
    });

    // Resultaatstap
    var resultStep = el("div", ROOT + "-q");
    resultStep.id = CONFIG.resultStep;
    var resultContent = el("div", "");
    resultStep.appendChild(resultContent);
    var restart = el("button", ROOT + "-restart", "↺ Start opnieuw");
    restart.type = "button";
    resultStep.appendChild(restart);
    steps.appendChild(resultStep);

    tool.appendChild(steps);
    mount.innerHTML = "";
    mount.appendChild(tool);

    return { tool: tool, resultContent: resultContent, restart: restart };
  }

  function ctaHtml() {
    return '<div class="' + ROOT + '-cta">' +
      "<h5>" + esc(CONFIG.cta.heading) + "</h5>" +
      "<p>" + esc(CONFIG.cta.text) + "</p>" +
      '<a href="' + CONFIG.cta.url + '" target="_blank" rel="noopener noreferrer" class="' + ROOT + '-cta-link">' +
      esc(CONFIG.cta.label) + "</a></div>";
  }

  function run(mount) {
    var refs = build(mount);
    var tool = refs.tool;
    var progressSteps = tool.querySelectorAll("." + ROOT + "-step");
    var allQ = tool.querySelectorAll("." + ROOT + "-q");
    var gekozenPad = "";

    function updateProgress(id) {
      var n = CONFIG.stepNumbers[id] || 1;
      progressSteps.forEach(function (s, i) {
        s.classList.remove("active", "completed");
        if (i + 1 < n) s.classList.add("completed");
        else if (i + 1 === n) s.classList.add("active");
      });
    }

    function toon(id) {
      allQ.forEach(function (q) { q.classList.remove("active"); });
      var active = tool.querySelector("#" + id);
      if (active) active.classList.add("active");
      updateProgress(id);
    }

    function toonResultaat(resultKey) {
      var res = CONFIG.results[gekozenPad] ? CONFIG.results[gekozenPad][resultKey] : null;
      var html = "<h4>Jouw jaargrens (bruto) voor " + esc(CONFIG.jaar) + "</h4>";

      if (!res) {
        html += "<p>Er is iets misgegaan. Probeer het opnieuw.</p>";
      } else if (res === "onbegrensd") {
        html += "<p>Jouw inkomsten zijn <strong>onbegrensd</strong>. Je mag zoveel bijverdienen als je wilt zonder dat je pensioen wordt beïnvloed.</p>";
      } else {
        html += "<p>Op basis van jouw situatie zijn dit de limieten:</p>" +
          '<div class="' + ROOT + '-grid">' +
            '<div class="' + ROOT + '-box"><div class="' + ROOT + '-box-title">Werknemer / Ambtenaar</div>' +
              '<div class="' + ROOT + '-box-amount">' + esc(res.werknemer) + "</div></div>" +
            '<div class="' + ROOT + '-box"><div class="' + ROOT + '-box-title">Zelfstandige</div>' +
              '<div class="' + ROOT + '-box-amount">' + esc(res.zelfstandige) + "</div></div>" +
          "</div>" +
          '<p class="' + ROOT + '-note">Let op: dit zijn brutobedragen, tenzij anders vermeld. De bedragen voor zelfstandigen zijn netto belastbaar inkomen.</p>';
      }

      html += ctaHtml();
      refs.resultContent.innerHTML = html;
      refs.resultContent.className = ROOT + "-result";
      toon(CONFIG.resultStep);
    }

    tool.addEventListener("click", function (e) {
      var btn = e.target.closest("button." + ROOT + "-btn");
      if (!btn || !tool.contains(btn)) return;

      if (btn.dataset.path) gekozenPad = btn.dataset.path;

      if (btn.dataset.next) {
        toon(btn.dataset.next);
      } else if (btn.dataset.result) {
        // Heeft de vorige keuze al een pad gezet? Dan is dit de kinderen-keuze.
        // Zo niet, dan is het resultaat zelf het pad (bv. een flexi-job-keuze).
        if (gekozenPad) {
          toonResultaat(btn.dataset.result);
        } else {
          gekozenPad = btn.dataset.result;
          toonResultaat("nee");
        }
      }
    });

    refs.restart.addEventListener("click", function () {
      gekozenPad = "";
      toon(CONFIG.startStep);
    });

    toon(CONFIG.startStep);
  }

  function init() {
    var mount = document.getElementById(CONFIG.mountId);
    if (!mount) return;
    injectFont();
    injectStyles();
    run(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
