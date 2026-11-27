"use strict";
/* Light interaction layer. No animation libraries; everything here is optional.
   The page is fully readable and usable without this file. */
(function () {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q = (s, r) => (r || document).querySelector(s);
  const qa = (s, r) => [...(r || document).querySelectorAll(s)];
  const clamp = (a, b, x) => Math.max(a, Math.min(b, x));
  const safe = (fn) => { try { fn(); } catch (e) { console.warn("site:", e.message); } };

  /* ---- Privacy-friendly analytics (GoatCounter: cookie-less, no consent banner needed).
     1. Sign up free at https://www.goatcounter.com and pick a site code, e.g. "anushka".
     2. Paste that code below. Page views and the click events start flowing; nothing loads while it is "". ---- */
  const ANALYTICS_GOATCOUNTER_CODE = "";
  if (ANALYTICS_GOATCOUNTER_CODE && !/^(localhost|127\.)/.test(location.hostname)) {
    const gc = document.createElement("script");
    gc.async = true;
    gc.src = "https://gc.zgo.at/count.js";
    gc.dataset.goatcounter = "https://" + ANALYTICS_GOATCOUNTER_CODE + ".goatcounter.com/count";
    document.head.appendChild(gc);
  }
  const track = (name) => { try { if (window.plausible) window.plausible(name); else if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true }); } catch (e) {} };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a,button");
    if (!a) return;
    if (a.matches('a[href^="mailto:"]')) track("Email click");
    else if (a.id === "copymail") track("Email copy");
    else if (a.dataset.cta === "resume") track("Resume click");
    else if (a.id === "li") track("LinkedIn click");
    else if (a.id === "gh") track("GitHub click");
    else if (a.matches('a[href*="calendly"],a[href*="cal.com"]')) track("Book a call");
  });
  const enq = q("#enq"); if (enq) enq.addEventListener("submit", () => track("Run demo"));
  qa("details.how").forEach((d) => d.addEventListener("toggle", () => { if (d.open) track("Case study open"); }));

  /* ---- Scroll progress ---- */
  const bar = q("#progress");
  const onScroll = () => { if (bar) bar.style.width = (root.scrollTop / Math.max(1, root.scrollHeight - root.clientHeight) * 100) + "%"; };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---- Quiet reveal: short fades only ---- */
  safe(() => {
    if (reduce) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: "0px 0px -4% 0px" });
    qa(".cred,.timeline li,.tgroup,.deliv li").forEach((n, i) => { n.classList.add("rv"); n.style.transitionDelay = ((i % 4) * 0.04) + "s"; io.observe(n); });
  });

  /* ---- Sticky mobile CTA after the hero ---- */
  safe(() => {
    const st = q("#sticky"), hero = q(".hero"); if (!st || !hero) return;
    new IntersectionObserver((es) => st.classList.toggle("show", !es[0].isIntersecting), { threshold: 0 }).observe(hero);
  });

  /* ---- Active nav link ---- */
  safe(() => {
    const links = qa(".nav nav a");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => { const on = a.getAttribute("href") === "#" + e.target.id; a.classList.toggle("cur", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["proof", "how", "demo", "credentials", "about"].forEach((id) => { const n = document.getElementById(id); if (n) io.observe(n); });
  });

  /* ---- Autoplay walkthrough: six steps, plays only while visible ---- */
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
    let cur = -1, k = 0, vis = false, hover = false, timer = null;
    const setStep = (i) => {
      if (i === cur) return; cur = i;
      nodes.forEach((n, j) => { n.classList.toggle("on", j === i); n.classList.toggle("done", j < i); n.setAttribute("aria-current", j === i ? "step" : "false"); });
      cards.forEach((c, j) => c.classList.toggle("on", j === i));
      pre.innerHTML = L.slice(0, i + 1).map((s, j) => s.map((l) => `<span class="${j === i ? "ln" : ""}">${l}</span>`).join("")).join("");
    };
    const setP = (p) => track.style.setProperty("--jp", clamp(0, 1, (p * 6 - 0.5) / 5).toFixed(4));
    const go = (i) => { k = i; setStep(i); setP((i + 0.5) / 6); };
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
