/* countdown.js — locks the whole site until SITE.unlockAt */
const Countdown = (() => {
  const target = new Date(SITE.unlockAt).getTime();
  const preview = !!SITE.previewKey &&
    new URLSearchParams(location.search).get("preview") === SITE.previewKey;
  const isOpen = () => preview || Date.now() >= target;

  const cells = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    minutes: document.getElementById("cd-minutes"),
    seconds: document.getElementById("cd-seconds")
  };
  const status = document.getElementById("cd-status");
  const pad = (n) => String(n).padStart(2, "0");
  let timer = null;

  function render() {
    const left = Math.max(0, target - Date.now());
    if (left === 0) return finish();
    const s = Math.floor(left / 1000);
    cells.days.textContent = pad(Math.floor(s / 86400));
    cells.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    cells.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    cells.seconds.textContent = pad(s % 60);
  }

  function finish() {
    clearInterval(timer);
    Object.values(cells).forEach((c) => (c.textContent = "00"));
    status.textContent = "It's time.";
    setTimeout(() => Screens.goTo("screen-lock"), 2200);
  }

  // Playful "too early" teaser
  const peekBtn = document.getElementById("peek-btn");
  const peekMsg = document.getElementById("peek-msg");
  let peeks = 0;
  peekBtn.addEventListener("click", () => {
    peekMsg.textContent = SITE.peekReplies[peeks++ % SITE.peekReplies.length];
  });

  if (!isOpen()) {
    render();
    timer = setInterval(render, 1000);
    document.addEventListener("visibilitychange", () => !document.hidden && render());
  }

  return { isOpen };
})();