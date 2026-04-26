/* ==================================
   Baby Dutra · Chá Revelação 2026
   script.js
   ================================== */

(() => {
  /* ── Referências DOM ── */
  const audio        = document.getElementById("background-audio");
  const audioControl = document.getElementById("audio-control");
  const audioTitle   = document.getElementById("audio-title");
  const audioSubtitle= document.getElementById("audio-subtitle");
  const audioIconPath= document.getElementById("audio-icon-path");
  const page         = document.querySelector(".page");

  const countdownValues = {
    days:    document.querySelector('[data-unit="days"]'),
    hours:   document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]')
  };
  const countdownMessage = document.getElementById("countdown-message");

  const iconPlay  = "m8 5 11 7-11 7z";
  const iconPause = "M7 5h3v14H7zm7 0h3v14h-3z";
  const revealDate = new Date("2026-05-16T16:30:00-03:00");

  /* ─────────────────────────────────
     AUDIO
  ───────────────────────────────── */

  const setAudioState = (isPlaying) => {
    audioControl.dataset.state = isPlaying ? "playing" : "paused";
    audioControl.setAttribute("aria-pressed", String(isPlaying));
    audioControl.setAttribute("aria-label", isPlaying ? "Pausar música" : "Tocar música");
    audioTitle.textContent    = isPlaying ? "Tocando" : "Música";
    audioSubtitle.textContent = isPlaying ? "Sweet Child O' Mine" : "Toque para ouvir";
    audioIconPath.setAttribute("d", isPlaying ? iconPause : iconPlay);

    /* Controla visibilidade das notas musicais mobile */
    if (page) page.classList.toggle("audio-paused", !isPlaying);
  };

  const tryAutoplay = async () => {
    try { await audio.play(); setAudioState(true); }
    catch (_) { setAudioState(false); }
  };

  const handleFirstInteraction = async (e) => {
    if (e.target instanceof Element && e.target.closest("#audio-control")) return;
    if (!audio.paused) return;
    await tryAutoplay();
  };

  audioControl.addEventListener("click", async () => {
    if (audio.paused) {
      try { await audio.play(); setAudioState(true); }
      catch (_) { setAudioState(false); }
      return;
    }
    audio.pause();
    setAudioState(false);
  });

  audio.addEventListener("play",  () => setAudioState(true));
  audio.addEventListener("pause", () => setAudioState(false));
  document.addEventListener("pointerdown", handleFirstInteraction, { passive: true, once: true });
  document.addEventListener("keydown",     handleFirstInteraction, { once: true });

  // Começa pausado; tenta autoplay
  setAudioState(false);
  tryAutoplay();

  /* ─────────────────────────────────
     COUNTDOWN
  ───────────────────────────────── */

  const animateValue = (el, newVal) => {
    if (!el || el.textContent === newVal) return;
    el.textContent = newVal;
    el.classList.remove("changed");
    void el.offsetWidth; // reflow para reiniciar a animação
    el.classList.add("changed");
  };

  const updateCountdown = () => {
    const diff = revealDate.getTime() - Date.now();
    if (diff <= 0) {
      ["days","hours","minutes","seconds"].forEach(u => animateValue(countdownValues[u], "00"));
      countdownMessage.textContent = "Hoje é o dia da revelação! 🎉";
      return;
    }
    const s = Math.floor(diff / 1000);
    animateValue(countdownValues.days,    String(Math.floor(s / 86400)).padStart(2, "0"));
    animateValue(countdownValues.hours,   String(Math.floor((s % 86400) / 3600)).padStart(2, "0"));
    animateValue(countdownValues.minutes, String(Math.floor((s % 3600) / 60)).padStart(2, "0"));
    animateValue(countdownValues.seconds, String(s % 60).padStart(2, "0"));
    countdownMessage.textContent = "Contando os dias para esse momento.";
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  /* ─────────────────────────────────
     REDUCED MOTION — para aqui
  ───────────────────────────────── */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  /* ─────────────────────────────────
     PARTICLES CANVAS
  ───────────────────────────────── */

  const particlesCanvas = document.getElementById("particles-canvas");
  const ctx = particlesCanvas.getContext("2d");
  const palette = ["214,178,111","176,201,213","205,167,142","233,216,188"];
  const particles = [];
  let vw = window.innerWidth, vh = window.innerHeight;

  const mkParticle = () => {
    const d = Math.random() * 0.8 + 0.4;
    return {
      x: Math.random() * vw, y: Math.random() * vh,
      r: (Math.random() * 14 + 6) * d,
      dx: (Math.random() - 0.5) * 0.18 * d,
      dy: (Math.random() * 0.32 + 0.08) * d,
      a: Math.random() * 0.22 + 0.05,
      c: palette[Math.floor(Math.random() * palette.length)],
      ph: Math.random() * Math.PI * 2,
      wb: Math.random() * 0.6 + 0.15
    };
  };

  const resizeParticles = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth; vh = window.innerHeight;
    particlesCanvas.width  = Math.floor(vw * dpr);
    particlesCanvas.height = Math.floor(vh * dpr);
    particlesCanvas.style.width  = `${vw}px`;
    particlesCanvas.style.height = `${vh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(20, Math.min(44, Math.round(vw / 34)));
    particles.length = 0;
    for (let i = 0; i < n; i++) particles.push(mkParticle());
  };

  const drawParticles = (t) => {
    ctx.clearRect(0, 0, vw, vh);
    for (const p of particles) {
      p.x += p.dx + Math.sin(t * 0.00045 + p.ph) * p.wb * 0.08;
      p.y += p.dy;
      if (p.y - p.r > vh + 24) { p.y = -p.r - 24; p.x = Math.random() * vw; }
      if (p.x < -40) p.x = vw + 40; else if (p.x > vw + 40) p.x = -40;
      const g = ctx.createRadialGradient(p.x, p.y, p.r * 0.1, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(${p.c},${p.a})`);
      g.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    window.requestAnimationFrame(drawParticles);
  };

  resizeParticles();
  window.requestAnimationFrame(drawParticles);
  window.addEventListener("resize", resizeParticles);

  /* ─────────────────────────────────
     CONFETTI AO CARREGAR
  ───────────────────────────────── */

  const launchConfetti = () => {
    const container = document.getElementById("confetti-container");
    if (!container) return;
    const colors = ["#d6b26f","#b4c9d4","#e9cdb0","#f2d4b6","#cda78e","#9f643a"];
    const n = window.innerWidth < 600 ? 28 : 48;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      const isCircle = Math.random() > 0.5;
      const size = Math.random() * 8 + 5;
      el.style.cssText = [
        `--x:${Math.random()*100}%`,
        `--size:${size}px`,
        `--color:${colors[Math.floor(Math.random()*colors.length)]}`,
        `--dur:${(Math.random()*1.8+2).toFixed(2)}s`,
        `--delay:${(Math.random()*1.2).toFixed(2)}s`,
        `--br:${isCircle?"50%":"2px"}`,
        `--rot-start:${Math.round(Math.random()*180)}deg`,
        `--rot-end:${Math.round(Math.random()*720+360)}deg`
      ].join(";");
      container.appendChild(el);
    }
    setTimeout(() => { container.innerHTML = ""; }, 4500);
  };

  window.addEventListener("load", () => setTimeout(launchConfetti, 400));

})();

/* ===========================================
   GSAP — Animações de entrada, scroll e
           parallax (executa após load)
   =========================================== */

window.addEventListener("load", () => {
  if (typeof gsap === "undefined") {
    /* Fallback: IntersectionObserver para .anim-target */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in-view"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".anim-target").forEach(el => obs.observe(el));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("gsap-ready");

  /* ── PARALLAX com ScrollTrigger (substitui lógica manual) ── */

  /*
   * Cada layer tem:
   *   yTo   → quanto se desloca em Y do topo ao fundo da página (px)
   *   xTo   → deslocamento X opcional
   *   rot   → rotação total opcional (graus)
   *   scrub → inércia do scrub (maior = mais lag/suavidade)
   */
  const parallaxLayers = [
    /* Fundo — movimento suave */
    { sel: ".hill-gold",        yTo: -60,  scrub: 3   },
    { sel: ".rainbow",          yTo: -45,  scrub: 3.5, rot: 2  },

    /* Meio — velocidade média */
    { sel: ".hill-blue",        yTo: -110, scrub: 2.5 },
    { sel: ".hill-peach-small", yTo: -80,  scrub: 2.5 },
    { sel: ".hill-peach-large", yTo: -130, scrub: 2,  isCenter: true },

    /* Frente — movem mais, dando profundidade */
    { sel: ".sun",              yTo: -200, scrub: 1.8, rot: 6,  xTo: 10  },
    { sel: ".birds",            yTo: -250, scrub: 1.5, rot: -3, xTo: -12 },
    { sel: ".flower-caramel",   yTo: -280, scrub: 1.4, rot: -10 },
    { sel: ".flower-blue",      yTo: -220, scrub: 1.4, rot: 8   },
  ];

  /* hill-peach-large precisa de xPercent: -50 (era o translateX(-50%) do CSS) */
  gsap.set(".hill-peach-large", { xPercent: -50 });

  parallaxLayers.forEach(({ sel, yTo, xTo = 0, rot = 0, scrub, isCenter }) => {
    const el = document.querySelector(sel);
    if (!el) return;

    gsap.to(el, {
      y: yTo,
      x: isCenter ? 0 : xTo,
      rotation: rot,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub
      }
    });
  });

  /* ── Floating organico — flores e pássaros flutuam independente do scroll ── */
  const floaters = [
    { sel: ".flower-caramel img", yAmt: -13, dur: 2.6, delay: 0   },
    { sel: ".flower-blue img",    yAmt:  14, dur: 3.1, delay: 0.8 },
    { sel: ".birds img",          yAmt:  -7, dur: 2.2, delay: 0.3 },
  ];

  floaters.forEach(({ sel, yAmt, dur, delay }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    gsap.to(el, { y: yAmt, duration: dur, ease: "sine.inOut", yoyo: true, repeat: -1, delay });
  });

  /* Sol — rotação lenta como âncora cósmica */
  gsap.to(".sun img", {
    rotation: 6,
    duration: 14,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  /* ── ANIMAÇÕES DE ENTRADA ── */

  /* Hero card */
  gsap.from(".hero-card", {
    duration: 1.3, y: 50, opacity: 0, scale: 0.97,
    ease: "power3.out", delay: 0.15, clearProps: "all"
  });

  /* Elementos internos do hero em cascata */
  gsap.from([".eyebrow","h1",".hero-name",".lead",".hero-copy"], {
    duration: 0.8, y: 22, opacity: 0, stagger: 0.1,
    ease: "power2.out", delay: 0.5, clearProps: "all"
  });

  gsap.from([".date-box",".countdown",".dress-notes",".theme-song",".scroll-cue"], {
    duration: 0.7, y: 18, opacity: 0, stagger: 0.12,
    ease: "power2.out", delay: 0.9, clearProps: "all"
  });

  /* Details card ao entrar na tela */
  gsap.from(".details-card", {
    scrollTrigger: { trigger: ".details", start: "top 82%", once: true },
    duration: 1, y: 50, opacity: 0, ease: "power2.out", clearProps: "all"
  });

  gsap.from(".section-title, .section-copy", {
    scrollTrigger: { trigger: ".details", start: "top 80%", once: true },
    duration: 0.8, y: 24, opacity: 0, stagger: 0.15,
    ease: "power2.out", delay: 0.2, clearProps: "all"
  });

  /* Info cards com stagger */
  gsap.from(".info-card", {
    scrollTrigger: { trigger: ".info-grid", start: "top 85%", once: true },
    duration: 0.75, y: 30, opacity: 0, stagger: 0.18,
    ease: "power2.out", clearProps: "all"
  });

  /* Gift card */
  gsap.from(".gift-card", {
    scrollTrigger: { trigger: ".gift", start: "top 82%", once: true },
    duration: 1, y: 40, opacity: 0, ease: "power2.out", clearProps: "all"
  });

  gsap.from(".gift-highlight", {
    scrollTrigger: { trigger: ".gift-card", start: "top 78%", once: true },
    duration: 0.7, scale: 0.85, opacity: 0,
    ease: "back.out(2)", delay: 0.3, clearProps: "all"
  });

  /* Barra de ações e audio control */
  gsap.from(".quick-actions", {
    duration: 0.9, y: 60, opacity: 0, ease: "power3.out", delay: 1.1, clearProps: "all"
  });

  gsap.from(".audio-control", {
    duration: 0.7, x: 30, opacity: 0, ease: "power2.out", delay: 0.8, clearProps: "all"
  });
});
