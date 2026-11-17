/* Maqueta 3D do convento (Three.js r128).
   Três pisos que se separam no espaço, paragens clicáveis, percursos por tempo e por tema desenhados em 3D,
   visita guiada com câmara que voa de sala em sala e uma caça ao tesouro.
   A planta é esquemática: as coordenadas vêm da planta da versão 1 (0–900 × 0–600) e devem ser acertadas com a planta real. */
(function () {
  var stage = document.getElementById('c3dStage');
  if (!stage) return;
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv = document.getElementById('c3dCv'), labels = document.getElementById('c3dLabels');
  function falhar() { document.getElementById('c3dFallback').hidden = false; cv.style.display = 'none'; }
  if (!window.THREE) { falhar(); return; }
  var T = window.THREE, renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true }); } catch (e) { falhar(); return; }

  /* ---------- dados ---------- */
  var P = {
    1: { nome: 'Entrada e receção', piso: 0, x: 440, y: 528, foto: 'entrada', min: 3, txt: 'Bilhetes, bengaleiro e planta do museu. O portal manuelino lembra que entra num convento fundado em 1509.' },
    2: { nome: 'Claustro grande', piso: 0, x: 430, y: 320, foto: 'claustro', min: 4, txt: 'O coração do convento. Todas as alas dão para aqui: se se perder, volte ao claustro.' },
    3: { nome: 'Hispano-mourisco', piso: 0, x: 170, y: 405, foto: 'hispano-mourisco', min: 6, txt: 'Séc. XV–XVI. Corda-seca e aresta, vindos de Sevilha: os primeiros azulejos usados em Portugal.' },
    4: { nome: 'Majólica', piso: 0, x: 170, y: 510, foto: 'nossa-senhora-da-vida', min: 6, txt: 'Séc. XVI. O retábulo de Nossa Senhora da Vida, um altar inteiro feito de azulejo, c. 1580.' },
    5: { nome: 'Século XVII', piso: 0, x: 640, y: 512, foto: 'padrao-marvila', min: 6, txt: 'Padrões que cobrem paredes inteiras como tapetes, enxaquetados e frontais de altar.' },
    6: { nome: 'Igreja da Madre de Deus', piso: 0, x: 380, y: 95, foto: 'igreja', min: 8, txt: 'Talha dourada, telas e paredes de azulejo. Um dos interiores barrocos mais completos de Lisboa.' },
    7: { nome: 'Coro alto', piso: 1, x: 125, y: 95, foto: 'coro-alto', min: 5, txt: 'O lugar das monjas clarissas, sobre a entrada da igreja, com talha e pintura.' },
    8: { nome: 'Capela de Santo António', piso: 1, x: 700, y: 95, foto: 'capela-azulejos', min: 5, txt: 'Decoração barroca do século XVIII e telas do pintor André Gonçalves.' },
    9: { nome: 'Azul e branco', piso: 1, x: 670, y: 262, foto: 'batalha-de-isso', min: 8, txt: 'O Ciclo dos Mestres: grandes painéis figurativos pintados só a azul, c. 1690–1750.' },
    10: { nome: 'Pombalino e século XIX', piso: 1, x: 670, y: 382, foto: 'soldado', min: 7, txt: 'Da reconstrução de Lisboa às fachadas industriais. Procure as figuras de convite.' },
    11: { nome: 'Grande Vista de Lisboa', piso: 2, x: 832, y: 320, foto: 'grande-vista', min: 8, txt: 'Os 23 metros da cidade vista do rio, cerca de 1700, antes do terramoto de 1755.' },
    12: { nome: 'Séculos XX e XXI', piso: 2, x: 832, y: 512, foto: 'lisbonne-1937', min: 6, txt: 'Arte pública, metro e criação contemporânea. A saída faz-se pelo elevador.' },
    14: { nome: 'Cafetaria · antiga cozinha', piso: 0, x: 640, y: 300, foto: 'ref-cafetaria', min: 15, txt: 'A cozinha do convento, com painéis de peixes, carnes e caça pendurados, cobres e arcos de pedra. Hoje é a cafetaria do museu, aberta para o jardim.' },
    13: { nome: 'Claustrim', piso: 0, x: 190, y: 262, foto: 'claustrim', min: 3, txt: 'O pequeno claustro do século XVI, com revestimentos geométricos anteriores ao azul e branco.' }
  };
  var N = {
    gNO: [320, 220], gN: [430, 220], gNE: [540, 220], gE: [540, 320], gSE: [540, 420], gS: [430, 420], gSO: [320, 420], gO: [320, 320],
    pIg: [380, 175], pCoro: [125, 175], pCap: [700, 175], p9: [575, 262], p10: [575, 382], p3: [285, 405], p4: [285, 510], pS: [430, 470],
    p5: [575, 470], p11: [770, 320], p12: [770, 512], p13: [285, 262]
  };
  var A = [['gNO', 'gN'], ['gN', 'gNE'], ['gNE', 'gE'], ['gE', 'gSE'], ['gSE', 'gS'], ['gS', 'gSO'], ['gSO', 'gO'], ['gO', 'gNO'],
    ['2', 'gN'], ['2', 'gS'], ['2', 'gE'], ['2', 'gO'], ['1', 'pS'], ['pS', 'gS'], ['6', 'pIg'], ['pIg', 'gN'], ['pIg', 'gNO'], ['6', '7'], ['7', 'pCoro'], ['pCoro', 'p13'],
    ['8', 'pCap'], ['pCap', 'gNE'], ['6', '8'], ['9', 'p9'], ['p9', 'gNE'], ['p9', 'gE'], ['10', 'p10'], ['p10', 'gE'], ['p10', 'gSE'], ['9', '10'],
    ['3', 'p3'], ['p3', 'gSO'], ['p3', 'gO'], ['4', 'p4'], ['p4', 'pS'], ['3', '4'], ['5', 'p5'], ['p5', 'gSE'], ['p5', 'pS'],
    ['11', 'p11'], ['p11', '9'], ['p11', '10'], ['11', '12'], ['12', 'p12'], ['p12', '5'], ['13', 'p13'], ['p13', 'gO'], ['p13', 'gNO'], ['14', 'gE'], ['14', 'gNE']];
  var R = {
    t5: { grupo: 'tempo', rot: '5 min', tit: 'O essencial em 5 minutos', sub: 'A igreja e o claustro bastam para perceber porque este museu é único.', p: [1, 2, 6] },
    t10: { grupo: 'tempo', rot: '10 min', tit: 'Dez minutos, quatro maravilhas', sub: 'Igreja, claustro e Lisboa antes do terramoto, em 23 metros de azulejo.', p: [1, 2, 6, 11] },
    t30: { grupo: 'tempo', rot: '30 min', tit: 'Meia hora pela história', sub: 'Do azulejo de Sevilha ao azul e branco, com paragem na igreja.', p: [1, 3, 4, 2, 6, 9, 11] },
    t60: { grupo: 'tempo', rot: '1 hora', tit: 'O percurso completo', sub: 'Cinco séculos por ordem cronológica, pelos três pisos do convento.', p: [1, 13, 3, 4, 5, 2, 6, 7, 8, 9, 10, 11, 12, 14] },
    ouro: { grupo: 'tema', rot: 'Ouro e fé', tit: 'Ouro e fé', sub: 'Igrejas, capelas e altares de azulejo: o convento das clarissas.', p: [1, 4, 2, 6, 7, 8] },
    lisboa: { grupo: 'tema', rot: 'Lisboa em azulejo', tit: 'Lisboa em azulejo', sub: 'A cidade antes e depois do terramoto, e o azulejo que saiu à rua.', p: [1, 2, 10, 11, 12] },
    familia: { grupo: 'tema', rot: 'Com crianças', tit: 'Com crianças', sub: 'Curto e cheio de bichos, barcos e anjos. Acaba com um lanche entre peixes de azulejo.', p: [1, 2, 4, 6, 11, 14] },
    tesouro: { grupo: 'tema', rot: '★ Caça ao tesouro', tit: 'Caça ao tesouro', sub: 'Cinco pistas, cinco salas. Encontre cada pormenor antes de passar à seguinte.', p: [1, 3, 2, 10, 11, 4],
      pista: { 1: 'Antes de entrar: quantos anos tinha o convento quando nasceu o museu, em 1965?', 3: 'Encontre um azulejo com relevo. Siga as linhas em corda-seca com os olhos, não com as mãos.', 2: 'Conte as arcadas de um dos lados do claustro.', 10: 'Procure uma figura de convite: alguém pintado à porta, a receber quem chega.', 11: 'Na Grande Vista, encontre um barco à vela no Tejo.', 4: 'Última pista: descubra as colunas pintadas que fingem ser de pedra.' } }
  };

  /* ---------- grafo e caminhos ---------- */
  function pos(id) { return P[id] ? [P[id].x, P[id].y] : N[id]; }
  var G = {};
  A.forEach(function (a) {
    var d = Math.hypot(pos(a[0])[0] - pos(a[1])[0], pos(a[0])[1] - pos(a[1])[1]);
    (G[a[0]] = G[a[0]] || []).push([a[1], d]); (G[a[1]] = G[a[1]] || []).push([a[0], d]);
  });
  function caminho(a, b) {
    var dist = {}, prev = {}, vis = {}; dist[a] = 0;
    for (;;) {
      var u = null;
      for (var k in dist) if (!vis[k] && (u === null || dist[k] < dist[u])) u = k;
      if (u === null || u === b) break;
      vis[u] = true;
      (G[u] || []).forEach(function (e) { var nd = dist[u] + e[1]; if (dist[e[0]] === undefined || nd < dist[e[0]]) { dist[e[0]] = nd; prev[e[0]] = u; } });
    }
    var r = [b]; while (r[0] !== a) r.unshift(prev[r[0]]);
    return r;
  }

  /* ---------- cena ---------- */
  var ESC = 1 / 60, CX = 470, CY = 300;
  function X(x) { return (x - CX) * ESC; }
  function Z(y) { return (y - CY) * ESC; }
  var explodir = 1, explodirAlvo = 1;
  function alturaPiso(f) { return f * (1.05 + 1.75 * explodir); }

  var scene = new T.Scene();
  var FUNDO = 0x0b0e12;
  scene.background = new T.Color(FUNDO);
  scene.fog = new T.Fog(FUNDO, 26, 58);
  var camera = new T.PerspectiveCamera(34, 1, .1, 200);
  scene.add(new T.HemisphereLight(0xdfe9f2, 0x1a1a1f, .9));
  var sol = new T.DirectionalLight(0xffffff, .55); sol.position.set(-8, 14, 10); scene.add(sol);

  /* textura de azulejo desenhada em canvas */
  function texturaAzulejo(fundo, tinta) {
    var s = 128, c = document.createElement('canvas'); c.width = c.height = s;
    var g = c.getContext('2d');
    g.fillStyle = fundo; g.fillRect(0, 0, s, s);
    g.strokeStyle = tinta; g.fillStyle = tinta; g.lineWidth = 5;
    [[0, 0], [s, 0], [0, s], [s, s]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], s * .36, 0, Math.PI * 2); g.stroke(); });
    g.beginPath(); g.moveTo(s / 2, s * .2); g.lineTo(s * .8, s / 2); g.lineTo(s / 2, s * .8); g.lineTo(s * .2, s / 2); g.closePath(); g.fill();
    g.fillStyle = fundo; g.beginPath(); g.arc(s / 2, s / 2, s * .1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(0, 0, s, s);
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4;
    return t;
  }

  /* volumes: [x1, x2, y1, y2, piso, altura em pisos, tipo] */
  var V = [
    [250, 560, 30, 165, 0, 2, 'igreja'],
    [100, 300, 195, 228, 0, 1], [100, 300, 302, 330, 0, 1], [100, 135, 228, 302, 0, 1], [262, 300, 228, 302, 0, 1],
    [100, 300, 345, 565, 0, 1], [300, 560, 445, 565, 0, 1], [560, 720, 445, 565, 0, 1], [565, 720, 195, 430, 0, 1], [720, 890, 250, 570, 0, 1],
    [300, 560, 195, 220, 0, .55, 'arcada'], [300, 560, 420, 445, 0, .55, 'arcada'], [295, 320, 220, 420, 0, .55, 'arcada'], [540, 565, 220, 420, 0, .55, 'arcada'],
    [60, 250, 30, 165, 1, 1], [600, 780, 30, 165, 1, 1], [565, 720, 195, 430, 1, 1], [100, 300, 345, 565, 1, 1, 'vazio'], [720, 890, 250, 570, 1, 1, 'vazio'],
    [300, 560, 195, 220, 1, .55, 'arcada'], [300, 560, 420, 445, 1, .55, 'arcada'], [295, 320, 220, 420, 1, .55, 'arcada'], [540, 565, 220, 420, 1, .55, 'arcada'],
    [720, 890, 250, 570, 2, 1], [565, 720, 250, 430, 2, .9, 'vazio']
  ];
  var pisos = [new T.Group(), new T.Group(), new T.Group()];
  pisos.forEach(function (g) { scene.add(g); });
  var matsPiso = [[], [], []];
  var ALT = .85;
  V.forEach(function (v) {
    var w = (v[1] - v[0]) * ESC, d = (v[3] - v[2]) * ESC, h = ALT * v[5] * (v[6] === 'igreja' ? 1.25 : 1);
    var tipo = v[6] || 'sala';
    var geo = new T.BoxGeometry(w, h, d);
    var cor = tipo === 'igreja' ? 0x3a2f12 : tipo === 'vazio' ? 0x15191e : 0x1a2c3b;
    var op = tipo === 'vazio' ? .18 : tipo === 'arcada' ? .22 : .38;
    var m = new T.MeshLambertMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false });
    var mesh = new T.Mesh(geo, m);
    var ecor = tipo === 'igreja' ? 0xebc517 : tipo === 'vazio' ? 0x4a525c : 0x9fc7e6;
    var lm = new T.LineBasicMaterial({ color: ecor, transparent: true, opacity: tipo === 'vazio' ? .35 : .75 });
    var linhas = new T.LineSegments(new T.EdgesGeometry(geo), lm);
    var g = new T.Group(); g.add(mesh); g.add(linhas);
    g.position.set(X((v[0] + v[1]) / 2), h / 2 + .02, Z((v[2] + v[3]) / 2));
    pisos[v[4]].add(g);
    matsPiso[v[4]].push({ m: m, op: op }, { m: lm, op: lm.opacity });
  });
  /* placas dos pisos */
  var placaGeo = new T.PlaneGeometry((900 - 40) * ESC, (590 - 15) * ESC);
  for (var f = 0; f < 3; f++) {
    var pm = new T.MeshBasicMaterial({ color: 0x9fc7e6, transparent: true, opacity: .035, depthWrite: false, side: T.DoubleSide });
    var placa = new T.Mesh(placaGeo, pm); placa.rotation.x = -Math.PI / 2; placa.position.set(X(470), 0, Z(302));
    var contorno = new T.LineSegments(new T.EdgesGeometry(placaGeo), new T.LineBasicMaterial({ color: 0x9fc7e6, transparent: true, opacity: .25 }));
    contorno.rotation.x = -Math.PI / 2; contorno.position.copy(placa.position);
    pisos[f].add(placa); pisos[f].add(contorno);
    matsPiso[f].push({ m: pm, op: .035 }, { m: contorno.material, op: .25 });
  }
  /* pátio do claustro em azulejo, poço e claustrim */
  var texA = texturaAzulejo('#f4f2ec', '#137cc0'); texA.repeat.set(6, 5.5);
  var patio = new T.Mesh(new T.PlaneGeometry(220 * ESC, 200 * ESC), new T.MeshLambertMaterial({ map: texA }));
  patio.rotation.x = -Math.PI / 2; patio.position.set(X(430), .01, Z(320)); pisos[0].add(patio);
  var poco = new T.Mesh(new T.CylinderGeometry(.28, .32, .3, 24), new T.MeshLambertMaterial({ color: 0xebc517 }));
  poco.position.set(X(430), .15, Z(320)); pisos[0].add(poco);
  var texB = texturaAzulejo('#e9e4d6', '#b48a12'); texB.repeat.set(3, 3);
  var claustrim = new T.Mesh(new T.PlaneGeometry(127 * ESC, 74 * ESC), new T.MeshLambertMaterial({ map: texB }));
  claustrim.rotation.x = -Math.PI / 2; claustrim.position.set(X(198), .01, Z(265)); pisos[0].add(claustrim);
  matsPiso[0].push({ m: patio.material, op: 1 }, { m: poco.material, op: 1 }, { m: claustrim.material, op: 1 });
  patio.material.transparent = poco.material.transparent = claustrim.material.transparent = true;
  /* chão: grelha discreta */
  var grelha = new T.GridHelper(40, 40, 0x1c2630, 0x141b22); grelha.position.y = -.02; scene.add(grelha);

  /* hastes das paragens */
  var hastes = {};
  Object.keys(P).forEach(function (id) {
    var g = new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0, 0), new T.Vector3(0, .55, 0)]);
    var l = new T.Line(g, new T.LineBasicMaterial({ color: 0xebc517, transparent: true, opacity: .8 }));
    var base = new T.Mesh(new T.CircleGeometry(.12, 20), new T.MeshBasicMaterial({ color: 0xebc517, transparent: true, opacity: .9 }));
    base.rotation.x = -Math.PI / 2; base.position.y = .03;
    var h = new T.Group(); h.add(l); h.add(base);
    h.position.set(X(P[id].x), 0, Z(P[id].y));
    pisos[P[id].piso].add(h); hastes[id] = h;
  });

  /* ---------- pins e rótulos (HTML) ---------- */
  var pins = {};
  Object.keys(P).forEach(function (id) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pin';
    b.innerHTML = '<span class="num-pin">' + id + '</span><span class="nome">' + P[id].nome + '</span>';
    b.setAttribute('aria-label', P[id].nome + ', piso ' + P[id].piso);
    b.addEventListener('click', function (e) { e.stopPropagation(); selecionar(+id, true); });
    labels.appendChild(b); pins[id] = b;
  });
  var rotPiso = [0, 1, 2].map(function (f) { var s = document.createElement('span'); s.className = 'pisolbl'; s.textContent = 'Piso ' + f; labels.appendChild(s); return s; });

  /* ---------- câmara orbital ---------- */
  var cam = { th: -.55, ph: .98, r: 23, tx: 0, ty: 1.6, tz: 0 }, alvo = { th: -.55, ph: .98, r: 23, tx: 0, ty: 1.6, tz: 0 };
  var rodar = !reduz, interagir = false;
  function raioBase() { var a = stage.clientWidth / stage.clientHeight; return a < .8 ? 44 : a < 1.2 ? 34 : 28; }
  function aplicarCam() {
    var k = reduz ? 1 : .085;
    ['th', 'ph', 'r', 'tx', 'ty', 'tz'].forEach(function (p) { cam[p] += (alvo[p] - cam[p]) * k; });
    var sp = Math.sin(cam.ph);
    camera.position.set(cam.tx + cam.r * sp * Math.sin(cam.th), cam.ty + cam.r * Math.cos(cam.ph), cam.tz + cam.r * sp * Math.cos(cam.th));
    camera.lookAt(cam.tx, cam.ty, cam.tz);
  }
  var arr = null;
  stage.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button,.c3d-card')) return;
    arr = { x: e.clientX, y: e.clientY, th: alvo.th, ph: alvo.ph, mov: false }; interagir = true;
    stage.classList.add('drag');
  });
  addEventListener('pointermove', function (e) {
    if (!arr) return;
    var dx = e.clientX - arr.x, dy = e.clientY - arr.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) arr.mov = true;
    alvo.th = arr.th - dx * .008;
    if (e.pointerType !== 'touch') alvo.ph = Math.max(.06, Math.min(1.42, arr.ph - dy * .006));
    if (rodar && arr.mov) definirRodar(false);
  });
  addEventListener('pointerup', function () { arr = null; stage.classList.remove('drag'); });
  addEventListener('pointercancel', function () { arr = null; stage.classList.remove('drag'); });
  stage.addEventListener('pointerleave', function () { interagir = false; });
  stage.addEventListener('wheel', function (e) {
    if (!interagir && !e.ctrlKey) return;
    e.preventDefault();
    alvo.r = Math.max(8, Math.min(48, alvo.r * (1 + e.deltaY * .0012)));
  }, { passive: false });
  /* dois dedos para aproximar */
  var toques = {}, dist0 = 0, r0 = 0;
  stage.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { dist0 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); r0 = alvo.r; } }, { passive: true });
  stage.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2 && dist0) { e.preventDefault(); var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); alvo.r = Math.max(8, Math.min(48, r0 * dist0 / d)); }
  }, { passive: false });
  stage.addEventListener('touchend', function () { dist0 = 0; });

  var bRodar = document.getElementById('c3dRodar'), bExp = document.getElementById('c3dExplodir');
  function definirRodar(v) { rodar = v; bRodar.setAttribute('aria-pressed', String(v)); }
  definirRodar(rodar);
  bRodar.addEventListener('click', function () { definirRodar(!rodar); });
  bExp.addEventListener('click', function () { explodirAlvo = explodirAlvo ? 0 : 1; bExp.setAttribute('aria-pressed', String(!!explodirAlvo)); construirRota(); });
  document.getElementById('c3dCima').addEventListener('click', function () { definirRodar(false); alvo.ph = .06; alvo.th = 0; alvo.r = raioBase() + 2; });
  document.getElementById('c3dIso').addEventListener('click', function () { alvo.ph = .96; alvo.th = Math.PI / 4 - Math.PI / 2; alvo.r = raioBase(); });

  /* filtro de pisos */
  var pisoAtivo = -1;
  Array.prototype.forEach.call(document.querySelectorAll('.c3d-pisos button'), function (b) {
    b.addEventListener('click', function () {
      pisoAtivo = +b.getAttribute('data-piso');
      Array.prototype.forEach.call(document.querySelectorAll('.c3d-pisos button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      matsPiso.forEach(function (lista, f) { lista.forEach(function (o) { o.m.opacity = (pisoAtivo < 0 || pisoAtivo === f) ? o.op : o.op * .12; }); });
      alvo.ty = pisoAtivo < 0 ? 1.6 : alturaPisoAlvo(pisoAtivo) + .3;
      atualizarPins();
    });
  });
  function alturaPisoAlvo(f) { return f * (1.05 + 1.75 * explodirAlvo); }

  /* ---------- percursos ---------- */
  var rotaAtual = 't30', tubo = null, visitante = null, curva = null, paramParagem = {}, desenho = 0, desenhoAlvo = 1, ordem = [];
  var matTubo = new T.MeshBasicMaterial({ color: 0xebc517 });
  visitante = new T.Mesh(new T.SphereGeometry(.14, 20, 16), new T.MeshBasicMaterial({ color: 0xffffff }));
  var halo = new T.Mesh(new T.SphereGeometry(.3, 20, 16), new T.MeshBasicMaterial({ color: 0xebc517, transparent: true, opacity: .25 }));
  visitante.add(halo); scene.add(visitante);
  var posVis = 0, posVisAlvo = 0;

  function construirRota() {
    var r = R[rotaAtual], pts = [], comp = [0], total = 0;
    ordem = r.p.slice();
    function ponto(x, y, h) { return new T.Vector3(X(x), h + .14, Z(y)); }
    paramParagem = {};
    for (var i = 0; i < ordem.length - 1; i++) {
      var a = String(ordem[i]), b = String(ordem[i + 1]), cam_ = caminho(a, b);
      var ha = alturaPisoAlvo(P[a].piso), hb = alturaPisoAlvo(P[b].piso);
      var seg = [0], tot = 0;
      for (var j = 1; j < cam_.length; j++) { var p0 = pos(cam_[j - 1]), p1 = pos(cam_[j]); tot += Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); seg.push(tot); }
      for (j = (i === 0 ? 0 : 1); j < cam_.length; j++) {
        var pp = pos(cam_[j]), f = tot ? seg[j] / tot : 1;
        var h = ha + (hb - ha) * (f * f * (3 - 2 * f));
        pts.push(ponto(pp[0], pp[1], h));
      }
    }
    if (ordem.length === 1) pts.push(ponto(P[ordem[0]].x, P[ordem[0]].y, alturaPisoAlvo(P[ordem[0]].piso)));
    /* pontos intermédios para arredondar sem fugir dos corredores */
    var dens = [];
    for (i = 0; i < pts.length - 1; i++) { dens.push(pts[i]); dens.push(pts[i].clone().lerp(pts[i + 1], .5)); }
    dens.push(pts[pts.length - 1]);
    curva = new T.CatmullRomCurve3(dens, false, 'centripetal', .2);
    /* parâmetro de cada paragem ao longo da curva */
    var L = curva.getLengths(600);
    ordem.forEach(function (id, k) {
      var alvoP = ponto(P[id].x, P[id].y, alturaPisoAlvo(P[id].piso)), melhor = 0, md = 1e9;
      var ini = k === 0 ? 0 : (paramParagem[ordem[k - 1]] || 0);
      for (var s = 0; s <= 300; s++) { var u = ini + (1 - ini) * s / 300, d = curva.getPointAt(Math.min(1, u)).distanceTo(alvoP); if (d < md) { md = d; melhor = u; } }
      paramParagem[id] = melhor;
    });
    if (tubo) { scene.remove(tubo); tubo.geometry.dispose(); }
    var segs = Math.max(80, dens.length * 14);
    tubo = new T.Mesh(new T.TubeGeometry(curva, segs, .055, 8, false), matTubo);
    tubo.userData.total = tubo.geometry.index.count;
    scene.add(tubo);
    desenho = reduz ? 1 : 0; desenhoAlvo = 1;
    posVis = posVisAlvo = 0;
  }

  /* painel */
  var chipsTempo = document.getElementById('chipsTempo'), chipsTema = document.getElementById('chipsTema');
  Object.keys(R).forEach(function (k) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = R[k].rot; b.setAttribute('data-r', k);
    b.addEventListener('click', function () { escolherRota(k); });
    (R[k].grupo === 'tempo' ? chipsTempo : chipsTema).appendChild(b);
  });
  var lista = document.getElementById('rotaLista');
  function escolherRota(k) {
    rotaAtual = k; fecharCard(); passo = -1;
    Array.prototype.forEach.call(document.querySelectorAll('[data-r]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-r') === k)); });
    var r = R[k];
    document.getElementById('rotaH').textContent = r.tit;
    document.getElementById('rotaSub').textContent = r.sub;
    var min = r.p.reduce(function (s, id) { return s + (id === 14 ? 0 : P[id].min); }, 0);
    document.getElementById('rotaMin').textContent = r.p.length + ' paragens · cerca de ' + min + ' min';
    lista.innerHTML = '';
    r.p.forEach(function (id, i) {
      var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<span>' + P[id].nome + '</span><small>Piso ' + P[id].piso + '</small>';
      b.addEventListener('click', function () { passo = i; selecionar(id, true); });
      li.appendChild(b); lista.appendChild(li);
    });
    construirRota(); atualizarPins();
  }
  function atualizarPins() {
    Object.keys(pins).forEach(function (id) {
      var i = ordem.indexOf(+id), b = pins[id];
      b.classList.toggle('na-rota', i >= 0);
      b.querySelector('.num-pin').textContent = i >= 0 ? (rotaAtual === 'tesouro' && i > 0 ? '★' : String(i + 1)) : '·';
      b.classList.toggle('fora', i < 0 || (pisoAtivo >= 0 && P[id].piso !== pisoAtivo));
    });
  }

  /* cartão da paragem e visita guiada */
  var card = document.getElementById('c3dCard'), selecionada = 0, passo = -1;
  function selecionar(id, voar) {
    selecionada = id;
    var p = P[id], i = ordem.indexOf(id);
    if (i >= 0) passo = i;
    Object.keys(pins).forEach(function (k) { pins[k].classList.toggle('ativo', +k === id); });
    Array.prototype.forEach.call(lista.querySelectorAll('button'), function (b, k) { b.classList.toggle('ativo', ordem[k] === id); });
    var img = document.getElementById('c3dCardImg'); img.src = 'fotos/' + p.foto + '-640.jpg'; img.alt = p.nome;
    document.getElementById('c3dCardLbl').textContent = 'Piso ' + p.piso + ' · ' + p.min + ' min' + (i >= 0 ? ' · paragem ' + (i + 1) + ' de ' + ordem.length : '');
    document.getElementById('c3dCardH').textContent = p.nome;
    document.getElementById('c3dCardP').textContent = p.txt;
    var pista = document.getElementById('c3dCardPista'), ps = R[rotaAtual].pista;
    pista.hidden = !(ps && ps[id]); if (ps && ps[id]) pista.textContent = '★ ' + ps[id];
    document.getElementById('c3dCardNav').hidden = i < 0;
    document.getElementById('c3dPrev').disabled = i <= 0;
    document.getElementById('c3dNext').textContent = i >= ordem.length - 1 ? 'Recomeçar ↺' : 'Seguinte →';
    card.hidden = false;
    if (i >= 0) posVisAlvo = paramParagem[id] || 0;
    if (voar) {
      definirRodar(false);
      alvo.tx = X(p.x); alvo.tz = Z(p.y); alvo.ty = alturaPisoAlvo(p.piso) + .3;
      alvo.r = Math.max(11, raioBase() * .6); alvo.ph = Math.min(alvo.ph, .95);
      if (window.innerWidth < 980) alvo.tz += 1.2;
    }
  }
  function fecharCard() {
    card.hidden = true; selecionada = 0; passo = -1;
    Object.keys(pins).forEach(function (k) { pins[k].classList.remove('ativo'); });
    alvo.tx = 0; alvo.tz = 0; alvo.ty = pisoAtivo < 0 ? 1.6 : alturaPisoAlvo(pisoAtivo) + .3; alvo.r = raioBase();
  }
  document.getElementById('c3dCardX').addEventListener('click', fecharCard);
  document.getElementById('c3dVisita').addEventListener('click', function () { passo = 0; selecionar(ordem[0], true); if (window.innerWidth < 980) stage.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' }); });
  document.getElementById('c3dNext').addEventListener('click', function () { passo = passo >= ordem.length - 1 ? 0 : passo + 1; selecionar(ordem[passo], true); });
  document.getElementById('c3dPrev').addEventListener('click', function () { if (passo > 0) { passo--; selecionar(ordem[passo], true); } });

  /* ---------- ciclo ---------- */
  var visivel = true, v3 = new T.Vector3(), W = 0, H = 0, ultimoExp = -1;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; if (visivel) requestAnimationFrame(loop); }, { rootMargin: '100px' }).observe(stage);
  function tamanho() {
    W = stage.clientWidth; H = stage.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    if (!selecionada) alvo.r = raioBase();
  }
  addEventListener('resize', tamanho);
  function projetar(x, y, z, el, off) {
    v3.set(x, y, z).project(camera);
    var vis = v3.z < 1;
    el.style.transform = 'translate(' + ((v3.x * .5 + .5) * W).toFixed(1) + 'px,' + ((-v3.y * .5 + .5) * H).toFixed(1) + 'px) ' + (off || 'translate(-50%,-50%)');
    el.style.visibility = vis ? '' : 'hidden';
  }
  var tAnt = performance.now();
  function loop(now) {
    if (!visivel) return;
    var dt = Math.min(.05, (now - tAnt) / 1000); tAnt = now;
    if (rodar && !arr) alvo.th += dt * .12;
    explodir += (explodirAlvo - explodir) * (reduz ? 1 : .07);
    if (Math.abs(explodir - ultimoExp) > .0005) {
      for (var f = 0; f < 3; f++) pisos[f].position.y = alturaPiso(f);
      ultimoExp = explodir;
    }
    if (tubo) {
      tubo.visible = Math.abs(explodir - explodirAlvo) < .02;
      desenho += (desenhoAlvo - desenho) * (reduz ? 1 : .03);
      var n = Math.floor(tubo.userData.total * Math.min(1, desenho * 1.02) / 3) * 3;
      tubo.geometry.setDrawRange(0, n);
      var lim = Math.min(posVisAlvo, desenho);
      posVis += (lim - posVis) * (reduz ? 1 : .05);
      if (!card.hidden || passo >= 0) { } else if (desenho > .99 && !reduz) { posVisAlvo = (posVisAlvo + dt * .04) % 1; if (posVisAlvo < posVis) posVis = posVisAlvo; }
      visitante.position.copy(curva.getPointAt(Math.max(0, Math.min(1, posVis))));
      visitante.visible = tubo.visible;
      halo.scale.setScalar(1 + .25 * Math.sin(now / 250));
    }
    aplicarCam();
    renderer.render(scene, camera);
    Object.keys(P).forEach(function (id) { projetar(X(P[id].x), alturaPiso(P[id].piso) + .7, Z(P[id].y), pins[id]); });
    rotPiso.forEach(function (el, f) {
      projetar(X(40), alturaPiso(f) + .05, Z(590), el, 'translate(-100%,-50%)');
      el.style.opacity = explodir > .5 && (pisoAtivo < 0 || pisoAtivo === f) ? '1' : '0';
    });
    requestAnimationFrame(loop);
  }
  tamanho();
  escolherRota('t30');
  alvo.r = raioBase(); cam.r = alvo.r + (reduz ? 0 : 14); cam.th = alvo.th - (reduz ? 0 : 1.2);
  requestAnimationFrame(loop);
})();
