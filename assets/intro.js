/* Abertura cinematográfica da página inicial: cortes rápidos, congelamentos com legenda e o selo no fim.
   Só corre na página inicial, uma vez por sessão, e nunca com "reduzir movimento" ativo. */
(function () {
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var capa = document.querySelector('.capa');
  if (!capa) return;

  /* ---- capa: fundo com zoom lento e título palavra a palavra ---- */
  var h1 = capa.querySelector('h1');
  if (h1 && !reduz) {
    var i = 0;
    h1.innerHTML = h1.textContent.trim().split(/\s+/).map(function (p) {
      return '<span class="pal" style="--i:' + (i++) + '">' + p + '</span>';
    }).join(' ');
  }
  if (!reduz) {
    var fundo = document.createElement('div');
    fundo.className = 'capa__fundo';
    fundo.setAttribute('aria-hidden', 'true');
    capa.insertBefore(fundo, capa.firstChild);
  }
  function revelaTitulo() { if (h1) { h1.classList.remove('anima'); void h1.offsetWidth; h1.classList.add('anima'); } }

  if (reduz) return;

  var PLANOS = [
    { t: 'texto', txt: 'Lisboa · Xabregas · 1509', d: 950 },
    { t: 'corte', f: 'fotos/fachada-960.jpg' },
    { t: 'corte', f: 'fotos/portal-960.jpg' },
    { t: 'corte', f: 'fotos/claustro-960.jpg' },
    { t: 'corte', f: 'fotos/igreja-960.jpg' },
    { t: 'congela', f: 'fotos/casamento-da-galinha.jpg', pos: '50% 45%', n: '01', nome: 'O macaco', sub: 'Casamento da Galinha · c. 1660 · <b>suspeito do costume</b>' },
    { t: 'corte', f: 'fotos/corredor-960.jpg' },
    { t: 'corte', f: 'fotos/padrao-marvila-960.jpg' },
    { t: 'congela', f: 'fotos/soldado.jpg', pos: '50% 18%', n: '02', nome: 'O soldado', sub: 'Figura de convite · c. 1770 · <b>de guarda há 250 anos</b>' },
    { t: 'corte', f: 'fotos/ig-oficina-criancas.jpg' },
    { t: 'corte', f: 'fotos/ig-restauro.jpg' },
    { t: 'congela', f: 'fotos/grande-vista.jpg', pos: '40% 50%', n: '03', nome: 'A cidade', sub: 'Grande Vista de Lisboa · 23 metros · <b>antes do terramoto</b>' },
    { t: 'fim' }
  ];

  var raiz = document.documentElement;
  var cine, plano, flash, cartao, contador, abortado = false, timers = [];

  function espera(ms) { return new Promise(function (r) { timers.push(setTimeout(r, ms)); }); }
  function anima(el, kf, op) { try { return el.animate(kf, op); } catch (e) { return null; } }

  function monta() {
    cine = document.createElement('div');
    cine.className = 'cine cine__barras';
    cine.setAttribute('role', 'dialog');
    cine.setAttribute('aria-label', 'Abertura animada do site. Pode saltar.');
    cine.innerHTML =
      '<div class="cine__plano"></div><div class="cine__grao"></div><div class="cine__flash"></div>' +
      '<p class="cine__texto"></p><div class="cine__cartao"></div>' +
      '<span class="cine__contador mono"></span>' +
      '<button class="cine__saltar" type="button">Saltar ›</button>' +
      '<div class="cine__fim"><img src="assets/logo-mnaz.svg" alt="" width="220" height="220"><p>Cinco séculos.<br><em>Uma só casa.</em></p></div>';
    document.body.appendChild(cine);
    plano = cine.querySelector('.cine__plano');
    flash = cine.querySelector('.cine__flash');
    cartao = cine.querySelector('.cine__cartao');
    contador = cine.querySelector('.cine__contador');
    cine.addEventListener('click', termina);
    document.addEventListener('keydown', teclaSair);
    raiz.classList.add('cine-ativo');
    cine.querySelector('.cine__saltar').focus({ preventScroll: true });
  }
  function teclaSair(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); termina(); } }

  function mostra(f, pos) {
    plano.style.backgroundImage = "url('" + f + "')";
    plano.style.backgroundPosition = pos || 'center';
    plano.style.filter = '';
    plano.classList.add('on');
  }
  function dispara() { anima(flash, [{ opacity: .85 }, { opacity: 0 }], { duration: 140, easing: 'ease-out' }); }

  async function corre() {
    for (var k = 0; k < PLANOS.length && !abortado; k++) {
      var p = PLANOS[k];
      if (p.t === 'texto') {
        var el = cine.querySelector('.cine__texto');
        for (var c = 1; c <= p.txt.length && !abortado; c++) { el.textContent = p.txt.slice(0, c); await espera(28); }
        await espera(p.d - p.txt.length * 28);
        el.textContent = '';
      } else if (p.t === 'corte') {
        mostra(p.f);
        anima(plano, [{ transform: 'scale(1.18) rotate(.6deg)' }, { transform: 'scale(1.02)' }], { duration: 230, easing: 'cubic-bezier(.1,.9,.2,1)', fill: 'forwards' });
        await espera(210);
      } else if (p.t === 'congela') {
        cartao.innerHTML = '';
        mostra(p.f, p.pos);
        contador.textContent = p.n + ' / 03';
        anima(plano, [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }], { duration: 520, easing: 'cubic-bezier(.5,0,.9,.4)', fill: 'forwards' });
        await espera(500);
        if (abortado) break;
        dispara();
        plano.style.filter = 'grayscale(.85) contrast(1.3) brightness(.8)';
        anima(plano, [{ transform: 'scale(1.12) rotate(-1.4deg)' }, { transform: 'scale(1.13) rotate(-1.4deg)' }], { duration: 900, fill: 'forwards' });
        var nome = document.createElement('p');
        nome.className = 'cine__nome';
        nome.innerHTML = p.nome.split('').map(function (l, j) { return '<span style="--j:' + j + '">' + (l === ' ' ? '&nbsp;' : l) + '</span>'; }).join('');
        var sub = document.createElement('p');
        sub.className = 'cine__sub';
        cartao.appendChild(nome); cartao.appendChild(sub);
        anima(nome, [{ transform: 'scale(1.9) rotate(-6deg)', opacity: 0 }, { transform: 'scale(.96) rotate(-2deg)', opacity: 1, offset: .7 }, { transform: 'scale(1) rotate(-2deg)', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'forwards' });
        await espera(240);
        var plano_txt = p.sub.replace(/<[^>]+>/g, '');
        for (var w = 2; w <= plano_txt.length + 1 && !abortado; w += 2) { sub.textContent = plano_txt.slice(0, w); await espera(14); }
        sub.innerHTML = p.sub;
        await espera(620);
        cartao.innerHTML = '';
        contador.textContent = '';
      } else if (p.t === 'fim') {
        var fim = cine.querySelector('.cine__fim');
        dispara();
        fim.style.opacity = 1;
        anima(fim.querySelector('img'), [{ transform: 'scale(2.4) rotate(-90deg)', opacity: 0 }, { transform: 'scale(.94) rotate(4deg)', opacity: 1, offset: .75 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'forwards' });
        anima(fim.querySelector('p'), [{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: 260, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'both' });
        await espera(1450);
      }
    }
    termina();
  }

  function termina() {
    if (!cine || cine.classList.contains('cine--sai')) return;
    abortado = true;
    timers.forEach(clearTimeout);
    document.removeEventListener('keydown', teclaSair);
    cine.classList.add('cine--sai');
    raiz.classList.remove('cine-ativo');
    revelaTitulo();
    setTimeout(function () { if (cine) cine.remove(); cine = null; }, 750);
  }

  function carrega(lista, limite) {
    return new Promise(function (ok) {
      var falta = lista.length, feito = false;
      var t = setTimeout(function () { if (!feito) { feito = true; ok(false); } }, limite);
      lista.forEach(function (f) {
        var im = new Image();
        im.onload = im.onerror = function () { if (--falta === 0 && !feito) { feito = true; clearTimeout(t); ok(true); } };
        im.src = f;
      });
    });
  }

  function inicia(forcar) {
    abortado = false; timers = [];
    var fotos = PLANOS.filter(function (p) { return p.f; }).map(function (p) { return p.f; });
    return carrega(fotos, forcar ? 8000 : 3500).then(function (ok) {
      if (!ok && !forcar) { revelaTitulo(); return; }
      monta(); corre();
    });
  }

  /* botão para rever */
  var txt = capa.querySelector('.capa__txt');
  if (txt) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'capa__rever';
    b.innerHTML = '<span aria-hidden="true">▶</span> Ver a abertura';
    b.addEventListener('click', function () { inicia(true); });
    txt.appendChild(b);
  }

  var visto = false;
  try { visto = sessionStorage.getItem('mnaz-abertura') === '1'; sessionStorage.setItem('mnaz-abertura', '1'); } catch (e) {}
  if (visto || location.hash) revelaTitulo(); else inicia(false);
})();
