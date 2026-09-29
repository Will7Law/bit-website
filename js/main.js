/**
 * ============================================================
 * BIT GUYANA — Main JavaScript Engine
 * Board of Industrial Training | Est. 1909
 *
 * Powers: Navigation, Scroll Effects, Animated Counters,
 *         Accordions, Mobile Menu, Reveal Animations,
 *         Scroll-to-Top, Header Shadow
 * ============================================================
 */

(function () {
  'use strict';

  // ── DOM Ready ────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileMenu();
    initStickyHeader();
    initScrollToTop();
    initRevealAnimations();
    initCounters();
    initAccordions();
    initSmoothScroll();
    initActiveNav();
  }

  // ── Mobile Menu Toggle ───────────────────────────────────
  function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      this.classList.toggle('active');
      nav.classList.toggle('mobile-open');
      document.body.style.overflow = nav.classList.contains('mobile-open') ? 'hidden' : '';
    });

    // Close on nav link click
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (nav.classList.contains('mobile-open')) {
          toggle.classList.remove('active');
          nav.classList.remove('mobile-open');
          document.body.style.overflow = '';
        }
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('mobile-open')) {
        toggle.classList.remove('active');
        nav.classList.remove('mobile-open');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Sticky Header with Shadow ────────────────────────────
  function initStickyHeader() {
    var header = document.getElementById('header');
    if (!header) return;

    var lastScroll = 0;

    window.addEventListener('scroll', function () {
      var scrollY = window.pageYOffset;

      // Add shadow on scroll
      if (scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = scrollY;
    }, { passive: true });
  }

  // ── Scroll to Top Button ─────────────────────────────────
  function initScrollToTop() {
    var btn = document.getElementById('scrollTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Reveal on Scroll (Intersection Observer) ─────────────
  function initRevealAnimations() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all immediately
      reveals.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── Animated Counters ────────────────────────────────────
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        el.textContent = formatNumber(parseInt(el.dataset.count)) + (el.dataset.suffix || '');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var duration = 2000;
    var startTime = null;
    var startValue = 0;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutQuart(progress);
      var current = Math.floor(startValue + (target - startValue) * easedProgress);

      el.textContent = formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function formatNumber(num) {
    if (num >= 1000) {
      return num.toLocaleString('en-US');
    }
    return num.toString();
  }

  // ── Accordion / FAQ ──────────────────────────────────────
  function initAccordions() {
    // Global toggle function
    window.toggleAccordion = function (header) {
      var item = header.parentElement;
      var body = item.querySelector('.accordion-body');
      var isActive = item.classList.contains('active');

      // Close all siblings in same parent
      var siblings = item.parentElement.querySelectorAll('.accordion-item');
      siblings.forEach(function (sib) {
        sib.classList.remove('active');
        var sibBody = sib.querySelector('.accordion-body');
        if (sibBody) sibBody.style.maxHeight = null;
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    };
  }

  // ── Smooth Scroll for Anchor Links ───────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ── Active Nav Highlighting ──────────────────────────────
  function initActiveNav() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.main-nav a, .dropdown-menu a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      var linkPage = href.split('/').pop().split('?')[0];

      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }

  // ── Lazy-load fallback for legacy markup ─────────────────
  // Some images on older pages used data-src + an empty src to defer
  // loading. Native loading="lazy" handles deferral on its own, so this
  // wedge only acts when a real data-src is present — otherwise it
  // would clobber valid src attributes with `undefined`.
  document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    if (img.dataset && img.dataset.src) {
      img.src = img.dataset.src;
    }
  });

})();
