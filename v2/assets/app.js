/* Versão 2 · comportamento geral: navegação, parede luminosa, manifesto, revelações, coleção e agenda. */
(function () {
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* navegação */
  var nav = $('#nav');
  function navSolida() { nav.classList.toggle('solid', window.scrollY > 40); }
  addEventListener('scroll', navSolida, { passive: true }); navSolida();
  var mb = $('#menuBtn'), mm = $('#menuMob');
  mb.addEventListener('click', function () { var a = mb.getAttribute('aria-expanded') === 'true'; mb.setAttribute('aria-expanded', String(!a)); mm.hidden = a; });
  $$('a', mm).forEach(function (a) { a.addEventListener('click', function () { mb.setAttribute('aria-expanded', 'false'); mm.hidden = true; }); });

  /* parede de fotografias com luz que segue o cursor */
  var FOTOS = ['igreja-talha', 'claustro', 'padrao-marvila', 'hispano-mourisco', 'capela-tecto', 'batalha-de-isso', 'ig-oficina-pincel', 'casamento-da-galinha',
    'claustrim', 'lisbonne-1937', 'igreja-altar', 'caca-ao-leopardo', 'ig-criancas-azulejos', 'frontal-de-altar', 'nossa-senhora-da-vida', 'coro-alto',
    'bordalo-pinheiro', 'soldado', 'capela-azulejos', 'ig-restauro', 'grande-vista', 'licao-de-danca', 'ig-santo-antonio', 'mulher-ao-toucador', 'portal', 'claustrim-2', 'ig-azulejo-ave', 'sala-azulejos'];
  function src(n) { return 'fotos/' + n + (n.indexOf('ig-') === 0 ? '.jpg' : '-640.jpg'); }
  var parede = $('#parede'), luz = $('#paredeLuz'), cols = [];
  function montarParede() {
    parede.innerHTML = ''; cols = [];
    var n = window.innerWidth < 600 ? 4 : window.innerWidth < 1000 ? 6 : 8, k = 0;
    for (var i = 0; i < n; i++) {
      var col = document.createElement('div'); col.className = 'col';
      for (var j = 0; j < 7; j++) {
        var t = document.createElement('div'); t.className = 'tile';
        t.style.backgroundImage = 'url(' + src(FOTOS[(k++ * 5 + i) % FOTOS.length]) + ')';
        col.appendChild(t);
      }
      parede.appendChild(col); cols.push({ el: col, v: (i % 2 ? 1 : -1) * (12 + (i * 7) % 11) });
    }
  }
  montarParede();
  var rT; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(montarParede, 200); });
  var hero = $('.hero'), mx = .62, my = .38, tx = mx, ty = my, rato = false;
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; rato = true;
  });
  hero.addEventListener('pointerleave', function () { rato = false; });
  var heroVisivel = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { heroVisivel = es[0].isIntersecting; }).observe(hero);
  var tIni = performance.now();
  function animarParede(now) {
    var s = (now - tIni) / 1000;
    if (heroVisivel) {
      if (!rato && !reduz) { tx = .55 + Math.sin(s * .35) * .28; ty = .4 + Math.sin(s * .5) * .18; }
      mx += (tx - mx) * .08; my += (ty - my) * .08;
      luz.style.setProperty('--mx', (mx * 100).toFixed(2) + '%'); luz.style.setProperty('--my', (my * 100).toFixed(2) + '%');
      if (!reduz) {
        var sc = window.scrollY;
        cols.forEach(function (c, i) { c.el.style.transform = 'translate3d(0,' + (Math.sin(s * .12 + i) * c.v - sc * (.1 + (i % 3) * .06)).toFixed(1) + 'px,0)'; });
      }
    }
    requestAnimationFrame(animarParede);
  }
  requestAnimationFrame(animarParede);

  /* ticker sem fim */
  var tk = $('#ticker'); tk.innerHTML += tk.innerHTML;

  /* manifesto: as palavras acendem com o scroll */
  var mt = $('#mtxt'), azuis = { 'azulejo,': 1, '1509.': 1, 'ouro.': 1, 'maqueta': 1 };
  mt.innerHTML = mt.textContent.split(' ').map(function (w) { return '<span class="w' + (azuis[w.toLowerCase()] ? ' az' : '') + '">' + w + '</span>'; }).join(' ');
  var palavras = $$('.w', mt);
  function manifesto() {
    var r = mt.getBoundingClientRect(), vh = window.innerHeight;
    var p = (vh * .85 - r.top) / (r.height + vh * .35);
    var n = Math.floor(p * palavras.length);
    palavras.forEach(function (w, i) { w.classList.toggle('on', i < n); });
  }
  if (!reduz) { addEventListener('scroll', manifesto, { passive: true }); manifesto(); }

  /* revelações e contadores */
  function contar(el) {
    var alvo = +el.getAttribute('data-conta'), ini = alvo > 1000 ? alvo - 120 : 0, t0 = performance.now();
    (function f(now) { var p = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(ini + (alvo - ini) * e); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  if ('IntersectionObserver' in window && !reduz) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-conta]', e.target).forEach(contar);
        io.unobserve(e.target);
      });
    }, { threshold: .15 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });

  /* parallax das histórias */
  var par = $$('[data-par]');
  function parallax() {
    var vh = window.innerHeight;
    par.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      el.firstElementChild.style.transform = 'translate3d(0,' + (-8 + p * -100 * +el.getAttribute('data-par')).toFixed(1) + '%,0)';
    });
  }
  if (!reduz) { addEventListener('scroll', parallax, { passive: true }); parallax(); }

  /* agenda: setas */
  var rail = $('#rail');
  $$('.rnav').forEach(function (b) { b.addEventListener('click', function () { rail.scrollBy({ left: +b.getAttribute('data-dir') * 340, behavior: reduz ? 'auto' : 'smooth' }); }); });

  /* coleção */
  var PECAS = window.PECAS || [], masonry = $('#masonry'), filtros = $('#filtros');
  var ROT = { montado: 'Em exposição', temporaria: 'Em viagem', reserva: 'Reserva' };
  function limpar(t) { return (t || '').replace(/\s*\[Substituir[^\]]*\]/g, '').trim(); }
  PECAS.forEach(function (p, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'peca'; b.setAttribute('data-sec', p.seculo);
    var img = p.foto ? '<img src="fotos/' + p.foto + '-640.jpg" alt="" loading="lazy">' : '<div class="padrao"><span>Fotografia a fazer</span></div>';
    b.innerHTML = '<div class="pimg">' + img + '<span class="estado' + (p.estado === 'temporaria' ? ' via' : '') + '">' + (ROT[p.estado] || '') + '</span></div>' +
      '<h3>' + p.titulo + '</h3><p>' + (/^S[ée]c/.test(p.data) ? 'Séc. ' + p.seculo : 'Séc. ' + p.seculo + ' · ' + p.data) + '</p>';
    b.addEventListener('click', function () { abrir(p); });
    if (!reduz) {
      b.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = b.firstChild.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        b.firstChild.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg)';
      });
      b.addEventListener('pointerleave', function () { b.firstChild.style.transform = ''; });
    }
    masonry.appendChild(b);
  });
  var secs = ['Todas'].concat(PECAS.map(function (p) { return p.seculo; }).filter(function (s, i, a) { return a.indexOf(s) === i; }).sort(function (a, b) { return rom(a) - rom(b); }));
  function rom(s) { var v = { I: 1, V: 5, X: 10, L: 50 }, n = 0; for (var i = 0; i < s.length; i++) { var a = v[s[i]], b = v[s[i + 1]] || 0; n += a < b ? -a : a; } return n; }
  secs.forEach(function (s, i) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = s === 'Todas' ? s : 'Séc. ' + s; b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', function () {
      $$('button', filtros).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.peca', masonry).forEach(function (p) { p.classList.toggle('sai', s !== 'Todas' && p.getAttribute('data-sec') !== s); });
    });
    filtros.appendChild(b);
  });

  /* visualizador */
  var viewer = $('#viewer'), vImg = $('#vImg'), vStage = $('#vStage'), ultimo = null;
  function abrir(p) {
    ultimo = document.activeElement;
    vImg.src = p.foto ? 'fotos/' + p.foto + '.jpg' : 'assets/logo-mnaz.svg'; vImg.alt = p.titulo;
    $('#vLbl').textContent = 'Séc. ' + p.seculo + ' · ' + p.periodo;
    $('#vTitle').textContent = p.titulo;
    $('#vTxt').textContent = limpar(p.texto) || 'Texto do painel a enviar pela equipa do museu.';
    var dl = $('#vDl'); dl.innerHTML = '';
    [['Data', p.data], ['Autoria', p.autoria], ['Técnica', p.tecnica], ['Dimensões', p.dimensoes], ['Proveniência', p.proveniencia], ['Onde está', p.local]].forEach(function (r) {
      if (!r[1]) return; var dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = r[0]; dd.textContent = r[1]; dl.appendChild(dt); dl.appendChild(dd);
    });
    vStage.classList.remove('zoom'); vImg.style.transform = '';
    viewer.hidden = false; document.documentElement.style.overflow = 'hidden';
    $('#vClose').focus();
  }
  function fechar() { viewer.hidden = true; document.documentElement.style.overflow = ''; if (ultimo) ultimo.focus(); }
  $('#vClose').addEventListener('click', fechar);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !viewer.hidden) fechar(); });
  vStage.addEventListener('click', function (e) {
    var z = vStage.classList.toggle('zoom');
    if (z) zoomEm(e); else vImg.style.transform = '';
  });
  function zoomEm(e) {
    var r = vStage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    vImg.style.transform = 'translate(' + (-x * 100).toFixed(1) + '%,' + (-y * 100).toFixed(1) + '%) scale(2.4)';
  }
  vStage.addEventListener('pointermove', function (e) { if (vStage.classList.contains('zoom')) zoomEm(e); });
})();
