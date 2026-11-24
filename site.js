"use strict";
/* Motion layer: restrained. Smooth scroll, headline reveals, hero intro, tool ticker, autoplay journey. */
(function () {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q = (s, r) => (r || document).querySelector(s);
  const qa = (s, r) => [...(r || document).querySelectorAll(s)];
  const clamp = (a, b, x) => Math.max(a, Math.min(b, x));
  const hasG = !!(window.gsap && window.ScrollTrigger);
  const STATIC = /[?&]fxstatic/.test(location.search);
  const safe = (fn) => { try { fn(); } catch (e) { console.warn("fx:", e.message); } };
  const animate = hasG && !reduce && !STATIC;
  if (hasG) gsap.registerPlugin(ScrollTrigger);
  if (animate) root.classList.add("fx");

  /* ---- Smooth scroll + anchors ---- */
  let lenis = null;
  safe(() => {
    if (reduce || STATIC || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasG) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
    qa("textarea,pre").forEach((n) => n.setAttribute("data-lenis-prevent", ""));
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href"); if (id.length < 2) return;
    const t = id === "#top" ? document.body : q(id); if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(id === "#top" ? 0 : t, { offset: id === "#top" ? 0 : -64, duration: 1.3 });
    else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  /* ---- Scroll progress ---- */
  const bar = q("#progress");
  const onScroll = () => { const h = root; bar.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + "%"; };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---- Tool ticker (tools I have actually used) ---- */
  safe(() => {
    const tools = ["Clay", "Sumble", "Octave", "Swan", "HubSpot", "Claude Code", "Python", "SQL", "Power BI", "Excel & Google Sheets", "MS Access", ".NET", "Angular", "Git & GitHub Actions"];
    const track = q("#track"); if (!track) return;
    for (let p = 0; p < 2; p++) tools.forEach((t) => { const s = document.createElement("span"); s.textContent = t; track.append(s); });
  });

  /* ---- Active nav link ---- */
  safe(() => {
    const links = qa(".nav nav a");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("cur", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["proof", "journey", "demo", "credentials", "about"].forEach((id) => { const n = document.getElementById(id); if (n) io.observe(n); });
  });

  /* ---- Headline reveal (word masks) ---- */
  function split(el) {
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 1) { split(n); return; }
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((tok) => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.append(" "); return; }
        const w = document.createElement("span"); w.className = "w";
        const wi = document.createElement("span"); wi.className = "wi"; wi.textContent = tok;
        w.append(wi); frag.append(w);
      });
      n.replaceWith(frag);
    });
  }
  safe(() => {
    if (!animate) return;
    qa("h2").forEach((h) => {
      h.setAttribute("aria-label", h.textContent); split(h);
      const wi = qa(".wi", h);
      ScrollTrigger.create({ trigger: h, start: "top 92%", once: true, onEnter: () => gsap.fromTo(wi, { yPercent: 115 }, { yPercent: 0, duration: 1.0, ease: "power4.out", stagger: 0.07 }) });
    });
  });

  /* ---- Hero intro ---- */
  safe(() => {
    if (!animate) return;
    const h1 = q(".hero h1"); h1.setAttribute("aria-label", h1.textContent); split(h1);
    const hw = qa(".wi", h1);
    gsap.set(hw, { yPercent: 118 });
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-name,.status-line", { y: 14, opacity: 0, duration: 0.6, stagger: 0.1 })
      .to(hw, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.07, onComplete: () => root.classList.add("h1-in") }, "-=.2")
      .from(".hero .lead", { y: 20, opacity: 0, duration: 0.8 }, "-=.7")
      .from(".hero .cta-row > *", { y: 16, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=.6")
      .from(".portrait-frame", { clipPath: "inset(12% 12% 12% 12% round 400px)", opacity: 0, scale: 1.06, duration: 1.4, ease: "power3.inOut" }, 0.1)
      .from(".portrait figcaption", { y: 12, opacity: 0, duration: 0.7 }, "-=.6")
      .from(".stats li", { y: 24, opacity: 0, duration: 0.7, stagger: 0.09 }, "-=.7");
    tl.eventCallback("onComplete", () => gsap.set([".hero-name", ".status-line", ".hero .lead", ".hero .cta-row > *", ".portrait-frame", ".portrait figcaption", ".stats li"], { clearProps: "all" }));
  });

  /* ---- Section rules draw in, rows slide up, portrait parallax ---- */
  safe(() => {
    if (!animate) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    qa(".sec-no").forEach((n) => io.observe(n));
    const rows = qa(".cred,.timeline li,.lane,.cert,.panel");
    rows.forEach((n, i) => { n.classList.add("rv"); n.style.transitionDelay = ((i % 3) * 0.09) + "s"; io.observe(n); });
    qa(".case").forEach((c) => {
      const items = [c.querySelector(".case-metric b"), c.querySelector(".case-metric span"), c.querySelector(".tag"), c.querySelector("h3"), ...qa("dt,dd", c)];
      gsap.from(items, { y: 34, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.06, scrollTrigger: { trigger: c, start: "top 78%", once: true } });
    });
    const img = q(".portrait-frame img");
    if (img && !reduce) gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  });

  /* ---- Autoplay journey ---- */
  safe(() => {
    const sec = q("#journey"); if (!sec) return;
    const nodes = qa(".j-node", sec), cards = qa(".j-card", sec), pre = q("#j-term", sec), track = q(".j-track", sec);
    const L = [
      ['<span class="c"># 1 / signal in</span>', '<span class="k">source</span>: <span class="s">"web form: demo request"</span>', '<span class="k">company</span>: <span class="s">"Pinecrest Bank"</span>', '<span class="k">received</span>: <span class="s">"Tue 16:42 PT"</span>'],
      ['<span class="c"># 2 / match</span>', '<span class="k">fit</span>: <span class="s">"regional bank, inside the size band"</span>', '<span class="k">signal</span>: <span class="s">"person-backed enquiry"</span>', '<span class="k">dnc / vendor / partner</span>: <span class="ok">none</span>'],
      ['<span class="c"># 3 / route</span>', '<span class="k">rule</span>: <span class="s">"segment = banking"</span>', '<span class="k">owner</span>: <span class="s">"financial-services desk"</span>', '<span class="k">why</span>: <span class="s">"plain-English reason + rule version saved"</span>'],
      ['<span class="c"># 4 / clock</span>', '<span class="k">reply_due</span>: <span class="s">"next business day, 17:00 PT"</span>', '<span class="k">alarm</span>: <span class="n">armed</span>'],
      ['<span class="c"># 5 / draft + lint</span>', '<span class="k">draft</span>: <span class="s">"from approved wording only"</span>', '<span class="k">claims_lint</span>: <span class="ok">0 hits &#10003;</span>', '<span class="k">blocks</span>: <span class="s">"prices, SOC 2, guarantees, unverified claims"</span>'],
      ['<span class="c"># 6 / human</span>', '<span class="k">status</span>: <span class="n">awaiting approval</span>', '<span class="k">engine_sends</span>: <span class="n">never</span>', '<span class="k">sent_by</span>: <span class="s">"a person"</span>']
    ];
    let cur = -1;
    const setStep = (i) => {
      if (i === cur) return; cur = i;
      nodes.forEach((n, k) => { n.classList.toggle("on", k === i); n.classList.toggle("done", k < i); });
      cards.forEach((c, k) => c.classList.toggle("on", k === i));
      pre.innerHTML = L.slice(0, i + 1).map((s, k) => s.map((l) => `<span class="${k === i ? "ln" : ""}">${l}</span>`).join("")).join("");
    };
    const setP = (p) => track.style.setProperty("--jp", clamp(0, 1, (p * 6 - 0.5) / 5).toFixed(4));
    const go = (i) => { setStep(i); setP((i + 0.5) / 6); k = i; };
    let k = 0, vis = false, hover = false, timer = null;
    const arm = () => { clearInterval(timer); if (reduce || !vis) return; timer = setInterval(() => { if (!hover) go((k + 1) % 6); }, 3600); };
    go(0);
    new IntersectionObserver((es) => {
      const was = vis; vis = es[0].isIntersecting;
      if (vis && !was) go(0);
      arm(); if (!vis) clearInterval(timer);
    }, { threshold: 0.4 }).observe(sec);
    const stage = q(".j-stage", sec);
    stage.addEventListener("pointerenter", () => { hover = true; sec.classList.add("paused"); });
    stage.addEventListener("pointerleave", () => { hover = false; sec.classList.remove("paused"); arm(); });
    nodes.forEach((n, i) => n.addEventListener("click", () => { go(i); arm(); }));
  });
})();
