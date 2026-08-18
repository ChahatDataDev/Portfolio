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
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
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
