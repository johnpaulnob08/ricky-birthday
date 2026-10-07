/* finale.js — Screens 8-10: the letter, the wish, the final surprise */
(() => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const show = (el) => el.classList.remove("is-hidden");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pace = (ms) => wait(reduced ? 0 : ms);
  const readTime = (text) => 1100 + text.split(/\s+/).length * 170; // time to read a line
  const played = {};
  const make = (tag, cls, text) => {
    const el = document.createElement(tag);
    el.className = cls; if (text) el.textContent = text;
    return el;
  };

  /* ============ SCREEN 8 — the letter (paragraphs fade in as you scroll) ============ */
  const heartScreen = document.getElementById("screen-heart");
  const letter = document.getElementById("heart-msg");
  SITE.message.forEach((text) => letter.appendChild(make("p", "letter-p reveal is-hidden", text)));
  const heartBtn = document.getElementById("heart-continue");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { show(en.target); observer.unobserve(en.target); }
    });
  }, { root: heartScreen, threshold: 0.35 });
  [...letter.children, heartBtn].forEach((el) => observer.observe(el));

  /* ============ SCREEN 9 — the wish ============ */
  async function playWish() {
    const body = document.getElementById("wish-body");
    const title = document.getElementById("wish-title");
    await pace(500); show(title);
    await pace(1700);
    for (const text of SITE.wish) {
      const p = make("p", "wish-line reveal is-hidden", text);
      body.appendChild(p);
      requestAnimationFrame(() => show(p));
      await pace(readTime(text) + 1200);
    }
    const always = make("p", "wish-always reveal is-hidden", SITE.wishAlways);
    body.appendChild(always); requestAnimationFrame(() => show(always));
    await pace(1500);
    const sign = make("p", "wish-sign reveal is-hidden", SITE.wishSign);
    body.appendChild(sign); requestAnimationFrame(() => show(sign));
    await pace(1500);
    show(document.getElementById("wish-continue"));
  }

  /* ============ SCREEN 10 — the final surprise ============ */
  const f = {
    wait: document.getElementById("f-wait"),
    more: document.getElementById("f-more"),
    btn: document.getElementById("f-btn"),
    payoff: document.getElementById("f-payoff")
  };

  async function introFinal() {
    await pace(700); show(f.wait);
    await pace(1700); show(f.more);
    await pace(1500); show(f.btn);
  }

  f.btn.addEventListener("click", async () => {
    if (Fx.finaleStarted) return;
    f.btn.disabled = true;
    [f.wait, f.more, f.btn].forEach((el) => el.classList.add("is-hidden"));
    await pace(700);
    [f.wait, f.more, f.btn].forEach((el) => (el.hidden = true));

    Fx.finale();                 // stars, confetti, particles forming "27"
    await pace(4300);            // let the 27 form and be seen
    Fx.dimNumber(0.22);          // step back so the words are readable
    f.payoff.hidden = false;
    await pace(300);

    const items = f.payoff.querySelectorAll(".reveal");
    for (const el of items) {
      requestAnimationFrame(() => show(el));
      await pace(el.tagName === "H2" ? 1800 : 1200);
    }
  });

  /* ============ which effects each screen gets ============ */
  document.addEventListener("screenchange", (e) => {
    const id = e.detail.id;
    if (id === "screen-heart" || id === "screen-wish") Fx.setMode("calm");
    else if (id === "screen-final") Fx.setMode(Fx.finaleStarted ? "final" : "calm");
    else Fx.setMode("off");

    if (played[id]) return;
    if (id === "screen-wish") { played[id] = true; playWish(); }
    if (id === "screen-final") { played[id] = true; introFinal(); }
  });
})();