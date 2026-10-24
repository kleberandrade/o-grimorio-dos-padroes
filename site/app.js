'use strict';

(() => {
  const grid = document.querySelector('#project-grid');
  const search = document.querySelector('#project-search');
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#no-results');
  const error = document.querySelector('#catalog-error');
  const dialog = document.querySelector('#project-dialog');
  const fileSelect = document.querySelector('#file-select');
  const fileContent = document.querySelector('#file-content');
  const fileStatus = document.querySelector('#file-status');
  const copyButton = document.querySelector('#copy-file');
  let projects = [];
  let activeProject = null;
  let fileController = null;
  let currentFileText = '';
  let dialogTrigger = null;

  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function projectCard(project) {
    const card = el('article', 'project-card');
    const headingId = `pattern-${project.number}`;
    card.setAttribute('aria-labelledby', headingId);
    const top = el('div', 'card-top');
    top.append(el('span', 'card-number', project.number), el('span', 'card-category', project.category));
    const title = el('h3', '', project.name);
    title.id = headingId;
    const actions = el('div', 'card-actions');
    const open = el('button', 'card-open', 'Consultar projeto');
    open.type = 'button';
    open.setAttribute('aria-label', `Consultar código e arquivos de ${project.name}`);
    open.setAttribute('aria-haspopup', 'dialog');
    const arrow = el('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    open.append(arrow);
    open.addEventListener('click', () => openProject(project, open));
    const download = el('a', 'card-download', 'Baixar ZIP');
    download.href = project.download;
    download.download = '';
    download.setAttribute('aria-label', `Baixar projeto ${project.number}: ${project.name}, arquivo ZIP`);
    const downloadArrow = el('span', '', '↓');
    downloadArrow.setAttribute('aria-hidden', 'true');
    download.append(downloadArrow);
    actions.append(open, download);
    card.append(top, title, el('p', '', project.description), actions);
    return card;
  }

  function renderProjects() {
    const category = document.querySelector('input[name="category"]:checked').value;
    const query = normalize(search.value.trim());
    const filtered = projects.filter(project => (
      (category === 'Todos' || project.category === category) &&
      normalize(`${project.number} ${project.name} ${project.description} ${project.category}`).includes(query)
    ));
    grid.replaceChildren(...filtered.map(projectCard));
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}${category !== 'Todos' ? ` · ${category}` : ''}`;
    empty.hidden = filtered.length !== 0;
  }

  async function loadProjects() {
    error.hidden = true;
    empty.hidden = true;
    grid.setAttribute('aria-busy', 'true');
    count.textContent = 'Preparando os 23 projetos…';
    try {
      const response = await fetch('projetos.json');
      if (!response.ok) throw new Error('Índice indisponível');
      const data = await response.json();
      if (!Array.isArray(data) || !data.length || data.some(project => !project.id || !project.name || !Array.isArray(project.files))) {
        throw new Error('Índice inválido');
      }
      projects = data;
      renderProjects();
    } catch (cause) {
      grid.replaceChildren();
      count.textContent = 'Índice indisponível no momento.';
      error.hidden = false;
    } finally {
      grid.setAttribute('aria-busy', 'false');
    }
  }

  function openProject(project, trigger) {
    activeProject = project;
    dialogTrigger = trigger;
    document.querySelector('#dialog-category').textContent = `Padrão ${project.number} · ${project.category}`;
    document.querySelector('#dialog-title').textContent = project.name;
    document.querySelector('#dialog-description').textContent = project.description;
    const download = document.querySelector('#project-download');
    download.href = project.download;
    download.setAttribute('aria-label', `Baixar projeto completo de ${project.name}, arquivo ZIP`);
    const groupNames = {
      root: 'Comece por aqui', src: 'Implementação', test: 'Testes', exercise: 'Exercício',
      solution: 'Solução do exercício', evidence: 'Referências de execução'
    };
    const groups = new Map();
    const groupOrder = ['root', 'src', 'test', 'exercise', 'solution', 'evidence'];
    for (const file of project.files) {
      const group = file.path.includes('/') ? file.path.split('/')[0] : 'root';
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(file);
    }
    const keys = [...groupOrder.filter(group => groups.has(group)), ...[...groups.keys()].filter(group => !groupOrder.includes(group))];
    const options = keys.map(key => {
      const group = document.createElement('optgroup');
      group.label = groupNames[key] || key;
      for (const file of groups.get(key)) {
        const option = document.createElement('option');
        option.value = file.path;
        option.textContent = file.path;
        group.append(option);
      }
      return group;
    });
    fileSelect.replaceChildren(...options);
    const initial = project.files.find(file => file.path === 'README.md') || project.files[0];
    if (initial) fileSelect.value = initial.path;
    if (!dialog.open) dialog.showModal();
    document.querySelector('#close-dialog').focus();
    if (initial) loadFile(initial.path);
    else {
      fileContent.textContent = 'Nenhum arquivo disponível neste projeto.';
      fileStatus.textContent = 'Nenhum arquivo disponível.';
      copyButton.disabled = true;
    }
  }

  async function loadFile(path) {
    if (fileController) fileController.abort();
    fileController = new AbortController();
    const controller = fileController;
    const file = activeProject?.files.find(item => item.path === path);
    if (!file) return;
    currentFileText = '';
    copyButton.disabled = true;
    copyButton.textContent = 'Copiar conteúdo';
    document.querySelector('#file-path').textContent = path;
    fileContent.textContent = 'Abrindo arquivo…';
    fileContent.classList.toggle('is-prose', /\.(md|txt)$/i.test(path));
    fileContent.parentElement.scrollTop = 0;
    fileContent.parentElement.scrollLeft = 0;
    fileContent.setAttribute('aria-busy', 'true');
    fileStatus.textContent = 'Carregando arquivo…';
    try {
      const response = await fetch(file.url, { signal: controller.signal });
      if (!response.ok) throw new Error('Arquivo indisponível');
      const text = await response.text();
      if (controller.signal.aborted) return;
      currentFileText = text;
      fileContent.textContent = text;
      copyButton.disabled = false;
      fileStatus.textContent = `${text.split('\n').length} linhas · ${path.endsWith('.ts') ? 'TypeScript' : 'arquivo de texto'}`;
    } catch (cause) {
      if (cause.name === 'AbortError') return;
      fileContent.textContent = 'Não foi possível abrir este arquivo. Selecione outro arquivo ou baixe o projeto completo.';
      fileStatus.textContent = 'Arquivo indisponível no momento.';
    } finally {
      if (!controller.signal.aborted) fileContent.setAttribute('aria-busy', 'false');
    }
  }

  search.addEventListener('input', renderProjects);
  document.querySelectorAll('input[name="category"]').forEach(input => input.addEventListener('change', renderProjects));
  document.querySelector('#retry-projects').addEventListener('click', loadProjects);
  fileSelect.addEventListener('change', () => loadFile(fileSelect.value));
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (fileController) fileController.abort();
    if (dialogTrigger?.isConnected) dialogTrigger.focus();
  });
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentFileText);
      copyButton.textContent = 'Copiado';
      fileStatus.textContent = 'Conteúdo copiado para a área de transferência.';
    } catch (cause) {
      fileStatus.textContent = 'Selecione o texto do arquivo para copiá-lo.';
      fileContent.focus();
    }
  });
  loadProjects();
})();
