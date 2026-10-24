'use strict';
(() => {
  const carousel = document.querySelector('.saga-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.saga-slide')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const play = document.querySelector('#saga-play');
  const count = document.querySelector('#saga-count');
  let current = 0;
  let timer;
  let userPaused = false;
  let playing = !preference.matches;
  let inView = false;
  let purchaseHovered = false;
  function render(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, n) => { slide.hidden = n !== current; });
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    count.setAttribute('aria-label', `Livro ${current + 1} de ${slides.length}: ${slides[current].querySelector('h3').textContent}`);
    // Prepare only the next cover before the automatic transition.
    slides[(current + 1) % slides.length].querySelector('img').loading = 'eager';
  }
  function syncPlayback() {
    clearTimeout(timer);
    play.textContent = playing ? 'Pausar' : 'Reproduzir';
    play.setAttribute('aria-pressed', String(playing));
    play.setAttribute('aria-label', playing ? 'Pausar troca automática de livros' : 'Reproduzir troca automática de livros');
    count.setAttribute('aria-live', playing ? 'off' : 'polite');
    const readingWithKeyboard = slides.some(slide => slide.contains(document.activeElement));
    if (playing && inView && !purchaseHovered && !document.hidden && !readingWithKeyboard) {
      timer = setTimeout(() => { render(current + 1); syncPlayback(); }, 8000);
    }
  }
  document.querySelector('#saga-prev').addEventListener('click', () => { render(current - 1); syncPlayback(); });
  document.querySelector('#saga-next').addEventListener('click', () => { render(current + 1); syncPlayback(); });
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
  render(0);
  syncPlayback();
  window.addEventListener('pagehide', () => clearTimeout(timer));
  window.addEventListener('pageshow', syncPlayback);
})();
