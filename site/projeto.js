'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const pathFromOrigin = path => path.startsWith('/') ? path : `/${path}`;
  const create = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  let project;
  let fileController;
  let currentText = '';
  let diagramTrigger;
  const diagramDialog = byId('diagram-dialog');

  function inline(text) {
    const fragment = document.createDocumentFragment();
    const token = /(`[^`]+`|\*\*[^*]+\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
    let offset = 0;
    for (const match of text.matchAll(token)) {
      fragment.append(document.createTextNode(text.slice(offset, match.index)));
      if (match[0].startsWith('`')) fragment.append(create('code', match[0].slice(1, -1)));
      else if (match[0].startsWith('**')) fragment.append(create('strong', match[0].slice(2, -2)));
      else {
        const a = create('a', match[2]);
        a.href = match[3];
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('aria-label', `${match[2]} (abre em outra aba)`);
        fragment.append(a);
      }
      offset = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(text.slice(offset)));
    return fragment;
  }

  function markdown(text, container) {
    // Renderiza somente elementos conhecidos. HTML e scripts do documento permanecem texto.
    const fragment = document.createDocumentFragment();
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    let paragraph = [];
    let list = null;
    let fence = null;
    const flush = () => {
      if (!paragraph.length) return;
      const p = create('p');
      p.append(inline(paragraph.join(' ')));
      fragment.append(p);
      paragraph = [];
    };
    for (const line of lines) {
      if (/^\s*```/.test(line)) {
        flush(); list = null;
        if (fence === null) fence = [];
        else {
          const pre = create('pre');
          pre.append(create('code', fence.join('\n')));
          fragment.append(pre);
          fence = null;
        }
        continue;
      }
      if (fence !== null) { fence.push(line); continue; }
      if (!line.trim()) { flush(); list = null; continue; }
      const heading = /^(#{1,6})\s+(.+)$/.exec(line);
      if (heading) {
        flush(); list = null;
        const h = create(heading[1].length > 2 ? 'h4' : 'h3');
        h.append(inline(heading[2]));
        fragment.append(h);
        continue;
      }
      if (/^\s*([-*_])\1\1+\s*$/.test(line)) { flush(); list = null; fragment.append(create('hr')); continue; }
      const bullet = /^\s*(?:([-*])|\d+[.)])\s+(.+)$/.exec(line);
      if (bullet) {
        flush();
        const kind = bullet[1] ? 'UL' : 'OL';
        if (!list || list.tagName !== kind) { list = create(kind.toLowerCase()); fragment.append(list); }
        const li = create('li'); li.append(inline(bullet[2])); list.append(li);
        continue;
      }
      list = null;
      paragraph.push(line.trim());
    }
    flush();
    if (fence !== null) { const pre = create('pre'); pre.append(create('code', fence.join('\n'))); fragment.append(pre); }
    container.replaceChildren(fragment);
  }

  async function textFile(file) {
    const response = await fetch(pathFromOrigin(file.url));
    if (!response.ok) throw new Error('Arquivo indisponível');
    return response.text();
  }

  async function renderDocument(path, target) {
    const container = byId(target);
    const file = project.files.find(item => item.path === path);
    if (!file) {
      container.textContent = 'O documento está disponível nos arquivos do projeto.';
      container.setAttribute('aria-busy', 'false');
      return;
    }
    try { markdown(await textFile(file), container); }
    catch (error) { container.textContent = 'Não foi possível abrir este documento. Consulte os arquivos do projeto ou tente recarregar a página.'; }
    finally { container.setAttribute('aria-busy', 'false'); }
  }

  function prepareFiles() {
    const groupNames = { root: 'Documentação e configuração', src: 'Implementação', test: 'Testes', exercise: 'Exercício', solution: 'Solução do exercício', evidence: 'Referências de execução' };
    const groups = new Map();
    for (const file of project.files) {
      const key = file.path.includes('/') ? file.path.split('/')[0] : 'root';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(file);
    }
    const order = ['root', 'src', 'test', 'exercise', 'solution', 'evidence'];
    const keys = [...order.filter(key => groups.has(key)), ...[...groups.keys()].filter(key => !order.includes(key))];
    byId('study-file-select').replaceChildren(...keys.map(key => {
      const group = create('optgroup'); group.label = groupNames[key] || key;
      for (const file of groups.get(key)) {
        const option = create('option', file.path); option.value = file.path; group.append(option);
      }
      return group;
    }));
    const main = project.files.find(file => file.path === 'src/main.ts');
    const implementation = project.files.find(file => file.path.startsWith('src/') && file.path !== 'src/main.ts' && !/contratos?\.ts$/.test(file.path));
    const tests = project.files.find(file => file.path.startsWith('test/') && file.path.endsWith('.ts'));
    const readme = project.files.find(file => file.path === 'README.md');
    const shortcuts = [main, implementation, tests, readme].filter(Boolean);
    byId('study-file-shortcuts').replaceChildren(...shortcuts.map(file => {
      const button = create('button', file.path); button.type = 'button'; button.dataset.path = file.path;
      button.addEventListener('click', () => selectFile(file.path));
      return button;
    }));
    const initial = main || readme || project.files[0];
    if (initial) selectFile(initial.path);
    byId('study-file-select').addEventListener('change', event => selectFile(event.target.value));
  }

  async function selectFile(path, scroll = false) {
    const file = project.files.find(item => item.path === path);
    if (!file) return;
    if (fileController) fileController.abort();
    fileController = new AbortController();
    const controller = fileController;
    currentText = '';
    byId('study-file-select').value = path;
    byId('study-file-path').textContent = path;
    byId('study-file-kind').textContent = path.endsWith('.ts') ? 'TypeScript' : path.endsWith('.mmd') ? 'Mermaid' : 'Texto';
    byId('study-copy').disabled = true;
    byId('study-copy').textContent = 'Copiar código';
    byId('study-code-text').textContent = 'Abrindo arquivo…';
    byId('study-code').classList.toggle('is-prose', /\.(md|txt)$/i.test(path));
    byId('study-code').setAttribute('aria-busy', 'true');
    byId('study-code').scrollTop = 0;
    byId('study-code').scrollLeft = 0;
    byId('study-code-status').textContent = 'Carregando arquivo…';
    document.querySelectorAll('#study-file-shortcuts button').forEach(button => {
      const active = button.dataset.path === path;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (scroll) byId('codigo').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    try {
      const response = await fetch(pathFromOrigin(file.url), { signal: controller.signal });
      if (!response.ok) throw new Error('Arquivo indisponível');
      const text = await response.text();
      if (controller.signal.aborted) return;
      currentText = text;
      byId('study-code-text').textContent = text;
      byId('study-copy').disabled = false;
      byId('study-code-status').textContent = `${text.split('\n').length} linhas · conteúdo original do projeto · execução local com Node e npm`;
    } catch (error) {
      if (error.name === 'AbortError') return;
      byId('study-code-text').textContent = 'Não foi possível abrir este arquivo. Selecione outro ou tente recarregar a página.';
      byId('study-code-status').textContent = 'Arquivo indisponível no momento.';
    } finally { if (!controller.signal.aborted) byId('study-code').setAttribute('aria-busy', 'false'); }
  }

  function renderDiagrams() {
    byId('study-diagrams').replaceChildren();
    const diagrams = Array.isArray(project.diagrams) ? project.diagrams : [];
    if (!diagrams.length) byId('study-diagrams').append(create('p', 'As relações do projeto podem ser consultadas na fonte Mermaid, nos arquivos do código.'));
    for (const [index, diagram] of diagrams.entries()) {
      const figure = create('figure', undefined, 'study-diagram');
      const button = create('button'); button.type = 'button';
      button.setAttribute('aria-label', `Ampliar diagrama: ${diagram.title}`);
      button.setAttribute('aria-haspopup', 'dialog');
      const image = create('img'); image.src = pathFromOrigin(diagram.url); image.alt = diagram.alt || diagram.title; image.loading = 'lazy';
      button.append(image);
      button.addEventListener('click', () => {
        diagramTrigger = button;
        byId('diagram-dialog-title').textContent = diagram.title;
        byId('diagram-dialog-image').src = pathFromOrigin(diagram.url);
        byId('diagram-dialog-image').alt = diagram.alt || diagram.title;
        byId('diagram-new-tab').href = pathFromOrigin(diagram.url);
        diagramDialog.showModal();
        byId('close-diagram').focus();
      });
      const caption = create('figcaption');
      caption.append(create('span', `${String(index + 1).padStart(2, '0')} · ${diagram.title}`), create('span', 'Ampliar ↗'));
      figure.append(button, caption);
      if (diagram.description) figure.append(create('p', diagram.description, 'study-diagram-description'));
      byId('study-diagrams').append(figure);
    }
    const source = project.files.find(file => file.path === 'diagram.mmd');
    if (source) { byId('show-diagram-source').hidden = false; byId('show-diagram-source').addEventListener('click', () => selectFile(source.path, true)); }
  }

  function pagination(data) {
    const index = data.findIndex(item => item.id === project.id);
    for (const [id, item] of [['previous-project', data[index - 1]], ['next-project', data[index + 1]]]) {
      if (!item) continue;
      byId(id).hidden = false;
      byId(id).href = `/padroes/${encodeURIComponent(item.id)}/`;
      byId(id).querySelector('span').textContent = `${item.number} · ${item.name}`;
    }
  }

  async function init() {
    try {
      const id = document.body.dataset.projectId || new URLSearchParams(location.search).get('id');
      const response = await fetch('/projetos.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Índice indisponível');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Índice inválido');
      project = data.find(item => item.id === id);
      if (!project || !Array.isArray(project.files)) throw new Error('Padrão desconhecido');
      document.title = `${project.name} — O Grimório dos Padrões`;
      byId('study-title').textContent = project.name;
      byId('study-category').textContent = `Padrão ${project.number} · ${project.category}`;
      byId('study-description').textContent = project.description;
      if (project.art?.url) {
        byId('study-art').src = pathFromOrigin(project.art.coverUrl || project.art.url);
        if (project.art.coverUrl) {
          byId('study-art').srcset = `${pathFromOrigin(project.art.url)} 800w, ${pathFromOrigin(project.art.coverUrl)} 1600w`;
          byId('study-art').sizes = '100vw';
        }
        byId('study-art').alt = project.art.alt || `Cena do capítulo ${project.number}`;
        byId('study-art-caption').textContent = `Cena do capítulo ${project.number} · ${project.name}`;
        byId('study-scene').hidden = false;
      }
      byId('study-download').href = pathFromOrigin(project.download);
      byId('study-commands').textContent = `cd book-23/code/${project.id}\nnpm ci --ignore-scripts --no-audit --no-fund\nnpm test\nnpm start\n\n# Depois da sua tentativa\nnpm run solution`;
      pagination(data);
      prepareFiles();
      renderDiagrams();
      renderDocument('README.md', 'readme-document');
      renderDocument('exercise/README.md', 'exercise-document');
      const solution = project.files.find(file => file.path === 'solution/main.ts') || project.files.find(file => file.path.startsWith('solution/') && file.path.endsWith('.ts'));
      byId('show-solution').hidden = !solution;
      if (solution) byId('show-solution').addEventListener('click', () => selectFile(solution.path, true));
      byId('study-content').hidden = false;
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) document.querySelectorAll('.study-nav a').forEach(a => a.classList.toggle('is-current', a.hash === `#${entry.target.id}`));
      }, { rootMargin: '-15% 0px -65% 0px' });
      document.querySelectorAll('.study-section').forEach(section => observer.observe(section));
      if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    } catch (error) { if (!document.body.dataset.projectId) byId('study-error').hidden = false; }
    finally { byId('study-loading').hidden = true; }
  }
  byId('study-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      byId('study-copy').textContent = 'Copiado';
      byId('study-code-status').textContent = 'Conteúdo original copiado para a área de transferência.';
    } catch (error) { byId('study-code-status').textContent = 'Selecione o conteúdo do arquivo para copiá-lo.'; byId('study-code').focus(); }
  });
  byId('close-diagram').addEventListener('click', () => diagramDialog.close());
  diagramDialog.addEventListener('close', () => diagramTrigger?.focus());
  diagramDialog.addEventListener('click', event => {
    if (event.target !== diagramDialog) return;
    const box = diagramDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) diagramDialog.close();
  });
  init();
})();
