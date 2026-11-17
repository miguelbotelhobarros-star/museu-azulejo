/* Catálogo de peças, mapa do percurso e caça ao tesouro */
(function () {
  'use strict';
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function bg(p) {
    if (p.foto) { var f = (window.FOTOS && window.FOTOS[p.foto]) || p.foto; return 'background-image:url(\'' + esc(f) + '\');background-size:cover;background-position:center'; }
    var a = (p.padrao || 'padrao:1').split(':');
    return 'background-image:' + window.Azulejo.dataURI(window.Azulejo.unitSVG(a[0], +a[1])) + ';background-size:120px 120px';
  }

  // ---------- Catálogo ----------
  function catalogo() {
    var box = document.querySelector('[data-catalogo]');
    if (!box || !window.PECAS) return;
    var grid = box.querySelector('.pecas'), count = box.querySelector('[data-contagem]');
    var dlg = document.getElementById('ficha');
    var filtro = 'todas';
    var FILTROS = {
      todas: function () { return true; },
      montado: function (p) { return p.estado === 'montado'; },
      xvii: function (p) { return p.seculo === 'XVII'; },
      temporaria: function (p) { return p.estado === 'temporaria'; }
    };
    function draw() {
      var list = window.PECAS.filter(FILTROS[filtro]);
      count.textContent = list.length + (list.length === 1 ? ' peça' : ' peças');
      grid.innerHTML = list.map(function (p) {
        return '<button type="button" class="peca" data-id="' + esc(p.id) + '">' +
          '<span class="peca__img" style="' + bg(p) + '">' + (p.foto ? '' : '<span class="peca__aviso mono">Fotografia em breve</span>') + '</span>' +
          '<span class="peca__txt"><span class="mono">' + esc(p.data) + ' · ' + esc(p.periodo) + '</span>' +
          '<b>' + esc(p.titulo) + '</b><span class="peca__local">' + esc(p.local) + '</span></span></button>';
      }).join('');
    }
    box.querySelectorAll('[data-filtro]').forEach(function (b) {
      b.addEventListener('click', function () {
        filtro = b.dataset.filtro;
        box.querySelectorAll('[data-filtro]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        draw();
      });
    });
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.peca'); if (!b || !dlg) return;
      var p = window.PECAS.find(function (x) { return x.id === b.dataset.id; });
      var campos = [['Data', p.data], ['Autoria', p.autoria], ['Técnica', p.tecnica], ['Dimensões', p.dimensoes], ['Proveniência', p.proveniencia], ['N.º de inventário', p.inventario], ['Onde está', p.local]];
      dlg.querySelector('.ficha__corpo').innerHTML =
        '<div class="ficha__img" style="' + bg(p) + '"></div>' +
        '<div class="ficha__txt"><p class="etiqueta">' + esc(p.periodo) + '</p><h2 id="ficha-titulo">' + esc(p.titulo) + '</h2>' +
        '<p class="ficha__texto">' + esc(p.texto) + '</p><table>' +
        campos.map(function (c) { return '<tr><th>' + c[0] + '</th><td>' + esc(c[1]) + '</td></tr>'; }).join('') + '</table></div>';
      dlg.showModal();
    });
    if (dlg) {
      dlg.querySelector('[data-fechar]').addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    }
    draw();
  }

  // ---------- Mapa do percurso ----------
  function mapa() {
    var box = document.querySelector('[data-mapa]');
    if (!box) return;
    var paragens = box.querySelectorAll('[data-paragem]');
    var pontos = box.querySelectorAll('.mapa__ponto');
    function ativar(n) {
      paragens.forEach(function (p) { p.classList.toggle('ativa', p.dataset.paragem === n); });
      pontos.forEach(function (p) { p.classList.toggle('ativo', p.dataset.n === n); });
    }
    paragens.forEach(function (p) {
      p.addEventListener('click', function () { ativar(p.dataset.paragem); });
    });
    pontos.forEach(function (p) {
      p.addEventListener('click', function () {
        ativar(p.dataset.n);
        var el = box.querySelector('[data-paragem="' + p.dataset.n + '"]');
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    });
    ativar('1');
  }

  // ---------- Caça ao tesouro ----------
  function caca() {
    var box = document.querySelector('[data-caca]');
    if (!box) return;
    var KEY = 'mnaz-caca';
    var feitos = {};
    try { feitos = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { feitos = {}; }
    var itens = box.querySelectorAll('input[type=checkbox]');
    var barra = box.querySelector('.caca__barra span'), txt = box.querySelector('[data-progresso]'), fim = box.querySelector('[data-fim]');
    function update() {
      var n = 0;
      itens.forEach(function (i) { if (i.checked) n++; });
      barra.style.width = (100 * n / itens.length) + '%';
      txt.textContent = n + ' de ' + itens.length + ' pistas encontradas';
      fim.hidden = n !== itens.length;
    }
    itens.forEach(function (i) {
      i.checked = !!feitos[i.id];
      i.addEventListener('change', function () {
        feitos[i.id] = i.checked;
        try { localStorage.setItem(KEY, JSON.stringify(feitos)); } catch (e) { /* sem memória local */ }
        update();
      });
    });
    var reset = box.querySelector('[data-recomecar]');
    if (reset) reset.addEventListener('click', function () {
      itens.forEach(function (i) { i.checked = false; }); feitos = {};
      try { localStorage.removeItem(KEY); } catch (e) { /* ignorar */ }
      update();
    });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () { catalogo(); mapa(); caca(); });
})();
