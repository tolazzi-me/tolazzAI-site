// ── Navbar scroll effect ──
const navbar = document.getElementById("navbar");
if (navbar) {
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 40) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    },
    { passive: true },
  );
}

// ── Mobile menu toggle ──
const toggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
if (toggle && mobileMenu) {
  toggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => mobileMenu.classList.remove("open"));
  });
}

// ── Scroll-triggered fade-in ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);
document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

// ===== FUNDO NEON ANIMADO =====
(function () {
  const canvas = document.getElementById("neonBg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height;
  let particles = [];
  let rafId = null;
  let running = false;
  const pointer = { x: null, y: null };
  const isMobile = window.innerWidth < 768;

  const CONFIG = {
    count: isMobile ? 40 : 80,
    maxDist: isMobile ? 100 : 130,
    mouseDist: isMobile ? 140 : 180,
    speed: 0.5,
    radius: 2.5,
    blur: isMobile ? 8 : 12,
    color: "0, 200, 255",
  };

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${CONFIG.color})`;
      ctx.shadowBlur = CONFIG.blur;
      ctx.shadowColor = `rgb(${CONFIG.color})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const opacity = 1 - dist / CONFIG.maxDist;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.color}, ${opacity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (pointer.x !== null) {
      for (let p of particles) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseDist) {
          const opacity = 1 - dist / CONFIG.mouseDist;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(${CONFIG.color}, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    draw();
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function updatePointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = clientX - rect.left;
    pointer.y = clientY - rect.top;
  }

  window.addEventListener("mousemove", (e) =>
    updatePointer(e.clientX, e.clientY),
  );
  window.addEventListener("mouseout", () => {
    pointer.x = null;
    pointer.y = null;
  });
  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
        else stop();
      });
    },
    { threshold: 0 },
  );
  obs.observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (isVisible()) start();
  });
  function isVisible() {
    const r = canvas.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  resize();
  createParticles();
})();

// ===== TLZ BUILDER SVG LINES =====
(function () {
  const builder = document.getElementById("tlzBuilder");
  if (!builder) return;
  const svg = document.getElementById("tlzLinks");
  const core = document.getElementById("tlzCore");
  const mods = builder.querySelectorAll(".tlz-mod");
  const NS = "http://www.w3.org/2000/svg";

  function drawLines() {
    svg.querySelectorAll(".tlz-link-line").forEach((l) => l.remove());
    const bRect = builder.getBoundingClientRect();
    const cRect = core.getBoundingClientRect();
    const cx = cRect.left + cRect.width / 2 - bRect.left;
    const cy = cRect.top + cRect.height / 2 - bRect.top;

    mods.forEach((mod, i) => {
      const r = mod.getBoundingClientRect();
      const side = mod.dataset.side;
      const x1 = (side === "left" ? r.right : r.left) - bRect.left;
      const y1 = r.top + r.height / 2 - bRect.top;

      const line = document.createElementNS(NS, "line");
      line.setAttribute("class", "tlz-link-line");
      line.setAttribute("data-i", i);
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", cx);
      line.setAttribute("y2", cy);

      const len = Math.hypot(cx - x1, cy - y1);
      line.style.strokeDasharray = len;
      line.style.setProperty("--len", len);
      line.style.strokeDashoffset = len;
      svg.appendChild(line);
    });
  }

  window.addEventListener("load", drawLines);
  window.addEventListener("resize", drawLines);
  drawLines();
})();

// ===== MÁQUINA DE ESCREVER E INTERSECTION DO ECOSSISTEMA =====
(function () {
  const el = document.getElementById("typewriter");
  const cursor = document.querySelector(".tw-cursor");
  if (el) {
    const text = "Nós arquitetamos o futuro\nda sua empresa.";
    const speed = 45;
    let i = 0;

    function type() {
      if (i >= text.length) {
        if (cursor) cursor.classList.add("done");
        return;
      }
      const char = text[i];
      if (char === "\n") {
        el.appendChild(document.createElement("br"));
      } else {
        el.appendChild(document.createTextNode(char));
      }
      i++;
      setTimeout(type, speed);
    }
    window.addEventListener("load", () => setTimeout(type, 400));
  }

  const tlzBuilder = document.querySelector(".tlz-builder");
  if (tlzBuilder) {
    const tlzObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          tlzBuilder.classList.toggle("tlz-paused", !entry.isIntersecting);
        });
      },
      { threshold: 0.1 },
    );
    tlzObserver.observe(tlzBuilder);
  }
})();

// ===== PALCO DO CELULAR (RAIOS) =====
const altStage = document.querySelector(".alt-stage");
const altVideo = document.getElementById("altVideo");
if (altStage) {
  const altObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          altStage.classList.add("is-active");
          if (altVideo) altVideo.play().catch(() => {});
        } else {
          altStage.classList.remove("is-active");
          if (altVideo) altVideo.pause();
        }
      });
    },
    { threshold: 0.3 },
  );
  altObserver.observe(altStage);
}

// ===== PALCO DO ESCUDO =====
const shieldStage = document.getElementById("shieldStage");
if (shieldStage) {
  new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          shieldStage.classList.add("is-active");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 },
  ).observe(shieldStage);
}

// ===== ACCORDION (CONSULTORIA EXECUTIVA) =====
document.querySelectorAll(".exec-head").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".exec-item");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".exec-item").forEach((i) => {
      i.classList.remove("open");
      i.querySelector(".exec-head").setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      item.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

// ===== BANNER DE EDUCAÇÃO RANDOM =====
(function () {
  const eduImages = ["img/palestras/palestra-06.webp"];

  const img = document.getElementById("eduRandomImg");
  if (!img) return;

  const ultima = sessionStorage.getItem("eduLastImg");
  let opcoes =
    ultima && eduImages.length > 1
      ? eduImages.filter((s) => s !== ultima)
      : eduImages;
  const escolhida = opcoes[Math.floor(Math.random() * opcoes.length)];

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.style.opacity = "0";
          img.style.transition = "opacity 0.6s ease";
          img.onload = () => {
            img.style.opacity = "1";
          };
          img.onerror = () => {
            img.onerror = null;
            img.src = "img/palestras/palestra-01.webp";
          };
          img.src = escolhida;
          sessionStorage.setItem("eduLastImg", escolhida);
          obs.disconnect();
        }
      });
    },
    { rootMargin: "200px" },
  );

  io.observe(img);
})();

// ===== KEYWORD SPACE ANIMATION =====
(function () {
  const kwSpace = document.querySelector(".kw-space");
  if (!kwSpace) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        kwSpace.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { threshold: 0.1 },
  );

  io.observe(kwSpace);
})();

// ==========================================
// SCRIPTS ESPECÍFICOS DA PÁGINA ALTONICS
// ==========================================

(function () {
  const chartBox = document.querySelector(".chart-box");
  const el = document.getElementById("pct");
  const alvo = 187;
  const dur = 5000; // mesmo tempo da linha do gráfico
  let jaAnimou = false;

  // Se os elementos do gráfico não existirem nesta página, encerra a função
  if (!chartBox || !el) return;

  function animarContador() {
    const ini = performance.now();
    function animar(agora) {
      const p = Math.min((agora - ini) / dur, 1);
      el.textContent = "+" + Math.floor(p * alvo) + "%";
      if (p < 1) requestAnimationFrame(animar);
    }
    requestAnimationFrame(animar);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !jaAnimou) {
          jaAnimou = true;
          chartBox.classList.add("animate"); // dispara animação do SVG
          animarContador(); // dispara contador sincronizado
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }, // dispara quando 40% do gráfico estiver visível
  );

  observer.observe(chartBox);
})();
