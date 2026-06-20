/* =========================================================
   ALTONICS / TOLLAZAI — script.js
   Menu mobile + Navbar scroll + Animações + Scroll suave
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 1. MENU MOBILE (abrir/fechar) ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      navToggle.classList.toggle("active");
    });

    // Fecha o menu ao clicar em um link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.classList.remove("active");
      });
    });

    // Fecha o menu ao clicar fora dele
    document.addEventListener("click", (e) => {
      const clicouDentro =
        navLinks.contains(e.target) || navToggle.contains(e.target);
      if (!clicouDentro) {
        navLinks.classList.remove("open");
        navToggle.classList.remove("active");
      }
    });
  }

  /* ---------- 2. NAVBAR COM FUNDO AO ROLAR ---------- */
  const navbar = document.getElementById("navbar");

  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 30) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll(); // executa uma vez ao carregar
  }

  /* ---------- 3. SCROLL SUAVE PARA ÂNCORAS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId.length < 2) return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80; // compensa a altura da navbar fixa
        const top =
          target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  /* ---------- 4. ANIMAÇÃO DE ENTRADA (reveal on scroll) ---------- */
  const animTargets = document.querySelectorAll(
    ".pain-card, .card, .flow-step, .plan, .founder-photo, .founder > div, .faq-item, .product-feature, .section-head",
  );

  // Prepara os elementos
  animTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // pequeno atraso escalonado para um efeito mais elegante
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, index * 80);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );

    animTargets.forEach((el) => observer.observe(el));
  } else {
    // Fallback: navegadores antigos exibem tudo direto
    animTargets.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- 5. ANO DINÂMICO NO FOOTER (opcional) ---------- */
  document.querySelectorAll(".footer-bottom p").forEach((p) => {
    p.innerHTML = p.innerHTML.replace(
      /©\s*\d{4}/,
      `© ${new Date().getFullYear()}`,
    );
  });
});

/* ---------- 6. PARTÍCULAS NO HERO ---------- */
window.addEventListener("load", async () => {
  if (window.tsParticles) {
    await tsParticles.load({
      id: "particles-canvas",
      options: {
        fullScreen: { enable: false }, // ESSENCIAL: senão ele ocupa a tela toda fixo
        fpsLimit: 60,
        interactivity: {
          detectsOn: "window",
          events: {
            onHover: { enable: true, mode: "repulse" },
            resize: true,
          },
          modes: { repulse: { distance: 120, duration: 0.4 } },
        },
        particles: {
          color: { value: "#22d3ee" },
          links: {
            enable: true,
            color: "#22d3ee",
            distance: 120,
            opacity: 0.35,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1,
            outModes: { default: "bounce" },
          },
          number: { value: 50, density: { enable: true, area: 800 } },
          opacity: { value: 0.4 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      },
    });
  }
});
