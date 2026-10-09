/* effects.js — one canvas behind everything: calm glow, stars, confetti, particle "27" */
const Fx = (() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLORS = ["#6fa8ff", "#2f6bff", "#eaf1ff", "#9cc0ff", "#4a86ff"];
  const rand = (a, b) => a + Math.random() * (b - a);

  let W = 0, H = 0, mode = "off", raf = 0, last = 0, clock = 0;
  let motes = [], stars = [], bits = [], dots = [];
  let dotsAlpha = 1, dotsTarget = 1, finaleStarted = false;

  // soft glow sprite, drawn many times (cheap)
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  (() => {
    const g = sprite.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(190,215,255,1)");
    gr.addColorStop(0.25, "rgba(111,168,255,0.55)");
    gr.addColorStop(1, "rgba(47,107,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  })();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initMotes();
    if (dots.length) formText("27", true);
    if (mode !== "off") draw(0);
  }

  function initMotes() {
    const n = W < 600 ? 24 : 44;
    motes = Array.from({ length: n }, () => ({
      x: rand(0, W), y: rand(0, H), size: rand(10, 28),
      vy: -rand(5, 16), a: rand(0.15, 0.5), ph: rand(0, 6.28)
    }));
  }

  /* ---------- drawing ---------- */
  function draw(dt) {
    clock += dt;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    const moteScale = mode === "final" ? 0.5 : 1;
    for (const m of motes) {
      m.y += m.vy * dt;
      m.x += Math.sin(clock * 0.6 + m.ph) * 6 * dt;
      if (m.y < -30) { m.y = H + 30; m.x = rand(0, W); }
      ctx.globalAlpha = m.a * moteScale;
      ctx.drawImage(sprite, m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
    }

    if (mode === "final") {
      for (const s of stars) {
        const fadeIn = Math.min(1, (clock - s.born) / 0.9);
        if (fadeIn <= 0) continue;
        ctx.globalAlpha = fadeIn * (0.55 + 0.45 * Math.sin(clock * s.speed + s.ph));
        ctx.drawImage(sprite, s.x - s.r * 3, s.y - s.r * 3, s.r * 6, s.r * 6);
      }

      dotsAlpha += (dotsTarget - dotsAlpha) * (1 - Math.exp(-dt * 1.6));
      for (const d of dots) {
        if (clock >= d.born + d.delay) {
          const k = 1 - Math.exp(-dt * 2.4);
          d.x += (d.tx - d.x) * k; d.y += (d.ty - d.y) * k;
        }
        const shimmer = Math.sin(clock * 2 + d.ph) * 0.7;
        ctx.globalAlpha = 0.85 * dotsAlpha;
        ctx.drawImage(sprite, d.x + shimmer - d.size / 2, d.y - d.size / 2, d.size, d.size);
      }

      ctx.globalCompositeOperation = "source-over";
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.y += b.vy * dt;
        b.x += (b.vx + Math.sin(clock * 1.3 + b.ph) * b.sway) * dt;
        b.rot += b.vr * dt;
        if (b.y > H + 20) { bits.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, (H - b.y) / (H * 0.3))) * 0.85;
        ctx.translate(b.x, b.y); ctx.rotate(b.rot);
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    draw(dt);
    raf = requestAnimationFrame(loop);
  }

  function setMode(next) {
    if (next === mode) return;
    mode = next;
    cancelAnimationFrame(raf);
    if (mode === "off") { ctx.clearRect(0, 0, W, H); return; }
    if (reduced && mode === "calm") { ctx.clearRect(0, 0, W, H); return; } // no ambient motion
    if (reduced) { draw(0); return; }                                       // static final frame
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  /* ---------- finale pieces ---------- */
  function spawnStars(count, over) {
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rand(0, W), y: rand(0, H), r: rand(0.8, 2),
        speed: rand(1, 2.6), ph: rand(0, 6.28),
        born: clock + (reduced ? -1 : rand(0, over))
      });
    }
  }

  function confettiBurst(count) {
    for (let i = 0; i < count; i++) {
      bits.push({
        x: rand(0, W), y: rand(-H * 0.4, -10),
        w: rand(3, 6), h: rand(6, 12), vy: rand(45, 110), vx: rand(-14, 14),
        sway: rand(8, 26), ph: rand(0, 6.28), rot: rand(0, 6.28), vr: rand(-2, 2),
        color: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }
  }

  async function formText(text, instant) {
    try { await document.fonts.load("600 100px Sora"); } catch (e) { /* fallback font is fine */ }
    const size = Math.min(W * 0.85, H * 0.46);
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const o = off.getContext("2d");
    o.fillStyle = "#fff";
    o.font = `600 ${size}px Sora, system-ui, sans-serif`;
    o.textAlign = "center"; o.textBaseline = "middle";
    o.fillText(text, W / 2, H / 2);
    const px = o.getImageData(0, 0, W, H).data;

    let step = 5, pts;
    do {
      pts = [];
      for (let y = 0; y < H; y += step)
        for (let x = 0; x < W; x += step)
          if (px[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
      step++;
    } while (pts.length > 850);

    dots = pts.map(([tx, ty]) => ({
      tx, ty,
      x: instant ? tx : rand(0, W), y: instant ? ty : rand(0, H),
      size: rand(9, 13), ph: rand(0, 6.28),
      born: clock, delay: instant ? 0 : rand(0.2, 1.6)
    }));
  }

  function finale() {
    if (finaleStarted) return;
    finaleStarted = true;
    setMode("final");
    spawnStars(reduced ? 90 : 130, 3.5);
    if (!reduced) confettiBurst(90);
    formText("27", reduced);
    dotsTarget = 1;
  }

  window.addEventListener("resize", resize);
  resize();

  return {
    setMode, finale,
    dimNumber: (a) => { dotsTarget = a; if (reduced) { dotsAlpha = a; draw(0); } },
    get finaleStarted() { return finaleStarted; }
  };
})();