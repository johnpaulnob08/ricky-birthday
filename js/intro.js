/* intro.js — Screens 1-3: birthday gate, unlock sequence, dodging button */
(() => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const show = (el) => el.classList.remove("is-hidden");

  /* ============ SCREEN 1 — the gate ============ */
  const gate = document.getElementById("gate");
  const input = document.getElementById("bday-input");
  const feedback = document.getElementById("gate-feedback");
  const loader = document.getElementById("lock-loader");
  const flash = document.getElementById("flash");
  const wrongReplies = [
    "Hmm... nice try.",
    "That's not the birthday we're looking for. 😌",
    "Ricky.exe refuses to cooperate."
  ];
  let wrongCount = 0;

  // Reveal the form after the "loading" moment
  let gateStarted = false;
  document.addEventListener("screenchange", (e) => {
    if (e.detail.id !== "screen-lock" || gateStarted) return;
    gateStarted = true;
    wait(3200).then(() => {
      loader.hidden = true;
      gate.hidden = false;
      requestAnimationFrame(() => show(gate));
    });
  });

  // Auto-format as "MM / DD / YYYY" while typing (digits only)
  input.addEventListener("input", () => {
    const d = input.value.replace(/\D/g, "").slice(0, 8);
    input.value = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join(" / ");
  });

  gate.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = input.value.replace(/\D/g, "");
    if (d.length < 8) {
      feedback.textContent = "Finish the date first: MM / DD / YYYY.";
      return;
    }
    const { month, day, year } = SITE.birthday;
    const ok = +d.slice(0, 2) === month && +d.slice(2, 4) === day && +d.slice(4, 8) === year;

    if (!ok) {
      feedback.textContent = wrongReplies[wrongCount++ % wrongReplies.length];
      gate.classList.remove("shake");
      void gate.offsetWidth; // restart animation
      gate.classList.add("shake");
      input.select();
      return;
    }

    // Correct: satisfying unlock moment
    gate.querySelectorAll("input, button").forEach((el) => (el.disabled = true));
    feedback.textContent = "Identity verified.";
    flash.classList.add("is-on");
    Music.start(); // inside the tap, so browsers allow sound
    await wait(900);
    Screens.unlock();
    Screens.goTo("screen-unlock");
  });

  /* ============ SCREEN 2 — system unlock ============ */
  const unlockEls = {
    granted: document.getElementById("u-granted"),
    welcome: document.getElementById("u-welcome"),
    loaded: document.getElementById("u-loaded"),
    bar: document.querySelector("#u-loaded .progress span"),
    percent: document.getElementById("u-percent"),
    happy: document.getElementById("u-happy"),
    waiting: document.getElementById("u-waiting"),
    next: document.getElementById("u-continue")
  };
  document.getElementById("u-welcome").textContent = `Welcome, ${SITE.name}.`;
  let unlockPlayed = false;

  function setProgress(p) {
    unlockEls.bar.style.width = p + "%";
    unlockEls.percent.textContent = Math.round(p) + "%";
  }

  async function playUnlock() {
    if (unlockPlayed) { // revisiting from the menu: show the finished state
      Object.values(unlockEls).forEach((el) => el.classList && show(el));
      setProgress(100);
      return;
    }
    unlockPlayed = true;
    show(unlockEls.granted);
    await wait(1000);
    show(unlockEls.welcome);
    await wait(1000);
    show(unlockEls.loaded);

    const duration = 3000, start = performance.now();
    await new Promise((resolve) => {
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        setProgress((1 - Math.pow(1 - t, 2)) * 100); // ease-out
        t < 1 ? requestAnimationFrame(tick) : resolve();
      };
      requestAnimationFrame(tick);
    });

    await wait(400);
    show(unlockEls.happy);
    await wait(1500);
    show(unlockEls.waiting);
    await wait(700);
    show(unlockEls.next);
  }
  unlockEls.next.addEventListener("click", () => Screens.goTo("screen-confirm"));

  /* ============ SCREEN 3 — the dodging button ============ */
  const arena = document.getElementById("arena");
  const readyBtn = document.getElementById("ready-btn");
  const dodgeMsg = document.getElementById("dodge-msg");
  const dodgeLines = ["Too slow.", "Almost.", "You thought.", "Fine. Catch it."];
  const MAX_DODGES = 4;
  let dodges = 0;
  let justDodged = false;
  let won = false;

  function dodge() {
    const room = arena.getBoundingClientRect();
    const size = readyBtn.getBoundingClientRect();
    const ease = 1 - dodges * 0.22; // each dodge travels less far = easier to catch
    const maxX = Math.max(0, (room.width - size.width) / 2) * ease;
    const maxY = Math.max(0, (room.height - size.height) / 2) * ease;
    // push to the opposite side of where it is, with some randomness
    const side = dodges % 2 === 0 ? 1 : -1;
    const x = side * (0.5 + Math.random() * 0.5) * maxX;
    const y = (Math.random() * 2 - 1) * maxY;
    readyBtn.style.setProperty("--dx", x.toFixed(0) + "px");
    readyBtn.style.setProperty("--dy", y.toFixed(0) + "px");
    dodgeMsg.textContent = dodgeLines[dodges];
    dodges++;
  }

  // pointerdown works for touch AND mouse — no hover needed
  readyBtn.addEventListener("pointerdown", (e) => {
    if (won || dodges >= MAX_DODGES) return;
    e.preventDefault();
    justDodged = true;
    dodge();
  });

  readyBtn.addEventListener("click", async () => {
    if (justDodged) { justDodged = false; return; } // that press was a dodge
    if (won) return;
    won = true;
    readyBtn.disabled = true;
    dodgeMsg.textContent = "Okay, okay. You win.";
    await wait(1500);
    Screens.goTo("screen-scan");
  });
  // Keyboard users (Enter/Space, no pointerdown) are never dodged.

  document.addEventListener("screenchange", (e) => {
    if (e.detail.id === "screen-unlock") playUnlock();
  });
})();