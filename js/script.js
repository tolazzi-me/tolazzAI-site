// ── Navbar scroll effect (otimizado com requestAnimationFrame) ──
const navbar = document.getElementById("navbar");
if (navbar) {
  let navTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!navTicking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 40) navbar.classList.add("scrolled");
          else navbar.classList.remove("scrolled");
          navTicking = false;
        });
        navTicking = true;
      }
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
  const ctx = canvas.getContext("2d", { alpha: true });

  let width = 0;
  let height = 0;
  let particles = [];
  let rafId = null;
  let running = false;
  let lastTime = 0;
  const pointer = { x: null, y: null };
  let lastClientX = null;
  let lastClientY = null;
  const isMobile = window.innerWidth < 768;

  const CONFIG = {
    count: isMobile ? 35 : 70,
    maxDist: isMobile ? 100 : 130,
    mouseDist: isMobile ? 140 : 180,
    speed: 0.5,
    radius: 2.5,
    blur: isMobile ? 6 : 10,
    color: "0, 200, 255",
  };

  const maxDistSq = CONFIG.maxDist * CONFIG.maxDist;
  const mouseDistSq = CONFIG.mouseDist * CONFIG.mouseDist;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const newWidth = Math.round(rect.width);
    const newHeight = Math.round(rect.height);
    if (newWidth === 0 || newHeight === 0) return;

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      const oldW = width || newWidth;
      const oldH = height || newHeight;
      canvas.width = newWidth;
      canvas.height = newHeight;
      width = newWidth;
      height = newHeight;

      if (particles.length === 0) {
        createParticles();
      } else {
        const scaleX = newWidth / oldW;
        const scaleY = newHeight / oldH;
        for (let i = 0; i < particles.length; i++) {
          particles[i].x = Math.max(
            0,
            Math.min(newWidth, particles[i].x * scaleX),
          );
          particles[i].y = Math.max(
            0,
            Math.min(newHeight, particles[i].y * scaleY),
          );
        }
      }
    }
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

  function draw(timestamp) {
    if (!running) return;

    const dt = lastTime ? Math.min((timestamp - lastTime) / 16.667, 2) : 1;
    lastTime = timestamp;

    ctx.clearRect(0, 0, width, height);

    // 1. Atualizar e desenhar os pontos neon (em lote para alta performance)
    ctx.fillStyle = `rgb(${CONFIG.color})`;
    ctx.shadowBlur = CONFIG.blur;
    ctx.shadowColor = `rgb(${CONFIG.color})`;
    ctx.beginPath();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.moveTo(p.x + CONFIG.radius, p.y);
      ctx.arc(p.x, p.y, CONFIG.radius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.shadowBlur = 0; // Desativa blur para desenhar as linhas com alto FPS

    // 2. Linhas conectando partículas entre si
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      const pi = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const pj = particles[j];
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const opacity = (1 - dist / CONFIG.maxDist) * 0.45;
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = `rgba(${CONFIG.color}, ${opacity.toFixed(2)})`;
          ctx.stroke();
        }
      }
    }

    // 3. Linhas conectando ao mouse (com precisão milimétrica nas coordenadas)
    if (pointer.x !== null && pointer.y !== null) {
      ctx.lineWidth = 1.2;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < mouseDistSq) {
          const dist = Math.sqrt(distSq);
          const opacity = 1 - dist / CONFIG.mouseDist;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(${CONFIG.color}, ${opacity.toFixed(2)})`;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = 0;
    rafId = requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function updatePointer(clientX, clientY) {
    lastClientX = clientX;
    lastClientY = clientY;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Mapeamento exato de coordenadas da viewport para os pixels internos do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;

    // Conecta somente se o ponteiro estiver dentro da área visível do canvas do hero
    if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
      pointer.x = px;
      pointer.y = py;
    } else {
      pointer.x = null;
      pointer.y = null;
    }
  }

  window.addEventListener(
    "mousemove",
    (e) => updatePointer(e.clientX, e.clientY),
    { passive: true },
  );

  window.addEventListener(
    "scroll",
    () => {
      if (lastClientX !== null && lastClientY !== null) {
        updatePointer(lastClientX, lastClientY);
      }
    },
    { passive: true },
  );

  window.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget && !e.toElement) {
      lastClientX = null;
      lastClientY = null;
      pointer.x = null;
      pointer.y = null;
    }
  });

  window.addEventListener("resize", () => {
    resize();
  });

  // Observa qualquer redimensionamento ou reflow dinâmico (inclusive durante efeito de digitação)
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      resize();
      if (lastClientX !== null && lastClientY !== null) {
        updatePointer(lastClientX, lastClientY);
      }
    });
    ro.observe(canvas);
  }

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

  let tlzTicking = false;
  function drawLines() {
    if (tlzTicking) return;
    tlzTicking = true;
    requestAnimationFrame(() => {
      tlzTicking = false;
      svg.querySelectorAll(".tlz-link-line").forEach((l) => l.remove());
      const bRect = builder.getBoundingClientRect();
      const cRect = core.getBoundingClientRect();
      if (!bRect.width || !cRect.width) return;
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
    });
  }

  window.addEventListener("load", drawLines);
  window.addEventListener("resize", drawLines, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(drawLines).observe(builder);
  }
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

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        setTimeout(type, 300),
      );
    } else {
      setTimeout(type, 300);
    }
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

// ==========================================
// CARROSSEL DUPLO SOBREPOSTO: SOFTWARES SOB DEMANDA
// ==========================================

(function () {
  const stage = document.getElementById("softwaresStage");
  if (!stage) return;

  const cardFront = document.getElementById("softCardFront");
  const cardBack = document.getElementById("softCardBack");
  const frontWebp = document.getElementById("softFrontWebp");
  const frontImg = document.getElementById("softFrontImg");
  const backWebp = document.getElementById("softBackWebp");
  const backImg = document.getElementById("softBackImg");
  const frontUrl = document.getElementById("softFrontUrl");
  const backUrl = document.getElementById("softBackUrl");
  const frontStatus = document.getElementById("softFrontStatus");

  const badgeEl = document.getElementById("softBadge");
  const indexBadgeEl = document.getElementById("softIndexBadge");
  const titleEl = document.getElementById("softTitle");
  const descEl = document.getElementById("softDesc");
  const tagsEl = document.getElementById("softTags");
  const demoLinkEl = document.getElementById("softDemoLink");
  const demoLabelEl = document.getElementById("softDemoLabel");

  const prevBtn = document.getElementById("softPrevBtn");
  const nextBtn = document.getElementById("softNextBtn");
  const pills = document.querySelectorAll(".soft-pill");
  const progressBar = document.getElementById("softProgressBar");

  const softwareItems = [
    {
      title: "Datacenter Panic",
      badge: "Simulação & Game Corporativo",
      url: "tolazzai://apps/datacenterpanic",
      status: "Ao Vivo",
      desc: "Aplicação web gamificada de dedução social e cibersegurança em tempo real. Desenvolvida para treinamento corporativo, simulação de incidentes de rede, telemetria NOC e agentes de IA autônomos integrados.",
      tags: [
        "WebSockets Tempo Real",
        "Bots IA Autônomos",
        "Gamificação Corporativa",
        "Multiplayer Web",
      ],
      demoUrl: "https://datacenterpanic.tolazzai.com.br",
      demoLabel: "Jogar Demonstração",
      isExternal: true,
      imgWebp: "img/softwaresImg/datacenterpanic.webp",
      imgPng: "img/softwaresImg/datacenterpanic.png",
      alt: "Datacenter Panic - Software TolazzAI",
    },
    {
      title: "IALuísio Mayer",
      badge: "Recriação das Memórias de Fundador de Escola",
      url: "tolazzai://apps/ialuisio",
      status: "Sob Medida",
      desc: "Recriação das memórias do fundador da escola, Aluísio Mayer, em formato de Chat IA para uso educacional e cultural.",
      tags: ["IA", "Memórias", "Chat", "Linguagem"],
      demoUrl: "#contato",
      demoLabel: "Solicitar Projeto Semelhante",
      isExternal: false,
      imgWebp: "img/softwaresImg/IAluisio.webp",
      imgPng: "img/softwaresImg/IAluisio.png",
      alt: "IALuísio Mayer - Software TolazzAI",
    },
    {
      title: "Prompt Auction",
      badge: "Marketplace & Leilão de IA",
      url: "tolazzai://apps/promptauction",
      status: "Ao Vivo",
      desc: "Plataforma web sob medida de marketplace e leilão gamificado de prompts para Inteligência Artificial. Conta com pontuação dinâmica, avaliação de acurácia de prompts e rankings em tempo real.",
      tags: [
        "Arquitetura Web Moderna",
        "Sistema de Leilão",
        "Benchmarking de IA",
        "Ranking em Tempo Real",
      ],
      demoUrl: "https://promptauction.tolazzai.com.br",
      demoLabel: "Acessar Plataforma",
      isExternal: true,
      imgWebp: "img/softwaresImg/promptauction.webp",
      imgPng: "img/softwaresImg/promptauction.png",
      alt: "Prompt Auction - Software TolazzAI",
    },
    {
      title: "Reservas LDS",
      badge: "Gestão & Agendamento de Recursos",
      url: "tolazzai://apps/reservaslds",
      status: "Sob Medida",
      desc: "Software corporativo completo desenvolvido sob medida para agendamento e gerenciamento de salas, capelas e recursos comunitários. Elimina conflitos de horários e centraliza permissões por perfil.",
      tags: [
        "Calendário Dinâmico",
        "Controle de Conflitos",
        "Gestão Multi-espaços",
        "Controle de Acesso RBAC",
      ],
      demoUrl: "#contato",
      demoLabel: "Solicitar Projeto Semelhante",
      isExternal: false,
      imgWebp: "img/softwaresImg/reservasLDS.webp",
      imgPng: "img/softwaresImg/reservasLDS.png",
      alt: "Reservas LDS - Software TolazzAI",
    },
  ];

  let currentIndex = 0;
  const count = softwareItems.length;
  let isPaused = false;
  let progress = 0;
  const duration = 5000; // 5s por slide
  const interval = 50;

  function render(index, animate = true) {
    currentIndex = (index + count) % count;
    const nextIndex = (currentIndex + 1) % count;

    const currentItem = softwareItems[currentIndex];
    const nextItem = softwareItems[nextIndex];

    if (animate) {
      if (cardFront) cardFront.classList.add("is-switching");
      if (cardBack) cardBack.classList.add("is-switching");
    }

    setTimeout(
      () => {
        // Atualiza card da frente
        if (frontWebp) frontWebp.srcset = currentItem.imgWebp;
        if (frontImg) {
          frontImg.src = currentItem.imgPng;
          frontImg.alt = currentItem.alt;
        }
        if (frontUrl) frontUrl.textContent = currentItem.url;
        if (frontStatus) frontStatus.textContent = currentItem.status;

        // Atualiza card de trás (segunda imagem sobreposta)
        if (backWebp) backWebp.srcset = nextItem.imgWebp;
        if (backImg) {
          backImg.src = nextItem.imgPng;
          backImg.alt = nextItem.alt;
        }
        if (backUrl) backUrl.textContent = nextItem.url;

        // Atualiza painel de detalhes do projeto
        if (badgeEl) badgeEl.textContent = currentItem.badge;
        if (indexBadgeEl) {
          indexBadgeEl.textContent = `0${currentIndex + 1} / 0${count}`;
        }
        if (titleEl) titleEl.textContent = currentItem.title;
        if (descEl) descEl.textContent = currentItem.desc;

        if (tagsEl) {
          tagsEl.innerHTML = currentItem.tags
            .map(
              (t) =>
                `<span class="inline-flex items-center text-[0.72rem] font-body px-2.5 py-1 rounded bg-white/5 border border-white/10 text-txt-gray">${t}</span>`,
            )
            .join("");
        }

        if (demoLinkEl) {
          demoLinkEl.href = currentItem.demoUrl;
          if (currentItem.isExternal) {
            demoLinkEl.setAttribute("target", "_blank");
            demoLinkEl.setAttribute("rel", "noopener noreferrer");
          } else {
            demoLinkEl.removeAttribute("target");
            demoLinkEl.removeAttribute("rel");
          }
        }
        if (demoLabelEl) demoLabelEl.textContent = currentItem.demoLabel;

        // Atualiza pills
        pills.forEach((p, idx) => {
          const isActive = idx === currentIndex;
          p.classList.toggle("active", isActive);
          const dot = p.querySelector("span");
          if (dot) {
            if (isActive) {
              dot.className = "w-1.5 h-1.5 rounded-full bg-cyan-neon";
            } else {
              dot.className =
                "w-1.5 h-1.5 rounded-full bg-transparent border border-txt-dim";
            }
          }
        });

        if (animate) {
          setTimeout(() => {
            if (cardFront) cardFront.classList.remove("is-switching");
            if (cardBack) cardBack.classList.remove("is-switching");
          }, 60);
        }
      },
      animate ? 180 : 0,
    );

    progress = 0;
    if (progressBar) progressBar.style.width = "0%";
  }

  function next() {
    render(currentIndex + 1);
  }

  function prev() {
    render(currentIndex - 1);
  }

  // Controles
  if (nextBtn) nextBtn.addEventListener("click", () => next());
  if (prevBtn) prevBtn.addEventListener("click", () => prev());

  // Clique no card de trás avança diretamente para ele
  if (cardBack) {
    cardBack.addEventListener("click", () => next());
  }

  // Clique nos pills
  pills.forEach((p) => {
    p.addEventListener("click", () => {
      const idx = parseInt(p.getAttribute("data-index"), 10);
      if (!isNaN(idx) && idx !== currentIndex) {
        render(idx);
      }
    });
  });

  // Pausa ao passar o mouse ou focar
  const pauseEls = [stage, document.getElementById("softwares")];
  pauseEls.forEach((el) => {
    if (!el) return;
    el.addEventListener("mouseenter", () => {
      isPaused = true;
    });
    el.addEventListener("mouseleave", () => {
      isPaused = false;
    });
  });

  // Suporte a swipe em mobile
  let touchStartX = 0;
  let touchEndX = 0;
  stage.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isPaused = true;
    },
    { passive: true },
  );

  stage.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      isPaused = false;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) next();
        else prev();
      }
    },
    { passive: true },
  );

  // Autoplay apenas quando visível na tela
  let isSectionVisible = false;
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isSectionVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(stage);
  } else {
    isSectionVisible = true;
  }

  setInterval(() => {
    if (!isPaused && isSectionVisible) {
      progress += (interval / duration) * 100;
      if (progressBar) {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
      }
      if (progress >= 100) {
        next();
      }
    }
  }, interval);

  // Render inicial
  render(0, false);
})();
