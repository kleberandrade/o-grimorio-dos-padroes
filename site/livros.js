'use strict';
(() => {
  const carousel = document.querySelector('.saga-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.saga-slide')];
  const choices = [...carousel.querySelectorAll('[data-book]')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const play = document.querySelector('#saga-play');
  const count = document.querySelector('#saga-count');
  let current = 0;
  let timer;
  let playing = false;
  let inView = false;
  let hovering = false;
  function render(index, manual = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, n) => { slide.hidden = n !== current; });
    choices.forEach((button, n) => button.setAttribute('aria-pressed', String(n === current)));
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')} · ${slides[current].querySelector('h3').textContent}`;
    if (manual) { playing = false; syncPlayback(); }
  }
  function syncPlayback() {
    clearInterval(timer);
    play.textContent = playing ? 'Pausar' : 'Reproduzir';
    play.setAttribute('aria-pressed', String(playing));
    count.setAttribute('aria-live', playing ? 'off' : 'polite');
    if (playing && inView && !hovering && !document.hidden && (!carousel.contains(document.activeElement) || document.activeElement === play)) timer = setInterval(() => render(current + 1), 9000);
  }
  document.querySelector('#saga-prev').addEventListener('click', () => render(current - 1, true));
  document.querySelector('#saga-next').addEventListener('click', () => render(current + 1, true));
  choices.forEach((button, n) => button.addEventListener('click', () => render(n, true)));
  play.addEventListener('click', () => { playing = !playing; syncPlayback(); });
  carousel.addEventListener('keydown', event => {
    // Preserve arrow keys on native controls and links. Thumbnail navigation uses roving focus.
    const choice = event.target.closest('[data-book]');
    if (!choice || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : (current + (event.key === 'ArrowLeft' ? -1 : 1) + slides.length) % slides.length;
    render(target, true); choices[target].focus();
  });
  carousel.querySelector('.saga-stage').addEventListener('mouseenter', () => { hovering = true; syncPlayback(); });
  carousel.querySelector('.saga-stage').addEventListener('mouseleave', () => { hovering = false; syncPlayback(); });
  carousel.addEventListener('focusin', syncPlayback);
  carousel.addEventListener('focusout', () => requestAnimationFrame(syncPlayback));
  document.addEventListener('visibilitychange', syncPlayback);
  preference.addEventListener('change', () => { if (preference.matches) playing = false; syncPlayback(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncPlayback(); }, {threshold:0.15}).observe(carousel);
  else inView = true;
  carousel.classList.add('is-enhanced');
  carousel.querySelector('.saga-controls').hidden = false;
  carousel.querySelector('.saga-thumbnails').hidden = false;
  render(0);
  window.addEventListener('pagehide', () => clearInterval(timer));
})();
