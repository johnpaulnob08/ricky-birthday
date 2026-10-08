/* story.js — Screens 4-7: scan, 27 years, memories, things */
(() => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const show = (el) => el.classList.remove("is-hidden");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pace = (ms) => wait(reduced ? 0 : ms);
  const played = {}; // each sequence plays once; the DOM stays as-is on revisit

  /* ============ SCREEN 4 — scan ============ */
  async function playScan() {
    const list = document.getElementById("scan-list");
    for (const item of SITE.scan) {
      const li = document.createElement("li");
      li.className = "scan-row reveal is-hidden";
      li.innerHTML = '<span class="scan-k"></span><span class="scan-dots" aria-hidden="true"></span><span class="scan-v"></span>';
      li.querySelector(".scan-k").textContent = item.label;
      li.querySelector(".scan-v").textContent = item.value;
      list.appendChild(li);
      requestAnimationFrame(() => show(li));
      await pace(550);
    }
    const result = document.getElementById("scan-result");
    result.textContent = SITE.scanResult;
    await pace(500);
    show(result);
    await pace(900);
    show(document.getElementById("scan-continue"));
  }

  /* ============ SCREEN 5 — 27 years ============ */
  async function playYears() {
    const num = document.getElementById("years-num");
    const target = SITE.age;
    if (reduced) {
      num.textContent = target;
    } else {
      const duration = 1900, start = performance.now();
      await new Promise((resolve) => {
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          num.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
          t < 1 ? requestAnimationFrame(tick) : resolve();
        };
        requestAnimationFrame(tick);
      });
    }
    await pace(500);
    show(document.getElementById("years-sub"));
    await pace(1500);
    show(document.getElementById("years-note"));
    await pace(1500);
    show(document.getElementById("years-continue"));
  }

  /* ============ SCREEN 6 — memories carousel ============ */
  function buildMemories() {
    const track = document.getElementById("carousel");
    const count = document.getElementById("mem-count");
    const total = SITE.memories.length;

    SITE.memories.forEach((m) => {
      const fig = document.createElement("figure");
      fig.className = "polaroid";
      const photo = document.createElement("div");
      photo.className = "photo";
      const img = new Image();
      img.src = m.src; img.alt = m.alt; img.loading = "lazy"; img.decoding = "async";
      img.addEventListener("error", () => {
        img.remove();
        photo.classList.add("is-missing");
        photo.textContent = "Add photo: " + m.src.split("/").pop();
      });
      photo.appendChild(img);
      const cap = document.createElement("figcaption");
      cap.textContent = m.caption;
      fig.append(photo, cap);
      track.appendChild(fig);
    });

    const cardStep = () => (track.children[0] ? track.children[0].getBoundingClientRect().width + 16 : 300);
    const index = () => Math.min(total - 1, Math.max(0, Math.round(track.scrollLeft / cardStep())));
    const update = () => (count.textContent = `${index() + 1} / ${total}`);
    const go = (dir) => track.scrollBy({ left: dir * cardStep(), behavior: reduced ? "auto" : "smooth" });

    track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    document.getElementById("mem-prev").addEventListener("click", () => go(-1));
    document.getElementById("mem-next").addEventListener("click", () => go(1));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });
    update();
  }

  /* ============ SCREEN 7 — tap-to-reveal cards ============ */
  function buildThings() {
    const wrap = document.getElementById("things");
    SITE.things.forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "thing";
      b.setAttribute("aria-expanded", "false");
      b.innerHTML = '<span class="thing-phrase"></span><span class="thing-line"><span></span></span>';
      b.querySelector(".thing-phrase").textContent = t.phrase;
      b.querySelector(".thing-line span").textContent = t.line;
      let taps = 0;
      b.addEventListener("click", () => {
        b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") === "true" ? "false" : "true");
        if (t.egg && ++taps === 3) { taps = 0; Toast.show(t.egg, 3200); }
      });
      wrap.appendChild(b);
    });
  }

  buildMemories();
  buildThings();

  document.addEventListener("screenchange", (e) => {
    const id = e.detail.id;
    if (played[id]) return;
    if (id === "screen-scan") { played[id] = true; playScan(); }
    if (id === "screen-years") { played[id] = true; playYears(); }
  });
})();