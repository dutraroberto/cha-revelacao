/* ===================================================
   Baby Contar · Chá Revelação 2026
   Convite em formato de LIVRO
   script.js
   =================================================== */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ─────────────────────────────────
     ÁUDIO
  ───────────────────────────────── */
  const audio = document.getElementById("background-audio");
  const audioControl = document.getElementById("audio-control");
  const audioTitle = document.getElementById("audio-title");
  const audioSubtitle = document.getElementById("audio-subtitle");
  const audioIconPath = document.getElementById("audio-icon-path");

  const ICON_PLAY = "m8 5 11 7-11 7z";
  const ICON_PAUSE = "M7 5h3v14H7zm7 0h3v14h-3z";

  const setAudioState = (playing) => {
    audioControl.dataset.state = playing ? "playing" : "paused";
    audioControl.setAttribute("aria-pressed", String(playing));
    audioControl.setAttribute(
      "aria-label",
      playing ? "Pausar música" : "Tocar música",
    );
    audioTitle.textContent = playing ? "Tocando" : "Música";
    audioSubtitle.textContent = playing ? "Nossa canção 🤎" : "Toque para ouvir";
    audioIconPath.setAttribute("d", playing ? ICON_PAUSE : ICON_PLAY);
  };

  const tryAutoplay = async () => {
    try {
      await audio.play();
      setAudioState(true);
    } catch (_) {
      setAudioState(false);
    }
  };

  audioControl.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        setAudioState(true);
      } catch (_) {
        setAudioState(false);
      }
    } else {
      audio.pause();
      setAudioState(false);
    }
  });

  audio.addEventListener("play", () => setAudioState(true));
  audio.addEventListener("pause", () => setAudioState(false));

  const firstInteraction = (e) => {
    if (e.target instanceof Element && e.target.closest("#audio-control"))
      return;
    if (!audio.paused) return;
    tryAutoplay();
  };
  document.addEventListener("pointerdown", firstInteraction, {
    passive: true,
    once: true,
  });
  document.addEventListener("keydown", firstInteraction, { once: true });

  setAudioState(false);
  tryAutoplay();

  /* ─────────────────────────────────
     CONTAGEM REGRESSIVA → 12/07/2026 13h30
  ───────────────────────────────── */
  const revealDate = new Date("2026-07-12T13:30:00-03:00");
  const cd = {
    days: document.querySelector('[data-unit="days"]'),
    hours: document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]'),
  };
  const cdMessage = document.getElementById("countdown-message");

  const setVal = (el, v) => {
    if (!el || el.textContent === v) return;
    el.textContent = v;
    if (prefersReducedMotion) return;
    el.classList.remove("changed");
    void el.offsetWidth;
    el.classList.add("changed");
  };

  const tick = () => {
    const diff = revealDate.getTime() - Date.now();
    if (diff <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach((u) =>
        setVal(cd[u], "00"),
      );
      if (cdMessage) cdMessage.textContent = "Hoje é o grande dia! 💛";
      return;
    }
    const s = Math.floor(diff / 1000);
    setVal(cd.days, String(Math.floor(s / 86400)).padStart(2, "0"));
    setVal(cd.hours, String(Math.floor((s % 86400) / 3600)).padStart(2, "0"));
    setVal(cd.minutes, String(Math.floor((s % 3600) / 60)).padStart(2, "0"));
    setVal(cd.seconds, String(s % 60).padStart(2, "0"));
  };
  tick();
  setInterval(tick, 1000);

  /* ─────────────────────────────────
     LIVRO — StPageFlip
  ───────────────────────────────── */
  const bookEl = document.getElementById("book");
  const pages = bookEl.querySelectorAll(".page");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const indicator = document.getElementById("page-indicator");
  const hint = document.getElementById("hint");
  const wrap = document.querySelector(".book-wrap");

  // Rótulos exibidos no indicador (um por folha física)
  const labels = [
    "Capa",
    "Convite",
    "Quando",
    "Traje",
    "Programação",
    "Presente",
    "Localização",
    "Fim",
  ];

  let pageFlip = null;

  const updateNav = (idx) => {
    const total = pageFlip ? pageFlip.getPageCount() : pages.length;
    if (indicator)
      indicator.textContent = labels[idx] || `${idx + 1} / ${total}`;
    if (prevBtn) prevBtn.disabled = idx <= 0;
    if (nextBtn) nextBtn.disabled = idx >= total - 1;
  };

  const initBook = () => {
    if (typeof St === "undefined" || !St.PageFlip) {
      // Fallback: mostra páginas empilhadas se a lib não carregar
      bookEl.classList.add("no-flip");
      pages.forEach((p) => {
        p.style.position = "relative";
        p.style.width = "100%";
        p.style.minHeight = "70vh";
        p.style.marginBottom = "16px";
        p.style.borderRadius = "10px";
      });
      if (wrap) wrap.classList.add("is-ready");
      return;
    }

    pageFlip = new St.PageFlip(bookEl, {
      width: 440,
      height: 600,
      size: "stretch",
      minWidth: 300,
      maxWidth: 520,
      minHeight: 420,
      maxHeight: 720,
      maxShadowOpacity: 0.5,
      drawShadow: true,
      flippingTime: prefersReducedMotion ? 0 : 750,
      usePortrait: true,
      showCover: true,
      mobileScrollSupport: false,
      swipeDistance: 20,
    });

    pageFlip.loadFromHTML(pages);

    pageFlip.on("flip", (e) => {
      updateNav(e.data);
      if (hint && !hint.classList.contains("is-hidden"))
        hint.classList.add("is-hidden");
    });
    pageFlip.on("changeState", () => {});

    updateNav(0);

    prevBtn.addEventListener("click", () => pageFlip.flipPrev());
    nextBtn.addEventListener("click", () => pageFlip.flipNext());

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") pageFlip.flipPrev();
      if (e.key === "ArrowRight") pageFlip.flipNext();
    });

    if (wrap) requestAnimationFrame(() => wrap.classList.add("is-ready"));

    // esconde a dica após algum tempo
    if (hint) setTimeout(() => hint.classList.add("is-hidden"), 8000);
  };

  if (document.readyState === "complete") initBook();
  else window.addEventListener("load", initBook);

  /* ─────────────────────────────────
     FOLHAS FLUTUANTES (canvas)
  ───────────────────────────────── */
  if (prefersReducedMotion) return;

  const canvas = document.getElementById("leaf-canvas");
  const ctx = canvas.getContext("2d");
  const colors = [
    "201,169,106",
    "143,145,113",
    "176,125,79",
    "138,86,49",
    "205,187,149",
  ];
  let W = 0,
    H = 0,
    leaves = [];

  const makeLeaf = () => {
    const depth = Math.random() * 0.7 + 0.4;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      len: (Math.random() * 10 + 7) * depth,
      ang: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.5 + 0.3,
      fall: (Math.random() * 0.4 + 0.25) * depth,
      drift: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.28 + 0.12,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(14, Math.min(34, Math.round(W / 46)));
    leaves = Array.from({ length: n }, makeLeaf);
  };

  const drawLeaf = (l) => {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.ang);
    ctx.fillStyle = `rgba(${l.color},${l.alpha})`;
    // folha em forma de gota
    ctx.beginPath();
    ctx.moveTo(0, -l.len);
    ctx.quadraticCurveTo(l.len * 0.6, 0, 0, l.len);
    ctx.quadraticCurveTo(-l.len * 0.6, 0, 0, -l.len);
    ctx.fill();
    ctx.restore();
  };

  const animate = (t) => {
    ctx.clearRect(0, 0, W, H);
    for (const l of leaves) {
      l.sway += 0.01 * l.swaySpeed;
      l.x += l.drift + Math.sin(l.sway) * 0.4;
      l.y += l.fall;
      l.ang += l.spin;
      if (l.y - l.len > H + 20) {
        l.y = -l.len - 20;
        l.x = Math.random() * W;
      }
      if (l.x < -30) l.x = W + 30;
      else if (l.x > W + 30) l.x = -30;
      drawLeaf(l);
    }
    requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(animate);
})();
