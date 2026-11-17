/* Movimento em todo o site: revelações ao fazer scroll, Ken Burns, parallax, inclinação dos cartões,
   galeria que desliza sozinha e barra de azulejos em movimento. Nada disto corre com "reduzir movimento". */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var raiz = document.documentElement;
  raiz.classList.add('mov');

  function pronto(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  pronto(function () {
    /* ---------- 1. camadas de imagem com Ken Burns e parallax ---------- */
    var GRANDES = '.banda, .dupla__foto, .titulo-pag--foto, .loja__img';
    var CARTOES = '.evento__img, .obra__img, .epoca__img, .artigo__img, .lugar__img, .cartao__img, .obras__img, .peca__img';
    var paralaxe = [];
    document.querySelectorAll('[data-foto]').forEach(function (el) {
      if (el.classList.contains('capa') || el.classList.contains('mosaico__img') || el.querySelector(':scope > .kb')) return;
      var bg = el.style.backgroundImage; if (!bg) return;
      var kb = document.createElement('div'); kb.className = 'kb'; kb.setAttribute('aria-hidden', 'true');
      var im = document.createElement('div'); im.className = 'kb__img'; im.style.backgroundImage = bg;
      im.style.backgroundPosition = el.style.backgroundPosition || '';
      kb.appendChild(im); el.insertBefore(kb, el.firstChild); el.classList.add('tem-kb');
      if (el.matches(GRANDES)) {
        el.classList.add('kb--lento');
        im.style.animationDelay = (-Math.random() * 18).toFixed(1) + 's';
        im.style.animationName = Math.random() < .5 ? 'kb-a' : 'kb-b';
        if (!el.classList.contains('loja__img')) { kb.classList.add('kb--par'); paralaxe.push(kb); }
      }
    });

    var pedido = false;
    function scrollar() {
      pedido = false;
      var vh = window.innerHeight;
      paralaxe.forEach(function (kb) {
        var r = kb.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var f = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
        kb.style.transform = 'translate3d(0,' + (f * -9).toFixed(2) + '%,0)';
      });
    }
    window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(scrollar); } }, { passive: true });
    window.addEventListener('resize', scrollar);
    scrollar();

    /* ---------- 2. revelações ao fazer scroll ---------- */
    var ALVOS = [
      'main .cabeca', 'main .faixa > div', 'main .atalhos', '.dupla__txt', '.banda__txt', '.capela__txt', '.capela__fotos .foto',
      '.evento', '.obra', '.epoca', '.lugar', '.artigo', '.mosaico__item', '.cartao', '.linha li', '.loja', '.news',
      '.texto', '.peca', '.pistas li', '.paragens li', '.dia', '.planta-home__txt', '[data-planta]', '.passos li', '.glossario > div',
      '.titulo-pag .wrap > div', 'table.creditos tbody tr'
    ].join(',');
    var alvos = Array.prototype.slice.call(document.querySelectorAll(ALVOS)).filter(function (el) { return !el.closest('.capa') && !el.closest('.cine'); });
    var porPai = new Map();
    alvos.forEach(function (el) {
      el.classList.add('rev');
      if (el.matches('.mosaico__item, .capela__fotos .foto')) el.classList.add('rev--zoom');
      else if (el.matches('.dupla__txt, .planta-home__txt')) el.classList.add('rev--lado');
      var n = porPai.get(el.parentNode) || 0; porPai.set(el.parentNode, n + 1);
      el.style.setProperty('--rev-i', Math.min(n, 8));
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
      alvos.forEach(function (el) { io.observe(el); });
    } else alvos.forEach(function (el) { el.classList.add('visto'); });
    // segurança: nada fica escondido se o observador falhar
    setTimeout(function () { alvos.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('visto'); }); }, 2500);

    /* títulos: sublinhado dourado que cresce */
    document.querySelectorAll('main h2').forEach(function (h) { if (!h.closest('.capa')) h.classList.add('h2-traco'); });

    /* ---------- 3. inclinação 3D dos cartões ---------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.obra, .epoca, .evento, .artigo, .lugar').forEach(function (c) {
        c.classList.add('inclina');
        c.addEventListener('pointermove', function (e) {
          var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          c.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg'); c.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
          c.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%'); c.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%');
        });
        c.addEventListener('pointerleave', function () { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
      });
    }

    /* ---------- 4. galeria de obras que desliza sozinha ---------- */
    document.querySelectorAll('.galeria').forEach(function (g) {
      var parado = false, ultimo = 0, vis = false, acc = 0;
      ['pointerenter', 'focusin', 'touchstart', 'wheel'].forEach(function (ev) { g.addEventListener(ev, function () { parado = true; }, { passive: true }); });
      g.addEventListener('pointerleave', function () { parado = false; });
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(g);
      g.style.scrollSnapType = 'none';
      (function passo(t) {
        var dt = ultimo ? Math.min(50, t - ultimo) : 16; ultimo = t;
        if (vis && !parado) {
          acc += dt * .035;
          if (acc >= 1) { var px = Math.floor(acc); acc -= px; g.scrollLeft += px; }
          if (g.scrollLeft + g.clientWidth >= g.scrollWidth - 2) g.scrollLeft = 0;
        }
        requestAnimationFrame(passo);
      })(0);
      // arrastar com o rato
      var arrasta = null;
      g.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; arrasta = { x: e.clientX, s: g.scrollLeft, mov: 0 }; g.classList.add('a-arrastar'); });
      window.addEventListener('pointermove', function (e) { if (!arrasta) return; var dx = e.clientX - arrasta.x; arrasta.mov = Math.abs(dx); g.scrollLeft = arrasta.s - dx; });
      window.addEventListener('pointerup', function () { if (arrasta) { g.classList.remove('a-arrastar'); setTimeout(function () { arrasta = null; }, 0); } });
      g.addEventListener('click', function (e) { if (arrasta && arrasta.mov > 6) { e.preventDefault(); } }, true);
    });

    /* ---------- 5. cabeçalho que encolhe ---------- */
    var cab = document.querySelector('.cabecalho');
    if (cab && !cab.classList.contains('cabecalho--sobre')) {
      window.addEventListener('scroll', function () { cab.classList.toggle('compacto', scrollY > 80); }, { passive: true });
    }
  });
})();
