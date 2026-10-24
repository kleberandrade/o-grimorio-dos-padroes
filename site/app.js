'use strict';
(() => {
  const grid = document.querySelector('#project-grid');
  const search = document.querySelector('#project-search');
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#no-results');
  const error = document.querySelector('#catalog-error');
  let projects = [];
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const originPath = path => path.startsWith('/') ? path : `/${path}`;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function projectCard(project) {
    const card = el('article', 'project-card');
    const href = `/projeto.html?id=${encodeURIComponent(project.id)}`;
    const headingId = `pattern-${project.number}`;
    card.setAttribute('aria-labelledby', headingId);
    if (project.art?.url) {
      const art = el('a', 'card-art');
      art.href = href;
      art.tabIndex = -1;
      art.setAttribute('aria-hidden', 'true');
      const image = document.createElement('img');
      image.src = originPath(project.art.url);
      image.alt = '';
      image.loading = 'lazy';
      image.width = 800;
      image.height = 450;
      art.append(image);
      card.append(art);
    }
    const top = el('div', 'card-top');
    top.append(el('span', 'card-number', project.number), el('span', 'card-category', project.category));
    const title = el('h3', '', project.name);
    title.id = headingId;
    const actions = el('div', 'card-actions');
    const open = el('a', 'card-open', 'Estudar padrão');
    open.href = href;
    open.setAttribute('aria-label', `Estudar ${project.name}: fundamentos, código, diagrama e exercício`);
    const arrow = el('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    open.append(arrow);
    const chapters = el('span', 'card-chapters', 'Código · Diagrama');
    actions.append(open, chapters);
    card.append(top, title, el('p', '', project.description), actions);
    return card;
  }
  function renderProjects() {
    const category = document.querySelector('input[name="category"]:checked').value;
    const query = normalize(search.value.trim());
    const filtered = projects.filter(project => (category === 'Todos' || project.category === category) && normalize(`${project.number} ${project.name} ${project.description} ${project.category}`).includes(query));
    grid.replaceChildren(...filtered.map(projectCard));
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'padrão encontrado' : 'padrões encontrados'}${category !== 'Todos' ? ` · ${category}` : ''}`;
    empty.hidden = filtered.length !== 0;
  }
  async function loadProjects() {
    error.hidden = true;
    empty.hidden = true;
    grid.setAttribute('aria-busy', 'true');
    count.textContent = 'Abrindo o índice do grimório…';
    try {
      const response = await fetch('/projetos.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Índice indisponível');
      const data = await response.json();
      if (!Array.isArray(data) || !data.length || data.some(project => !project.id || !project.name || !Array.isArray(project.files))) throw new Error('Índice inválido');
      projects = data;
      renderProjects();
    } catch (cause) {
      grid.replaceChildren();
      count.textContent = 'Índice indisponível no momento.';
      error.hidden = false;
    } finally { grid.setAttribute('aria-busy', 'false'); }
  }
  search.addEventListener('input', renderProjects);
  document.querySelectorAll('input[name="category"]').forEach(input => input.addEventListener('change', renderProjects));
  document.querySelector('#retry-projects').addEventListener('click', loadProjects);
  loadProjects();
})();
