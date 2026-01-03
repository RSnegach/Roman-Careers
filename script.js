// ===== Mobile Navigation Toggle (guarded) =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
  });

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   FORM (Formspree + GitHub Pages safe redirect)
   IMPORTANT:
   - Your form element must have: id="consultation-form"
   - Your form action must be: https://formspree.io/f/REALFORMID
   - Delete any other submit handlers (especially old Netlify UX)
============================================================ */
const consultationForm = document.getElementById('consultation-form');

if (consultationForm) {
  consultationForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevents POSTing to thank-you.html (405)

    const btn = consultationForm.querySelector('button[type="submit"]');
    const originalText = btn ? btn.textContent : 'Send';

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending…';
    }

    try {
      const res = await fetch(consultationForm.action, {
        method: 'POST',
        body: new FormData(consultationForm),
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        // Try to surface Formspree error details
        let detail = '';
        try {
          const data = await res.json();
          detail = data?.errors?.map(e => e.message).join(' ') || '';
        } catch {}
        throw new Error(`Formspree returned ${res.status}. ${detail}`.trim());
      }

      // Success: client-side redirect (free tier compatible)
      window.location.href = 'thank-you.html';
    } catch (err) {
      console.error(err);
      alert(`Submit failed: ${err.message || err}`);

      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  });
}

// ===== Count animation helper =====
function animateNumber(el, from, to, durationMs, suffix = '') {
  if (!el) return;
  const start = performance.now();
  const range = to - from;

  function step(now) {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(from + range * eased);
    el.textContent = `${value}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ===== Landing page counters (FREE version: per-browser via localStorage) =====
(function setupHeroCounters() {
  const consultationsEl = document.getElementById('consultationsCount');
  const interviewsEl = document.getElementById('interviewsCount');

  const visitsKey = 'rec_site_visits_v1';
  let visits = parseInt(localStorage.getItem(visitsKey) || '0', 10);
  visits += 1;
  localStorage.setItem(visitsKey, String(visits));

  const baseConsultations = 57;
  const consultations = baseConsultations + Math.floor(visits / 10);

  const interviews = 19;

  const currentConsult = parseInt((consultationsEl?.textContent || '0').replace(/\D/g, ''), 10) || 0;
  const currentInterviews = parseInt((interviewsEl?.textContent || '0').replace(/\D/g, ''), 10) || 0;

  animateNumber(consultationsEl, Math.min(currentConsult, consultations), consultations, 900, '+');
  animateNumber(interviewsEl, Math.min(currentInterviews, interviews), interviews, 750, '+');
})();

// ===== About slideshow =====
(function setupSlideshow() {
  const slides = Array.from(document.querySelectorAll('.slideshow .slide'));
  if (!slides.length) return;

  let idx = 0;
  const intervalMs = 3200;

  setInterval(() => {
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, intervalMs);
})();

// ===== Scroll animation (optional enhancement) =====
if ('IntersectionObserver' in window) {
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.service-card, .resource-card, .book-now-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}
