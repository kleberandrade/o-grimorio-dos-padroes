#!/usr/bin/env python3
"""Build public HTML and social cards from the frozen project catalog.
Run: python3 scripts/build-seo.py (Pillow and rsvg-convert required for image export).
No private manuscript or credentials are read.
"""
from pathlib import Path
import base64, html, io, json, re, textwrap, subprocess
from xml.etree import ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
BASE = 'https://o-grimorio-dos-padroes.vercel.app'
AUTHOR = 'Kleber de Oliveira Andrade'
BOOK = 'O Grimório dos Padrões'
PROJECTS = json.loads((SITE / 'projetos.json').read_text())
OG = SITE / 'assets/og'
OG.mkdir(parents=True, exist_ok=True)
esc = lambda value: html.escape(str(value), quote=True)
url = lambda project: f'/padroes/{project["id"]}/'

def local(path):
    resolved = (SITE / path.lstrip('/')).resolve()
    if not resolved.is_relative_to(SITE.resolve()):
        raise ValueError('Path outside public site')
    return resolved

def data_image(path):
    image = Image.open(path).convert('RGB')
    out = io.BytesIO(); image.save(out, 'JPEG', quality=94)
    return 'data:image/jpeg;base64,' + base64.b64encode(out.getvalue()).decode()

def social_card(project=None):
    image_path = local(project['art']['coverUrl']) if project else SITE / 'assets/universo-oito-terras-relevo-v01.webp'
    background = data_image(image_path)
    title = project['name'] if project else BOOK
    lines = textwrap.wrap(title, width=24 if project else 20, break_long_words=False)
    size = 64 if project else 68
    title_y = 410 - (len(lines)-1)*76 if project else 205
    texts = ''.join(f'<text x="70" y="{title_y+i*76}" font-size="{size}" fill="#fff5dd">{esc(line)}</text>' for i,line in enumerate(lines))
    extra = ''
    if not project:
        extra = f'<rect x="829" y="57" width="310" height="462" fill="#000" opacity=".4"/><image href="{data_image(SITE / "assets/cover.jpg")}" x="820" y="45" width="310" height="440" preserveAspectRatio="xMidYMid meet"/>'
    eyebrow = f'PADRÃO {project["number"]} · {project["category"].upper()}' if project else 'FANTASIA &amp; PROGRAMAÇÃO'
    sub = 'TypeScript · Diagramas UML · Exercícios' if project else 'Magia é programação. O mundo é código.'
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#051020" stop-opacity=".96"/><stop offset=".65" stop-color="#051020" stop-opacity=".56"/><stop offset="1" stop-color="#051020" stop-opacity=".2"/></linearGradient><linearGradient id="bottom" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#051020" stop-opacity=".95"/><stop offset=".8" stop-color="#051020" stop-opacity="0"/></linearGradient></defs><image href="{background}" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/><rect width="1200" height="630" fill="url(#shade)"/><rect width="1200" height="630" fill="url(#bottom)"/><path d="M70 86H1130M70 546H1130" stroke="#d8b77c" stroke-opacity=".55"/><text x="70" y="126" fill="#edc884" font-family="Arial" font-size="16" letter-spacing="3">{eyebrow}</text><g font-family="Georgia, serif">{texts}</g><text x="70" y="{462 if project else 405}" fill="#e8d4af" font-family="Georgia, serif" font-size="25">{esc(sub)}</text>{extra}<text x="70" y="584" fill="#e6d4b2" font-family="Arial" font-size="19">{esc(BOOK if project else AUTHOR)}</text><text x="1130" y="584" text-anchor="end" fill="#c7d2dd" font-family="Arial" font-size="15">{esc('Kleber de Oliveira Andrade' if project else '23 histórias · 23 padrões de projeto')}</text></svg>'''
    png = subprocess.run(["rsvg-convert", "--format=png"], input=svg.encode(), check=True, capture_output=True).stdout
    name = project['id'] if project else 'home'
    target = OG / f'{name}-v01.jpg'
    Image.open(io.BytesIO(png)).convert('RGB').save(target, quality=92, optimize=True)
    return '/assets/og/' + target.name

def metadata(title, description, path, image, alt, graph):
    entries = [f'<title>{esc(title)}</title>', f'<meta name="description" content="{esc(description)}">',
               f'<link rel="canonical" href="{BASE}{path}">', '<meta name="robots" content="index,follow,max-image-preview:large">',
               f'<meta name="author" content="{AUTHOR}">']
    for key,value in {'og:title': title, 'og:description': description, 'og:type': 'website' if path == '/' else 'article', 'og:url': BASE+path,
                      'og:site_name': BOOK, 'og:locale': 'pt_BR', 'og:image': BASE+image,
                      'og:image:secure_url': BASE+image, 'og:image:type': 'image/jpeg', 'og:image:width': '1200',
                      'og:image:height': '630', 'og:image:alt': alt}.items():
        entries.append(f'<meta property="{key}" content="{esc(value)}">')
    for key,value in {'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description,
                      'twitter:image': BASE+image, 'twitter:image:alt': alt}.items():
        entries.append(f'<meta name="{key}" content="{esc(value)}">')
    entries.append('<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph}, ensure_ascii=False).replace('<','\\u003c')+'</script>')
    return '\n  '.join(entries)

def set_head(source, block):
    source = re.sub(r'\s*<title>.*?</title>', '', source, flags=re.S)
    source = re.sub(r'\s*<meta (?:name="(?:description|author|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>', '', source)
    source = re.sub(r'\s*<link rel="canonical"[^>]*>', '', source)
    source = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', '', source, flags=re.S)
    return source.replace('</head>', '  '+block+'\n</head>')

PERSON = {'@type':'Person','@id':BASE+'/#autor','name':AUTHOR,'url':'https://kleberandrade.dev/'}
WEBSITE = {'@type':'WebSite','@id':BASE+'/#website','name':BOOK,'url':BASE+'/','inLanguage':'pt-BR','author':{'@id':BASE+'/#autor'}}

def inline(text):
    result=[]; offset=0
    for match in re.finditer(r'(`[^`]+`|\*\*[^*]+\*\*|\[([^\]]+)\]\((https?://[^\s)]+)\))', text):
        result.append(esc(text[offset:match.start()]))
        token=match[0]
        if token.startswith('`'): result.append('<code>'+esc(token[1:-1])+'</code>')
        elif token.startswith('**'): result.append('<strong>'+esc(token[2:-2])+'</strong>')
        else: result.append(f'<a href="{esc(match[3])}" target="_blank" rel="noopener noreferrer">{esc(match[2])}</a>')
        offset=match.end()
    result.append(esc(text[offset:])); return ''.join(result)

def markdown(text):
    result=[]; para=[]; fence=None; list_kind=None
    def flush():
        if para: result.append('<p>'+inline(' '.join(para))+'</p>'); para.clear()
    def close_list():
        nonlocal list_kind
        if list_kind: result.append(f'</{list_kind}>'); list_kind=None
    for line in text.replace('\r\n','\n').split('\n'):
        if re.match(r'^\s*```',line):
            flush(); close_list()
            if fence is None: fence=[]
            else: result.append('<pre><code>'+esc('\n'.join(fence))+'</code></pre>'); fence=None
            continue
        if fence is not None: fence.append(line); continue
        if not line.strip(): flush(); close_list(); continue
        heading=re.match(r'^(#{1,6})\s+(.+)$',line)
        if heading:
            flush(); close_list(); tag='h4' if len(heading[1])>2 else 'h3'
            result.append(f'<{tag}>'+inline(heading[2])+f'</{tag}>'); continue
        if re.match(r'^\s*([-*_])\1\1+\s*$',line): flush(); close_list(); result.append('<hr>'); continue
        bullet=re.match(r'^\s*(?:([-*])|\d+[.)])\s+(.+)$',line)
        if bullet:
            flush(); kind='ul' if bullet[1] else 'ol'
            if kind!=list_kind: close_list(); result.append(f'<{kind}>'); list_kind=kind
            result.append('<li>'+inline(bullet[2])+'</li>'); continue
        close_list(); para.append(line.strip())
    flush(); close_list()
    if fence is not None: result.append('<pre><code>'+esc('\n'.join(fence))+'</code></pre>')
    return '\n'.join(result)

def card(project):
    return f'''<article class="project-card" aria-labelledby="pattern-{project['number']}"><a class="card-art" href="{url(project)}" tabindex="-1" aria-hidden="true"><img src="/{project['art']['url'].lstrip('/')}" alt="" loading="lazy" width="800" height="450"></a><div class="card-top"><span class="card-number">{project['number']}</span><span class="card-category">{esc(project['category'])}</span></div><h3 id="pattern-{project['number']}">{esc(project['name'])}</h3><p>{esc(project['description'])}</p><div class="card-actions"><a class="card-open" href="{url(project)}" aria-label="Estudar {esc(project['name'])}: fundamentos, código, diagrama e exercício">Estudar padrão <span aria-hidden="true">↗</span></a><span class="card-chapters">Código · Diagrama</span></div></article>'''

def carousel():
    books=json.loads((SITE/'livros.json').read_text())
    slides=[]
    dots=[]
    for index,book in enumerate(books):
        slides.append(f'<article class="saga-slide" id="saga-slide-{index}" role="group" aria-roledescription="slide" aria-label="{index+1} de 6: {esc(book["title"])}"><div class="saga-cover"><img src="{book["cover"]}" width="{book["width"]}" height="{book["height"]}" alt="Capa de {esc(book["title"])}" loading="lazy"></div><div class="saga-copy"><p class="eyebrow">{esc(book["series"])} · Livro {book["volume"]}</p><h3>{esc(book["title"])}</h3><p class="saga-subtitle">{esc(book["subtitle"])}</p><p class="saga-summary">{esc(book["summary"])}</p><a class="button button-primary" href="{book["purchase"]}" target="_blank" rel="noopener noreferrer">Comprar livro <span aria-hidden="true">↗</span><span class="sr-only"> {esc(book["title"])} no Clube de Autores (abre em outra aba)</span></a></div></article>')
        dots.append(f'<button type="button" class="saga-dot" data-book="{index}" aria-controls="saga-slide-{index}" aria-label="Ver {esc(book["title"])}" aria-current="{str(index==0).lower()}"><span></span></button>')
    return '<section class="sagas-section" id="trilogias" aria-labelledby="sagas-title"><div class="wrap section-space"><div class="sagas-heading"><p class="eyebrow">Outras jornadas do autor</p><h2 id="sagas-title">Duas trilogias. Seis <em>jornadas.</em></h2></div><div class="saga-carousel" role="region" aria-roledescription="carrossel" aria-label="Livros das duas trilogias"><div class="saga-frame"><div class="saga-stage">'+''.join(slides)+'</div><div class="saga-arrows" hidden><button type="button" class="saga-arrow" id="saga-prev" aria-label="Livro anterior">←</button><button type="button" class="saga-arrow" id="saga-next" aria-label="Próximo livro">→</button></div><div class="saga-controls" hidden><div class="saga-dots" aria-label="Escolher livro">'+''.join(dots)+'</div><button type="button" class="saga-play" id="saga-play" aria-pressed="true">Pausar</button></div></div><p class="sr-only" id="saga-status" role="status" aria-live="off" aria-atomic="true"></p></div></div></section>'


home=(SITE/'index.html').read_text()
home=re.sub(r'<!-- carousel:start -->.*?<!-- carousel:end -->\n?', '',home,flags=re.S)
home=home.replace('    <section class="author-section"', '<!-- carousel:start -->'+carousel()+'<!-- carousel:end -->\n    <section class="author-section"')
if '<!-- seo:catalog:start -->' not in home:
    home=home.replace('<div id="project-grid" class="project-grid" aria-busy="true"></div>', '<!-- seo:catalog:start --><!-- seo:catalog:end -->')
home=re.sub(r'<!-- seo:catalog:start -->.*?<!-- seo:catalog:end -->', '<!-- seo:catalog:start -->\n<div id="project-grid" class="project-grid" aria-busy="false">'+''.join(map(card,PROJECTS))+'</div>\n<!-- seo:catalog:end -->',home,flags=re.S)
home=home.replace('Preparando os 23 projetos…','23 padrões encontrados')
description='Aprenda 23 Design Patterns com histórias de fantasia, monstros e magia como código. Explore projetos TypeScript, diagramas UML e exercícios do livro de Kleber Andrade.'
image=social_card()
graph=[PERSON,WEBSITE,{'@type':'WebPage','@id':BASE+'/#webpage','url':BASE+'/','name':BOOK,'description':description,'isPartOf':{'@id':BASE+'/#website'},'inLanguage':'pt-BR'}, {'@type':'Book','name':BOOK,'author':{'@id':BASE+'/#autor'},'inLanguage':'pt-BR','image':BASE+'/assets/cover.jpg','url':'https://clubedeautores.com.br/livro/o-grimorio-dos-padroes'}]
home=set_head(home,metadata(BOOK+' — Fantasia e Design Patterns em TypeScript', description, '/',image,'O Grimório dos Padrões: capa do livro sobre as Oito Terras em relevo.',graph))
(SITE/'index.html').write_text(home)

template=(SITE/'projeto.html').read_text()
# The generic legacy endpoint is not an additional canonical page.
if '<meta name="robots"' not in template:
    template=template.replace('</head>','  <meta name="robots" content="noindex,follow">\n</head>')
(SITE/'projeto.html').write_text(template)
for index,project in enumerate(PROJECTS):
    page=template.replace('<body class="study-page">',f'<body class="study-page" data-project-id="{project["id"]}">')
    page=page.replace('id="study-loading" class="study-message wrap" role="status"','id="study-loading" class="study-message wrap" role="status" hidden').replace('<div id="study-content" hidden>','<div id="study-content">')
    page=page.replace('<p class="eyebrow" id="study-category"></p>',f'<p class="eyebrow" id="study-category">Padrão {project["number"]} · {esc(project["category"])}</p>')
    page=page.replace('<h1 id="study-title"></h1>',f'<h1 id="study-title">{esc(project["name"])}</h1>').replace('<p id="study-description"></p>',f'<p id="study-description">{esc(project["description"])}</p>')
    page=page.replace('id="study-scene" hidden','id="study-scene"').replace('<img id="study-art" alt=""',f'<img id="study-art" src="/{project["art"]["coverUrl"].lstrip("/")}" srcset="/{project["art"]["url"].lstrip("/")} 800w, /{project["art"]["coverUrl"].lstrip("/")} 1600w" sizes="100vw" alt="{esc(project["art"]["alt"])}"')
    page=page.replace('<figcaption id="study-art-caption"></figcaption>',f'<figcaption id="study-art-caption">Cena do capítulo {project["number"]} · {esc(project["name"])}</figcaption>')
    for source,target,message in [('README.md','readme-document','fundamentos'),('exercise/README.md','exercise-document','exercício')]:
        file=next(item for item in project['files'] if item['path']==source)
        rendered=markdown(local(file['url']).read_text())
        page=page.replace(f'<div class="readme-document" id="{target}" aria-busy="true"><p>Abrindo {"os" if message=="fundamentos" else "o"} {message}…</p></div>',f'<div class="readme-document" id="{target}" aria-busy="false">{rendered}</div>')
    initial=next(item for item in project['files'] if item['path']=='src/main.ts')
    code=local(initial['url']).read_text()
    page=page.replace('<code id="study-code-text">Abrindo arquivo…</code>',f'<code id="study-code-text">{esc(code)}</code>').replace('aria-label="Conteúdo do arquivo selecionado" aria-busy="true"','aria-label="Conteúdo do arquivo selecionado" aria-busy="false"')
    page=page.replace('<span id="study-file-path"></span>','<span id="study-file-path">src/main.ts</span>').replace('<span id="study-file-kind"></span>','<span id="study-file-kind">TypeScript</span>')
    # Enhanced file navigation is only shown once JS can handle it.
    page=page.replace('<select id="study-file-select"></select>','<select id="study-file-select"><option>src/main.ts</option></select>')
    diagrams=[]
    for diagram in project['diagrams']:
        diagrams.append(f'<figure class="study-diagram"><a href="/{diagram["url"].lstrip("/")}" target="_blank" rel="noopener noreferrer"><img src="/{diagram["url"].lstrip("/")}" alt="{esc(diagram["alt"])}" loading="lazy"></a><figcaption>{esc(diagram["title"])}</figcaption><p class="study-diagram-description">{esc(diagram.get("description",""))}</p></figure>')
    page=page.replace('<div class="study-diagrams" id="study-diagrams"></div>','<div class="study-diagrams" id="study-diagrams">'+''.join(diagrams)+'</div>')
    commands=f'cd book-23/code/{project["id"]}\nnpm ci --ignore-scripts --no-audit --no-fund\nnpm test\nnpm start\n\n# Depois da sua tentativa\nnpm run solution'
    page=page.replace('<pre id="study-commands"></pre>',f'<pre id="study-commands">{esc(commands)}</pre>').replace('id="study-download" download',f'id="study-download" href="/{project["download"].lstrip("/")}" download')
    for id,offset in [('previous-project',-1),('next-project',1)]:
        n=index+offset
        if 0<=n<len(PROJECTS):
            neighbor=PROJECTS[n]; label='Padrão anterior' if offset<0 else 'Próximo padrão'
            page=page.replace(f'<a id="{id}" hidden><small>{label}</small><span></span></a>',f'<a id="{id}" href="{url(neighbor)}"><small>{label}</small><span>{neighbor["number"]} · {esc(neighbor["name"])}</span></a>')
    desc=f'Aprenda {project["name"]} com fantasia e TypeScript: {project["description"]} Consulte código, diagramas UML e exercício.'
    social=social_card(project)
    graph=[PERSON,WEBSITE,{'@type':'TechArticle','@id':BASE+url(project)+'#artigo','url':BASE+url(project),'headline':project['name']+' — '+BOOK,'description':desc,'image':BASE+social,'author':{'@id':BASE+'/#autor'},'inLanguage':'pt-BR','isPartOf':{'@id':BASE+'/#website'}},{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':BOOK,'item':BASE+'/'},{'@type':'ListItem','position':2,'name':project['name'],'item':BASE+url(project)}]}]
    page=set_head(page,metadata(project['name']+' em TypeScript — '+BOOK,desc,url(project),social,project['art']['alt'],graph))
    target=SITE/url(project).lstrip('/')/'index.html'; target.parent.mkdir(parents=True,exist_ok=True); target.write_text(page)

(SITE/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+BASE+'/sitemap.xml\n')
ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
ns='{http://www.sitemaps.org/schemas/sitemap/0.9}'
root=ET.Element(ns+'urlset')
for path in ['/', *map(url,PROJECTS)]: ET.SubElement(ET.SubElement(root,ns+'url'),ns+'loc').text=BASE+path
ET.ElementTree(root).write(SITE/'sitemap.xml',encoding='utf-8',xml_declaration=True)
config=json.loads((ROOT/'vercel.json').read_text())
config['trailingSlash']=True
config['redirects']=[{'source':'/projeto.html','has':[{'type':'query','key':'id','value':project['id']}],'destination':url(project),'permanent':True} for project in PROJECTS]
(ROOT/'vercel.json').write_text(json.dumps(config,indent=2,ensure_ascii=False)+'\n')
print('Generated 24 indexable pages, 24 social images (1200×630), sitemap, robots and 23 legacy redirects.')
