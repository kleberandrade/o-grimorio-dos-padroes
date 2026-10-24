'use strict';
(() => {
  const carousel = document.querySelector('.saga-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.saga-slide')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const play = document.querySelector('#saga-play');
  const status = document.querySelector('#saga-status');
  const dots = [...carousel.querySelectorAll('.saga-dot')];
  let current = 0;
  let timer;
  let userPaused = false;
  let playing = !preference.matches;
  let inView = false;
  let purchaseHovered = false;
  let gesture = null;
  let suppressClick = false;
  function render(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, n) => {
      const active = n === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    dots.forEach((dot, n) => dot.setAttribute('aria-current', String(n === current)));
    status.textContent = `Livro ${current + 1} de ${slides.length}: ${slides[current].querySelector('h3').textContent}`;
    // Prepare only the next cover before the automatic transition.
    slides[(current + 1) % slides.length].querySelector('img').loading = 'eager';
  }
  function syncPlayback() {
    clearTimeout(timer);
    play.textContent = playing ? 'Pausar' : 'Reproduzir';
    play.setAttribute('aria-pressed', String(playing));
    play.setAttribute('aria-label', playing ? 'Pausar troca automática de livros' : 'Reproduzir troca automática de livros');
    status.setAttribute('aria-live', playing ? 'off' : 'polite');
    const readingWithKeyboard = slides.some(slide => slide.contains(document.activeElement));
    if (playing && inView && !gesture && !purchaseHovered && !document.hidden && !readingWithKeyboard) {
      timer = setTimeout(() => { render(current + 1); syncPlayback(); }, 8000);
    }
  }
  // Horizontal touch/pen gestures use the existing synchronized transition.
  // pan-y preserves normal vertical scrolling and pinch zoom.
  const stage = carousel.querySelector('.saga-stage');
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || !event.isPrimary || event.target.closest('a, button, input, select')) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0, horizontal: false };
    syncPlayback();
  });
  stage.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    gesture.dx = event.clientX - gesture.x;
    gesture.dy = event.clientY - gesture.y;
    if (!gesture.horizontal && Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.3) {
      gesture.horizontal = true;
      stage.setPointerCapture(event.pointerId);
    }
  });
  function finishGesture(event, cancelled = false) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const finished = gesture;
    gesture = null;
    const threshold = Math.max(38, Math.min(70, stage.clientWidth * 0.12));
    if (!cancelled && finished.horizontal && Math.abs(finished.dx) >= threshold && Math.abs(finished.dx) > Math.abs(finished.dy) * 1.3) {
      render(current + (finished.dx < 0 ? 1 : -1));
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
    }
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    syncPlayback();
  }
  stage.addEventListener('pointerup', event => finishGesture(event));
  stage.addEventListener('pointercancel', event => finishGesture(event, true));
  stage.addEventListener('lostpointercapture', event => finishGesture(event, true));
  stage.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); } }, true);
  document.querySelector('#saga-prev').addEventListener('click', () => { render(current - 1); syncPlayback(); });
  document.querySelector('#saga-next').addEventListener('click', () => { render(current + 1); syncPlayback(); });
  dots.forEach((dot, n) => dot.addEventListener('click', () => { render(n); syncPlayback(); }));
  play.addEventListener('click', () => { playing = !playing; userPaused = !playing; syncPlayback(); });
  carousel.querySelectorAll('.saga-copy .button').forEach(link => {
    link.addEventListener('mouseenter', () => { purchaseHovered = true; syncPlayback(); });
    link.addEventListener('mouseleave', () => { purchaseHovered = false; syncPlayback(); });
  });
  carousel.addEventListener('focusin', syncPlayback);
  carousel.addEventListener('focusout', () => requestAnimationFrame(syncPlayback));
  document.addEventListener('visibilitychange', syncPlayback);
  preference.addEventListener('change', () => { playing = !preference.matches && !userPaused; syncPlayback(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncPlayback(); }, {threshold:0.15}).observe(carousel);
  else inView = true;
  carousel.classList.add('is-enhanced');
  carousel.querySelector('.saga-controls').hidden = false;
  carousel.querySelector('.saga-arrows').hidden = false;
  render(0);
  syncPlayback();
  window.addEventListener('pagehide', () => clearTimeout(timer));
  window.addEventListener('pageshow', syncPlayback);
})();
