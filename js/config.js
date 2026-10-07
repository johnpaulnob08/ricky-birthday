/* ==========================================================
   config.js — the ONLY file you need to edit for content.
   ========================================================== */
window.SITE = {
  name: "Ricky",
  age: 27,
  from: "Paupau",

  // Birthday answer (month / day / year)
  birthday: { month: 10, day: 29, year: 1999 },

  // The site stays locked behind a countdown until this moment.
  // "+08:00" = Philippine time, so it opens at midnight PH time no matter where the phone is.
  unlockAt: "2026-10-29T00:00:00+08:00",
  // For YOUR testing only: open the site with ?preview=<this key> to skip the countdown.
  // Example: https://your-site.netlify.app/?preview=paupau-preview
  previewKey: "paupau-preview",

  // Shown (one by one) when Ricky taps "PEEK ANYWAY" too early
  peekReplies: [
    "Too early, Ricky. 👀",
    "The system says: not yet.",
    "Nice try. Come back on October 29. 😌",
    "Ricky.exe is still being prepared.",
    "Patience. It's worth it."
  ],

  // Music: replace the file at this path (or change the path)
  musicPath: "assets/audio/song.mp3",

  // Screen 4 — the scan. One row per line: label ........ value
  scan: [
    { label: "Kindness", value: "detected" },
    { label: "Humor", value: "detected" },
    { label: "Handsomeness", value: "detected" },
    { label: "Appetite", value: "questionable" },
    { label: "Sleepiness", value: "extremely high" },
    { label: "Being special", value: "confirmed" },
    { label: "“Di pagutom.”", value: "confirmed" },
    { label: "“Mukbangch?”", value: "detected" },
    { label: "“Katulgon na.”", value: "detected" }
  ],
  scanResult: "Result: One very special human detected.",

  // Screen 6 — memories. Put photos in assets/images/ and edit this list.
  // If a photo file is missing, a placeholder card is shown instead.
  memories: [
    { src: "assets/images/memory-01.jpg", alt: "Describe photo 1", caption: "Salamat sa Chocolait, Boss!😍" },
    { src: "assets/images/memory-02.jpg", alt: "Describe photo 2", caption: "Unsa gani imong pagsabot sa akong giingon ani? HAHAHAHA" },
    { src: "assets/images/memory-03.jpg", alt: "Describe photo 3", caption: "Busog ra, Dong?" }
  ],

  // Screen 7 — tap-to-reveal cards
  things: [
    { phrase: "DI PAGUTOM.", line: "Because apparently, every adventure begins with food." },
    { phrase: "MUKBANGCH?", line: "A question capable of changing the entire direction of the day. You know na what I mean. HAHHAHA" },
    { phrase: "KATULGON NA.", line: "The universal signal that the night is officially ending. Or katulgon sa shift. HAHAHAHA" }
  ],

  // The heartfelt message (Screen 8). Each string = one paragraph.
  // DRAFT written for you: swap in real memories and your own words.
  message: [
    "Hi, Rickyyyy!. I tried a few times to figure out how to say this properly, and then I realized I don't need big words. I just need to be honest.",
    "Thank you for being in my life. Not in a polite, birthday-card way. I mean it. The late-night talks, the random food decisions, the ordinary days that somehow turned into the ones I remember. A lot of that is you.",
    "I appreciate who you are. The way you make a heavy day feel lighter without making a big deal out of it. The way you show up. You probably don't notice how much that counts, but I do.",
    "I hope your 27th year is kind to you. I hope it's a little more exciting than the last one, a little softer when things get hard, and that you keep growing into the person you're already becoming, at your own pace and in your own way.",
    "You are valued. You are loved. Your presence matters more than you think. I wanted you to have that written somewhere you can come back to.",
    "Happy birthday, Ricky."
  ],

  // Screen 9 — the small wish (two paragraphs, then the sign-off)
  wish: [
    "I hope this year gives you more reasons to smile, more moments worth remembering, and more people who remind you how much you matter.",
    "And whenever life gets a little heavy, I hope you remember that there is someone quietly cheering for you."
  ],
  wishAlways: "Always. 💙",
  wishSign: "— Paupau"
};