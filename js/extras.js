/* extras.js — toast messages, background music, easter eggs */

/* ---------- Toast: small messages that appear at the bottom ---------- */
const Toast = (() => {
  const el = document.getElementById("toast");
  let queue = Promise.resolve();
  function show(text, ms = 2600) {
    queue = queue.then(() => new Promise((resolve) => {
      el.textContent = text;
      el.classList.add("is-on");
      setTimeout(() => { el.classList.remove("is-on"); setTimeout(resolve, 350); }, ms);
    }));
    return queue;
  }
  return { show };
})();

/* ---------- Music: optional, never autoplays, easy to replace ---------- */
const Music = (() => {
  const btn = document.getElementById("music-btn");
  const audio = new Audio();
  audio.src = SITE.musicPath;          // change the file in assets/audio/ or edit musicPath in config.js
  audio.loop = true;
  audio.preload = "metadata";
  audio.volume = 0;

  let available = true;     // false if the audio file is missing
  let userPaused = false;   // true once Ricky pauses it himself
  let resumeOnShow = false;
  let fadeTimer = null;

  audio.addEventListener("error", () => { available = false; btn.hidden = true; });
  audio.addEventListener("play", () => ui(true));
  audio.addEventListener("pause", () => ui(false));

  function ui(playing) {
    btn.textContent = playing ? "❚❚" : "▶";
    btn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    btn.setAttribute("aria-pressed", String(playing));
    btn.classList.toggle("is-playing", playing);
  }

  function fadeIn() {
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      audio.volume = Math.min(0.6, audio.volume + 0.03);
      if (audio.volume >= 0.6) clearInterval(fadeTimer);
    }, 120);
  }

  function play() {
    if (!available) return Promise.resolve();
    return audio.play().then(fadeIn).catch(() => { /* blocked until the next tap: that's fine */ });
  }

  // Called from a real tap (the unlock). If the browser still refuses, the
  // next tap anywhere will try once more. Music is never required.
  function start() {
    if (!available || userPaused) return;
    play();
  }

  btn.addEventListener("click", () => {
    if (audio.paused) { userPaused = false; play(); }
    else { userPaused = true; audio.pause(); }
  });

  document.addEventListener("unlocked", () => {
    if (available) btn.hidden = false;
    const retry = () => { if (audio.paused && !userPaused) start(); };
    document.addEventListener("pointerdown", retry, { once: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { resumeOnShow = !audio.paused; audio.pause(); }
    else if (resumeOnShow && !userPaused) play();
  });

  return { start };
})();

/* ---------- Easter egg 1: tap the big "27" several times ---------- */
(() => {
  const num = document.getElementById("years-num");
  let taps = 0, last = 0;
  num.addEventListener("click", () => {
    const now = Date.now();
    taps = now - last < 1200 ? taps + 1 : 1;
    last = now;
    if (taps >= 7) {
      taps = 0;
      Toast.show("Okay, we get it. You really like being 27. 😂", 3200);
    }
  });
})();

/* ---------- Easter egg 2: the tiny blue star (top-left of "Things that make you, you") ---------- */
(() => {
  const star = document.getElementById("tiny-star");
  let found = false;
  star.addEventListener("click", async () => {
    if (found) return;
    found = true;
    star.classList.add("is-found");
    await Toast.show("You found something you're not supposed to find.", 2800);
    await Toast.show("...but I'll let it slide.", 2400);
  });
})();

/* Easter egg 3 lives in config.js (things → egg) and story.js:
   tap the MUKBANGCH? card three times. */