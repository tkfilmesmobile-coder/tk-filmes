/* TK Filmes · experiência (fora do 3D)
   Abertura de cinema, rolagem com inércia, títulos que se revelam, cursor próprio,
   botões magnéticos e a galeria de trabalhos em holograma. */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ?quadro-fixo: modo de conferência (sem abertura, sem transições)
  if (/[?&]quadro-fixo/.test(location.search)) {
    html.classList.add('quadro-fixo');
    try { sessionStorage.setItem('tk-abertura', '1'); } catch (e) {}
  }
  var ponteiroFino = window.matchMedia('(pointer: fine)').matches;
  function avisar(nome, d) { if (nome === 'tk:intro-fim') window.__tkIntroFim = true; window.dispatchEvent(new CustomEvent(nome, { detail: d })); }
  function ler(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  // ---------- Rolagem com inércia (Lenis) ----------
  var lenis = null;
  if (!reduzir && window.Lenis && !html.classList.contains('quadro-fixo')) {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    (function rolar(t) { lenis.raf(t); requestAnimationFrame(rolar); })(performance.now());
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var alvo = document.querySelector(a.getAttribute('href')); if (!alvo) return;
      e.preventDefault(); lenis.scrollTo(alvo, { offset: 0, duration: 1.6 });
    });
  }

  // ---------- Títulos que se revelam palavra a palavra ----------
  document.querySelectorAll('[data-revela="palavras"]').forEach(function (el) {
    var texto = el.textContent.trim();
    el.setAttribute('aria-label', texto);
    el.innerHTML = texto.split(/\s+/).map(function (p, i) {
      return '<span class="palavra" aria-hidden="true"><span style="--i:' + i + '">' + p + '</span></span>';
    }).join(' ');
  });
  var revelar = function (el) { el.classList.add('visivel'); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { revelar(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('[data-revela]').forEach(function (el) { if (!el.closest('#topo')) io.observe(el); });
  } else document.querySelectorAll('[data-revela]').forEach(revelar);
  var revelarAbertura = function () { document.querySelectorAll('#topo [data-revela]').forEach(revelar); };

  // ---------- Abertura de cinema ----------
  var filme = document.getElementById('abertura-filme');
  function fimAbertura() {
    if (!filme || filme.classList.contains('saindo')) return;
    filme.classList.add('saindo');
    gravar('tk-abertura', '1');
    if (lenis) lenis.start();
    html.classList.remove('rodando-abertura');
    setTimeout(function () { revelarAbertura(); avisar('tk:intro-fim'); }, 250);
    setTimeout(function () { filme.remove(); }, 1100);
  }
  if (!filme || reduzir || ler('tk-abertura')) {
    if (filme) filme.remove();
    html.classList.remove('rodando-abertura');
    revelarAbertura();
    setTimeout(function () { avisar('tk:intro-fim'); }, 60);
  } else {
    if (lenis) lenis.stop();
    var tc = filme.querySelector('.timecode'), t0 = performance.now();
    (function contar() {
      if (!document.body.contains(filme)) return;
      var ms = performance.now() - t0, q = Math.floor(ms / 1000 * 24);
      tc.textContent = '00:00:' + String(Math.floor(q / 24)).padStart(2, '0') + ':' + String(q % 24).padStart(2, '0');
      requestAnimationFrame(contar);
    })();
    setTimeout(fimAbertura, 2600);
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { window.addEventListener(ev, fimAbertura, { once: true, passive: true }); });
  }

  // ---------- Galeria em holograma ----------
  var lista = document.querySelector('.trabalhos-lista');
  var holo = document.getElementById('holograma');
  if (lista && holo && ponteiroFino && !reduzir) {
    html.classList.add('holo-cursor');
    var holoImg = holo.querySelector('img'), holoVideo = holo.querySelector('video'), holoLegenda = holo.querySelector('.holo-legenda');
    var alvoX = 0, alvoY = 0, x = 0, y = 0, vx = 0, mostrando = false;
    lista.querySelectorAll('.trabalho').forEach(function (item) {
      item.addEventListener('pointerenter', function () {
        var img = item.querySelector('img');
        holoImg.src = img.currentSrc || img.src; holoImg.alt = '';
        var v = item.getAttribute('data-video');
        if (v && holoVideo) { holoVideo.src = v; holoVideo.hidden = false; holoVideo.play().catch(function () {}); } else if (holoVideo) { holoVideo.pause(); holoVideo.hidden = true; }
        holoLegenda.textContent = item.getAttribute('data-formato') || '';
        holo.classList.add('ligado'); mostrando = true;
        holo.classList.remove('troca'); void holo.offsetWidth; holo.classList.add('troca');
      });
    });
    lista.addEventListener('pointerleave', function () { holo.classList.remove('ligado'); mostrando = false; if (holoVideo) holoVideo.pause(); });
    // o holograma flutua à direita do título apontado, sem cobrir o texto
    window.addEventListener('pointermove', function (e) {
      var r = lista.getBoundingClientRect();
      alvoX = Math.min(r.right - 280, Math.max(e.clientX + 170, r.left + r.width * 0.5));
      alvoY = e.clientY;
    }, { passive: true });
    (function flutuar(t) {
      var nx = x + (alvoX - x) * 0.12, ny = y + (alvoY - y) * 0.12;
      vx = vx + ((nx - x) - vx) * 0.2; x = nx; y = ny;
      if (mostrando) {
        var giro = Math.max(-18, Math.min(18, vx * 0.9)), boia = Math.sin(t / 600) * 6;
        holo.style.transform = 'translate3d(' + x + 'px,' + (y - 170 + boia) + 'px,0) perspective(900px) rotateY(' + (-giro) + 'deg) rotateZ(' + (giro * 0.25) + 'deg)';
      }
      requestAnimationFrame(flutuar);
    })(0);
  }

  // ---------- Retrato vivo (Quem dirige) ----------
  // ela olha pra onde está o interesse (quadros do vídeo dela olhando em todas as direções, num canvas).
  //   As poses vêm de <data-olhar>poses.json: [x, y], x de -1 (esquerda) a 1 (direita), y de -1 (cima) a 1 (baixo).
  //   O quadro 00 é o de frente, de olhos abertos.
  //   no computador: segue o cursor (lados e cima/baixo); com o mouse parado, volta a olhar pra frente.
  //   no celular: segue a rolagem (entra olhando pra cima, passa de frente, sai olhando pra baixo);
  //   um toque ou clique faz ela olhar pro ponto tocado por um instante.
  // com "reduzir movimento": foto parada (capa do vídeo).
  var retrato = document.querySelector('.retrato');
  var retratoVideo = retrato && retrato.querySelector('video');
  var olhar = retrato && retrato.getAttribute('data-olhar');
  if (retratoVideo && olhar && !reduzir) {
    retratoVideo.poster = retrato.getAttribute('data-olhar-capa');
    var tela = document.createElement('canvas'); tela.className = 'retrato-olhar'; tela.width = 480; tela.height = 640; tela.setAttribute('aria-hidden', 'true');
    retrato.querySelector('.retrato-moldura').insertBefore(tela, retrato.querySelector('.retrato-brilho'));
    var ctx = tela.getContext('2d'), poses = [], quadros = [], pronto = false;
    var olharX = 0, olharY = 0, alvoOlharX = 0, alvoOlharY = 0, desenhado = -1, andando = false, parado;
    var limitar1 = function (v) { return Math.max(-1, Math.min(1, v)); };
    var maisPerto = function (x, y) {
      var m = 0, dm = 1e9;
      for (var k = 0; k < poses.length; k++) { var ddx = poses[k][0] - x, ddy = poses[k][1] - y, d = ddx * ddx + ddy * ddy; if (d < dm) { dm = d; m = k; } }
      return m;
    };
    var desenhar = function () {
      olharX += (alvoOlharX - olharX) * 0.16; olharY += (alvoOlharY - olharY) * 0.16;
      var i = maisPerto(olharX, olharY);
      if (i !== desenhado && quadros[i].complete) { ctx.drawImage(quadros[i], 0, 0, 480, 640); desenhado = i; }
      if (Math.abs(alvoOlharX - olharX) + Math.abs(alvoOlharY - olharY) > 0.01) requestAnimationFrame(desenhar); else andando = false;
    };
    var andar = function () { if (pronto && !andando) { andando = true; requestAnimationFrame(desenhar); } };
    var mirar = function (x, y) { alvoOlharX = limitar1(x); alvoOlharY = limitar1(y); andar(); };
    var carregar = function () {
      fetch(olhar + 'poses.json').then(function (r) { return r.json(); }).then(function (p) {
        poses = p; var faltam = p.length;
        p.forEach(function (_, k) {
          var im = new Image(); im.decoding = 'async';
          im.onload = function () {
            if (--faltam) return;
            pronto = true; ctx.drawImage(quadros[0], 0, 0, 480, 640); desenhado = 0;
            retrato.classList.add('olhando');
            if (!ponteiroFino) pelaRolagem();
          };
          im.src = olhar + String(k).padStart(2, '0') + '.webp'; quadros.push(im);
        });
      }).catch(function () {});
    };
    if ('IntersectionObserver' in window) {
      var ioOlhar = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { carregar(); ioOlhar.disconnect(); } }, { rootMargin: '600px 0px' });
      ioOlhar.observe(retrato);
    } else carregar();
    var naTela = function () { var r = retrato.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    // ponto da tela → direção do olhar, a partir do rosto dela (um terço de cima do retrato)
    var paraOPonto = function (px, py) {
      var r = retrato.getBoundingClientRect();
      var x = (px - (r.left + r.width / 2)) / (innerWidth * 0.42), y = (py - (r.top + r.height * 0.36)) / (innerHeight * 0.45);
      // perto do rosto, ela olha pra frente (o vídeo não tem meio-termo entre o centro e as direções)
      return Math.hypot(x, y) < 0.22 ? [0, 0] : [x, y];
    };
    var tocouAte = 0;
    // celular: entrando por baixo ela olha pra cima (e um pouco pra esquerda); no meio, de frente; saindo, pra baixo
    var pelaRolagem = function () {
      if (Date.now() < tocouAte || !naTela() || !pronto) return;
      var r = retrato.getBoundingClientRect();
      var p = limitar1(((r.top + r.height / 2) - innerHeight / 2) / (innerHeight / 2 + r.height / 2) * 1.4);
      if (Math.abs(p) < 0.25) mirar(0, 0); else mirar(-p * 0.55, -p);
    };
    if (ponteiroFino) {
      window.addEventListener('pointermove', function (e) {
        if (!pronto || !naTela()) return;
        var d = paraOPonto(e.clientX, e.clientY); mirar(d[0], d[1]);
        clearTimeout(parado); parado = setTimeout(function () { mirar(0, 0); }, 2600);
      }, { passive: true });
      document.addEventListener('pointerleave', function () { mirar(0, 0); });
    } else {
      window.addEventListener('scroll', pelaRolagem, { passive: true });
      window.addEventListener('resize', pelaRolagem, { passive: true });
      // toque ou clique: olha pro ponto tocado e, depois de um instante, volta a seguir a rolagem
      window.addEventListener('pointerdown', function (e) {
        if (!pronto || !naTela()) return;
        tocouAte = Date.now() + 1800;
        var d = paraOPonto(e.clientX, e.clientY); mirar(d[0], d[1]);
        clearTimeout(parado); parado = setTimeout(function () { tocouAte = 0; pelaRolagem(); }, 1800);
      }, { passive: true });
    }
  } else if (retratoVideo && !reduzir) {
    var tocar = function () { retratoVideo.play().catch(function () {}); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) tocar(); else retratoVideo.pause();
      }, { rootMargin: '120px 0px' }).observe(retrato);
    } else { retratoVideo.preload = 'auto'; tocar(); }
    // inclina de leve na direção do cursor, com a luz acompanhando
    if (ponteiroFino) {
      var moldura = retrato.querySelector('.retrato-moldura');
      var rx = 0, ry = 0, tx = 0, ty = 0, girando = false;
      var girar = function () {
        rx += (tx - rx) * 0.09; ry += (ty - ry) * 0.09;
        moldura.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        if (Math.abs(tx - rx) + Math.abs(ty - ry) > 0.02) requestAnimationFrame(girar); else girando = false;
      };
      var mexer = function () { if (!girando) { girando = true; requestAnimationFrame(girar); } };
      retrato.addEventListener('pointermove', function (e) {
        var r = retrato.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ty = (px - 0.5) * 9; tx = (0.5 - py) * 7;
        moldura.style.setProperty('--bx', (px * 100).toFixed(1) + '%');
        moldura.style.setProperty('--by', (py * 100).toFixed(1) + '%');
        mexer();
      });
      retrato.addEventListener('pointerleave', function () { tx = 0; ty = 0; mexer(); });
    }
  }

  // ---------- Cursor próprio e botões magnéticos ----------
  if (ponteiroFino && !reduzir) {
    html.classList.add('cursor-proprio');
    var anel = document.createElement('div'); anel.className = 'cursor'; anel.setAttribute('aria-hidden', 'true');
    anel.innerHTML = '<span class="cursor-rotulo"></span>';
    var ponto = document.createElement('div'); ponto.className = 'cursor-ponto'; ponto.setAttribute('aria-hidden', 'true');
    document.body.appendChild(anel); document.body.appendChild(ponto);
    var cx = -100, cy = -100, ax = -100, ay = -100;
    var rotulo = anel.querySelector('.cursor-rotulo');
    window.addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY;
      ponto.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      var sobre = e.target.closest('a, button, summary, [data-cursor]');
      anel.classList.toggle('sobre', !!sobre);
      var r = sobre && sobre.getAttribute('data-cursor');
      rotulo.textContent = r || '';
      anel.classList.toggle('com-rotulo', !!r);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { anel.classList.add('fora'); });
    document.addEventListener('pointerenter', function () { anel.classList.remove('fora'); });
    (function seguir() {
      ax += (cx - ax) * 0.18; ay += (cy - ay) * 0.18;
      anel.style.transform = 'translate3d(' + ax + 'px,' + ay + 'px,0)';
      requestAnimationFrame(seguir);
    })();
    document.querySelectorAll('.botao:not(.whats-fixo), .botao-contorno, .som-botao').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + (dx * 0.22) + 'px,' + (dy * 0.3) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }
})();
