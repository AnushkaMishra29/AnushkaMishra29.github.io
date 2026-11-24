"use strict";

/* ---- EDIT ME: contact links. Leave "" to hide a button. ---- */
const CONFIG = {
  email: "ianushkamishra29@gmail.com",
  calendly: "",   // e.g. https://cal.com/yourname/30min
  linkedin: "https://www.linkedin.com/in/anushka-m-6a635a430/",
  github: "https://github.com/AnushkaMishra29",
  // Capstone client is anonymised. Replace once you have written permission to name them.
  clientName: "Tallpine",
  senderName: "the approver",
  // Add quotes once you have written OK from the person. Section stays hidden while empty.
  // { quote: "...", name: "Full Name", role: "Title, Organization" }
  reviews: []
};

/* ---- Contact buttons ---- */
(function contact() {
  const set = (id, href) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (href) el.href = href; else el.style.display = "none";
  };
  set("mail", CONFIG.email ? "mailto:" + CONFIG.email : "");
  set("cal", CONFIG.calendly);
  set("li", CONFIG.linkedin);
  set("gh", CONFIG.github);
  document.querySelectorAll('[data-cta="hire"]').forEach(a => {
    if (CONFIG.calendly) { a.href = CONFIG.calendly; a.target = "_blank"; a.rel = "noopener"; }
  });
  const mt = document.getElementById("mailtxt");
  if (mt && CONFIG.email) {
    mt.textContent = CONFIG.email; mt.href = "mailto:" + CONFIG.email;
    const cp = document.getElementById("copymail"); cp.hidden = false;
    cp.addEventListener("click", () => {
      const done = () => { cp.textContent = "Copied"; setTimeout(() => { cp.textContent = "Copy"; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(CONFIG.email).then(done, done); else done();
    });
  } else if (mt) { mt.parentElement.style.display = "none"; }
  document.getElementById("yr").textContent = new Date().getFullYear();
})();

/* ---- Reviews (hidden until configured) ---- */
(function reviews(){
  if(!CONFIG.reviews.length) return;
  const list=document.getElementById("review-list");
  CONFIG.reviews.forEach(r=>{
    const f=document.createElement("figure");f.className="review";f.style.margin=0;
    const p=document.createElement("p");p.textContent="“"+r.quote+"”";
    const c=document.createElement("cite");c.textContent=r.name+(r.role?", "+r.role:"");
    f.append(p,c);list.append(f);
  });
  document.getElementById("reviews").classList.remove("hidden");
})();

/* ---- Scroll reveal, counters, bars ---- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".section-head,.case,.card,.panel,.lane,.cert,.review,.principles li,.stats li,.flow").forEach(el => el.classList.add("reveal"));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  if (e.target.classList.contains("bars")) e.target.classList.add("in");
  io.unobserve(e.target);
}), { threshold: .15 });
document.querySelectorAll(".reveal,.bars").forEach(el => io.observe(el));

document.querySelectorAll("[data-count]").forEach(el => {
  const to = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
  const paint = v => el.innerHTML = pre + Math.round(v) + suf;
  if (reduce) return paint(to);
  paint(0);
  const co = new IntersectionObserver(es => {
    if (!es[0].isIntersecting) return;
    co.disconnect();
    const t0 = performance.now();
    const tick = t => { const p = Math.min(1, (t - t0) / 1200); paint(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, { threshold: .6 });
  co.observe(el);
});

/* =========================================================
   Simulated inbound engine (invented companies and rules)
   ========================================================= */
const COMPANIES = [
  { id: "northwind", name: "Northwind Health Plan", kind: "Health payer",   revB: 6.2,  regulated: true,  dnc: false, vendor: false },
  { id: "harbor",    name: "Harbor Mutual",         kind: "Insurer",        revB: 3.1,  regulated: true,  dnc: false, vendor: false },
  { id: "pinecrest", name: "Pinecrest Bank",        kind: "Regulated bank", revB: 11.4, regulated: true,  dnc: false, vendor: false },
  { id: "atlas",     name: "Atlas Wealth Group",    kind: "Wealth manager", revB: 22.0, regulated: true,  dnc: false, vendor: false },
  { id: "tinyclinic",name: "TinyClinic Co-op",      kind: "Health provider",revB: 0.4,  regulated: true,  dnc: false, vendor: false },
  { id: "lumen",     name: "Lumen Analytics",       kind: "Software vendor",revB: 0.1,  regulated: false, dnc: false, vendor: true  },
  { id: "orion",     name: "Orion Holdings",        kind: "Insurer (do-not-contact)", revB: 8.0, regulated: true, dnc: true, vendor: false }
];
const BAND = { lo: 2, hi: 15 }; // invented ICP revenue band in $B

const $ = id => document.getElementById(id);
const coSel = $("f-co"), hourSel = $("f-hour");
COMPANIES.forEach(c => coSel.add(new Option(c.name + " (" + c.kind + ")", c.id)));
for (let h = 0; h < 24; h++) hourSel.add(new Option((h % 12 || 12) + ":00 " + (h < 12 ? "AM" : "PM"), h));
hourSel.value = 18;

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const fmtHour = h => (h % 12 || 12) + ":00 " + (h < 12 ? "AM" : "PM");

function match(co) {
  if (co.dnc) return { ok: true, note: co.name + " matched. On the do-not-contact list." };
  return { ok: true, note: co.name + " matched by domain (" + co.kind + ", about $" + co.revB + "B revenue)." };
}

function route(type, co) {
  if (co.dnc) return { owner: "Sponsor (same-day task)", draft: false, briefing: false, why: "Do-not-contact org: no draft, forwarded for a same-day human decision." };
  if (type === "partner") return { owner: "Partnerships owner", draft: true, briefing: false, why: "Partner enquiries go to the partnerships owner, never into the buyer lane." };
  if (co.vendor) return { owner: "Shared inbox", draft: true, briefing: false, why: "Vendor, not a buyer: shared inbox, polite reply, no briefing ask." };
  if (co.revB > BAND.hi) return { owner: "Sponsor (by hand)", draft: false, briefing: false, why: "Above the $" + BAND.hi + "B band: a person handles it by hand, nothing is drafted." };
  if (co.revB < BAND.lo || !co.regulated) return { owner: "Sales team", draft: true, briefing: false, why: "Below the $" + BAND.lo + "B band: still answered (inbound routes, never drops), but no briefing ask." };
  return { owner: "Sponsor", draft: true, briefing: true, why: "In band ($" + BAND.lo + "B to $" + BAND.hi + "B) and regulated: sponsor owns it, briefing ask allowed." };
}

/* Reply clock: Pacific, Mon-Fri, due 17:00. After hours counts from 09:00 next business day. */
function clock(day, hour) {
  const biz = d => d >= 1 && d <= 5;
  const nextBiz = d => { let n = (d + 1) % 7; while (!biz(n)) n = (n + 1) % 7; return n; };
  if (!biz(day) || hour >= 17) {
    const s = nextBiz(day);
    return { start: DAYS[s] + " 9:00 AM", due: DAYS[s] + " before 5:00 PM", note: "Outside business hours: the clock starts " + DAYS[s] + " morning." };
  }
  if (hour < 9) return { start: DAYS[day] + " 9:00 AM", due: DAYS[day] + " before 5:00 PM", note: "Before opening: the clock starts at 9:00 AM." };
  const n = nextBiz(day);
  return { start: DAYS[day] + " " + fmtHour(hour), due: DAYS[n] + " 5:00 PM", note: "In hours: due 5:00 PM the next business day." };
}

const LABEL = { demo: "a demo", briefing: "an executive briefing", contact: "getting in touch", partner: "a partnership", whitepaper: "our whitepaper", nda: "an NDA" };
function makeDraft(type, name, co, r, msg) {
  const first = (name || "there").trim().split(/\s+/)[0];
  const ask = r.briefing
    ? "The usual first step is a 30-minute executive briefing, and it works best with the executive who owns AI in the room. If that would be useful, I would be glad to propose a few times."
    : "If it helps, I can point you to the right resource. Just tell me what you are trying to solve.";
  const q = msg && msg.trim() ? "[Reviewer: answer their question in their own terms. They wrote: " + msg.trim() + "]" : "[Reviewer: add a personal line]";
  const nda = type === "nda" ? "\n\nOn the NDA: I have passed this to the right person and will confirm next steps." : "";
  return "Hi " + first + ",\n\nThank you for " + LABEL[type] + " at " + CONFIG.clientName + ".\n\n" + q + "\n\n" +
    CONFIG.clientName + " is a management system for AI value realization: every initiative runs through gates that can refuse, and each one ends in a number Finance signs." + nda + "\n\n" + ask + "\n\nBest regards,\n[Sender: the person who sends this reply]";
}

/* Claims linter: fails closed. Invented blocklist mirroring the real rules' shape. */
const BLOCK = [
  { re: /\$\s?\d[\d,.]*|\b\d+\s?(usd|dollars)\b|pricing|\bprice\b|discount|\bquote\b/i, why: "States or implies a price" },
  { re: /soc\s?2/i, why: "Makes a compliance claim not approved" },
  { re: /guarantee|promise|100%/i, why: "Makes a guarantee" },
  { re: /brand[- ]new|just launched/i, why: "Misdescribes the company's stage" },
  { re: /\bI saw you (visited|browsed|clicked)/i, why: "Describes a person's browsing" }
];
function lint(text) {
  const hits = [];
  BLOCK.forEach(b => { const m = text.match(b.re); if (m) hits.push(b.why + ' ("' + m[0] + '")'); });
  if (/\[Reviewer:|\[Sender:/.test(text)) hits.push("Unfilled slot: a person must complete it before sending");
  return hits;
}

const stepEl = k => document.querySelector('[data-s="' + k + '"]');
function setStep(k, cls, text) {
  const el = stepEl(k);
  el.className = "on " + (cls || "");
  el.querySelector("span").textContent = text;
}
function resetSteps() {
  document.querySelectorAll("#steps li").forEach(li => { li.className = ""; li.querySelector("span").textContent = "waiting"; });
  $("draftbox").classList.add("hidden");
  $("status").textContent = "";
  $("approve").disabled = false;
  $("approve").dataset.done = "";
}
const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
let running = 0;

function showLint() {
  const hits = lint($("draft").value);
  const b = $("lintbadge");
  const blocking = hits.filter(h => !h.startsWith("Unfilled"));
  if (blocking.length) { b.textContent = "blocked: " + blocking[0]; b.className = "badge bad"; }
  else if (hits.length) { b.textContent = "clean, 1 slot left for a person"; b.className = "badge ok"; }
  else { b.textContent = "clean"; b.className = "badge ok"; }
  return blocking;
}

$("enq").addEventListener("submit", async ev => {
  ev.preventDefault();
  const id = ++running;
  resetSteps();
  const type = $("f-type").value, co = COMPANIES.find(c => c.id === coSel.value);
  const name = $("f-name").value, msg = $("f-msg").value;
  const day = +$("f-day").value, hour = +$("f-hour").value;

  await wait(250); if (id !== running) return;
  const m = match(co); setStep("match", co.dnc ? "warn" : "", m.note);
  await wait(550); if (id !== running) return;
  const r = route(type, co); setStep("route", r.draft ? "" : "warn", "Owner: " + r.owner + ". " + r.why);
  await wait(550); if (id !== running) return;
  const c = clock(day, hour); setStep("sla", "", "Starts " + c.start + ", due " + c.due + ". " + c.note);
  await wait(550); if (id !== running) return;

  if (!r.draft) {
    setStep("draft", "warn", "No draft by rule. A person decides.");
    setStep("lint", "warn", "Not needed: nothing to check.");
    return;
  }
  setStep("draft", "", "Built from approved wording only. No language model wrote this.");
  $("draft").value = makeDraft(type, name, co, r, msg);
  await wait(550); if (id !== running) return;
  const blocking = lint($("draft").value).filter(h => !h.startsWith("Unfilled"));
  setStep("lint", blocking.length ? "bad" : "", blocking.length ? "Blocked: " + blocking[0] : "Passed. One slot left for the person.");
  $("draftbox").classList.remove("hidden");
  showLint();
  $("status").textContent = "Your turn as the approver: replace the [Reviewer] and [Sender] slots, then approve. Try typing a price or \"SOC 2\" to trip the linter.";
});

$("draft").addEventListener("input", () => { $("status").textContent = ""; $("approve").dataset.done = ""; });
$("relint").addEventListener("click", () => {
  const blocking = showLint();
  $("status").textContent = blocking.length ? "Fix the flagged wording, then re-run." : "Linter passed.";
});
$("approve").addEventListener("click", () => {
  const hits = lint($("draft").value);
  if (hits.length) {
    showLint();
    $("status").textContent = "Cannot approve: " + hits[0] + ".";
    return;
  }
  $("status").textContent = "Approved at " + new Date().toLocaleTimeString() + ". Approval is not the same as sent: the person sends from their own mailbox and the send is timestamped separately.";
  $("send").disabled = false;
  $("send").textContent = "Mark as sent (by a person)";
  $("send").onclick = () => { $("status").textContent = "Marked sent at " + new Date().toLocaleTimeString() + ". The engine never sends email."; $("send").disabled = true; };
});
