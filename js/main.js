/* main.js — boot. Later steps add more screens' logic in their own files. */
document.addEventListener("DOMContentLoaded", () => {
  // Placeholder "Continue" buttons for screens not built yet
  document.querySelectorAll("[data-next]").forEach((btn) =>
    btn.addEventListener("click", () => Screens.next())
  );
  // Before the unlock time: countdown. After it (or with ?preview=key): the birthday lock.
  Screens.goTo(Countdown.isOpen() ? "screen-lock" : "screen-countdown");
});