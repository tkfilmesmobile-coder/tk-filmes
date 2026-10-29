/* TK Filmes · som do site
   Tudo sintetizado na hora (Web Audio), sem arquivo de áudio: nada pra licenciar e quase nenhum peso.
   Desligado por padrão; liga no botão "Som" do topo. A escolha fica guardada neste aparelho.
   - ambiente: um acorde quente e lento, com respiração no filtro (clima de estúdio)
   - passar o mouse: um "tic" curto · clicar: um toque grave
   - trocar de cena: um sopro de ar (whoosh)
   - peça do K que acende / encaixa: um "clac" seco
   - o K montado na abertura: um acorde que se abre */
(function () {
  'use strict';
  var botao = document.getElementById('som');
  if (!botao || !(window.AudioContext || window.webkitAudioContext)) { if (botao) botao.hidden = true; return; }

  var ctx = null, mestre = null, eco = null, ambiente = null, ligado = false;
  function lerPref() { try { return localStorage.getItem('tk-som') === 'ligado'; } catch (e) { return false; } }
  function gravarPref(v) { try { localStorage.setItem('tk-som', v ? 'ligado' : 'desligado'); } catch (e) {} }

  function preparar() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    mestre = ctx.createGain(); mestre.gain.value = 0; mestre.connect(ctx.destination);
    // reverberação de sala: resposta ao impulso feita de ruído que decai
    eco = ctx.createConvolver();
    var dur = 2.8, n = Math.floor(ctx.sampleRate * dur), ir = ctx.createBuffer(2, n, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = ir.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2); }
    eco.buffer = ir;
    var volEco = ctx.createGain(); volEco.gain.value = 0.35; eco.connect(volEco); volEco.connect(mestre);
  }

  function saida(ganho, comEco) {
    var g = ctx.createGain(); g.gain.value = ganho; g.connect(mestre); if (comEco) g.connect(eco); return g;
  }

  function iniciarAmbiente() {
    if (ambiente) return;
    var filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 700; filtro.Q.value = 0.6;
    var vol = saida(0, true); filtro.connect(vol);
    var lfo = ctx.createOscillator(), prof = ctx.createGain(); lfo.frequency.value = 0.07; prof.gain.value = 320;
    lfo.connect(prof); prof.connect(filtro.frequency); lfo.start();
    var notas = [110, 164.81, 220, 277.18]; // lá, mi, lá, dó#: um acorde de lá maior aberto
    var osc = notas.map(function (f, i) {
      var o = ctx.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (i - 1.5) * 4;
      var g = ctx.createGain(); g.gain.value = 0.22 / notas.length; o.connect(g); g.connect(filtro); o.start(); return o;
    });
    vol.gain.setTargetAtTime(0.32, ctx.currentTime, 2.5);
    ambiente = { vol: vol, osc: osc, lfo: lfo };
  }

  function tic() {
    if (!ligado) return;
    var o = ctx.createOscillator(), g = saida(0, false), t = ctx.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(2100, t); o.frequency.exponentialRampToValueAtTime(1300, t + 0.04);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g); o.start(t); o.stop(t + 0.08);
  }
  function toque() {
    if (!ligado) return;
    var o = ctx.createOscillator(), g = saida(0, true), t = ctx.currentTime;
    o.type = 'triangle'; o.frequency.setValueAtTime(440, t); o.frequency.exponentialRampToValueAtTime(220, t + 0.12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); o.start(t); o.stop(t + 0.25);
  }
  var ruido = null;
  function bufferRuido() {
    if (ruido) return ruido;
    var n = ctx.sampleRate, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return (ruido = b);
  }
  function sopro() {
    if (!ligado) return;
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = saida(0, true), t = ctx.currentTime;
    s.buffer = bufferRuido(); f.type = 'bandpass'; f.Q.value = 1.4;
    f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(1800, t + 0.45); f.frequency.exponentialRampToValueAtTime(500, t + 0.9);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    s.connect(f); f.connect(g); s.start(t); s.stop(t + 1);
  }
  function clac(atraso) {
    if (!ligado) return;
    var t = ctx.currentTime + (atraso || 0);
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = saida(0, true);
    s.buffer = bufferRuido(); f.type = 'highpass'; f.frequency.value = 2400;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f); f.connect(g); s.start(t); s.stop(t + 0.06);
    var o = ctx.createOscillator(), g2 = saida(0, false);
    o.type = 'sine'; o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.12);
    g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.12, t + 0.004); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g2); o.start(t); o.stop(t + 0.18);
  }
  function acorde() {
    if (!ligado) return;
    [0, 0.55, 0.95, 1.3].forEach(function (a) { clac(a); });
    var t = ctx.currentTime + 1.45;
    [440, 554.37, 659.25, 880].forEach(function (f, i) {
      var o = ctx.createOscillator(), g = saida(0, true); o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + i * 0.06); g.gain.exponentialRampToValueAtTime(0.05, t + i * 0.06 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      o.connect(g); o.start(t + i * 0.06); o.stop(t + 2.8);
    });
  }

  function ligar() {
    preparar();
    if (ctx.state === 'suspended') ctx.resume();
    ligado = true; iniciarAmbiente();
    mestre.gain.cancelScheduledValues(ctx.currentTime); mestre.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
    botao.setAttribute('aria-pressed', 'true'); botao.classList.add('ligado'); gravarPref(true);
  }
  function desligar() {
    ligado = false; gravarPref(false);
    botao.setAttribute('aria-pressed', 'false'); botao.classList.remove('ligado');
    if (ctx) mestre.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
  }
  botao.addEventListener('click', function () { ligado ? desligar() : (ligar(), toque()); });

  // Quem já tinha ligado: volta a tocar no primeiro toque na página (o navegador exige um gesto)
  if (lerPref()) {
    var retomar = function () { ligar(); ['pointerdown', 'keydown'].forEach(function (e) { window.removeEventListener(e, retomar); }); };
    ['pointerdown', 'keydown'].forEach(function (e) { window.addEventListener(e, retomar); });
  }

  // Ganchos da experiência
  var ultimoTic = 0;
  document.addEventListener('pointerover', function (e) {
    var el = e.target.closest('a, button, summary, .trabalho'); if (!el || el.contains(e.relatedTarget)) return;
    var agora = performance.now(); if (agora - ultimoTic > 70) { ultimoTic = agora; tic(); }
  });
  document.addEventListener('click', function (e) { if (e.target.closest('a, summary') && !e.target.closest('#som')) toque(); });
  var primeiraCena = true, ultimoSopro = 0;
  window.addEventListener('tk:cena', function () {
    if (primeiraCena) { primeiraCena = false; return; }
    var agora = performance.now(); if (agora - ultimoSopro > 700) { ultimoSopro = agora; sopro(); }
  });
  window.addEventListener('tk:peca', function () { clac(0); });
  window.addEventListener('tk:montagem', acorde);
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (ligado) ctx.resume();
  });
})();
