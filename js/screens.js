/* screens.js — screen manager + unlock-gated navigation */
const Screens = (() => {
  const PRE_UNLOCK = ["screen-countdown", "screen-lock"]; // reachable before the birthday is entered
  const order = [...document.querySelectorAll(".screen")];
  const reached = new Set();
  let current = null;
  let unlocked = false;

  const nav = {
    toggle: document.getElementById("nav-toggle"),
    sheet: document.getElementById("nav-sheet")
  };

  function goTo(id) {
    const next = document.getElementById(id);
    if (!next || next === current) return;
    if (!unlocked && !PRE_UNLOCK.includes(id)) return; // gate: no skipping the countdown / birthday check

    const prev = current;
    if (prev) {
      prev.classList.remove("is-active");
      prev.classList.add("is-leaving");
      setTimeout(() => prev.classList.remove("is-leaving"), 350);
    }
    current = next;
    reached.add(id);
    setTimeout(() => {
      next.classList.add("is-active");
      next.scrollTop = 0;
      const heading = next.querySelector("h1, h2");
      if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
    }, prev ? 300 : 0);
    document.dispatchEvent(new CustomEvent("screenchange", { detail: { id } }));
    renderNav();
  }

  function next() {
    const i = order.indexOf(current);
    if (i >= 0 && order[i + 1]) goTo(order[i + 1].id);
  }

  function unlock() {
    unlocked = true;
    nav.toggle.hidden = false;
    document.dispatchEvent(new Event("unlocked"));
  }

  function renderNav() {
    nav.sheet.innerHTML = "";
    order.forEach((s) => {
      if (PRE_UNLOCK.includes(s.id)) return;
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = s.dataset.title;
      b.disabled = !reached.has(s.id);
      if (s === current) b.setAttribute("aria-current", "page");
      b.addEventListener("click", () => { closeNav(); goTo(s.id); });
      nav.sheet.appendChild(b);
    });
  }

  function openNav() {
    renderNav();
    nav.sheet.hidden = false;
    nav.toggle.setAttribute("aria-expanded", "true");
    nav.toggle.setAttribute("aria-label", "Close sections menu");
    nav.toggle.textContent = "✕";
    const first = nav.sheet.querySelector("button:not([disabled])");
    if (first) first.focus();
  }
  function closeNav() {
    nav.sheet.hidden = true;
    nav.toggle.setAttribute("aria-expanded", "false");
    nav.toggle.setAttribute("aria-label", "Open sections menu");
    nav.toggle.textContent = "☰";
  }

  nav.toggle.addEventListener("click", () => (nav.sheet.hidden ? openNav() : closeNav()));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !nav.sheet.hidden) { closeNav(); nav.toggle.focus(); }
  });

  return { goTo, next, unlock, get unlocked() { return unlocked; } };
})();