/* finale.js — Screens 8-10: the letter, the wish, the final surprise */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const show = (el) => el && el.classList.remove("is-hidden");
  // double rAF so the fade-in always plays after the element is added to the page
  const showSoon = (el) => requestAnimationFrame(() => requestAnimationFrame(() => show(el)));
  const readTime = (text) => 800 + text.split(/\s+/).length * 130; // time to read a line
  const played = {};
  const make = (tag, cls, text) => {
    const el = document.createElement(tag);
    el.className = cls; if (text) el.textContent = text;
    return el;
  };

  /* A sequence that plays on its own, but ANY tap on the screen skips the waiting. */
  function sequencer(screen) {
    let skipped = reduced;
    let wake = null;
    screen.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;       // buttons keep their own job
      skipped = true;
      if (wake) wake();
    });
    return (ms) => new Promise((resolve) => {
      if (skipped) return resolve();
      const t = setTimeout(done, ms);
      function done() { clearTimeout(t); wake = null; resolve(); }
      wake = done;
    });
  }

  // Safe fallbacks: the story still works even if config.js is an older copy
  const MESSAGE = SITE.message || ["(add your message in js/config.js)"];
  const WISH = SITE.wish || [
    "I hope this year gives you more reasons to smile, more moments worth remembering, and more people who remind you how much you matter.",
    "And whenever life gets a little heavy, I hope you remember that there is someone quietly cheering for you."
  ];
  const WISH_ALWAYS = SITE.wishAlways || "Always. 💙";
  const WISH_SIGN = SITE.wishSign || "— Paupau";

  /* ============ SCREEN 8 — the letter (paragraphs fade in as you scroll) ============ */
  const heartScreen = document.getElementById("screen-heart");
  const letter = document.getElementById("heart-msg");
  const heartBtn = document.getElementById("heart-continue");
  MESSAGE.forEach((text) => letter.appendChild(make("p", "letter-p reveal is-hidden", text)));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { show(en.target); observer.unobserve(en.target); }
      });
    }, { root: heartScreen, threshold: 0.1 });
    [...letter.children, heartBtn].forEach((el) => observer.observe(el));
  } else {
    [...letter.children, heartBtn].forEach(show);
  }

  // The CONTINUE button must never stay hidden: it always appears a few seconds in.
  function heartSafety() {
    setTimeout(() => show(heartBtn), reduced ? 0 : 5000);
  }

  /* ============ SCREEN 9 — the wish (tap anywhere to skip the waiting) ============ */
  async function playWish() {
    const body = document.getElementById("wish-body");
    const title = document.getElementById("wish-title");
    const next = document.getElementById("wish-continue");
    const screen = document.getElementById("screen-wish");
    const sleep = sequencer(screen);
    try {
      await sleep(400); show(title);
      await sleep(1300);
      for (const text of WISH) {
        const p = make("p", "wish-line reveal is-hidden", text);
        body.appendChild(p); showSoon(p);
        await sleep(readTime(text) + 600);
      }
      const always = make("p", "wish-always reveal is-hidden", WISH_ALWAYS);
      body.appendChild(always); showSoon(always);
      await sleep(1100);
      const sign = make("p", "wish-sign reveal is-hidden", WISH_SIGN);
      body.appendChild(sign); showSoon(sign);
      await sleep(1100);
    } catch (err) {
      console.error("Wish screen error:", err);
    } finally {
      show(title); show(next); // whatever happens above, the way forward is always visible
    }
  }

  /* ============ SCREEN 10 — the final surprise ============ */
  const f = {
    screen: document.getElementById("screen-final"),
    wait: document.getElementById("f-wait"),
    more: document.getElementById("f-more"),
    btn: document.getElementById("f-btn"),
    payoff: document.getElementById("f-payoff")
  };
  let finaleStarted = false;
  const pause = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));

  async function introFinal() {
    try {
      await pause(600); show(f.wait);
      await pause(1400); show(f.more);
      await pause(1200);
    } finally {
      show(f.wait); show(f.more); show(f.btn);
    }
  }

  f.btn.addEventListener("click", async () => {
    if (finaleStarted) return;
    finaleStarted = true;
    f.btn.disabled = true;
    [f.wait, f.more, f.btn].forEach((el) => el.classList.add("is-hidden"));
    await pause(700);
    [f.wait, f.more, f.btn].forEach((el) => (el.hidden = true));

    try { Fx.finale(); } catch (err) { console.error("Effects error:", err); } // stars, confetti, "27"
    await pause(4300);
    try { Fx.dimNumber(0.22); } catch (err) { /* the words still show */ }
    f.payoff.hidden = false;
    await pause(300);

    for (const el of f.payoff.querySelectorAll(".reveal")) {
      showSoon(el);
      await pause(el.tagName === "H2" ? 1800 : 1200);
    }
  });

  /* ============ which effects each screen gets ============ */
  document.addEventListener("screenchange", (e) => {
    const id = e.detail.id;
    try { // a canvas problem must never block the story
      if (id === "screen-heart" || id === "screen-wish") Fx.setMode("calm");
      else if (id === "screen-final") Fx.setMode(finaleStarted ? "final" : "calm");
      else Fx.setMode("off");
    } catch (err) { console.error("Effects error:", err); }

    if (played[id]) return;
    played[id] = true;
    if (id === "screen-heart") heartSafety();
    if (id === "screen-wish") playWish();
    if (id === "screen-final") introFinal();
  });
})();