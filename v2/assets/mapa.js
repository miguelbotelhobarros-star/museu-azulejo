/* Mapa do azulejo em Portugal (Azulejo Aberto): país em pontos, lugares clicáveis, linhas de comboio animadas a partir do museu
   e aproximação a Lisboa. As coordenadas são aproximadas. */
(function () {
  var svg = document.getElementById('mapaSvg');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* contorno simplificado de Portugal continental [lon, lat] */
  var PT = [[-8.87, 41.87], [-8.64, 42.03], [-8.48, 42.08], [-8.20, 42.14], [-8.08, 41.95], [-7.92, 41.88], [-7.60, 41.84], [-7.20, 41.88], [-6.95, 41.96],
    [-6.55, 41.95], [-6.19, 41.58], [-6.48, 41.30], [-6.69, 41.20], [-6.93, 41.02], [-6.80, 40.85], [-6.86, 40.45], [-6.85, 40.25], [-7.02, 39.98],
    [-7.52, 39.66], [-7.33, 39.46], [-7.05, 39.10], [-7.10, 38.88], [-7.30, 38.70], [-7.31, 38.44], [-7.10, 38.17], [-6.95, 38.20], [-7.25, 37.98],
    [-7.50, 37.55], [-7.42, 37.18], [-7.65, 37.10], [-7.93, 37.01], [-8.20, 37.08], [-8.67, 37.10], [-8.99, 37.02], [-8.80, 37.45], [-8.80, 37.92],
    [-8.90, 38.45], [-9.18, 38.42], [-9.22, 38.66], [-9.42, 38.70], [-9.50, 38.79], [-9.42, 39.10], [-9.35, 39.36], [-9.05, 39.65], [-8.89, 40.15],
    [-8.75, 40.60], [-8.66, 41.00], [-8.70, 41.18], [-8.78, 41.48], [-8.85, 41.70]];
  /* estuário do Tejo, para não pôr pontos na água em Lisboa */
  var TEJO = [[-9.25, 38.68], [-9.13, 38.70], [-9.10, 38.74], [-9.03, 38.84], [-8.93, 38.90], [-8.93, 38.74], [-9.0, 38.66], [-9.12, 38.65], [-9.25, 38.65]];

  var L = [
    { id: 'mnaz', tipo: 'museu', nome: 'Museu Nacional do Azulejo', lugar: 'Lisboa · Madre de Deus', lon: -9.1137, lat: 38.7247, foto: 'fotos/fachada-640.jpg', txt: 'O antigo Convento da Madre de Deus, fundado em 1509. Fechado para obras; a coleção continua lá fora.' },
    { id: 'calheta', tipo: 'expo', nome: 'Palácio da Calheta', lugar: 'Lisboa · Belém · Open Azulejo', lon: -9.2035, lat: 38.6975, foto: 'fotos/ig-calheta-jardim.jpg', txt: 'A exposição do museu durante as obras, com azulejos no lugar de origem e peças da coleção. Ter.–dom., 10h–17h.' },
    { id: 'fronteira', tipo: 'lugar', nome: 'Palácio Fronteira', lugar: 'Lisboa · séc. XVII', lon: -9.1797, lat: 38.7406, foto: 'fotos/caca-ao-leopardo-640.jpg', txt: 'Jardins e galerias com alguns dos mais célebres conjuntos de azulejo seiscentista, como a Galeria dos Reis.' },
    { id: 'svicente', tipo: 'lugar', nome: 'São Vicente de Fora', lugar: 'Lisboa · séc. XVIII', lon: -9.1259, lat: 38.7155, foto: 'fotos/batalha-de-isso-640.jpg', txt: 'Claustros revestidos de painéis em azul e branco.' },
    { id: 'metro', tipo: 'lugar', nome: 'Metropolitano de Lisboa', lugar: 'Lisboa · desde 1959', lon: -9.1450, lat: 38.7300, foto: 'fotos/lisbonne-1937-640.jpg', txt: 'Estações com obras de Maria Keil e de muitos outros artistas.' },
    { id: 'sintra', tipo: 'lugar', nome: 'Palácio Nacional de Sintra', lugar: 'Sintra · séc. XV–XVI', lon: -9.3904, lat: 38.7976, foto: 'fotos/hispano-mourisco-640.jpg', txt: 'O maior conjunto de azulejos hispano-mouriscos ainda no lugar.' },
    { id: 'tavira', tipo: 'expo', nome: 'O azulejo vai ao Algarve', lugar: 'Tavira · exposição', lon: -7.6506, lat: 37.1270, foto: 'fotos/bordalo-pinheiro-640.jpg', txt: 'Cerca de 70 peças da coleção do museu, longe de Lisboa. Local e datas a confirmar.' },
    { id: 'sbento', tipo: 'est', nome: 'Estação de São Bento', lugar: 'Porto · 1905–1916', lon: -8.6106, lat: 41.1456, foto: '', txt: 'O átrio coberto de painéis de Jorge Colaço com cenas da história de Portugal. Cerca de 20 mil azulejos.' },
    { id: 'pinhao', tipo: 'est', nome: 'Estação do Pinhão', lugar: 'Douro · séc. XX', lon: -7.5458, lat: 41.1907, foto: '', txt: 'Painéis em azul e branco com paisagens do Douro e a vindima.' },
    { id: 'aveiro', tipo: 'est', nome: 'Estação de Aveiro', lugar: 'Aveiro · séc. XX', lon: -8.6406, lat: 40.6440, foto: '', txt: 'A antiga estação, com painéis de paisagens e costumes da região.' },
    { id: 'vilar', tipo: 'est', nome: 'Estação de Vilar Formoso', lugar: 'Beira · séc. XX', lon: -6.8340, lat: 40.6110, foto: '', txt: 'Na fronteira, painéis com cidades e monumentos portugueses para quem chega a Portugal.' }
  ];
  var COR = { museu: '#137cc0', expo: '#ebc517', lugar: '#f3f1ea', est: '#0b0b0c' };

  /* projeção simples, com correção da latitude */
  var K = Math.cos(39.5 * Math.PI / 180), LON0 = -10.2, LAT0 = 42.4, S = 100;
  function px(lon, lat) { return [(lon - LON0) * K * S, (LAT0 - lat) * S]; }
  function dentro(pt, poly) {
    var x = pt[0], y = pt[1], d = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) d = !d;
    }
    return d;
  }
  function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  var gDots = el('g', {}, svg), gArcos = el('g', {}, svg), gMk = el('g', {}, svg);
  /* pontos do país: grelha grossa e, à volta de Lisboa, grelha fina */
  var FINO = [-9.5, -8.9, 38.48, 38.99];
  function noFino(lon, lat) { return lon > FINO[0] && lon < FINO[1] && lat > FINO[2] && lat < FINO[3]; }
  function pontos(passo, lon1, lon2, lat1, lat2, r, cls) {
    for (var lat = lat1; lat <= lat2; lat += passo) for (var lon = lon1; lon <= lon2; lon += passo / K * .9) {
      if (!cls && noFino(lon, lat)) continue;
      if (dentro([lon, lat], PT) && !dentro([lon, lat], TEJO)) { var p = px(lon, lat); el('circle', { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: r, 'class': 'dot' + (cls ? ' ' + cls : '') }, gDots); }
    }
  }
  pontos(.075, -9.6, -6.1, 36.95, 42.2, 2.1);
  pontos(.0072, FINO[0], FINO[1], FINO[2], FINO[3], .17, 'lx');

  var mus = L[0], pm = px(mus.lon, mus.lat);
  /* arcos do museu para os outros lugares */
  L.forEach(function (l, i) {
    if (i === 0) return;
    var p = px(l.lon, l.lat), mx = (pm[0] + p[0]) / 2, my = (pm[1] + p[1]) / 2, dx = p[0] - pm[0], dy = p[1] - pm[1], d = Math.hypot(dx, dy);
    var cx = mx - dy * .25, cy = my + dx * .25 - d * .1;
    var a = el('path', { d: 'M' + pm[0] + ' ' + pm[1] + ' Q' + cx + ' ' + cy + ' ' + p[0] + ' ' + p[1], 'class': 'arco' }, gArcos);
    l.arco = a;
  });
  var mk = L.map(function (l, i) {
    var p = px(l.lon, l.lat), g = el('g', { 'class': 'mk', transform: 'translate(' + p[0] + ' ' + p[1] + ')', tabindex: '0', role: 'button', 'aria-label': l.nome }, gMk);
    el('circle', { r: 6, 'class': 'anel', stroke: l.tipo === 'museu' ? '#4fa6dd' : '#ebc517' }, g);
    el('circle', { r: l.tipo === 'museu' ? 6 : 4.5, 'class': 'c', fill: COR[l.tipo], stroke: l.tipo === 'est' ? '#ebc517' : l.tipo === 'museu' ? '#fff' : 'none', 'stroke-width': 2 }, g);
    var t = el('text', { x: 9, y: 4 }, g); t.textContent = l.nome.replace('Estação de ', '').replace('Estação do ', '');
    g.addEventListener('click', function () { mostrar(i, true); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostrar(i, true); } });
    l.g = g; l.t = t; return g;
  });

  /* caixa de visão e aproximação */
  var todo = (function () { var a = px(-9.75, 42.25), b = px(-6.05, 36.9); return [a[0], a[1], b[0] - a[0], b[1] - a[1]]; })();
  var lx = (function () { var a = px(-9.43, 38.83), b = px(-9.03, 38.64); return [a[0], a[1], b[0] - a[0], b[1] - a[1]]; })();
  var vb = todo.slice(), vbAlvo = todo.slice(), zoomLx = false;
  function ajustar(box) {
    /* mantém a proporção do ecrã, centrando a caixa e deixando espaço para o cartão à esquerda */
    var r = svg.getBoundingClientRect(), ar = r.width / Math.max(1, r.height);
    var b = box.slice(), larg = window.innerWidth > 760;
    if (larg) { b[0] -= b[2] * .55; b[2] *= 1.55; }
    if (b[2] / b[3] < ar) { var nw = b[3] * ar; b[0] -= (nw - b[2]) / 2; b[2] = nw; } else { var nh = b[2] / ar; b[1] -= (nh - b[3]) / 2; b[3] = nh; }
    return b;
  }
  var escAtual = 1;
  function aplicar() {
    svg.setAttribute('viewBox', vb.map(function (v) { return v.toFixed(3); }).join(' '));
    var esc = vb[2] / svg.getBoundingClientRect().width; escAtual = esc;
    L.forEach(function (l) { if (l.arco) { l.arco.style.strokeWidth = (1.3 * esc).toFixed(4); l.arco.style.strokeDasharray = (3 * esc).toFixed(4) + ' ' + (6 * esc).toFixed(4); } });
    L.forEach(function (l) {
      var lisboa = l.lon < -9 && l.lat < 38.85;
      var s = esc * (zoomLx ? 1 : 1);
      l.g.setAttribute('transform', 'translate(' + px(l.lon, l.lat).join(' ') + ') scale(' + s.toFixed(4) + ')');
      l.t.style.display = (lisboa && !zoomLx && l.tipo !== 'museu') ? 'none' : '';
    });
  }
  var anim = null;
  function irPara(box) {
    vbAlvo = ajustar(box);
    if (reduz) { vb = vbAlvo.slice(); aplicar(); return; }
    var de = vb.slice(), t0 = performance.now();
    cancelAnimationFrame(anim);
    (function f(now) {
      var p = Math.min(1, (now - t0) / 1100), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      vb = de.map(function (v, i) { return v + (vbAlvo[i] - v) * e; }); aplicar();
      if (p < 1) anim = requestAnimationFrame(f);
    })(t0);
  }
  document.getElementById('mapaLx').addEventListener('click', function () { zoomLx = true; irPara(lx); });
  document.getElementById('mapaPt').addEventListener('click', function () { zoomLx = false; irPara(todo); });

  /* cartão */
  var atual = 0;
  function mostrar(i, voar) {
    atual = (i + L.length) % L.length; var l = L[atual];
    mk.forEach(function (g, k) { g.classList.toggle('ativo', k === atual); });
    L.forEach(function (o, k) { if (o.arco) o.arco.style.opacity = k === atual ? '1' : ''; });
    var f = document.getElementById('mapaFoto');
    f.style.backgroundImage = l.foto ? 'url(' + l.foto + ')' : 'repeating-linear-gradient(45deg,#137cc0 0 12px,#1a8ad3 12px 24px)';
    var T = { museu: 'Museu', expo: 'Exposição', lugar: 'Lugar a visitar', est: 'Estação de comboio' };
    document.getElementById('mapaLbl').textContent = T[l.tipo] + ' · ' + l.lugar;
    document.getElementById('mapaH').textContent = l.nome;
    document.getElementById('mapaP').textContent = l.txt;
    if (voar) {
      var lisboa = l.lon < -9 && l.lat < 38.85;
      if (lisboa && !zoomLx && l.tipo !== 'museu') { zoomLx = true; irPara(lx); }
      else if (!lisboa && zoomLx) { zoomLx = false; irPara(todo); }
    }
  }
  document.getElementById('mapaNext').addEventListener('click', function () { mostrar(atual + 1, true); });
  document.getElementById('mapaPrev').addEventListener('click', function () { mostrar(atual - 1, true); });

  /* arrastar para mover */
  var arr = null;
  svg.addEventListener('pointerdown', function (e) { if (e.target.closest('.mk')) return; arr = { x: e.clientX, y: e.clientY, vb: vb.slice() }; });
  addEventListener('pointermove', function (e) {
    if (!arr || e.pointerType === 'touch') return;
    var esc = vb[2] / svg.getBoundingClientRect().width;
    vb[0] = arr.vb[0] - (e.clientX - arr.x) * esc; vb[1] = arr.vb[1] - (e.clientY - arr.y) * esc; aplicar();
  });
  addEventListener('pointerup', function () { arr = null; });

  vb = ajustar(todo); aplicar(); mostrar(0, false);
  /* comboios a correr nas linhas */
  if (!reduz) (function corre(now) {
    var off = -(now / 1000 * 13 * escAtual);
    L.forEach(function (l) { if (l.arco) l.arco.style.strokeDashoffset = off.toFixed(3); });
    requestAnimationFrame(corre);
  })(performance.now());
  var rT; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { vb = ajustar(zoomLx ? lx : todo); aplicar(); }, 150); });
})();
