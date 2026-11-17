/* Museu Nacional do Azulejo — gerador de padrões e interações
   Cada "padrão" é uma unidade de 2×2 azulejos: o mesmo quarto de desenho
   é rodado 0°, 90°, 180° e 270° à volta do centro, como nos padrões do séc. XVII. */
(function () {
  'use strict';

  var PALETTES = {
    mourisco:      { bg: '#efe6cf', a: '#2f6b4f', b: '#4a2a3f', c: '#c98a2b', line: '#4a2a3f' },
    enxaquetado:   { bg: '#f4f2ea', a: '#137cc0', b: '#2f6b4f', c: '#f4f2ea', line: '#137cc0' },
    padrao:        { bg: '#f6f4ec', a: '#137cc0', b: '#d9a322', c: '#6fb0e0', line: '#137cc0' },
    barroco:       { bg: '#f7f7f2', a: '#137cc0', b: '#4a9ad6', c: '#a9cfec', line: '#0a385c' },
    pombalino:     { bg: '#f7f6f0', a: '#137cc0', b: '#d9a322', c: '#7a4e9a', line: '#137cc0' },
    industrial:    { bg: '#e9efe9', a: '#2f6b4f', b: '#8a3b2e', c: '#d9a322', line: '#23463a' },
    contemporaneo: { bg: '#f5f5f2', a: '#137cc0', b: '#d9a322', c: '#0a385c', line: '#0a385c' }
  };

  function rng(seed) {
    var s = (seed * 9301 + 49297) % 233280 || 1;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  // Desenho de um quarto (azulejo de 100×100). O canto (100,100) é o centro do padrão.
  function quarter(kind, p, r) {
    var o = '';
    var R = function (a, b) { return a + r() * (b - a); };
    o += '<rect width="100" height="100" fill="' + p.bg + '"/>';
    if (kind === 'enxaquetado') {
      o += '<rect x="0" y="0" width="50" height="50" fill="' + p.a + '"/>';
      o += '<rect x="50" y="50" width="50" height="50" fill="' + p.a + '"/>';
      o += '<rect x="35" y="35" width="30" height="30" fill="' + p.b + '" transform="rotate(45 50 50)"/>';
      o += '<rect x="44" y="44" width="12" height="12" fill="' + p.bg + '" transform="rotate(45 50 50)"/>';
      return o;
    }
    if (kind === 'mourisco') {
      var k = R(26, 34);
      o += star(100, 100, 46, 20, 8, p.a, p.line);
      o += star(100, 100, k, k * 0.45, 8, p.c, p.line);
      o += star(0, 0, 40, 18, 8, p.b, p.line);
      o += star(50, 50, 16, 8, 8, p.c, p.line);
      o += '<path d="M0 50 L50 0 M50 100 L100 50" stroke="' + p.line + '" stroke-width="3" fill="none"/>';
      return o;
    }
    if (kind === 'contemporaneo') {
      var f = r() > .5;
      o += '<path d="M100 100 L100 ' + (f ? 20 : 40) + ' A' + (f ? 80 : 60) + ' ' + (f ? 80 : 60) + ' 0 0 0 ' + (f ? 20 : 40) + ' 100 Z" fill="' + p.a + '"/>';
      o += '<circle cx="0" cy="0" r="' + R(30, 42) + '" fill="' + p.b + '"/>';
      o += '<rect x="0" y="88" width="' + R(30, 60) + '" height="12" fill="' + p.c + '"/>';
      return o;
    }
    // padrao, barroco, pombalino, industrial: composição floral
    var ring = R(52, 70);
    o += '<circle cx="100" cy="100" r="' + ring + '" fill="' + p.a + '"/>';
    o += '<circle cx="100" cy="100" r="' + (ring - R(8, 14)) + '" fill="' + p.bg + '"/>';
    o += '<circle cx="100" cy="100" r="' + R(22, 32) + '" fill="' + p.b + '"/>';
    o += petals(100, 100, 4, R(16, 24), R(6, 9), 45, p.bg);
    // folhas em diagonal até ao canto exterior
    o += '<ellipse cx="38" cy="38" rx="' + R(16, 22) + '" ry="' + R(6, 9) + '" transform="rotate(45 38 38)" fill="' + p.a + '"/>';
    o += '<ellipse cx="38" cy="38" rx="' + R(6, 9) + '" ry="3" transform="rotate(45 38 38)" fill="' + p.c + '"/>';
    o += '<circle cx="0" cy="0" r="' + R(14, 22) + '" fill="' + p.b + '"/>';
    o += '<circle cx="0" cy="0" r="' + R(5, 9) + '" fill="' + p.a + '"/>';
    if (kind === 'barroco') {
      o += '<path d="M8 100 C 8 70, 40 78, 34 56 C 30 42, 14 50, 18 60" stroke="' + p.line + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
      o += '<path d="M100 8 C 70 8, 78 40, 56 34 C 42 30, 50 14, 60 18" stroke="' + p.line + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
    } else if (kind === 'pombalino') {
      o += '<circle cx="50" cy="0" r="7" fill="' + p.c + '"/><circle cx="0" cy="50" r="7" fill="' + p.c + '"/>';
    } else if (kind === 'industrial') {
      o += '<rect x="44" y="0" width="12" height="100" fill="' + p.line + '" opacity=".18"/>';
      o += '<rect x="0" y="44" width="100" height="12" fill="' + p.line + '" opacity=".18"/>';
    } else {
      o += '<path d="M50 0 A12 12 0 0 0 50 24 A12 12 0 0 0 50 0" fill="' + p.c + '"/>';
      o += '<path d="M0 50 A12 12 0 0 1 24 50 A12 12 0 0 1 0 50" fill="' + p.c + '"/>';
    }
    return o;
  }

  function star(cx, cy, ro, ri, n, fill, line) {
    var pts = [];
    for (var i = 0; i < n * 2; i++) {
      var ang = Math.PI * i / n - Math.PI / 2, rad = i % 2 ? ri : ro;
      pts.push((cx + rad * Math.cos(ang)).toFixed(1) + ',' + (cy + rad * Math.sin(ang)).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="' + fill + '" stroke="' + line + '" stroke-width="3" stroke-linejoin="round"/>';
  }

  function petals(cx, cy, n, rx, ry, off, fill) {
    var o = '';
    for (var i = 0; i < n; i++) {
      var a = off + i * 360 / n;
      var x = cx + rx * Math.cos(a * Math.PI / 180), y = cy + rx * Math.sin(a * Math.PI / 180);
      o += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + a + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + fill + '"/>';
    }
    return o;
  }

  var uid = 0;
  // Devolve o SVG de uma unidade 2×2 (200×200)
  function unitSVG(kind, seed, joints) {
    var p = PALETTES[kind] || PALETTES.padrao;
    var q = quarter(kind, p, rng(seed));
    var id = 'q' + (uid++);
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">' +
      '<defs><clipPath id="' + id + 'c"><rect width="100" height="100"/></clipPath>' +
      '<g id="' + id + '"><g clip-path="url(#' + id + 'c)">' + q + '</g></g></defs>' +
      '<use href="#' + id + '"/>' +
      '<use href="#' + id + '" transform="rotate(90 100 100)"/>' +
      '<use href="#' + id + '" transform="rotate(180 100 100)"/>' +
      '<use href="#' + id + '" transform="rotate(270 100 100)"/>';
    if (joints !== false) {
      s += '<path d="M100 0V200M0 100H200" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.5"/>' +
        '<rect x=".75" y=".75" width="198.5" height="198.5" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.5"/>';
    }
    return s + '</svg>';
  }

  function dataURI(svg) { return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")'; }

  window.Azulejo = { unitSVG: unitSVG, dataURI: dataURI, kinds: Object.keys(PALETTES) };

  // Aplica padrões a todos os elementos com data-tile="tipo:semente[:tamanho]"
  function paint(root) {
    (root || document).querySelectorAll('[data-tile]').forEach(function (el) {
      var parts = el.getAttribute('data-tile').split(':');
      var size = parts[2] || '160';
      el.style.backgroundImage = dataURI(unitSVG(parts[0], +parts[1] || 1));
      el.style.backgroundSize = size + 'px ' + size + 'px';
    });
  }

  // Parede de azulejos do topo: clicar num azulejo roda-o 90°
  function heroWall() {
    var wall = document.querySelector('.parede');
    if (!wall) return;
    var kinds = ['padrao', 'padrao', 'barroco', 'pombalino', 'padrao', 'mourisco'];
    var cols = 8, rows = 6, html = '';
    var falta = { 5: 1, 22: 1, 39: 1 }; // azulejos em falta: vê-se a argamassa
    for (var i = 0; i < cols * rows; i++) {
      var k = kinds[Math.floor(i / cols) % kinds.length];
      if (falta[i]) { html += '<span class="az az--falta" aria-hidden="true"></span>'; continue; }
      html += '<button type="button" class="az" style="--d:' + ((i % cols) + Math.floor(i / cols)) + '" ' +
        'data-k="' + k + '" data-s="' + (3 + Math.floor(i / cols)) + '" data-q="' + (i % 2) + (Math.floor(i / cols) % 2) + '" ' +
        'aria-label="Rodar azulejo"></button>';
    }
    wall.innerHTML = html;
    wall.querySelectorAll('.az[data-k]').forEach(function (b) {
      var img = dataURI(unitSVG(b.dataset.k, +b.dataset.s, false));
      b.style.backgroundImage = img;
      // cada botão mostra o quarto certo da unidade 2×2
      var q = b.dataset.q;
      b.style.backgroundPosition = (q[0] === '0' ? '0%' : '100%') + ' ' + (q[1] === '0' ? '0%' : '100%');
      var rot = 0;
      b.addEventListener('click', function () {
        rot += 90; b.style.setProperty('--r', rot + 'deg');
      });
    });
  }

  // Explorador de padrões (página Coleção)
  function explorer() {
    var box = document.querySelector('[data-explorador]');
    if (!box) return;
    var view = box.querySelector('.explorador__vista');
    var label = box.querySelector('[data-legenda]');
    var state = { k: 'padrao', s: 7, n: 2 };
    function draw() {
      view.style.backgroundImage = dataURI(unitSVG(state.k, state.s));
      view.style.backgroundSize = (100 / (state.n / 2)) + '% ' + (100 / (state.n / 2)) + '%';
      if (state.n === 1) { view.style.backgroundSize = '200% 200%'; view.style.backgroundPosition = '0 0'; }
      else view.style.backgroundPosition = '0 0';
      label.textContent = state.n === 1 ? '1 azulejo · 14 × 14 cm' :
        state.n + ' × ' + state.n + ' azulejos · ' + (state.n * 14) + ' × ' + (state.n * 14) + ' cm';
    }
    box.querySelectorAll('[data-k]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.k = b.dataset.k;
        box.querySelectorAll('[data-k]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        draw();
      });
    });
    box.querySelectorAll('[data-n]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.n = +b.dataset.n;
        box.querySelectorAll('[data-n]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        draw();
      });
    });
    var nova = box.querySelector('[data-nova]');
    if (nova) nova.addEventListener('click', function () { state.s = 1 + Math.floor(Math.random() * 900); draw(); });
    draw();
  }

  function menu() {
    var t = document.querySelector('.nav-toggle'), n = document.getElementById('menu');
    if (!t || !n) return;
    t.addEventListener('click', function () {
      var open = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', String(!open));
      n.classList.toggle('aberto', !open);
    });
  }

  function forms() {
    document.querySelectorAll('form[data-news]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var out = f.querySelector('.form-msg');
        var email = f.querySelector('input[type=email]');
        if (!email.value || !email.checkValidity()) { out.textContent = 'Escreva um endereço de email válido, por exemplo nome@exemplo.pt.'; return; }
        out.textContent = 'Inscrição registada. Vai receber a primeira newsletter quando houver novidades sobre a reabertura.';
        f.reset();
      });
    });
  }

  // Panorama ribeirinho (interpretação gráfica, não é reprodução da obra)
  function panorama() {
    document.querySelectorAll('[data-panorama]').forEach(function (el) {
      var W = 1400, H = 220, r = rng(17), C = '#137cc0', o = '';
      o += '<rect width="' + W + '" height="' + H + '" fill="#f7f7f2"/>';
      // colinas
      var hill = 'M0 120';
      for (var x = 0; x <= W; x += 70) hill += ' Q' + (x + 35) + ' ' + (80 + r() * 40) + ' ' + (x + 70) + ' ' + (105 + r() * 25);
      hill += ' L' + W + ' 160 L0 160Z';
      o += '<path d="' + hill + '" fill="#dfe6f6"/>';
      // casario
      for (var i = 0; i < 150; i++) {
        var bx = r() * W, bw = 10 + r() * 22, bh = 12 + r() * 34, by = 160 - bh - r() * 30;
        o += '<rect x="' + bx.toFixed(0) + '" y="' + by.toFixed(0) + '" width="' + bw.toFixed(0) + '" height="' + (160 - by).toFixed(0) + '" fill="#f7f7f2" stroke="' + C + '" stroke-width="1.4"/>';
        o += '<path d="M' + bx.toFixed(0) + ' ' + by.toFixed(0) + ' l' + (bw / 2).toFixed(0) + ' -6 l' + (bw / 2).toFixed(0) + ' 6" fill="none" stroke="' + C + '" stroke-width="1.4"/>';
        for (var wy = by + 5; wy < 152; wy += 8) o += '<rect x="' + (bx + 3).toFixed(0) + '" y="' + wy.toFixed(0) + '" width="' + Math.max(2, bw - 6).toFixed(0) + '" height="2" fill="' + C + '" opacity=".55"/>';
      }
      // torres e cúpulas
      for (var t = 0; t < 12; t++) {
        var tx = 60 + t * 112 + r() * 40, th = 40 + r() * 30;
        o += '<rect x="' + tx.toFixed(0) + '" y="' + (150 - th).toFixed(0) + '" width="12" height="' + th.toFixed(0) + '" fill="' + C + '"/>';
        o += r() > .5 ? '<path d="M' + (tx - 2).toFixed(0) + ' ' + (150 - th).toFixed(0) + ' l8 -14 l8 14Z" fill="' + C + '"/>' :
          '<circle cx="' + (tx + 6).toFixed(0) + '" cy="' + (150 - th).toFixed(0) + '" r="9" fill="' + C + '"/>';
      }
      // cais e rio
      o += '<rect x="0" y="158" width="' + W + '" height="4" fill="' + C + '"/>';
      o += '<rect x="0" y="162" width="' + W + '" height="58" fill="#eef1f8"/>';
      for (var y = 170; y < H; y += 9) {
        var d = 'M0 ' + y;
        for (var wx = 0; wx < W; wx += 24) d += ' q6 -3 12 0 t12 0';
        o += '<path d="' + d + '" fill="none" stroke="' + C + '" stroke-width="1" opacity=".45"/>';
      }
      // barcos
      for (var b = 0; b < 16; b++) {
        var sx = 30 + b * 86 + r() * 30, sy = 180 + r() * 26, s = .6 + r() * .7;
        o += '<g transform="translate(' + sx.toFixed(0) + ' ' + sy.toFixed(0) + ') scale(' + s.toFixed(2) + ')">' +
          '<path d="M-22 0 L22 0 L15 9 L-15 9Z" fill="' + C + '"/><path d="M0 0 V-34" stroke="' + C + '" stroke-width="2"/>' +
          '<path d="M2 -32 Q18 -18 2 -4Z" fill="' + C + '" opacity=".75"/><path d="M-2 -28 Q-14 -16 -2 -6Z" fill="' + C + '" opacity=".5"/></g>';
      }
      // grelha de azulejos
      for (var gx = 0; gx <= W; gx += 22) o += '<path d="M' + gx + ' 0V' + H + '" stroke="#ffffff" stroke-width="1.2" opacity=".9"/>';
      for (var gy = 0; gy <= H; gy += 22) o += '<path d="M0 ' + gy + 'H' + W + '" stroke="#ffffff" stroke-width="1.2" opacity=".9"/>';
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + o + '</svg>';
      el.style.backgroundImage = dataURI(svg);
      el.style.backgroundSize = 'cover';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    paint(); heroWall(); explorer(); menu(); forms(); panorama();
  });
})();
