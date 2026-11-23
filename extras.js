"use strict";
/* Visual upgrade logic: ticker, tool grid, motion explorer, rotating text, spotlight, progress */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  /* ---- Tools I have actually used ---- */
  const GROUPS = [
    { title: "GTM stack", tools: [
      ["Clay", 168, "ICP matching, Claygent revenue lookups and enrichment tables in the capstone"],
      ["Sumble", 250, "Organization and technology-footprint data; compared its revenue figures with filings across 110 companies"],
      ["Octave", 330, "AI drafting. Tested against approved wording, guarded, and switched off when it rewrote claims"],
      ["Swan", 28, "Organization-level visitor identification, with person-level matches dropped at ingest"],
      ["HubSpot", 18, "System of record: forms, contacts, tickets and tasks for the inbound engine"],
      ["Claude Code", 262, "Used to build, test and document the engine end to end"]
    ]},
    { title: "Data & analytics", tools: [
      ["Python", 48, "Forecasting models at Nagarro and the rules engine in the capstone"],
      ["SQL", 200, "Extracts across billing and revenue platforms at Orange; catalog database work at Nagarro"],
      ["Power BI", 45, "Inventory and KPI dashboards for managers and stakeholders"],
      ["Excel / Google Sheets", 140, "Trackers, analysis and reporting"],
      ["MS Access", 8, "Recurring reports at Orange Business Services"]
    ]},
    { title: "Engineering", tools: [
      [".NET", 270, "Full-stack web applications and the 30,000+ SKU configurator at Nagarro"],
      ["Angular", 350, "Front end of production web applications"],
      ["Git & GitHub Actions", 210, "Version control for rules and a scheduled run for the engine"]
    ]}
  ];

  const INI = { "Claude Code": "CC", "Clay": "Cy", "Git & GitHub Actions": "Gh", "Excel / Google Sheets": "Xl", ".NET": ".N", "Power BI": "BI", "MS Access": "Ac", "HubSpot": "Hs" };
  const icon = (name, h) => { const i = el("span", "ico", INI[name] || name.replace(/[^A-Za-z.]/g, "").slice(0, 2)); i.style.setProperty("--h", h); return i; };

  const all = GROUPS.flatMap(g => g.tools);
  const fill = (id) => {
    const track = document.getElementById(id); if (!track) return;
    const row = id === "track" ? all : all.slice().reverse();
    for (let pass = 0; pass < 2; pass++) row.forEach(([n, h]) => {
      const c = el("div", "tchip"); c.append(icon(n, h), el("span", null, n)); track.append(c);
    });
  };
  fill("track"); fill("track2");

  const grid = document.getElementById("toolgrid");
  if (grid) GROUPS.forEach(g => {
    const box = el("div", "tgroup reveal"); box.append(el("h3", null, g.title));
    g.tools.forEach(([n, h, d]) => {
      const row = el("div", "tool"); const txt = el("div");
      txt.append(el("b", null, n), el("span", null, d)); row.append(icon(n, h), txt); box.append(row);
    });
    grid.append(box);
  });

  /* ---- Rotating "now building" line ---- */
  const rot = document.getElementById("rot");
  if (rot) {
    const words = ["inbound engines", "Clay outbound workflows", "campaign analytics", "guardrails that fail closed"];
    let wi = 0, ci = words[0].length, del = true;
    if (!reduce) (function tick() {
      const w = words[wi];
      if (del) { ci--; if (ci <= 0) { del = false; wi = (wi + 1) % words.length; } }
      else { ci++; if (ci >= words[wi].length) { del = true; setTimeout(tick, 1600); return; } }
      rot.textContent = words[wi].slice(0, Math.max(ci, 0));
      setTimeout(tick, del ? 28 : 55);
    })();
  }

  /* ---- Motion explorer ---- */
  const MOTION = {
    inbound: { status: ["shipped", "Shipped"], title: "Inbound: answer every buyer, safely",
      desc: "Every person-backed enquiry gets an owner, a one-business-day deadline and a linted draft. Organization-level signals are scored, never answered.",
      steps: ["Form arrives", "Match the company", "Route to an owner", "Start the reply clock", "Draft + claims check", "Person approves & sends"], human: 5,
      humanTxt: "A person approves and sends every reply. The engine never sends.", tools: "HubSpot, Python, Clay (cached), Octave (tested, off)", kpi: "Drafted reply inside one business day; share of drafts sent unchanged" },
    outbound: { status: ["progress", "In progress"], title: "Outbound: a sourced reason to reach out",
      desc: "The motion I'm learning through the Clay outbound certification. This is the design I'm working toward, not a shipped system.",
      steps: ["Find signals", "Enrich & screen", "Score fit", "Draft the invitation", "Person approves & sends", "Learn by trigger"], human: 4,
      humanTxt: "I carry over one rule from inbound: a person approves every message before it goes out.", tools: "Clay, Sumble, Octave, Swan", kpi: "Meetings booked, reported by trigger" },
    campaigns: { status: ["next", "Next"], title: "Campaigns: learn which message earns meetings",
      desc: "Where my analytics background applies most: treating every campaign as an experiment with a clear sample size and a decision at the end.",
      steps: ["State the hypothesis", "Segment the audience", "Launch variants", "Measure replies & meetings", "Attribute by trigger", "Keep, change or retire"], human: 5,
      humanTxt: "An analyst decides what to keep, change or retire, with the evidence in front of them.", tools: "Python, SQL, Power BI, HubSpot", kpi: "Meetings per trigger and message, with sample sizes shown" }
  };
  const flow = document.getElementById("m-flow");
  let timer = null;
  function showMotion(key) {
    const m = MOTION[key]; if (!flow) return;
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.m === key));
    const st = document.getElementById("m-status"); st.className = "status " + m.status[0]; st.textContent = m.status[1];
    document.getElementById("m-title").textContent = m.title;
    document.getElementById("m-desc").textContent = m.desc;
    document.getElementById("m-human").textContent = m.humanTxt;
    document.getElementById("m-tools").textContent = m.tools;
    document.getElementById("m-kpi").textContent = m.kpi;
    flow.replaceChildren();
    m.steps.forEach((s, i) => {
      const d = el("div", "m-step" + (i === m.human ? " human" : "")); d.append(el("em", null, String(i + 1).padStart(2, "0")), el("b", null, s)); flow.append(d);
      if (i < m.steps.length - 1) flow.append(el("div", "m-link"));
    });
    flow.classList.remove("fade-swap"); void flow.offsetWidth; flow.classList.add("fade-swap");
    clearInterval(timer);
    const steps = [...flow.querySelectorAll(".m-step")]; let k = 0;
    const lit = () => { steps.forEach((x, j) => x.classList.toggle("lit", j === k)); k = (k + 1) % steps.length; };
    lit(); if (!reduce) timer = setInterval(lit, 1100);
  }
  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => showMotion(t.dataset.m)));
  showMotion("inbound");

  /* ---- Reveal for new blocks, staggered ---- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll(".chart,.motion,.tabs,.tgroup,.lane").forEach((n, i) => { n.classList.add("reveal"); n.style.setProperty("--rd", (i % 4) * .08 + "s"); io.observe(n); });

  /* ---- Mouse spotlight on cards ---- */
  document.addEventListener("pointermove", e => {
    const t = e.target.closest && e.target.closest(".card,.lane,.panel,.tgroup"); if (!t) return;
    const r = t.getBoundingClientRect(); t.style.setProperty("--mx", (e.clientX - r.left) + "px"); t.style.setProperty("--my", (e.clientY - r.top) + "px");
  });

  /* ---- Scroll progress ---- */
  const bar = document.getElementById("progress");
  const onScroll = () => { const h = document.documentElement; bar.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + "%"; };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();
