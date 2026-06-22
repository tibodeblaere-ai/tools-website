/* =====================================================================
 * Nestor – Flexi-Job Tool
 * Eén zelfstandig bestand. Sluit overal in met:
 *
 *   <div id="flexi-job-tool"></div>
 *   <script src="https://cdn.jsdelivr.net/gh/USER/nestor-tools@v1/flexi-job.js" defer></script>
 *
 * Inhoud aanpassen? Pas alleen het CONFIG-blok hieronder aan.
 * De logica eronder hoef je normaal niet aan te raken.
 * ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   *  CONFIG — hier pas je teksten, vragen, paden en resultaten aan
   * ------------------------------------------------------------------ */
  var CONFIG = {
    mountId: "flexi-job-tool",            // id van de <div> waarin de tool komt
    zoekUrl: "https://mijn.nestor.be/landing",
    zoekLabel: "Ik zoek een flexi-job",

    colors: { primary: "#F73109", primaryHover: "#D92B07" },

    progress: ["Situatie", "Details", "Resultaat"],
    startStep: "stap-situatie",
    resultStep: "stap-resultaat",

    // Herbruikbaar blok dat onderaan een positief resultaat verschijnt
    ctaHtml:
      '<div class="cta-box">' +
        '<p style="margin-bottom:10px;font-weight:bold;">Jouw zoektocht naar een flexi-job start hier!</p>' +
        '<p style="margin-bottom:0;">Nu je weet dat je in aanmerking komt, is het tijd om de ideale bijverdienste te vinden. Ontdek de leukste vacatures via onderstaande knop.</p>' +
      '</div>',

    // Elke stap = een vraag met keuzes.
    //  - next:   ga naar deze volgende stap-id
    //  - path:   onthoud dit pad (wordt gecombineerd met de result-key)
    //  - result: toon dit resultaat (key in 'results', evt. met path-prefix)
    // {kwartaal_t3} in een titel wordt vervangen door het berekende kwartaal.
    steps: {
      "stap-situatie": {
        title: "Wat is je huidige situatie?",
        choices: [
          { label: "Ik werk als arbeider, bediende of ambtenaar", next: "stap-t-min-3-check", path: "werknemer" },
          { label: "Ik ben met (vervroegd) pensioen", next: "stap-type-pensioen", path: "gepensioneerd" },
          { label: "Ik ontvang een ziekte- of werkloosheidsuitkering", next: "stap-t-min-3-check", path: "uitkering" },
          { label: "Ik werk als zelfstandige", next: "stap-zelfstandige", path: "zelfstandige" }
        ]
      },
      "stap-type-pensioen": {
        title: "Welk type pensioen ontvang je?",
        choices: [
          { label: "Ik ben 65+ of heb een volledige loopbaan van 45 jaar achter de rug", result: "65plus" },
          { label: "Ik ben met vervroegd pensioen (en nog geen 65)", result: "vervroegd" }
        ]
      },
      "stap-zelfstandige": {
        title: "Ben je zelfstandige in hoofdberoep of bijberoep?",
        choices: [
          { label: "Hoofdberoep", result: "hoofdberoep" },
          { label: "Bijberoep", next: "stap-t-min-3-check", path: "zelfstandige_bijberoep" }
        ]
      },
      "stap-t-min-3-check": {
        title: 'Heb je in het kwartaal <strong>{kwartaal_t3}</strong> minstens 4/5de als werknemer gewerkt?',
        choices: [
          { label: "Ja", result: "ja" },
          { label: "Nee", result: "nee" }
        ]
      }
    },

    // Resultaten. Key = (path_)result. type: success | warning | danger.
    // cta:true toont het CTA-blok én de "zoek een flexi-job"-knop.
    results: {
      gepensioneerd_65plus: { type: "success", cta: true,
        heading: "✅ Ja, je komt in aanmerking!",
        text: "Ben je (officieel) met pensioen (65+)? Dan mag je altijd onbeperkt bijverdienen onder het flexi-statuut." },
      gepensioneerd_vervroegd: { type: "warning", cta: true,
        heading: "⚠️ Ja, maar let op de limieten!",
        text: "Ben je met vervroegd pensioen (nog geen wettelijke pensioenleeftijd én geen 45 jaar loopbaan)? Dan geldt voor een flexi-job in 2026 een bijkomende grens van <strong>€8.121</strong> per jaar. Ga je daarboven, dan vermindert je pensioen. Daarnaast gelden algemene grensbedragen (€10.432 bruto als werknemer, €8.346 netto als zelfstandige; hoger met kinderen ten laste). Controleer dit altijd bij de Federale Pensioendienst!" },
      zelfstandige_hoofdberoep: { type: "danger",
        heading: "❌ Nee, je komt niet in aanmerking.",
        text: "Als zelfstandige in hoofdberoep bouw je geen rechten op voor een flexi-job." },
      werknemer_ja: { type: "success", cta: true,
        heading: "✅ Ja, je komt waarschijnlijk in aanmerking!",
        text: "Ben je nog niet met pensioen? Dan zijn je flexi-job-inkomsten in 2026 belastingvrij tot <strong>€18.440</strong> per jaar. Verdien je meer, dan wordt je volledige flexi-inkomen progressief belast." },
      werknemer_nee: { type: "danger",
        heading: "❌ Nee, je komt niet in aanmerking.",
        text: "De belangrijkste voorwaarde is dat je drie kwartalen geleden (T-3) minstens 4/5de als werknemer gewerkt hebt." },
      uitkering_ja: { type: "warning", cta: true,
        heading: "⚠️ Ja, maar wees zeer voorzichtig!",
        text: "Je moet je flexi-job inkomen verplicht melden bij je uitbetalingsinstelling of ziekenfonds. Dit kan je uitkering beïnvloeden. De fiscale flexi-grens van €18.440 op jaarbasis (bedrag 2026) is ook hier van toepassing. Contacteer de bevoegde instanties voor je start!" },
      uitkering_nee: { type: "danger",
        heading: "❌ Nee, je komt niet in aanmerking.",
        text: "Om in aanmerking te komen, moet je drie kwartalen geleden (T-3) minstens 4/5de als werknemer gewerkt hebben." },
      zelfstandige_bijberoep_ja: { type: "success", cta: true,
        heading: "✅ Ja, waarschijnlijk wel!",
        text: "Omdat je naast je bijberoep ook voldoende als werknemer hebt gewerkt, voldoe je aan de voorwaarden. De regels en de fiscale jaarlimiet van €18.440 voor werknemers (bedrag 2026) zijn op jou van toepassing." },
      zelfstandige_bijberoep_nee: { type: "danger",
        heading: "❌ Nee, je komt niet in aanmerking.",
        text: "Je statuut als zelfstandige in bijberoep geeft geen recht op een flexi-job. Je moet daarnaast ook minstens 4/5de als werknemer gewerkt hebben in kwartaal T-3." }
    }
  };

  /* ------------------------------------------------------------------ *
   *  Vanaf hier: logica + styling. Normaal niet aanpassen.
   * ------------------------------------------------------------------ */

  var ROOT = "fjt"; // class-prefix, voorkomt botsing met de rest van de site

  function injectStyles() {
    if (document.getElementById(ROOT + "-styles")) return;
    var css = `
#${CONFIG.mountId}{--fjt-primary:${CONFIG.colors.primary};--fjt-primary-hover:${CONFIG.colors.primaryHover}}
#${CONFIG.mountId} .${ROOT}-tool{max-width:600px;margin:20px auto;background:#fff;color:#1a202c;border-radius:16px;padding:24px 32px 32px;box-shadow:0 10px 30px rgba(0,50,100,.1);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;overflow:hidden;box-sizing:border-box}
#${CONFIG.mountId} .${ROOT}-tool *{box-sizing:border-box}
#${CONFIG.mountId} .${ROOT}-progress{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;user-select:none}
#${CONFIG.mountId} .${ROOT}-step{text-align:center;color:#a0aec0;transition:color .4s ease}
#${CONFIG.mountId} .${ROOT}-circle{height:32px;width:32px;border-radius:50%;border:2px solid #e2e8f0;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-weight:700;transition:all .4s ease}
#${CONFIG.mountId} .${ROOT}-step-label{font-size:12px;font-weight:500}
#${CONFIG.mountId} .${ROOT}-step.active{color:#2d3748}
#${CONFIG.mountId} .${ROOT}-step.active .${ROOT}-circle,#${CONFIG.mountId} .${ROOT}-step.completed .${ROOT}-circle{border-color:var(--fjt-primary);background:var(--fjt-primary);color:#fff}
#${CONFIG.mountId} .${ROOT}-step.completed{color:#a0aec0}
#${CONFIG.mountId} .${ROOT}-line{flex-grow:1;height:2px;background:#e2e8f0;margin:0 8px;transform:translateY(-12px);transition:background-color .4s ease}
#${CONFIG.mountId} .${ROOT}-steps{position:relative;min-height:150px}
#${CONFIG.mountId} .${ROOT}-q{transition:opacity .3s ease-in-out,transform .3s ease-in-out}
#${CONFIG.mountId} .${ROOT}-q:not(.active){opacity:0;transform:translateY(15px);position:absolute;top:0;left:0;width:100%;pointer-events:none}
#${CONFIG.mountId} .${ROOT}-title{text-align:center;margin:0 0 1.5rem;font-size:1.25rem;color:#575757;line-height:1.4;font-weight:600}
#${CONFIG.mountId} .${ROOT}-choices{display:flex;flex-direction:column;gap:12px}
#${CONFIG.mountId} .${ROOT}-btn{background:var(--fjt-primary);color:#fff;border:1px solid var(--fjt-primary);font-weight:600;border-radius:8px;padding:14px 20px;cursor:pointer;font-size:1rem;text-align:center;transition:background-color .2s,transform .2s;width:100%}
#${CONFIG.mountId} .${ROOT}-btn:hover{background:var(--fjt-primary-hover);border-color:var(--fjt-primary-hover)}
#${CONFIG.mountId} .${ROOT}-btn:active,#${CONFIG.mountId} .${ROOT}-restart:active{transform:scale(.98)}
#${CONFIG.mountId} .${ROOT}-cta-link{display:block;width:fit-content;margin:24px auto 0;background:var(--fjt-primary);color:#fff;border-radius:8px;padding:14px 28px;font-weight:700;text-decoration:none;transition:background-color .2s,transform .2s}
#${CONFIG.mountId} .${ROOT}-cta-link:hover{background:var(--fjt-primary-hover)}
#${CONFIG.mountId} .${ROOT}-cta-link.${ROOT}-hidden{display:none}
#${CONFIG.mountId} .${ROOT}-restart{display:block;text-align:center;margin-top:16px;color:#a0aec0;text-decoration:none;font-size:14px;cursor:pointer;background:none;border:none;width:100%}
#${CONFIG.mountId} .${ROOT}-restart:hover{text-decoration:underline}
#${CONFIG.mountId} .${ROOT}-result{border-radius:8px;color:#1a202c;text-align:left;line-height:1.6}
#${CONFIG.mountId} .${ROOT}-result.success{border-left:4px solid #28a745;background:#f0fff4;padding:1rem}
#${CONFIG.mountId} .${ROOT}-result.warning{border-left:4px solid #ffc107;background:#fff9eb;padding:1rem}
#${CONFIG.mountId} .${ROOT}-result.danger{border-left:4px solid #dc3545;background:#fff5f5;padding:1rem}
#${CONFIG.mountId} .${ROOT}-result h4{margin-top:0;font-size:1.1rem;color:#1a202c}
#${CONFIG.mountId} .${ROOT}-result p{margin-bottom:0}
#${CONFIG.mountId} .${ROOT}-result strong{color:var(--fjt-primary)}
#${CONFIG.mountId} .cta-box{margin-top:20px;padding:15px;background:#f5f8fa;border:1px solid #ccd6e0;border-radius:8px}`;
    var style = document.createElement("style");
    style.id = ROOT + "-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Bereken het kwartaal T-3 (drie kwartalen geleden) als leesbare periode.
  function kwartaalTMin3() {
    var nu = new Date();
    var jaar = nu.getFullYear();
    var k = Math.floor(nu.getMonth() / 3) + 1 - 3;
    if (k <= 0) { jaar -= 1; k += 4; }
    return {
      1: "1 januari - 31 maart " + jaar,
      2: "1 april - 30 juni " + jaar,
      3: "1 juli - 30 september " + jaar,
      4: "1 oktober - 31 december " + jaar
    }[k];
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function build(mount) {
    var kwartaal = kwartaalTMin3();

    var tool = el("div", ROOT + "-tool");

    // Voortgangsbalk
    var progress = el("div", ROOT + "-progress");
    CONFIG.progress.forEach(function (label, i) {
      if (i > 0) progress.appendChild(el("div", ROOT + "-line"));
      var step = el("div", ROOT + "-step" + (i === 0 ? " active" : ""));
      step.setAttribute("data-step", i + 1);
      step.appendChild(el("div", ROOT + "-circle", String(i + 1)));
      step.appendChild(el("div", ROOT + "-step-label", label));
      progress.appendChild(step);
    });
    tool.appendChild(progress);

    // Vragen
    var steps = el("div", ROOT + "-steps");
    Object.keys(CONFIG.steps).forEach(function (id) {
      var data = CONFIG.steps[id];
      var q = el("div", ROOT + "-q" + (id === CONFIG.startStep ? " active" : ""));
      q.id = id;
      var titleHtml = data.title.replace("{kwartaal_t3}", kwartaal);
      q.appendChild(el("h4", ROOT + "-title", titleHtml));
      var choices = el("div", ROOT + "-choices");
      data.choices.forEach(function (c) {
        var btn = el("button", ROOT + "-btn", c.label);
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
    var resultContent = el("div", ROOT + "-result");
    resultStep.appendChild(resultContent);
    var ctaLink = el("a", ROOT + "-cta-link " + ROOT + "-hidden", CONFIG.zoekLabel);
    ctaLink.href = CONFIG.zoekUrl;
    ctaLink.target = "_blank";
    ctaLink.rel = "noopener noreferrer";
    resultStep.appendChild(ctaLink);
    var restart = el("button", ROOT + "-restart", "↺ Start opnieuw");
    restart.type = "button";
    resultStep.appendChild(restart);
    steps.appendChild(resultStep);

    tool.appendChild(steps);
    mount.innerHTML = "";
    mount.appendChild(tool);

    return { tool: tool, resultContent: resultContent, ctaLink: ctaLink, restart: restart };
  }

  function run(mount) {
    var refs = build(mount);
    var tool = refs.tool;
    var progressSteps = tool.querySelectorAll("." + ROOT + "-step");
    var progressLines = tool.querySelectorAll("." + ROOT + "-line");
    var allQ = tool.querySelectorAll("." + ROOT + "-q");

    var gekozenPad = "";
    var toolPad = [];

    function stepNumber(id) {
      if (id === CONFIG.startStep) return 1;
      if (id === CONFIG.resultStep) return CONFIG.progress.length;
      return 2;
    }

    function updateProgress(id) {
      var n = stepNumber(id);
      progressSteps.forEach(function (s, i) {
        s.classList.remove("active", "completed");
        if (i + 1 < n) s.classList.add("completed");
        else if (i + 1 === n) s.classList.add("active");
      });
      progressLines.forEach(function (line, i) {
        line.style.backgroundColor = i < n - 1 ? CONFIG.colors.primary : "#e2e8f0";
      });
    }

    function toon(id) {
      allQ.forEach(function (q) { q.classList.remove("active"); });
      var active = tool.querySelector("#" + id);
      if (active) active.classList.add("active");
      updateProgress(id);
    }

    function track(payload) {
      if (typeof window.dataLayer !== "undefined") window.dataLayer.push(payload);
    }

    tool.addEventListener("click", function (e) {
      var btn = e.target.closest("button." + ROOT + "-btn");
      if (!btn || !tool.contains(btn)) return;

      toolPad.push(btn.textContent.trim());

      setTimeout(function () {
        if (btn.dataset.path) gekozenPad = btn.dataset.path;

        if (btn.dataset.next) {
          toon(btn.dataset.next);
        } else if (btn.dataset.result) {
          var key = gekozenPad ? gekozenPad + "_" + btn.dataset.result : btn.dataset.result;
          var res = CONFIG.results[key];
          if (!res) return;

          var html = "<h4>" + res.heading + "</h4><p>" + res.text + "</p>";
          if (res.cta) html += CONFIG.ctaHtml;
          refs.resultContent.innerHTML = html;
          refs.resultContent.className = ROOT + "-result " + res.type;

          if (res.cta) refs.ctaLink.classList.remove(ROOT + "-hidden");
          else refs.ctaLink.classList.add(ROOT + "-hidden");

          toon(CONFIG.resultStep);

          track({
            event: "flexijob_tool_voltooid",
            flexijobber_tool_pad: toolPad.join(" > "),
            flexijobber_tool_uitkomst: key
          });
        }
      }, 200);
    });

    refs.restart.addEventListener("click", function () {
      track({ event: "flexijob_tool_opnieuw" });
      toolPad = [];
      setTimeout(function () {
        gekozenPad = "";
        toon(CONFIG.startStep);
      }, 200);
    });

    toon(CONFIG.startStep);
  }

  function init() {
    var mount = document.getElementById(CONFIG.mountId);
    if (!mount) return; // geen mount-div op deze pagina → niets doen
    injectStyles();
    run(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
