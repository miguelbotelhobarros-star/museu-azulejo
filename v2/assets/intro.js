/* Filme de abertura da versão 2: cortes rápidos, freeze frames a preto e branco com cartões de personagem
   e tipografia cinética. Corre uma vez por sessão; desliga-se com movimento reduzido; Esc ou "Saltar" termina. */
(function () {
  var intro = document.getElementById('intro');
  if (!intro) return;
  var cv = document.getElementById('introCv'), c = cv.getContext('2d');
  var tc = document.getElementById('introTc'), bar = document.getElementById('introBar');
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = 12.2, W = 0, H = 0, dpr = 1, t0 = 0, corre = false;

  var NOMES = ['portal', 'fachada', 'igreja-talha', 'capela-tecto', 'igreja-altar', 'capela-talha', 'igreja-nave', 'claustro',
    'grande-vista', 'visitantes-grande-vista', 'hispano-mourisco', 'padrao-marvila', 'batalha-de-isso', 'soldado',
    'bordalo-pinheiro', 'lisbonne-1937', 'artesaos'];
  var CINZA = { claustro: 1, 'visitantes-grande-vista': 1, artesaos: 1 };
  var IMG = {}, PB = {}, logo = new Image();
  logo.src = 'assets/logo-mnaz.svg';

  function carregar(feito) {
    var falta = NOMES.length;
    NOMES.forEach(function (n) {
      var im = new Image();
      im.onload = function () {
        IMG[n] = im;
        if (CINZA[n]) PB[n] = pretoBranco(im);
        if (--falta === 0) feito();
      };
      im.onerror = function () { if (--falta === 0) feito(); };
      im.src = 'fotos/' + n + '-960.jpg';
    });
  }
  /* versão a preto e branco com contraste forte, calculada uma vez (ctx.filter não existe em todos os Safari) */
  function pretoBranco(im) {
    var o = document.createElement('canvas'); o.width = im.naturalWidth; o.height = im.naturalHeight;
    var oc = o.getContext('2d'); oc.drawImage(im, 0, 0);
    try {
      var d = oc.getImageData(0, 0, o.width, o.height), p = d.data;
      for (var i = 0; i < p.length; i += 4) {
        var y = .3 * p[i] + .59 * p[i + 1] + .11 * p[i + 2];
        y = (y - 128) * 1.5 + 118; y = y < 0 ? 0 : y > 255 ? 255 : y;
        p[i] = p[i + 1] = p[i + 2] = y;
      }
      oc.putImageData(d, 0, 0);
    } catch (e) { }
    return o;
  }

  /* grão de película */
  var grao = document.createElement('canvas'); grao.width = grao.height = 160;
  (function () {
    var g = grao.getContext('2d'), d = g.createImageData(160, 160);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 26; }
    g.putImageData(d, 0, 0);
  })();

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = intro.clientWidth; H = intro.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  var cl = function (v, a, b) { return v < (a || 0) ? (a || 0) : v > (b === undefined ? 1 : b) ? (b === undefined ? 1 : b) : v; };
  var eo = function (x) { x = cl(x); return 1 - Math.pow(1 - x, 3); };
  var eio = function (x) { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* desenha uma imagem a cobrir uma área, com zoom e deslocação */
  function cobrir(src, x, y, w, h, zoom, dx, dy) {
    if (!src) { c.fillStyle = '#111'; c.fillRect(x, y, w, h); return; }
    var iw = src.naturalWidth || src.width, ih = src.naturalHeight || src.height;
    var s = Math.max(w / iw, h / ih) * (zoom || 1);
    var dw = iw * s, dh = ih * s;
    var ox = x + (w - dw) / 2 + (dx || 0) * (dw - w) / 2, oy = y + (h - dh) / 2 + (dy || 0) * (dh - h) / 2;
    c.drawImage(src, ox, oy, dw, dh);
  }
  function ecra(nome, zoom, dx, dy, pb) {
    cobrir(pb ? (PB[nome] || IMG[nome]) : IMG[nome], 0, 0, W, H, zoom, dx, dy);
  }
  /* arrasto de câmara (whip pan): várias cópias deslocadas */
  function arrasto(nome, zoom, desl, forca) {
    for (var k = 4; k >= 0; k--) {
      c.globalAlpha = k === 0 ? 1 : .22;
      cobrir(IMG[nome], -desl * k * forca, 0, W, H, zoom, 0, 0);
    }
    c.globalAlpha = 1;
  }
  function fonte(peso, px, fam) { c.font = peso + ' ' + Math.round(px) + 'px ' + (fam || '"Syne", "Arial Black", Arial, sans-serif'); }
  var MONO = '"JetBrains Mono", Menlo, monospace';

  /* palavra que cai no ecrã com impacto */
  function bater(txt, t, ini, px, cor, y, contorno) {
    var p = (t - ini) / .22; if (p < 0) return;
    var s = 1 + 1.6 * (1 - eo(p));
    fonte(800, px); var mw = c.measureText(txt).width; if (mw > W * .88) { px *= W * .88 / mw; }
    c.save(); c.translate(W / 2, y); c.scale(s, s); c.globalAlpha = cl(p * 1.6);
    fonte(800, px); c.textAlign = 'center'; c.textBaseline = 'middle';
    if (contorno) { c.lineWidth = Math.max(2, px / 40); c.strokeStyle = cor; c.strokeText(txt, 0, 0); }
    else { c.fillStyle = cor; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 30; c.fillText(txt, 0, 0); }
    c.restore();
  }
  /* letras que sobem uma a uma */
  function cascata(txt, t, ini, px, x, y, cor, alinhar) {
    fonte(800, px); var mw = c.measureText(txt).width; if (mw > W * .9) { px *= W * .9 / mw; fonte(800, px); } c.textBaseline = 'alphabetic';
    var larg = c.measureText(txt).width, cx = alinhar === 'centro' ? x - larg / 2 : x;
    for (var i = 0; i < txt.length; i++) {
      var ch = txt[i], p = eo((t - ini - i * .035) / .3), w = c.measureText(ch).width;
      if (p > 0) {
        c.save(); c.beginPath(); c.rect(cx - 4, y - px * 1.05, w + 8, px * 1.25); c.clip();
        c.fillStyle = cor; c.fillText(ch, cx, y + px * (1 - p));
        c.restore();
      }
      cx += w;
    }
  }
  /* cartão de personagem, ao estilo de um freeze frame de cinema */
  function cartao(t, ini, nome, sub, nota, ax, ay) {
    var p = (t - ini); if (p < 0) return;
    var m = Math.min(W, H), px = Math.max(34, Math.min(W * .085, 110));
    var x = W * .07, y = H * .62;
    c.save();
    c.translate(x, y); c.rotate(-.045);
    fonte(800, px); var lw = c.measureText(nome).width;
    if (lw > W * .8) { px *= W * .8 / lw; fonte(800, px); lw = c.measureText(nome).width; }
    var e = eo(p / .18);
    c.fillStyle = '#ebc517'; c.fillRect(-14, -px * .92, (lw + 28) * e, px * 1.12);
    if (e > .6) { c.fillStyle = '#000'; c.textBaseline = 'alphabetic'; c.fillText(nome, 0, 0); }
    fonte(500, Math.max(11, px * .17), MONO); c.fillStyle = '#fff';
    if (p > .18) c.fillText(sub.substr(0, Math.floor((p - .18) * 70)), 2, px * .5);
    c.restore();
    if (nota && p > .35) {
      var q = eo((p - .35) / .45);
      var nx = W * .62, ny = H * .3;
      if (W < 700) { nx = W * .5; ny = H * .24; }
      c.save();
      c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(nx, ny + 10);
      var tx = nx + (ax * W - nx) * q, ty = ny + 10 + (ay * H - ny - 10) * q;
      c.quadraticCurveTo(nx - 20, (ny + ty) / 2 + 30, tx, ty); c.stroke();
      if (q > .95) {
        var ang = Math.atan2(ty - ny, tx - nx);
        c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx - 14 * Math.cos(ang - .5), ty - 14 * Math.sin(ang - .5));
        c.moveTo(tx, ty); c.lineTo(tx - 14 * Math.cos(ang + .5), ty - 14 * Math.sin(ang + .5)); c.stroke();
      }
      fonte('italic 500', Math.max(16, m * .035), '"Inter Tight", Arial, sans-serif');
      c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(nota, nx - 10, ny - 4);
      c.restore();
    }
  }
  function clarao(t, ini, dur) { var p = (t - ini) / (dur || .1); if (p >= 0 && p < 1) { c.fillStyle = 'rgba(255,255,255,' + (1 - p) + ')'; c.fillRect(0, 0, W, H); } }

  function frame(t) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    var m = Math.min(W, H), big = Math.min(W * .16, 230);

    if (t < 1.1) {
      /* 1. negro e máquina de escrever */
      var s = 'LISBOA, 1509.', n = Math.floor(cl(t / .8) * s.length);
      fonte(500, Math.max(14, m * .03), MONO); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(s.substr(0, n) + (Math.floor(t * 6) % 2 ? '_' : ' '), W / 2, H / 2);
      c.textAlign = 'left';
    } else if (t < 2.3) {
      /* 2. o portal, em aproximação rápida */
      var p = (t - 1.1) / 1.2;
      var sk = t > 1.3 && t < 1.42 ? (Math.random() - .5) * 18 : 0;
      c.save(); c.translate(sk, sk * .6);
      ecra(t < 1.75 ? 'portal' : 'fachada', 1.35 - .25 * eo(p * 2 % 1), 0, -.2);
      c.restore();
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 0, W, H);
      bater('UM CONVENTO', t, 1.25, big * .62, '#fff', H * .52);
      clarao(t, 1.1, .12);
    } else if (t < 3.1) {
      /* 3. estroboscópio dourado */
      var fot = ['igreja-talha', 'capela-tecto', 'igreja-altar', 'capela-talha', 'igreja-nave'];
      var k = Math.floor((t - 2.3) / .16) % fot.length;
      ecra(fot[k], 1.15 + ((t - 2.3) % .16) * .8, (k % 2 ? .4 : -.4), 0);
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, 0, W, H);
      bater('OURO.', t, 2.32, big * 1.25, '#ebc517', H * .5);
    } else if (t < 4.6) {
      /* 4. o claustro: freeze frame */
      var fr = t >= 3.55;
      var pz = fr ? 1.12 + (t - 3.55) * .02 : 1.25 - (t - 3.1) * .28;
      if (!fr) arrasto('claustro', pz, t < 3.25 ? (3.25 - t) * 80 : 0, 1);
      else ecra('claustro', pz, -.1, 0, true);
      if (fr) { c.fillStyle = 'rgba(19,124,192,.18)'; c.fillRect(0, 0, W, H); }
      clarao(t, 3.55, .14);
      if (fr) cartao(t, 3.62, 'O CLAUSTRO', 'PERSONAGEM N.º 1 · SÉC. XVI · O CORAÇÃO DO CONVENTO', 'se se perder, volte aqui', .48, .5);
    } else if (t < 5.9) {
      /* 5. Grande Vista de Lisboa em panorâmica */
      var q = (t - 4.6) / 1.3;
      if (t < 4.78) arrasto('grande-vista', 1.4, (4.78 - t) * 260, 1);
      else ecra('grande-vista', 1.45, -1 + 2 * eio(q), 0);
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 0, W, H);
      var y1 = H * .56;
      cascata('23 METROS', t, 4.82, big * .82, W / 2, y1, '#fff', 'centro');
      if (t > 5.25) {
        fonte(500, Math.max(12, m * .025), MONO); c.fillStyle = '#ebc517'; c.textAlign = 'center';
        var s2 = 'DE LISBOA ANTES DO TERRAMOTO DE 1755';
        c.fillText(s2.substr(0, Math.floor((t - 5.25) * 70)), W / 2, y1 + big * .25);
        c.textAlign = 'left';
      }
    } else if (t < 7.3) {
      /* 6. os visitantes: freeze frame */
      var fr2 = t >= 6.2;
      if (!fr2) ecra('visitantes-grande-vista', 1.35 - (t - 5.9) * .5, .2, 0);
      else ecra('visitantes-grande-vista', 1.2 + (t - 6.2) * .02, .2, 0, true);
      if (fr2) { c.fillStyle = 'rgba(19,124,192,.18)'; c.fillRect(0, 0, W, H); }
      clarao(t, 5.9, .08); clarao(t, 6.2, .14);
      if (fr2) cartao(t, 6.26, 'OS VISITANTES', 'PERSONAGEM N.º 2 · PERDIAM-SE SEMPRE', 'até agora', .8, .62);
    } else if (t < 8.9) {
      /* 7. tríptico dos séculos */
      var segunda = t >= 8.1;
      var set = segunda ? [['soldado', 'XVIII'], ['bordalo-pinheiro', 'XIX'], ['lisbonne-1937', 'XX']] : [['hispano-mourisco', 'XV'], ['padrao-marvila', 'XVII'], ['batalha-de-isso', 'XVIII']];
      var ini = segunda ? 8.1 : 7.3, w3 = W / 3;
      for (var i = 0; i < 3; i++) {
        var pi = eo((t - ini - i * .07) / .32), dir = i % 2 ? 1 : -1;
        c.save(); c.beginPath(); c.rect(i * w3, 0, w3 - 3, H); c.clip();
        cobrir(IMG[set[i][0]], i * w3, (1 - pi) * H * dir, w3 - 3, H, 1.15 + (t - ini) * .06, 0, 0);
        c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(i * w3, 0, w3, H);
        if (pi > .5) {
          var tpx = Math.min(w3 * .38, 160); fonte(800, tpx); var tw = c.measureText(set[i][1]).width; if (tw > w3 * .82) { tpx *= w3 * .82 / tw; fonte(800, tpx); }
          c.fillStyle = '#fff'; c.textAlign = 'center';
          c.globalAlpha = cl((pi - .5) * 2);
          c.fillText(set[i][1], i * w3 + w3 / 2, H * .86);
          fonte(500, 11, MONO); c.fillText('SÉCULO', i * w3 + w3 / 2, H * .86 - tpx * .85);
          c.globalAlpha = 1; c.textAlign = 'left';
        }
        c.restore();
      }
    } else if (t < 9.9) {
      /* 8. as mãos: freeze frame */
      var fr3 = t >= 9.15;
      if (!fr3) ecra('artesaos', 1.3 - (t - 8.9) * .3, 0, -.2);
      else ecra('artesaos', 1.22, 0, -.2, true);
      if (fr3) { c.fillStyle = 'rgba(19,124,192,.18)'; c.fillRect(0, 0, W, H); }
      clarao(t, 8.9, .08); clarao(t, 9.15, .14);
      if (fr3) cartao(t, 9.2, 'AS MÃOS', 'PERSONAGEM N.º 3 · QUEM PINTA, QUEM RESTAURA', null);
    } else {
      /* 9. o logótipo */
      var r = (t - 9.9);
      var e = eo(r / .6), lg = Math.min(m * .32, 240) * (.4 + .6 * e);
      c.fillStyle = '#137cc0'; c.globalAlpha = cl(1 - r / .5) * .9;
      c.beginPath(); c.arc(W / 2, H * .42, lg * (1 + r * 3), 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
      if (logo.complete && logo.naturalWidth !== 0) {
        c.save(); c.translate(W / 2, H * .42); c.rotate((1 - e) * -1.6);
        c.drawImage(logo, -lg / 2, -lg / 2, lg, lg); c.restore();
      }
      var px2 = Math.max(22, Math.min(W * .055, 64));
      cascata('MUSEU NACIONAL', t, 10.2, px2, W / 2, H * .42 + lg / 2 + px2 * 1.5, '#fff', 'centro');
      cascata('DO AZULEJO', t, 10.4, px2, W / 2, H * .42 + lg / 2 + px2 * 2.6, '#4fa6dd', 'centro');
      if (t > 10.9) {
        fonte(500, 12, MONO); c.fillStyle = 'rgba(255,255,255,.7)'; c.textAlign = 'center';
        c.fillText('LISBOA · CONVENTO DA MADRE DE DEUS', W / 2, H * .42 + lg / 2 + px2 * 3.5);
        c.textAlign = 'left';
      }
    }

    /* vinheta, grão e barras de cinema */
    var gr = c.createRadialGradient(W / 2, H / 2, m * .3, W / 2, H / 2, Math.max(W, H) * .75);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)');
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.save(); c.globalAlpha = .5; c.translate(-Math.random() * 160, -Math.random() * 160);
    c.fillStyle = c.createPattern(grao, 'repeat'); c.fillRect(0, 0, W + 160, H + 160); c.restore();
    var lb = H * .09; c.fillStyle = '#000'; c.fillRect(0, 0, W, lb); c.fillRect(0, H - lb, W, lb);
  }

  function loop(now) {
    if (!corre) return;
    var t = (now - t0) / 1000;
    if (t >= DUR) { fim(); return; }
    frame(t);
    if (t > DUR - .5) intro.style.opacity = String(cl((DUR - t) / .5));
    bar.style.width = (t / DUR * 100) + '%';
    tc.textContent = '00:' + pad(Math.floor(t)) + ':' + pad(Math.floor(t * 24) % 24);
    requestAnimationFrame(loop);
  }
  var pronto = false, pedido = false;
  function tocar() {
    intro.classList.remove('gone'); intro.setAttribute('aria-hidden', 'false'); intro.style.opacity = '';
    document.documentElement.style.overflow = 'hidden';
    layout();
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (!pronto) { pedido = true; return; }
    corre = true; t0 = performance.now(); requestAnimationFrame(loop);
    document.getElementById('introSkip').focus({ preventScroll: true });
  }
  function fim() {
    corre = false; pedido = false;
    intro.classList.add('gone'); intro.setAttribute('aria-hidden', 'true'); intro.style.opacity = '';
    document.documentElement.style.overflow = '';
    try { sessionStorage.setItem('mnaz2-intro', '1'); } catch (e) { }
  }
  document.getElementById('introSkip').addEventListener('click', fim);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !intro.classList.contains('gone')) fim(); });
  addEventListener('resize', function () { if (corre) layout(); });
  var rb = document.getElementById('replay'); if (rb) rb.addEventListener('click', tocar);

  var visto = false; try { visto = sessionStorage.getItem('mnaz2-intro') === '1'; } catch (e) { }
  var auto = !reduz && !visto && !/[?&]sem-intro/.test(location.search);
  if (auto) tocar();

  var fontes = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 80px Syne'), document.fonts.load('500 14px "JetBrains Mono"')]).catch(function () { }) : Promise.resolve();
  var limite = new Promise(function (r) { setTimeout(r, 2500); });
  carregar(function () {
    Promise.race([fontes, limite]).then(function () {
      pronto = true;
      if (pedido) { corre = true; t0 = performance.now(); requestAnimationFrame(loop); }
    });
  });
  window.MNAZ_INTRO = { tocar: tocar, fim: fim, frame: function (t) { layout(); frame(t); } };
})();
