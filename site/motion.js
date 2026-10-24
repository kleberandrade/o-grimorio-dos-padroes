'use strict';
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  let cardsObserver;
  const selector = '.section-intro, .about-copy, .catalog-heading, .catalog-controls, .project-card, .start-copy, .terminal-card, .author-inner, .study-section-heading, .study-diagram, .study-run';
  function prepare(root = document) {
    if (!observer) return;
    const nodes = root.matches?.(selector) ? [root, ...root.querySelectorAll(selector)] : root.querySelectorAll(selector);
    for (const node of nodes) {
      if (node.classList.contains('reveal-ready')) continue;
      node.classList.add('reveal-ready');
      observer.observe(node);
    }
  }
  function stop() {
    observer?.disconnect(); cardsObserver?.disconnect();
    observer = null; cardsObserver = null;
    document.querySelectorAll('.reveal-ready').forEach(node => node.classList.remove('reveal-ready', 'is-revealed'));
    document.documentElement.classList.remove('motion-ready');
  }
  function start() {
    if (preference.matches || !('IntersectionObserver' in window) || observer) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    document.documentElement.classList.add('motion-ready');
    prepare();
    const dynamic = document.querySelector('#project-grid') || document.querySelector('#study-diagrams');
    if (dynamic) {
      cardsObserver = new MutationObserver(changes => {
        for (const change of changes) for (const node of change.addedNodes) if (node.nodeType === 1) prepare(node);
      });
      cardsObserver.observe(dynamic, { childList: true });
    }
  }
  preference.addEventListener('change', () => { stop(); start(); });
  document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('motion-paused', document.hidden));
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  start();
})();
