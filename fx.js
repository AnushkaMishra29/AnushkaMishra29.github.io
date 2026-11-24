"use strict";
/* FX layer: smooth scroll, loader, hero network, cursor, split text, scramble, pinned journey, kinetic type, side rail */
(function () {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer:fine)").matches;
  const q = (s, r) => (r || document).querySelector(s);
  const qa = (s, r) => [...(r || document).querySelectorAll(s)];
  const clamp = (a, b, x) => Math.max(a, Math.min(b, x));
  const hasG = !!(window.gsap && window.ScrollTrigger);
  const safe = (fn) => { try { fn(); } catch (e) { console.warn("fx:", e.message); } };

  if (/[?&]nofx/.test(location.search)) { root.classList.add("loaded"); return; }
  if (hasG) gsap.registerPlugin(ScrollTrigger);
  const STATIC = /[?&]fxstatic/.test(location.search);
  if (hasG && !reduce && !STATIC) root.classList.add("fx");

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  safe(() => {
    if (reduce || !window.Lenis || /nolenis/.test(location.search)) return;
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    if (hasG) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    qa("textarea,.m-flow,pre").forEach((n) => n.setAttribute("data-lenis-prevent", ""));
  });
  const goTo = (target, offset) => {
    if (lenis) lenis.scrollTo(target, { offset: offset || 0, duration: 1.4 });
    else if (typeof target === "number") scrollTo({ top: target, behavior: "smooth" });
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) { if (id === "#") return; }
    const t = id === "#top" ? document.body : q(id);
    if (!t) return;
    e.preventDefault();
    if (id === "#top") goTo(0); else goTo(t, -56);
  });

  /* ---------- Text scramble ---------- */
  const GL = "01<>/\\_#=+*";
  function scramble(el) {
    if (reduce || el.dataset.scr) return;
    el.dataset.scr = "1";
    const final = el.textContent, n = final.length, t0 = performance.now(), dur = 750;
    (function step(now) {
      const p = clamp(0, 1, (now - t0) / dur), done = Math.floor(p * n);
      let out = "";
      for (let i = 0; i < n; i++) out += i < done || final[i] === " " ? final[i] : GL[(Math.random() * GL.length) | 0];
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    })(t0);
  }
  const scrIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { scramble(e.target); scrIO.unobserve(e.target); } }), { threshold: 0.6 });
  qa(".eyebrow").forEach((n) => { if (!n.closest(".hero")) scrIO.observe(n); });

  /* ---------- Split headings ---------- */
  function split(el) {
    const nodes = [...el.childNodes];
    nodes.forEach((n) => {
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
    if (!(hasG && !reduce)) return;
    qa("h2").forEach((h) => {
      const label = h.textContent; split(h); h.setAttribute("aria-label", label);
      const wi = qa(".wi", h);
      ScrollTrigger.create({ trigger: h, start: "top 90%", once: true, onEnter: () => gsap.fromTo(wi, { yPercent: 112 }, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.055 }) });
    });
  });

  /* ---------- Hero network canvas ---------- */
  safe(() => {
    const cv = q("#net"); if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), nodes = [], pulses = [], visible = true;
    const mouse = { x: -999, y: -999 };
    const N = () => clamp(24, 78, Math.round((W * H) / 15000));
    function size() {
      const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: N() }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28, r: 1.2 + Math.random() * 1.6, h: Math.random() < 0.18 }));
    }
    size(); addEventListener("resize", size);
    addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    const LINK = 128;
    function spawn() {
      for (let t = 0; t < 12; t++) {
        const a = nodes[(Math.random() * nodes.length) | 0], b = nodes[(Math.random() * nodes.length) | 0];
        if (a !== b && Math.hypot(a.x - b.x, a.y - b.y) < LINK) { pulses.push({ a, b, t: 0 }); return; }
      }
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1;
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 150 && d > 1) { n.x += (dx / d) * 0.9; n.y += (dy / d) * 0.9; }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) { ctx.strokeStyle = `rgba(67,56,202,${(1 - d / LINK) * 0.2})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 170) { ctx.strokeStyle = `rgba(124,58,237,${(1 - dm / 170) * 0.55})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
      for (const n of nodes) { ctx.fillStyle = n.h ? "#4338ca" : "rgba(90,96,114,.45)"; ctx.beginPath(); ctx.arc(n.x, n.y, n.h ? n.r + 0.8 : n.r, 0, 6.283); ctx.fill(); }
      if (Math.random() < 0.06 && pulses.length < 9) spawn();
      pulses = pulses.filter((p) => (p.t += 0.022) < 1);
      for (const p of pulses) {
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12); g.addColorStop(0, "rgba(67,56,202,.9)"); g.addColorStop(1, "rgba(67,56,202,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.283); ctx.fill();
      }
    }
    if (reduce) { frame(); return; }
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(cv);
    (function loop() { if (visible && !document.hidden) frame(); requestAnimationFrame(loop); })();
  });

  /* ---------- Cursor, magnetic buttons, card tilt ---------- */
  safe(() => {
    if (!fine || reduce) return;
    const ring = document.createElement("div"); ring.className = "cur cur-ring";
    const dot = document.createElement("div"); dot.className = "cur cur-dot";
    document.body.append(ring, dot);
    let mx = 0, my = 0, rx = 0, ry = 0;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; ring.classList.add("on"); dot.classList.add("on"); dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    document.addEventListener("mouseleave", () => { ring.classList.remove("on"); dot.classList.remove("on"); });
    (function follow() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(follow); })();
    document.addEventListener("pointerover", (e) => {
      const t = e.target; if (!t.closest) return;
      ring.classList.toggle("big", !!t.closest("a,button,.tab,.j-node,summary,select"));
      ring.classList.toggle("text", !!t.closest("input,textarea") );
    });
    qa(".btn,.tab").forEach((b) => {
      b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
    qa(".card,.lane,.tgroup").forEach((c) => {
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.classList.add("tilting"); c.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
      });
      c.addEventListener("pointerleave", () => { c.classList.remove("tilting"); c.style.transform = ""; });
    });
  });

  /* ---------- Pinned journey ---------- */
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
    setStep(0); setP(0.04);
    let st = null;
    if (hasG && !reduce) {
      st = ScrollTrigger.create({ trigger: sec, start: "top top", end: "+=3200", pin: q(".j-pin", sec), anticipatePin: 1,
        onUpdate: (s) => { setP(s.progress); setStep(Math.min(5, Math.floor(s.progress * 6))); } });
    } else if (!reduce) {
      let k = 0, vis = false;
      new IntersectionObserver((es) => { vis = es[0].isIntersecting; }).observe(sec);
      setInterval(() => { if (vis) { k = (k + 1) % 6; setStep(k); setP((k + 0.5) / 6); } }, 3200);
      q(".j-hint", sec).style.display = "none";
    } else { q(".j-hint", sec).style.display = "none"; }
    nodes.forEach((n, i) => n.addEventListener("click", () => {
      if (st) goTo(st.start + ((i + 0.5) / 6) * (st.end - st.start));
      else { setStep(i); setP((i + 0.5) / 6); }
    }));
  });

  /* ---------- Kinetic type band ---------- */
  safe(() => {
    const rows = qa(".k-row"); if (!rows.length) return;
    if (!(hasG && !reduce)) { rows.forEach((r) => { r.style.transform = "translateX(-8%)"; }); return; }
    rows.forEach((r, i) => {
      gsap.fromTo(r, { xPercent: i ? -34 : 0 }, { xPercent: i ? 0 : -34, ease: "none", scrollTrigger: { trigger: ".kinetic", start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
    if (lenis) lenis.on("scroll", ({ velocity }) => gsap.to(rows, { skewX: clamp(-7, 7, velocity * -0.3), duration: 0.35, overwrite: "auto" }));
  });

  /* ---------- Side rail + active nav ---------- */
  safe(() => {
    const defs = [["proof", "Work"], ["journey", "How I build"], ["demo", "Live demo"], ["judgment", "Judgment"], ["build", "Range"], ["credentials", "Credentials"], ["about", "About"], ["contact", "Contact"]];
    const rail = document.createElement("nav"); rail.className = "rail"; rail.setAttribute("aria-label", "Sections");
    defs.forEach(([id, label]) => { if (!document.getElementById(id)) return; const a = document.createElement("a"); a.href = "#" + id; a.dataset.s = id; a.setAttribute("aria-label", label); const s = document.createElement("span"); s.textContent = label; a.append(s); rail.append(a); });
    document.body.append(rail);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      qa("a", rail).forEach((a) => a.classList.toggle("on", a.dataset.s === id));
      qa(".nav nav a").forEach((a) => a.classList.toggle("cur-sec", a.getAttribute("href") === "#" + id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    defs.forEach(([id]) => { const n = document.getElementById(id); if (n) io.observe(n); });
  });

  /* ---------- Parallax ---------- */
  safe(() => {
    if (!(hasG && !reduce)) return;
    gsap.to(".o1", { y: 260, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1 } });
    gsap.to(".o2", { y: -220, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1 } });
    if (fine) {
      const art = q(".hero-art"); if (!art) return;
      const qx = gsap.quickTo(art, "x", { duration: 0.8, ease: "power3" }), qy = gsap.quickTo(art, "y", { duration: 0.8, ease: "power3" });
      addEventListener("pointermove", (e) => { qx((e.clientX / innerWidth - 0.5) * 22); qy((e.clientY / innerHeight - 0.5) * 16); }, { passive: true });
    }
  });

  /* ---------- Loader + hero intro ---------- */
  const finish = () => root.classList.add("loaded");
  function intro() {
    if (!(hasG && !reduce)) return;
    safe(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero .eyebrow", { y: 16, opacity: 0, duration: 0.6 })
        .from(".hero h1", { y: 36, opacity: 0, filter: "blur(10px)", duration: 1.0 }, "-=.35")
        .from(".hero .now,.hero .lead", { y: 18, opacity: 0, duration: 0.7, stagger: 0.12 }, "-=.6")
        .from(".hero .cta-row .btn", { y: 16, opacity: 0, scale: 0.94, duration: 0.6, stagger: 0.1 }, "-=.5")
        .from(".hero-art", { scale: 0.88, opacity: 0, duration: 1.2 }, 0.1)
        .from(".hero .stats li", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=.6")
        .from(".nav", { y: -60, opacity: 0, duration: 0.7 }, 0.2);
      tl.eventCallback("onComplete", () => gsap.set([".hero .eyebrow", ".hero h1", ".hero .now", ".hero .lead", ".hero .cta-row .btn", ".hero-art", ".hero .stats li", ".nav"], { clearProps: "opacity,filter,y,scale,transform" }));
    });
  }
  const ld = q("#loader");
  const seen = (() => { try { return sessionStorage.getItem("seen") === "1"; } catch (e) { return false; } })();
  if (!ld || !hasG || reduce || STATIC) { finish(); if (ld && STATIC) ld.style.display = "none"; }
  else if (seen) { gsap.to(ld, { opacity: 0, duration: 0.35, onComplete: finish }); intro(); }
  else {
    try { sessionStorage.setItem("seen", "1"); } catch (e) {}
    const lines = qa(".l-line", ld);
    const tl = gsap.timeline({ onComplete: () => { finish(); intro(); } });
    tl.to(lines, { opacity: 1, x: 0, duration: 0.3, stagger: 0.28 }, 0)
      .to(q(".l-bar i", ld), { width: "100%", duration: lines.length * 0.28 + 0.3, ease: "power1.inOut" }, 0)
      .to({}, { duration: 0.25 });
  }
})();
