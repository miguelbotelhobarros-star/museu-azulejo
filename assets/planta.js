/* Planta interativa do convento: percursos por tempo e por tema, caminho animado e paragens com foto.
   Monta-se em qualquer [data-planta]. data-modo="mini" mostra a versão da página inicial. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- paragens ---------- */
  var P = {
    1:  { nome: 'Entrada e receção', piso: 0, x: 440, y: 528, foto: 'entrada', cr: 'GualdimG · CC BY-SA 4.0', min: 3, txt: 'Bilhetes, bengaleiro e planta do museu. O portal manuelino lembra que entra num convento fundado em 1509.' },
    2:  { nome: 'Claustro grande', piso: 0, x: 430, y: 320, foto: 'claustro', cr: 'Matt Kieffer · CC BY-SA 2.0', min: 4, txt: 'O coração do convento. Todas as alas dão para aqui: se se perder, volte ao claustro.' },
    3:  { nome: 'Hispano-mourisco', piso: 0, x: 170, y: 405, foto: 'hispano-mourisco', cr: 'Pedro Ribeiro Simões · CC BY 2.0', min: 6, txt: 'Séc. XV–XVI. Corda-seca e aresta, vindos de Sevilha: os primeiros azulejos usados em Portugal.' },
    4:  { nome: 'Majólica', piso: 0, x: 170, y: 510, foto: 'nossa-senhora-da-vida', cr: 'Yair Haklai · CC BY-SA 4.0', min: 6, txt: 'Séc. XVI. O retábulo de Nossa Senhora da Vida, um altar inteiro feito de azulejo, c. 1580.' },
    5:  { nome: 'Século XVII', piso: 0, x: 640, y: 512, foto: 'padrao-marvila', cr: 'Jules Verne Times Two · CC BY-SA 4.0', min: 6, txt: 'Padrões que cobrem paredes inteiras como tapetes, enxaquetados e frontais de altar.' },
    6:  { nome: 'Igreja da Madre de Deus', piso: 0, x: 380, y: 95, foto: 'igreja', cr: 'Jules Verne Times Two · CC BY-SA 4.0', min: 8, txt: 'Talha dourada, telas e paredes de azulejo. Um dos interiores barrocos mais completos de Lisboa.' },
    7:  { nome: 'Coro alto', piso: 1, x: 125, y: 95, foto: 'coro-alto', cr: 'Jules Verne Times Two · CC BY-SA 4.0', min: 5, txt: 'O lugar das monjas clarissas, sobre a entrada da igreja, com talha e pintura.' },
    8:  { nome: 'Capela de Santo António', piso: 1, x: 700, y: 95, foto: 'capela-azulejos', cr: 'Yair Haklai · CC BY-SA 4.0', min: 5, txt: 'Decoração barroca do século XVIII e telas do pintor André Gonçalves.' },
    9:  { nome: 'Azul e branco', piso: 1, x: 670, y: 262, foto: 'batalha-de-isso', cr: 'Jules Verne Times Two · CC BY-SA 4.0', min: 8, txt: 'O Ciclo dos Mestres: grandes painéis figurativos pintados só a azul, c. 1690–1750.' },
    10: { nome: 'Pombalino e século XIX', piso: 1, x: 670, y: 382, foto: 'soldado', cr: 'Pedro Ribeiro Simões · CC BY 2.0', min: 7, txt: 'Da reconstrução de Lisboa às fachadas industriais. Procure as figuras de convite.' },
    11: { nome: 'Grande Vista de Lisboa', piso: 2, x: 832, y: 320, foto: 'grande-vista', cr: 'Bex Walton · CC BY 2.0', min: 8, txt: 'Os 23 metros da cidade vista do rio, cerca de 1700, antes do terramoto de 1755.' },
    12: { nome: 'Séculos XX e XXI', piso: 2, x: 832, y: 512, foto: 'lisbonne-1937', cr: 'Pedro Ribeiro Simões · CC BY 2.0', min: 6, txt: 'Arte pública, metro e criação contemporânea. A saída faz-se pelo elevador.' },
    13: { nome: 'Claustrim', piso: 0, x: 190, y: 262, foto: 'claustrim', cr: 'Jules Verne Times Two · CC BY-SA 4.0', min: 3, txt: 'O pequeno claustro do século XVI, com revestimentos geométricos anteriores ao azul e branco.' }
  };

  /* ---------- corredores (nós por onde o caminho passa) ---------- */
  var N = {
    gNO: [320, 220], gN: [430, 220], gNE: [540, 220], gE: [540, 320], gSE: [540, 420], gS: [430, 420], gSO: [320, 420], gO: [320, 320],
    pIg: [380, 175], pCoro: [125, 175], pCap: [700, 175], p9: [575, 262], p10: [575, 382], p3: [285, 405], p4: [285, 510], pS: [430, 470],
    p5: [575, 470], p11: [770, 320], p12: [770, 512], p13: [285, 262]
  };
  var A = [
    ['gNO', 'gN'], ['gN', 'gNE'], ['gNE', 'gE'], ['gE', 'gSE'], ['gSE', 'gS'], ['gS', 'gSO'], ['gSO', 'gO'], ['gO', 'gNO'],
    ['2', 'gN'], ['2', 'gS'], ['2', 'gE'], ['2', 'gO'],
    ['1', 'pS'], ['pS', 'gS'],
    ['6', 'pIg'], ['pIg', 'gN'], ['pIg', 'gNO'], ['6', '7'], ['7', 'pCoro'], ['pCoro', 'p13'],
    ['8', 'pCap'], ['pCap', 'gNE'], ['6', '8'],
    ['9', 'p9'], ['p9', 'gNE'], ['p9', 'gE'], ['10', 'p10'], ['p10', 'gE'], ['p10', 'gSE'], ['9', '10'],
    ['3', 'p3'], ['p3', 'gSO'], ['p3', 'gO'], ['4', 'p4'], ['p4', 'pS'], ['3', '4'],
    ['5', 'p5'], ['p5', 'gSE'], ['p5', 'pS'],
    ['11', 'p11'], ['p11', '9'], ['p11', '10'], ['11', '12'], ['12', 'p12'], ['p12', '5'],
    ['13', 'p13'], ['p13', 'gO'], ['p13', 'gNO']
  ];
  function pos(id) { return P[id] ? [P[id].x, P[id].y] : N[id]; }
  var G = {};
  A.forEach(function (a) {
    var d = Math.hypot(pos(a[0])[0] - pos(a[1])[0], pos(a[0])[1] - pos(a[1])[1]);
    (G[a[0]] = G[a[0]] || []).push([a[1], d]); (G[a[1]] = G[a[1]] || []).push([a[0], d]);
  });
  function caminho(a, b) {
    var dist = {}, prev = {}, vis = {}; dist[a] = 0;
    while (true) {
      var u = null;
      for (var k in dist) if (!vis[k] && (u === null || dist[k] < dist[u])) u = k;
      if (u === null || u === b) break;
      vis[u] = true;
      (G[u] || []).forEach(function (e) {
        var nd = dist[u] + e[1];
        if (dist[e[0]] === undefined || nd < dist[e[0]]) { dist[e[0]] = nd; prev[e[0]] = u; }
      });
    }
    var r = [b]; while (r[0] !== a) r.unshift(prev[r[0]]);
    return r;
  }

  /* ---------- percursos ---------- */
  var R = {
    t5:  { grupo: 'tempo', rot: '5 min', tit: 'O essencial em 5 minutos', sub: 'Pouco tempo? A igreja e o claustro bastam para perceber porque este museu é único.', p: [1, 2, 6] },
    t10: { grupo: 'tempo', rot: '10 min', tit: 'Dez minutos, quatro maravilhas', sub: 'Igreja, claustro e a cidade de Lisboa antes do terramoto, em 23 metros de azulejo.', p: [1, 2, 6, 11] },
    t30: { grupo: 'tempo', rot: '30 min', tit: 'Meia hora pela história do azulejo', sub: 'Do azulejo de Sevilha ao azul e branco, com paragem na igreja.', p: [1, 3, 4, 2, 6, 9, 11] },
    t60: { grupo: 'tempo', rot: '1 hora', tit: 'Uma hora: o percurso completo', sub: 'Cinco séculos por ordem cronológica, pelos três pisos do convento.', p: [1, 13, 3, 4, 5, 2, 6, 7, 8, 9, 10, 11, 12] },
    ouro:    { grupo: 'tema', rot: 'Ouro e fé', tit: 'Ouro e fé', sub: 'Igrejas, capelas e altares de azulejo: o convento das clarissas.', p: [1, 4, 2, 6, 7, 8] },
    lisboa:  { grupo: 'tema', rot: 'Lisboa em azulejo', tit: 'Lisboa em azulejo', sub: 'A cidade antes e depois do terramoto, e o azulejo que saiu à rua.', p: [1, 2, 10, 11, 12] },
    familia: { grupo: 'tema', rot: 'Com crianças', tit: 'Com crianças', sub: 'Curto e cheio de bichos, barcos e anjos. Junte a caça ao tesouro.', p: [1, 2, 4, 6, 11] },
    padroes: { grupo: 'tema', rot: 'Padrões e técnica', tit: 'Padrões e técnica', sub: 'Como se faz um azulejo e como um padrão cobre uma parede inteira.', p: [1, 13, 3, 5, 2, 10] }
  };
  var CORES = ['#137cc0', '#c08a00', '#7a4e9a'];
  var NOMES_PISO = ['Piso 0', 'Piso 1', 'Piso 2'];

  function el(tag, at, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function txt(pai, x, y, s, cls, anchor) { var t = el('text', { x: x, y: y, class: cls || 'pl__lbl', 'text-anchor': anchor || 'start' }, pai); t.textContent = s; return t; }

  function desenhaPlanta(svg) {
    var defs = el('defs', {}, svg);
    var hx = el('pattern', { id: 'pl-hatch', width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 10, height: 10, fill: '#fbf6e6' }, hx); el('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: '#ecd9a0', 'stroke-width': 3 }, hx);
    var hx2 = el('pattern', { id: 'pl-hatch2', width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-45)' }, defs);
    el('rect', { width: 10, height: 10, fill: '#f4eef8' }, hx2); el('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: '#ddcdea', 'stroke-width': 3 }, hx2);
    var tile = el('pattern', { id: 'pl-tile', width: 16, height: 16, patternUnits: 'userSpaceOnUse' }, defs);
    el('rect', { width: 16, height: 16, fill: '#eef5fb' }, tile); el('path', { d: 'M8 1L15 8L8 15L1 8Z', fill: 'none', stroke: '#c9def0', 'stroke-width': 1 }, tile);
    var jard = el('pattern', { id: 'pl-jardim', width: 12, height: 12, patternUnits: 'userSpaceOnUse' }, defs);
    el('rect', { width: 12, height: 12, fill: '#e3efd9' }, jard); el('circle', { cx: 6, cy: 6, r: 1.6, fill: '#bcd8a8' }, jard);

    var g = el('g', { class: 'pl__planta' }, svg);
    el('rect', { x: 0, y: 0, width: 900, height: 620, fill: '#fbfbf8' }, g);
    // salas
    function sala(x, y, w, h, piso, nome, lx, ly) {
      var f = piso === 1 ? 'url(#pl-hatch)' : piso === 2 ? 'url(#pl-hatch2)' : 'url(#pl-tile)';
      el('rect', { x: x, y: y, width: w, height: h, fill: f, stroke: '#20323f', 'stroke-width': 3 }, g);
      if (nome) txt(g, lx || x + 10, ly || y + 20, nome);
    }
    sala(60, 40, 560, 110, 0, 'IGREJA DA MADRE DE DEUS', 190);
    sala(60, 40, 130, 110, 1, 'CORO ALTO');
    sala(640, 40, 140, 110, 1, 'CAPELA S. ANTÓNIO');
    sala(60, 200, 240, 140, 0, '');
    sala(60, 340, 240, 110, 0, 'SALA 3', 70, 440);
    sala(60, 450, 240, 120, 0, 'SALA 4', 70, 560);
    sala(300, 450, 260, 120, 0, 'RECEÇÃO', 310, 560);
    sala(560, 450, 160, 120, 0, 'SALA 5', 570, 560);
    sala(560, 200, 220, 120, 1, 'SALA 9', 700, 220);
    sala(560, 320, 220, 130, 1, 'SALA 10', 700, 440);
    sala(780, 200, 100, 250, 2, 'GRANDE', 790, 225); txt(g, 790, 242, 'VISTA');
    sala(720, 450, 160, 120, 2, 'SALA 12', 730);
    // claustrim
    el('rect', { x: 130, y: 220, width: 120, height: 90, fill: 'url(#pl-jardim)', stroke: '#20323f', 'stroke-width': 1.5 }, g);
    txt(g, 140, 236, 'CLAUSTRIM');
    // claustro grande: galeria + jardim + fonte
    el('rect', { x: 300, y: 200, width: 260, height: 250, fill: '#f3f0e6', stroke: '#20323f', 'stroke-width': 3 }, g);
    el('rect', { x: 340, y: 240, width: 180, height: 170, fill: 'url(#pl-jardim)', stroke: '#20323f', 'stroke-width': 1.5 }, g);
    for (var i = 0; i < 7; i++) {
      el('rect', { x: 340 + i * 28.5, y: 236, width: 6, height: 6, fill: '#20323f' }, g);
      el('rect', { x: 340 + i * 28.5, y: 408, width: 6, height: 6, fill: '#20323f' }, g);
    }
    for (var j = 0; j < 6; j++) {
      el('rect', { x: 336, y: 240 + j * 31, width: 6, height: 6, fill: '#20323f' }, g);
      el('rect', { x: 518, y: 240 + j * 31, width: 6, height: 6, fill: '#20323f' }, g);
    }
    el('path', { d: 'M430 240V410M340 325H520', stroke: '#d8cfb4', 'stroke-width': 6 }, g);
    el('circle', { cx: 430, cy: 325, r: 14, fill: '#cfe3f3', stroke: '#20323f', 'stroke-width': 1.5 }, g);
    txt(g, 310, 216, 'CLAUSTRO GRANDE');
    // altar e porta principal
    el('rect', { x: 585, y: 70, width: 25, height: 50, fill: '#e8c547', stroke: '#20323f', 'stroke-width': 1.5 }, g);
    el('path', { d: 'M415 570h50', stroke: '#e8c547', 'stroke-width': 8 }, g);
    txt(g, 440, 600, 'ENTRADA · RUA DA MADRE DE DEUS', 'pl__lbl pl__lbl--forte', 'middle');
    // norte
    var n = el('g', { transform: 'translate(855 590)' }, g);
    el('path', { d: 'M0 -18L7 4L0 0L-7 4Z', fill: '#20323f' }, n); txt(n, 0, 18, 'N', 'pl__lbl', 'middle');
  }

  function monta(box) {
    var mini = box.getAttribute('data-modo') === 'mini';
    box.innerHTML = '';
    box.classList.add('pl'); if (mini) box.classList.add('pl--mini');

    var controlos = document.createElement('div');
    controlos.className = 'pl__controlos';
    if (!mini) {
      controlos.innerHTML = '<div class="pl__grupo"><span class="etiqueta">Quanto tempo tem?</span><div class="pl__chips" data-g="tempo"></div></div>' +
        '<div class="pl__grupo"><span class="etiqueta">Ou escolha um tema</span><div class="pl__chips" data-g="tema"></div></div>';
      box.appendChild(controlos);
    }

    var corpo = document.createElement('div'); corpo.className = 'pl__corpo'; box.appendChild(corpo);
    var fig = document.createElement('div'); fig.className = 'pl__fig'; corpo.appendChild(fig);
    var svg = el('svg', { viewBox: '0 0 900 620', class: 'pl__svg', role: 'img', 'aria-label': 'Planta esquemática do Convento da Madre de Deus com o percurso escolhido' });
    fig.appendChild(svg);
    desenhaPlanta(svg);
    var gRota = el('g', {}, svg);
    var rastoBase = el('path', { class: 'pl__rasto-base', d: '' }, gRota);
    var rasto = el('path', { class: 'pl__rasto', d: '' }, gRota);
    var gPontos = el('g', {}, svg);
    var caminhante = el('g', { class: 'pl__caminhante', opacity: 0 }, svg);
    el('circle', { r: 16, class: 'pl__onda' }, caminhante);
    el('circle', { r: 8, fill: '#ebc517', stroke: '#20323f', 'stroke-width': 2.5 }, caminhante);

    var pontos = {};
    Object.keys(P).forEach(function (id) {
      var p = P[id];
      var gp = el('g', { class: 'pl__ponto', transform: 'translate(' + p.x + ' ' + p.y + ')', tabindex: mini ? -1 : 0, role: mini ? 'presentation' : 'button', 'aria-label': p.nome + ', ' + NOMES_PISO[p.piso] }, gPontos);
      el('circle', { r: 17, fill: CORES[p.piso], stroke: '#fff', 'stroke-width': 3, class: 'pl__disco' }, gp);
      var t = txt(gp, 0, 5.5, '', 'pl__num', 'middle');
      gp._t = t;
      pontos[id] = gp;
      if (!mini) {
        gp.addEventListener('click', function () { mostraParagem(+id, true); });
        gp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostraParagem(+id, true); } });
      }
    });

    var legenda = document.createElement('p'); legenda.className = 'pl__legenda mono';
    legenda.innerHTML = CORES.map(function (c, i) { return '<span><i style="background:' + c + '"></i>' + NOMES_PISO[i] + '</span>'; }).join('') + '<span class="pl__aviso">Planta esquemática do protótipo</span>';
    fig.appendChild(legenda);

    var painel = document.createElement('div'); painel.className = 'pl__painel'; corpo.appendChild(painel);
    painel.innerHTML = '<p class="etiqueta pl__tipo"></p><h3 class="pl__tit"></h3><p class="pl__sub"></p>' +
      '<p class="pl__meta mono"></p>' +
      (mini ? '<p><a class="btn" href="percurso.html#planta">Escolher o meu percurso</a></p>' :
        '<div class="pl__acoes"><button type="button" class="btn" data-tour>▶ Fazer a visita</button><button type="button" class="btn btn--linha" data-reset>Ver tudo</button></div>' +
        '<article class="pl__cartao" hidden><div class="pl__foto"><div class="pl__foto-img"></div><span class="pl__cr mono"></span></div>' +
        '<div class="pl__cartao-txt"><p class="mono pl__cartao-meta"></p><h4></h4><p class="pl__cartao-p"></p>' +
        '<div class="pl__nav"><button type="button" class="btn btn--linha" data-ant>‹ Anterior</button><button type="button" class="btn" data-seg>Seguinte ›</button></div></div></article>' +
        '<ol class="pl__lista"></ol>');

    var atual = null, ordem = [], idx = -1, anim = null, tourTimer = null, comprimentos = [], d = '';

    function chips() {
      if (mini) return;
      ['tempo', 'tema'].forEach(function (grp) {
        var c = box.querySelector('[data-g="' + grp + '"]');
        Object.keys(R).forEach(function (k) {
          if (R[k].grupo !== grp) return;
          var b = document.createElement('button'); b.type = 'button'; b.className = 'pl__chip'; b.textContent = R[k].rot; b.dataset.r = k;
          b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', function () { escolhe(k, true); });
          c.appendChild(b);
        });
      });
    }

    function constroiPath(lista) {
      var pts = [], marcas = [0];
      for (var i = 0; i < lista.length - 1; i++) {
        var seg = caminho(String(lista[i]), String(lista[i + 1]));
        seg.forEach(function (nid, j) { if (i > 0 && j === 0) return; pts.push(pos(nid)); });
        marcas.push(pts.length - 1);
      }
      if (lista.length === 1) pts.push(pos(String(lista[0])));
      var s = 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join('L');
      // comprimento acumulado em cada paragem
      var acc = [0];
      for (var k = 1; k < pts.length; k++) acc.push(acc[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      return { d: s, total: acc[acc.length - 1], nas: marcas.map(function (m) { return acc[m]; }) };
    }

    function escolhe(k, foco) {
      atual = k; var r = R[k]; ordem = r.p.slice(); idx = -1;
      paraTour();
      box.querySelectorAll('.pl__chip').forEach(function (b) { var on = b.dataset.r === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var total = ordem.reduce(function (s, id) { return s + P[id].min; }, 0);
      var pisos = {}; ordem.forEach(function (id) { pisos[P[id].piso] = 1; });
      painel.querySelector('.pl__tipo').textContent = r.grupo === 'tempo' ? 'Percurso por tempo' : 'Percurso por tema';
      painel.querySelector('.pl__tit').textContent = r.tit;
      painel.querySelector('.pl__sub').textContent = r.sub;
      painel.querySelector('.pl__meta').textContent = ordem.length + ' paragens · cerca de ' + (r.grupo === 'tempo' ? r.rot : total + ' min') + ' · ' + Object.keys(pisos).map(function (p) { return NOMES_PISO[p]; }).join(', ');
      var lista = painel.querySelector('.pl__lista');
      if (lista) {
        lista.innerHTML = ordem.map(function (id, i) { return '<li><button type="button" data-p="' + id + '"><span class="pl__n" style="background:' + CORES[P[id].piso] + '">' + (i + 1) + '</span><span><b>' + P[id].nome + '</b><span class="mono">' + NOMES_PISO[P[id].piso] + ' · ' + P[id].min + ' min</span></span></button></li>'; }).join('');
        lista.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { paraTour(); mostraParagem(+b.dataset.p, true); }); });
        var cartao = painel.querySelector('.pl__cartao'); if (cartao) cartao.hidden = true;
      }
      // pontos
      Object.keys(pontos).forEach(function (id) {
        var i = ordem.indexOf(+id), gp = pontos[id];
        gp.classList.toggle('fora', i < 0); gp.classList.remove('vis', 'ativo');
        gp._t.textContent = i < 0 ? '' : String(i + 1);
      });
      var c = constroiPath(ordem); d = c.d; comprimentos = c.nas;
      rasto.setAttribute('d', d); rastoBase.setAttribute('d', d);
      var L = rasto.getTotalLength();
      if (anim) anim.cancel && anim.cancel();
      if (reduz) {
        rasto.style.strokeDasharray = 'none';
        ordem.forEach(function (id) { pontos[id].classList.add('vis'); });
        return;
      }
      rasto.style.strokeDasharray = L + ' ' + L;
      var dur = Math.min(4200, 900 + L * 1.6);
      var t0 = performance.now();
      caminhante.setAttribute('opacity', 1);
      var token = {};
      anim = token;
      (function passo(now) {
        if (anim !== token) return;
        var f = Math.min(1, (now - t0) / dur), e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
        var l = e * L;
        rasto.style.strokeDashoffset = L - l;
        var pt = rasto.getPointAtLength(l);
        caminhante.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
        comprimentos.forEach(function (cl, i) { if (l >= cl - 1) pontos[ordem[i]].classList.add('vis'); });
        if (f < 1) requestAnimationFrame(passo);
        else { caminhante.setAttribute('opacity', 0); }
      })(t0);
    }

    function mostraParagem(id, foco) {
      if (mini) return;
      var i = ordem.indexOf(id);
      if (i < 0) { // paragem fora do percurso: mostra na mesma
        i = -1;
      }
      idx = i;
      Object.keys(pontos).forEach(function (k) { pontos[k].classList.toggle('ativo', +k === id); });
      painel.querySelectorAll('.pl__lista button').forEach(function (b) { b.classList.toggle('ativa', +b.dataset.p === id); });
      var p = P[id], c = painel.querySelector('.pl__cartao');
      c.hidden = false;
      var img = c.querySelector('.pl__foto-img');
      img.style.backgroundImage = "url('fotos/" + p.foto + "-960.jpg')";
      img.classList.remove('kb-on'); void img.offsetWidth; img.classList.add('kb-on');
      c.querySelector('.pl__cr').textContent = p.cr;
      c.querySelector('.pl__cartao-meta').textContent = (i >= 0 ? 'Paragem ' + (i + 1) + ' de ' + ordem.length + ' · ' : '') + NOMES_PISO[p.piso] + ' · ' + p.min + ' min';
      c.querySelector('h4').textContent = p.nome;
      c.querySelector('.pl__cartao-p').textContent = p.txt;
      c.querySelector('[data-ant]').disabled = i <= 0;
      c.querySelector('[data-seg]').disabled = i < 0 || i >= ordem.length - 1;
      c.classList.remove('entra'); void c.offsetWidth; c.classList.add('entra');
      if (!reduz && i >= 0) {
        var pt = rasto.getPointAtLength(comprimentos[i] || 0);
        caminhante.setAttribute('opacity', 1);
        caminhante.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
      }
      if (foco) c.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'nearest' });
    }

    function andaAte(i, depois) {
      if (reduz) { mostraParagem(ordem[i]); depois && depois(); return; }
      var de = idx >= 0 ? comprimentos[idx] : 0, ate = comprimentos[i] || 0, t0 = performance.now(), dur = Math.max(500, Math.abs(ate - de) * 2.2);
      var token = {}; anim = token; caminhante.setAttribute('opacity', 1);
      (function passo(now) {
        if (anim !== token) return;
        var f = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - f, 3);
        var pt = rasto.getPointAtLength(de + (ate - de) * e);
        caminhante.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
        if (f < 1) requestAnimationFrame(passo); else { mostraParagem(ordem[i]); depois && depois(); }
      })(t0);
    }
    function paraTour() {
      clearTimeout(tourTimer); tourTimer = null;
      var b = box.querySelector('[data-tour]'); if (b) b.textContent = '▶ Fazer a visita';
    }
    function tour() {
      var b = box.querySelector('[data-tour]');
      if (tourTimer) { paraTour(); return; }
      b.textContent = '❚❚ Pausa';
      var i = idx < 0 || idx >= ordem.length - 1 ? 0 : idx + 1;
      tourTimer = 1;
      (function prox() {
        if (!tourTimer) return;
        andaAte(i, function () {
          if (!tourTimer) return;
          if (i >= ordem.length - 1) { paraTour(); return; }
          i++; tourTimer = setTimeout(prox, 3200);
        });
      })();
    }

    if (!mini) {
      chips();
      box.querySelector('[data-tour]').addEventListener('click', tour);
      box.querySelector('[data-reset]').addEventListener('click', function () { escolhe('t60', true); });
      painel.addEventListener('click', function (e) {
        if (e.target.closest('[data-seg]') && idx < ordem.length - 1) { paraTour(); andaAte(idx + 1); }
        if (e.target.closest('[data-ant]') && idx > 0) { paraTour(); andaAte(idx - 1); }
      });
    }

    // arranque: quando a planta entra no ecrã
    var pedida = (location.search.match(/rota=([a-z0-9]+)/) || [])[1];
    var inicial = R[pedida] ? pedida : (R['t' + pedida] ? 't' + pedida : 't10');
    var ciclo = ['t5', 't10', 't30', 't60'], ci = 1, cicloT = null;
    function arranca() {
      escolhe(inicial);
      if (mini && !reduz) {
        cicloT = setInterval(function () { ci = (ci + 1) % ciclo.length; escolhe(ciclo[ci]); marcaMini(); }, 5200);
      }
      marcaMini();
    }
    function marcaMini() {
      if (!mini) return;
      box.closest('section') && box.closest('section').querySelectorAll('[data-rota]').forEach(function (a) { a.classList.toggle('on', a.dataset.rota === atual); });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); arranca(); } }, { threshold: .25 });
      io.observe(box);
    } else arranca();
    if (mini) {
      var sec = box.closest('section');
      sec && sec.querySelectorAll('[data-rota]').forEach(function (a) {
        a.addEventListener('mouseenter', function () { if (cicloT) { clearInterval(cicloT); cicloT = null; } if (atual !== a.dataset.rota) { escolhe(a.dataset.rota); marcaMini(); } });
      });
    }
  }

  function inicia() { document.querySelectorAll('[data-planta]').forEach(monta); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();
