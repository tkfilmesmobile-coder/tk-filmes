/* TK Filmes · comportamento da página
   MEDIDORES: preencha os IDs abaixo quando criar as contas. Enquanto estiverem vazios,
   nada de fora é carregado e o aviso de cookies nem aparece. */
var MEDIDORES = {
  ga4: '',          // Google Analytics 4, ex.: 'G-XXXXXXXXXX'
  metaPixel: '',    // Pixel da Meta, ex.: '123456789012345'
  clarity: ''       // Microsoft Clarity, ex.: 'abcd1234ef'
};

(function () {
  'use strict';
  var CHAVE = 'tk-cookies';
  var temMedidor = !!(MEDIDORES.ga4 || MEDIDORES.metaPixel || MEDIDORES.clarity);
  var ligados = false;

  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) {} }

  function script(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }

  function ligarMedidores() {
    if (ligados) return; ligados = true;
    if (MEDIDORES.ga4) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', MEDIDORES.ga4, { anonymize_ip: true });
      script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEDIDORES.ga4));
    }
    if (MEDIDORES.metaPixel) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', MEDIDORES.metaPixel);
      window.fbq('track', 'PageView');
    }
    if (MEDIDORES.clarity) {
      (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, 'clarity', 'script', MEDIDORES.clarity);
    }
  }

  // Aviso de cookies (LGPD): os medidores só ligam depois do "aceito"
  var aviso = document.getElementById('cookies');
  function mostrarAviso() { if (aviso && temMedidor) aviso.hidden = false; }
  if (temMedidor) {
    var escolha = ler();
    if (escolha === 'aceito') ligarMedidores();
    else if (escolha !== 'recusado') mostrarAviso();
  }
  if (aviso) {
    aviso.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      var aceitou = b.classList.contains('aceitar');
      gravar(aceitou ? 'aceito' : 'recusado');
      aviso.hidden = true;
      if (aceitou) ligarMedidores();
    });
  }
  var prefs = document.getElementById('preferencias-cookies');
  if (prefs) {
    if (!temMedidor) prefs.hidden = true;
    prefs.addEventListener('click', mostrarAviso);
  }

  // Cada clique no WhatsApp vira um evento, separado por serviço
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a[data-whats]'); if (!a || !ligados) return;
    var servico = a.getAttribute('data-whats');
    if (window.gtag) window.gtag('event', 'clique_whatsapp', { servico: servico });
    if (window.fbq) window.fbq('track', 'Contact', { content_name: servico });
    if (window.clarity) window.clarity('event', 'whatsapp_' + servico);
  });

  // Botão fixo de WhatsApp no celular: aparece depois da abertura e some na chamada final
  var fixo = document.querySelector('.whats-fixo');
  var abertura = document.getElementById('topo');
  var chamada = document.getElementById('contato');
  if (fixo && abertura && 'IntersectionObserver' in window) {
    var aberturaVisivel = true, chamadaVisivel = false;
    var atualizar = function () { fixo.classList.toggle('visivel', !aberturaVisivel && !chamadaVisivel); };
    new IntersectionObserver(function (e) { aberturaVisivel = e[0].isIntersecting; atualizar(); }).observe(abertura);
    if (chamada) new IntersectionObserver(function (e) { chamadaVisivel = e[0].isIntersecting; atualizar(); }).observe(chamada);
  }
})();
