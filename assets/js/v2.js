// ENMARS v2 — animación del hero, gráfico de supply chain, formulario
const I = window.ENMARS_I18N; // textos del gráfico y del formulario (definidos en cada página)

/* ---------- recordar idioma elegido ---------- */
document.querySelectorAll("[data-setlang]").forEach(a => a.addEventListener("click", () => {
  try { localStorage.setItem("enmars-lang", a.dataset.setlang); } catch (e) {}
}));

/* ---------- gráfico ilustrativo ---------- */
const CH = { launch: "#f3f5f8", gwp: "#bccadb", ecom: "#8299b5", retail: "#526f90" };
const demand = [[0,0,3,4],[0,0,3,4],[9,0,3,5],[2,0,4,5],[0,6,4,5],[0,2,4,6],[0,0,3,4],[0,0,3,3],[8,0,4,5],[1,4,4,6],[0,9,5,7],[0,5,6,8]];
(function buildChart() {
  const max = 22, keys = ["launch", "gwp", "ecom", "retail"];
  document.getElementById("legend").innerHTML = keys.map((k, i) => `<span><i style="background:${CH[k]}"></i>${I.legend[i]}</span>`).join("");
  document.getElementById("bars").innerHTML = demand.map(m => `<div class="bar">${keys.map((k, i) => m[i] ? `<i style="height:${m[i] / max * 100}%;background:${CH[k]}"></i>` : "").join("")}</div>`).join("");
  document.getElementById("months").innerHTML = I.months.map(m => `<span>${m}</span>`).join("");
  const runs = [[0, 3.6], [4.1, 7.6], [8.1, 11.9]];
  document.getElementById("batches").innerHTML = runs.map(([a, b], i) => `<div class="batch" style="left:${a / 12 * 100}%;width:${(b - a) / 12 * 100}%">${I.batch} ${i + 1}</div>`).join("");
})();

/* ---------- aparición al hacer scroll ---------- */
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".rv").forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("pre"); io.observe(el); } });
}

/* ---------- nav ---------- */
const nav = document.getElementById("nav");
addEventListener("scroll", () => nav.classList.toggle("solid", scrollY > 40), { passive: true });

/* ---------- formulario de presupuesto (FormSubmit) ---------- */
// 1) Intenta enviar por AJAX (sin salir de la página). 2) Si tarda o falla, envía el formulario
// de forma normal: FormSubmit procesa el envío y vuelve a la web con ?sent=1 (campo _next).
const form = document.getElementById("qform");
const ok = document.getElementById("ok");
if (/[?&]sent=1/.test(location.search)) { ok.style.display = "block"; ok.textContent = I.sent; }
form.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = form.querySelector("button[type=submit]");
  if (form.querySelector("[name=_honey]").value) return;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  btn.disabled = true; ok.style.display = "block"; ok.textContent = I.sending;
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 12000);
  try {
    const body = JSON.stringify(Object.fromEntries(new FormData(form)));
    const res = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body, signal: ctl.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== "true") throw new Error(data.message || "error");
    clearTimeout(timer); form.reset(); ok.textContent = I.sent; btn.disabled = false;
  } catch (err) {
    clearTimeout(timer);
    HTMLFormElement.prototype.submit.call(form); // envío normal como respaldo
  }
});

/* ---------- cielo: estrellas + limbo del planeta (la barra de la A) ---------- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function rand(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const STARS = (() => { const r = rand(7); return Array.from({ length: 420 }, () => ({ x: r(), y: r(), z: r(), tw: r() * 6.28 })); })();

function Sky(canvas, opts) {
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, mx = 0, my = 0, t0 = performance.now(), visible = true, running = false;
  function size() { const dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener("resize", size);
  if (opts.mouse) addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  const start = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !reduce) start(); }).observe(canvas);

  function stars(t, s) {
    for (const st of STARS) {
      const depth = .25 + st.z * .75, sp = opts.parallax ? s * (1 - depth) * .35 : 0;
      const x = (st.x * W + mx * 30 * depth) % W, y = ((st.y * H * 1.4 - sp - my * 20 * depth) % (H * 1.4) + H * 1.4) % (H * 1.4) - H * .2;
      ctx.fillStyle = `rgba(223,233,255,${.25 + .55 * depth * (.6 + .4 * Math.sin(t * .0012 + st.tw))})`;
      ctx.beginPath(); ctx.arc(x, y, .35 + depth * 1.1, 0, 6.283); ctx.fill();
    }
  }
  function planet(cx, cy, R, intro, glow) {
    const atm = ctx.createRadialGradient(cx, cy, R * .96, cx, cy, R * 1.18);
    atm.addColorStop(0, `rgba(170,200,255,${.22 * glow})`); atm.addColorStop(1, "rgba(170,200,255,0)");
    ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, R * 1.18, 0, 6.283); ctx.fill();
    const body = ctx.createLinearGradient(0, cy - R, 0, cy - R * .2);
    body.addColorStop(0, "#1c3552"); body.addColorStop(.12, "#0d1f33"); body.addColorStop(1, "#050d16");
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fill();
    const span = 1.25 * intro, a0 = -Math.PI / 2 - span, a1 = -Math.PI / 2 + span;
    ctx.save(); ctx.lineCap = "round";
    for (const [w, a, b] of [[22, .06, 40], [8, .22, 18], [2.2, .95, 0]]) {
      const g = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
      g.addColorStop(0, "rgba(223,233,255,0)"); g.addColorStop(.5, `rgba(240,246,255,${a * glow})`); g.addColorStop(1, "rgba(223,233,255,0)");
      ctx.strokeStyle = g; ctx.lineWidth = w; ctx.shadowColor = "rgba(200,220,255,.9)"; ctx.shadowBlur = b;
      ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.stroke();
    }
    ctx.restore();
    const fx = cx, fy = cy - R, fl = ctx.createRadialGradient(fx, fy, 0, fx, fy, 160 * glow + 1);
    fl.addColorStop(0, `rgba(255,255,255,${.32 * intro * glow})`); fl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(fx, fy, 160 * glow + 1, 0, 6.283); ctx.fill();
  }
  function vial(x, y, s, alpha, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
    const w = 14 * s, h = 54 * s, cap = 12 * s;
    ctx.fillStyle = "#c9d4e2"; ctx.beginPath(); ctx.roundRect(-w * .42, -h / 2 - cap, w * .84, cap + 2, 2 * s); ctx.fill();
    ctx.strokeStyle = "rgba(223,233,255,.85)"; ctx.lineWidth = 1.1 * s; ctx.fillStyle = "rgba(223,233,255,.08)";
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, w * .45); ctx.fill(); ctx.stroke();
    const lg = ctx.createLinearGradient(0, -h * .05, 0, h / 2); lg.addColorStop(0, "rgba(214,226,245,.65)"); lg.addColorStop(1, "rgba(150,175,210,.35)");
    ctx.fillStyle = lg; ctx.beginPath(); ctx.roundRect(-w / 2 + 2 * s, -h * .05, w - 4 * s, h * .55 - 2 * s, w * .35); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(-w * .28, -h * .4, 1.4 * s, h * .7);
    ctx.restore();
  }
  function frame(now) {
    const t = now - t0, intro = reduce ? 1 : Math.min(1, t / 1800), e = 1 - Math.pow(1 - intro, 3);
    const s = opts.parallax ? Math.min(scrollY, H) : 0;
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#050d16"); bg.addColorStop(1, "#0a1927");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    stars(t, s);
    const R = Math.max(W, H) * 1.35, cx = W * .5 + mx * 12, cy = H + R - H * (.16 + .05 * e) + s * .45;
    planet(cx, cy, R, e, 1 - s / H * .5);
    if (opts.vials) [[.78, .34, 1.5, .9, -.12, .9], [.88, .5, 1.0, .55, .18, .6], [.68, .56, .75, .4, .3, .4]].forEach(([vx, vy, sc, al, rot, dp], i) => {
      vial(W * vx + mx * 40 * dp, H * vy - s * (.2 + dp * .5) + Math.sin(t * .0006 + i * 2) * 8, sc * Math.min(1.4, W / 900), al * e, rot + Math.sin(t * .0004 + i) * .05);
    });
    if (visible && !reduce) requestAnimationFrame(frame); else running = false;
  }
  start();
}
Sky(document.getElementById("sky"), { parallax: true, mouse: true, vials: true });
Sky(document.getElementById("sky2"), { parallax: false, mouse: false, vials: false });
