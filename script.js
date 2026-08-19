/* =========================================================
   IDEN Solution — Portfolio Scripts
   ========================================================= */

(function () {
  'use strict';

  // Elements
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const revealElements = document.querySelectorAll('.reveal');
  const statNumbers = document.querySelectorAll('.stat-number');
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const yearSpan = document.getElementById('year');

  // Update copyright year
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Navbar scroll effect
  function handleScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      const open = menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Reveal on scroll
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // Trigger hero elements immediately
  document.querySelectorAll('.hero .reveal').forEach(function (el) {
    el.classList.add('active');
  });

  // Counter animation
  function animateCounter(element) {
    const target = parseInt(element.dataset.target, 10);
    if (!target || Number.isNaN(target)) return;

    const duration = 2000;
    const startTime = performance.now();
    const suffix = element.textContent.replace(/[0-9]/g, '') || '';

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * target);
      element.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(function (stat) {
    counterObserver.observe(stat);
  });

  // Contact form handling
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = formData.get('name')?.toString().trim();
      const email = formData.get('email')?.toString().trim();
      const service = formData.get('service')?.toString();
      const message = formData.get('message')?.toString().trim();

      if (!name || !email || !service || !message) {
        showStatus('Please fill out all fields.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }

      // Build mailto link so the user can send from their own email client
      const subject = encodeURIComponent('New Project Inquiry from ' + name);
      const body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Service: ' + service + '\n\n' +
        'Project Details:\n' + message
      );
      const mailtoLink = 'mailto:hello@idensolution.com?subject=' + subject + '&body=' + body;

      window.location.href = mailtoLink;

      showStatus('Opening your email app with the project details...', 'success');
      contactForm.reset();
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = 'form-status ' + type;

    setTimeout(function () {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }, 5000);
  }

  // Smooth scroll for anchor links (fallback for older browsers)
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // Add slight parallax to hero orbs on mouse move
  const hero = document.querySelector('.hero');
  if (hero && !window.matchMedia('(pointer: coarse)').matches) {
    hero.addEventListener('mousemove', function (event) {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 30;
      const y = (clientY / innerHeight - 0.5) * 30;

      document.querySelectorAll('.floating-card').forEach(function (card, index) {
        const factor = (index + 1) * 0.5;
        card.style.transform = 'translate(' + x * factor + 'px, ' + y * factor + 'px)';
      });
    });
  }
})();

/* =========================================================
   Geometric particle network (canvas)
   ========================================================= */
(function () {
  'use strict';

  const canvas = document.getElementById('geo-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const colors = ['#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'];
  let w = 0, h = 0, dpr = 1, nodes = [], raf = null;

  function nodeCount() {
    return Math.min(60, Math.max(18, Math.round(window.innerWidth / 26)));
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    nodes = [];
    const total = nodeCount();
    for (let i = 0; i < total; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        size: 3 + Math.random() * 5,
        sides: 3 + Math.floor(Math.random() * 4),
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
        color: colors[i % colors.length]
      });
    }
  }

  function polygon(n) {
    ctx.beginPath();
    for (let i = 0; i < n.sides; i++) {
      const a = n.angle + (i * 2 * Math.PI) / n.sides;
      const px = n.x + Math.cos(a) * n.size;
      const py = n.y + Math.sin(a) * n.size;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx;
      a.y += a.vy;
      a.angle += a.spin;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          ctx.strokeStyle = a.color;
          ctx.globalAlpha = (1 - dist / 130) * 0.22;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1.4;
      polygon(a);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    build();
    frame();
  }

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(start, 200);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    } else if (!raf) {
      frame();
    }
  });

  start();
})();
