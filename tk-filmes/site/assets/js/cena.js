/* TK Filmes · "O K em cena" (v2, acabamento de estúdio)
   O símbolo K é um objeto 3D num set: luz de estúdio com reflexos reais, sombra suave no chão,
   folhas e hastes em caramelo acetinado, fio em metal escovado, poeira de luz no ar com
   profundidade de campo (o que está fora de foco vira bokeh) e câmera que viaja entre as cenas.
   A rolagem conta a história, uma pose por seção ([data-cena] no HTML).
   Sem WebGL ou com "reduzir movimento": versão estática (html.k-estatico). */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/addons/RoomEnvironment.js';

const html = document.documentElement;
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const avisar = (nome, detalhe) => window.dispatchEvent(new CustomEvent(nome, { detail: detalhe }));

function estatico() { html.classList.add('k-estatico'); avisar('tk:intro-fim'); }
function temWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
}

if (reduzir || !temWebGL()) estatico();
else { try { iniciar(); } catch (e) { console.warn('cena 3D desligada:', e); estatico(); } }

function iniciar() {
  // ---------- O desenho do K (os traços da logo 2.0) ----------
  const TRACOS = [
    'M 633.35 627.11 L 459.48 531.71 C 418 508.95 395.73 465.43 397.37 421.17 L 397.37 366.37 C 392.46 319.42 415.48 271.91 459.48 247.78 L 633.35 152.39 C 665.48 210.92 644.07 284.41 585.52 316.54 L 452.08 389.75 L 585.52 462.97 C 644.07 495.09 665.48 568.58 633.35 627.11 Z', // 0 hastes → sites
    'M 391.65 189.69 L 395.95 387.96 L 395.91 387.96 C 329.13 389.41 273.79 336.44 272.34 269.69 L 268.03 71.34 L 268.08 71.34 C 334.84 69.89 390.2 122.93 391.65 189.69 Z', // 1 folha de cima → marca
    'M 395.3 591.5 L 390.99 393.22 L 390.94 393.22 C 324.17 394.67 271.18 450 272.63 516.75 L 276.93 715.1 L 276.98 715.1 C 343.74 713.65 396.75 658.25 395.3 591.5 Z', // 2 folha de baixo → vídeos
    'M 393.72 86.3 C 396.41 86.3 398.59 88.45 398.59 91.11 L 398.59 664.3 C 398.59 666.95 396.41 669.1 393.72 669.1 C 391.03 669.1 388.84 666.95 388.84 664.3 L 388.84 91.11 C 388.84 88.45 391.03 86.3 393.72 86.3 Z' // 3 fio → estratégia
  ];
  const CX = 459, CY = 393, ESC = 4 / 654;
  function forma(d) {
    const t = d.match(/[MLCZ]|-?\d*\.?\d+/g), s = new THREE.Shape();
    const P = (x, y) => [(x - CX) * ESC, -(y - CY) * ESC];
    let i = 0, cmd = '';
    while (i < t.length) {
      if (/[MLCZ]/.test(t[i])) { cmd = t[i++]; if (cmd === 'Z') { s.closePath(); continue; } }
      if (cmd === 'M') { const p = P(+t[i], +t[i + 1]); s.moveTo(p[0], p[1]); i += 2; cmd = 'L'; }
      else if (cmd === 'L') { const p = P(+t[i], +t[i + 1]); s.lineTo(p[0], p[1]); i += 2; }
      else if (cmd === 'C') { const a = P(+t[i], +t[i + 1]), b = P(+t[i + 2], +t[i + 3]), c = P(+t[i + 4], +t[i + 5]); s.bezierCurveTo(a[0], a[1], b[0], b[1], c[0], c[1]); i += 6; }
      else i++;
    }
    return s;
  }

  // ---------- Palco ----------
  const palco = document.getElementById('palco');
  const renderer = new THREE.WebGLRenderer({ canvas: palco, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const celularFraco = (navigator.hardwareConcurrency || 4) <= 4 && window.innerWidth < 768;
  const PR = Math.min(window.devicePixelRatio || 1, celularFraco ? 1.25 : 1.75);
  renderer.setPixelRatio(PR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const cena = new THREE.Scene();
  // Reflexos reais: um estúdio virtual gera o mapa de ambiente que o material reflete
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  const olhaPara = new THREE.Vector3();

  // Luz de estúdio com contraste: principal quente forte, contra-luz fria recortando a borda, preenchimento baixo
  const ceu = new THREE.HemisphereLight(0xfff3e8, 0x6b4636, 0.35); cena.add(ceu);
  const chave = new THREE.DirectionalLight(0xffe6cf, 2.4); chave.position.set(5, 6, 7); cena.add(chave);
  const recorte = new THREE.DirectionalLight(0xeef4ff, 2.2); recorte.position.set(-7, 3, -5); cena.add(recorte);
  const preench = new THREE.DirectionalLight(0xffd9bd, 0.3); preench.position.set(-4, -3, 6); cena.add(preench);

  // caramelo da marca (#CD9365): a base é mais escura porque a luz de estúdio clareia
  const acetinado = new THREE.MeshPhysicalMaterial({
    color: 0xb87448, roughness: 0.5, metalness: 0.0, clearcoat: 0.3, clearcoatRoughness: 0.5,
    sheen: 0.35, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xf0b88c), envMapIntensity: 0.5, transparent: true
  });
  const metal = new THREE.MeshPhysicalMaterial({
    color: 0xb8916a, metalness: 1.0, roughness: 0.32, anisotropy: 0.85, anisotropyRotation: Math.PI / 2,
    envMapIntensity: 0.9, transparent: true
  });

  const grupo = new THREE.Group(); cena.add(grupo);
  const pecas = TRACOS.map((d, i) => {
    const fio = i === 3, prof = fio ? 0.12 : 0.3;
    const g = new THREE.ExtrudeGeometry(forma(d), { depth: prof, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.032, bevelSegments: 5, curveSegments: 32 });
    g.computeBoundingBox();
    const c = new THREE.Vector3(); g.boundingBox.getCenter(c);
    g.translate(-c.x, -c.y, -c.z);
    const m = new THREE.Mesh(g, (fio ? metal : acetinado).clone());
    m.userData.base = c.clone();
    grupo.add(m);
    return m;
  });
  const BASE = pecas.map(p => p.userData.base);

  // Sombra suave no chão (textura radial, barata e sem serrilhado)
  const tSombra = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(60,35,24,0.55)'); gr.addColorStop(0.45, 'rgba(60,35,24,0.22)'); gr.addColorStop(1, 'rgba(60,35,24,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tSombra, transparent: true, depthWrite: false, toneMapped: false }));
  sombra.rotation.x = -Math.PI / 2; cena.add(sombra);

  // Feixe de luz (só aparece na cena noturna, a chamada final)
  const tFeixe = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 512;
    const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 64, 0);
    gr.addColorStop(0, 'rgba(255,232,210,0)'); gr.addColorStop(0.5, 'rgba(255,232,210,0.9)'); gr.addColorStop(1, 'rgba(255,232,210,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 512);
    const v = x.createLinearGradient(0, 0, 0, 512); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.25, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalCompositeOperation = 'destination-in'; x.fillStyle = v; x.fillRect(0, 0, 64, 512);
    return new THREE.CanvasTexture(c);
  })();
  const feixe = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 16), new THREE.MeshBasicMaterial({ map: tFeixe, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  feixe.position.set(1.5, 2, -6); feixe.rotation.z = -0.42; cena.add(feixe);

  // Poeira de luz com profundidade de campo: fora do foco, a partícula cresce e esmaece (bokeh)
  const N = celularFraco ? 140 : (window.innerWidth < 768 ? 220 : 420);
  const pos = new Float32Array(N * 3), sem = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 18; pos[i * 3 + 1] = (Math.random() - 0.5) * 11; pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 1; sem[i] = Math.random() * 100; }
  const gPo = new THREE.BufferGeometry();
  gPo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  gPo.setAttribute('semente', new THREE.BufferAttribute(sem, 1));
  const poeiraMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTempo: { value: 0 }, uFoco: { value: 11 }, uCor: { value: new THREE.Color(0xa8714a) }, uAlfa: { value: 0.22 }, uPR: { value: PR } },
    vertexShader: `
      attribute float semente; uniform float uTempo, uFoco, uPR, uAlfa; varying float vA; varying float vBorda;
      void main(){
        vec3 p = position;
        p.x += sin(uTempo*0.11 + semente)*0.55;
        p.y = mod(position.y + 5.5 + uTempo*0.06 + semente*0.05, 11.0) - 5.5 + sin(uTempo*0.07 + semente*1.7)*0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dist = -mv.z, desfoque = abs(dist - uFoco);
        gl_PointSize = (2.2 + desfoque*2.6) * uPR * (11.0 / dist);
        vA = uAlfa / (1.0 + desfoque*0.75) * (0.55 + 0.45*sin(uTempo*0.9 + semente*3.0));
        vBorda = clamp(desfoque*0.25, 0.0, 0.85);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uCor; varying float vA; varying float vBorda;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = (1.0 - smoothstep(vBorda, 1.0, d)) * vA;
        if (a < 0.003) discard;
        gl_FragColor = vec4(uCor, a);
      }`
  });
  const poeira = new THREE.Points(gPo, poeiraMat); cena.add(poeira);

  // ---------- Coreografia ----------
  // g = o K (posição, rotação, escala, opacidade) · cam = câmera (posição e para onde olha)
  // noite = 0 dia (fundo creme) a 1 noite (fundo marrom) · chao = intensidade da sombra
  const Z = { p: [0, 0, 0], r: [0, 0, 0] };
  const montado = [Z, Z, Z, Z];
  const solto = [
    { p: [1.5, 0.4, 1.0], r: [0.2, 0.9, -0.3] }, { p: [-1.3, 1.1, 0.9], r: [0.5, -0.2, 0.7] },
    { p: [-1.0, -1.4, -0.8], r: [-0.4, 0.3, -0.5] }, { p: [0.2, 0.1, -0.3], r: [0.1, 0.4, 0.45] }
  ];
  const linha = (alvos) => alvos.map((a, i) => ({ p: [a[0] - BASE[i].x, a[1] - BASE[i].y, 0], r: [0, a[2] || 0, 0] }));
  const explodidoPC = linha([[3.4, 0, 0.25], [1.15, 0, 0.15], [-1.15, 0, -0.15], [-3.4, 0, -0.25]]);
  const explodidoCel = linha([[1.0, -1.05, 0.2], [-1.0, -1.05, 0.1], [1.0, 1.05, -0.1], [-1.0, 1.05, -0.2]]);
  const entrada = [
    { p: [6, 3, 4], r: [2, 3, 1] }, { p: [-6, 4, 3], r: [-2, 1, 2] }, { p: [-5, -5, 2], r: [1, -3, -1] }, { p: [1, -6, 5], r: [3, 0, 2] }
  ];

  const POSES = [
    /* 0 abertura */  { pc: { p: [2.6, -0.1, 0], r: [0.08, -0.42, 0], s: 1.05, o: 1 }, cel: { p: [0, 1.8, 0], r: [0.08, -0.35, 0], s: 0.54, o: 1 }, cam: [0, 0, 11], olha: [0, 0, 0], noite: 0, chao: 1, pecas: montado },
    /* 1 problema */  { pc: { p: [2.8, 0, -0.6], r: [0.25, 0.55, 0.1], s: 0.95, o: 1 }, cel: { p: [0.3, 0.6, -2.5], r: [0.25, 0.5, 0.1], s: 0.7, o: 0.22 }, cam: [-0.8, 0.5, 10.4], olha: [0.6, 0, 0], noite: 0, chao: 0.35, pecas: solto },
    /* 2 frentes */   { pc: { p: [2.3, 1.2, -1.2], r: [0.12, -0.15, 0], s: 0.5, o: 1 }, cel: { p: [0, 0.75, -0.5], r: [0.1, 0, 0], s: 0.46, o: 1 }, cam: [0, 0.2, 11.5], olha: [0, 0.2, 0], noite: 0, chao: 0, pecas: explodidoPC, pecasCel: explodidoCel },
    /* 3 trabalhos */ { pc: { p: [-3.8, -0.4, -5], r: [0.1, 1.4, 0], s: 0.75, o: 0.3 }, cel: { p: [0, 2.2, -6], r: [0.1, 1.4, 0], s: 0.6, o: 0.15 }, cam: [0.6, -0.3, 13], olha: [0, 0, -2], noite: 0, chao: 0, pecas: montado },
    /* 4 como */      { pc: { p: [3.2, 0.3, -2.5], r: [0.15, 2.6, 0], s: 0.85, o: 0.45 }, cel: { p: [0.4, 0.2, -4], r: [0.15, 2.6, 0], s: 0.7, o: 0.16 }, cam: [0.8, 0.3, 12], olha: [0.4, 0, 0], noite: 0, chao: 0.2, pecas: montado },
    /* 5 quem */      { pc: { p: [5.6, 2.3, -5], r: [0.1, 3.7, 0.05], s: 0.7, o: 0.2 }, cel: { p: [0.6, 1.6, -5], r: [0.1, 3.7, 0], s: 0.6, o: 0.12 }, cam: [0, 0, 12], olha: [0, 0, 0], noite: 0, chao: 0, pecas: montado },
    /* 6 perguntas */ { pc: { p: [-3.8, 0, -4], r: [0.1, 4.9, 0], s: 0.8, o: 0.22 }, cel: { p: [0, 0.5, -6], r: [0.1, 4.9, 0], s: 0.6, o: 0.1 }, cam: [0, 0, 12.5], olha: [0, 0, 0], noite: 0, chao: 0, pecas: montado },
    /* 7 chamada */   { pc: { p: [2.7, 0, 0.4], r: [0.04, 6.0, 0], s: 1.05, o: 1 }, cel: { p: [0, 1.65, 0], r: [0.04, 6.0, 0], s: 0.6, o: 1 }, cam: [0, 0.1, 10.5], olha: [0.3, 0, 0], noite: 1, chao: 0.8, pecas: montado }
  ];

  // com a Talyta na abertura, o K fica atrás dela, como uma escultura no set (sem sombra no chão).
  // A posição sai da foto na tela (não do centro da janela), então ele fica atrás dela em qualquer tamanho:
  // x/y = ponto da foto onde fica o centro do K (0 a 1), h = altura do K em relação à altura da foto.
  const retratoEl = document.querySelector('.abertura-retrato');
  const ALVO_K = {
    pc: { x: 0.22, y: 0.42, h: 0.46, z: -2.2, r: [0.06, -0.5, 0] },
    cel: { x: 0.30, y: 0.25, h: 0.33, z: -2.2, r: [0.06, 0.45, 0] }
  };
  if (retratoEl) POSES[0].chao = 0;
  function poseDoK() {
    const a = celular ? ALVO_K.cel : ALVO_K.pc;
    const r = retratoEl.getBoundingClientRect(), w = window.innerWidth, h = window.innerHeight;
    // posição da foto com a página no topo (a pose 0 é a da abertura)
    const sx = r.left + r.width * a.x, sy = r.top + window.scrollY + r.height * a.y;
    const dist = (celular ? 12 : 11) - a.z;
    const meiaA = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist, meiaL = meiaA * (w / h);
    return { p: [(sx / w * 2 - 1) * meiaL, (1 - sy / h * 2) * meiaA, a.z], r: a.r, s: (r.height * a.h / h) * 2 * meiaA / 4, o: 1 };
  }

  const secoes = [...document.querySelectorAll('[data-cena]')].sort((a, b) => +a.dataset.cena - +b.dataset.cena);
  const cortina = document.getElementById('cortina');
  const chamada = document.getElementById('contato');

  const suave = (x) => x * x * (3 - 2 * x);
  const mix = (a, b, t) => a + (b - a) * t;
  const mix3 = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
  // composição vertical (K em cima, texto embaixo): celular e telas estreitas ou em pé (tablet)
  const vertical = () => html.classList.contains('layout-vertical');
  let celular = vertical();

  function poseDe(i) {
    const P = POSES[i];
    const g = (i === 0 && retratoEl) ? poseDoK() : (celular ? P.cel : P.pc);
    // tema marrom: o site inteiro fica na luz da noite (poeira brilhando, feixe, contraluz forte)
    const noite = html.classList.contains('tema-marrom') ? 1 : P.noite;
    return { g, cam: P.cam, olha: P.olha, noite, chao: P.chao, pecas: (celular && P.pecasCel) ? P.pecasCel : P.pecas };
  }

  let cenaAtual = -1;
  function alvo() {
    const vh = window.innerHeight, meio = vh * 0.5, janela = vh * 0.38;
    let i = 0;
    for (let k = 0; k < secoes.length; k++) { if (secoes[k].getBoundingClientRect().top <= meio) i = k; }
    const r = secoes[i].getBoundingClientRect();
    let de = i, para = i, t = 0;
    if (i > 0 && meio - r.top < janela) { de = i - 1; para = i; t = 0.5 + (meio - r.top) / (2 * janela); }
    else if (i < secoes.length - 1 && r.bottom - meio < janela) { de = i; para = i + 1; t = 0.5 - (r.bottom - meio) / (2 * janela); }
    t = suave(Math.min(1, Math.max(0, t)));
    const dominante = +secoes[t < 0.5 ? de : para].dataset.cena;
    if (dominante !== cenaAtual) { cenaAtual = dominante; avisar('tk:cena', dominante); }
    const A = poseDe(+secoes[de].dataset.cena), B = poseDe(+secoes[para].dataset.cena);
    return {
      p: mix3(A.g.p, B.g.p, t), r: mix3(A.g.r, B.g.r, t), s: mix(A.g.s, B.g.s, t), o: mix(A.g.o, B.g.o, t),
      cam: mix3(A.cam, B.cam, t), olha: mix3(A.olha, B.olha, t), noite: mix(A.noite, B.noite, t), chao: mix(A.chao, B.chao, t),
      pecas: A.pecas.map((pa, k) => ({ p: mix3(pa.p, B.pecas[k].p, t), r: mix3(pa.r, B.pecas[k].r, t) }))
    };
  }

  // Começa com as peças espalhadas e invisíveis: a abertura monta o K em cena
  let atual = alvo();
  atual = { ...atual, o: 0, pecas: entrada.map(e => ({ p: e.p.slice(), r: e.r.slice() })) };
  // ?quadro-fixo no endereço: pula as transições e mostra a pose pronta (só pra conferir a composição)
  const quadroFixo = new URLSearchParams(location.search).has('quadro-fixo');
  let montando = quadroFixo, inicioMontagem = -1e9;
  const comecar = () => { if (!montando) { montando = true; inicioMontagem = performance.now(); avisar('tk:montagem'); } };
  if (window.__tkIntroFim) comecar(); // a abertura já terminou (ou foi pulada) antes da cena carregar
  else window.addEventListener('tk:intro-fim', comecar, { once: true });
  setTimeout(comecar, 4500); // garantia, caso a abertura não avise

  // Mouse e inclinação do celular
  const olhar = { x: 0, y: 0 }, olharAtual = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => { olhar.x = e.clientX / window.innerWidth - 0.5; olhar.y = e.clientY / window.innerHeight - 0.5; }, { passive: true });
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    olhar.x = Math.max(-0.5, Math.min(0.5, e.gamma / 50)); olhar.y = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60));
  }, { passive: true });

  // As frentes: seção presa na tela, uma frente acende por vez
  const frentes = document.getElementById('frentes');
  const cartoes = frentes ? [...frentes.querySelectorAll('[data-peca]')] : [];
  const contador = frentes ? frentes.querySelector('.contador-atual') : null;
  let ativoRolagem = -1, ultimoAtivo = -2;
  function atualizarFrentes() {
    if (!frentes || !cartoes.length) return;
    const r = frentes.getBoundingClientRect(), vh = window.innerHeight;
    const dentro = r.top < vh * 0.5 && r.bottom > vh * 0.5;
    const prog = Math.min(0.999, Math.max(0, -r.top / Math.max(1, r.height - vh)));
    const idx = dentro ? Math.floor(prog * cartoes.length) : -1;
    ativoRolagem = idx >= 0 ? +cartoes[idx].dataset.peca : -1;
    if (idx !== ultimoAtivo) {
      if (idx >= 0 && ultimoAtivo >= 0) avisar('tk:peca', idx);
      ultimoAtivo = idx;
      cartoes.forEach((c, i) => c.classList.toggle('ativo', i === Math.max(0, idx)));
      if (contador) contador.textContent = String(Math.max(0, idx) + 1).padStart(2, '0');
    }
  }
  let destaque = -1;
  const brilho = pecas.map(() => 0);
  cartoes.forEach((el) => {
    const n = +el.dataset.peca;
    el.addEventListener('pointerenter', () => { destaque = n; });
    el.addEventListener('pointerleave', () => { if (destaque === n) destaque = -1; });
    el.addEventListener('focusin', () => { destaque = n; });
    el.addEventListener('focusout', () => { if (destaque === n) destaque = -1; });
  });

  function tamanho() {
    const w = window.innerWidth, h = window.innerHeight;
    celular = vertical();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', tamanho);
  tamanho();

  const relogio = new THREE.Clock();
  let visivel = true;
  document.addEventListener('visibilitychange', () => { visivel = !document.hidden; if (visivel) relogio.getDelta(); });
  const corDia = new THREE.Color(0xa8714a), corNoite = new THREE.Color(0xffe2c6);
  let atualCam = null, atualOlha = null, atualNoite = 0, atualChao = 1;

  function quadro() {
    requestAnimationFrame(quadro);
    if (!visivel) return;
    const dt = Math.min(relogio.getDelta(), 0.05), t = relogio.elapsedTime;
    const a = alvo();

    // na montagem, um movimento mais lento e cinematográfico; depois, o ritmo da rolagem
    let base = 0.0025;
    if (montando) { const m = (performance.now() - inicioMontagem) / 1000; base = m < 2.6 ? mix(0.35, 0.02, Math.min(1, m / 2.6)) : 0.0025; }
    const k = quadroFixo ? 1 : (montando ? 1 - Math.pow(base, dt) : 0);
    const kCam = quadroFixo ? 1 : 1 - Math.pow(0.02, dt);

    atual.p = mix3(atual.p, a.p, k); atual.r = mix3(atual.r, a.r, k); atual.s = mix(atual.s, a.s, k);
    atual.o = mix(atual.o, montando ? a.o : 0, k || 0);
    atual.pecas = atual.pecas.map((pc, i) => ({ p: mix3(pc.p, a.pecas[i].p, k), r: mix3(pc.r, a.pecas[i].r, k) }));
    atualCam = atualCam ? mix3(atualCam, a.cam, kCam) : a.cam.slice();
    atualOlha = atualOlha ? mix3(atualOlha, a.olha, kCam) : a.olha.slice();
    atualNoite = mix(atualNoite, a.noite, kCam); atualChao = mix(atualChao, a.chao, kCam);
    olharAtual.x = mix(olharAtual.x, olhar.x, kCam * 0.5); olharAtual.y = mix(olharAtual.y, olhar.y, kCam * 0.5);

    // câmera: viagem entre cenas + leve paralaxe com o mouse
    // em pé: afasta a câmera conforme a tela fica mais estreita, pro K caber inteiro
    const zCel = celular ? 1.0 : 0;
    camera.position.set(atualCam[0] + olharAtual.x * 0.5, atualCam[1] - olharAtual.y * 0.35, atualCam[2] + zCel);
    olhaPara.set(atualOlha[0], atualOlha[1], atualOlha[2]); camera.lookAt(olhaPara);

    grupo.position.set(atual.p[0], atual.p[1] + Math.sin(t * 0.8) * 0.05, atual.p[2]);
    grupo.rotation.set(atual.r[0] + olharAtual.y * 0.22, atual.r[1] + Math.sin(t * 0.35) * 0.08 + olharAtual.x * 0.4, atual.r[2]);
    grupo.scale.setScalar(Math.max(0.0001, atual.s));

    const aceso = destaque >= 0 ? destaque : ativoRolagem;
    pecas.forEach((m, i) => {
      brilho[i] = mix(brilho[i], aceso === i ? 1 : 0, kCam);
      const off = atual.pecas[i];
      m.position.set(BASE[i].x + off.p[0], BASE[i].y + off.p[1], BASE[i].z + off.p[2] + brilho[i] * 0.6);
      m.rotation.set(off.r[0], off.r[1] + brilho[i] * 0.35, off.r[2]);
      m.scale.setScalar(1 + brilho[i] * 0.1);
      m.material.opacity = atual.o;
      m.material.emissive.setHex(0x3a2216).multiplyScalar(brilho[i] * 0.5);
      m.visible = atual.o > 0.02;
    });

    // sombra no chão, embaixo do K
    const s = atual.s;
    sombra.position.set(atual.p[0], atual.p[1] - 2.25 * s, atual.p[2]);
    sombra.scale.set(3.6 * s, 1.6 * s, 1);
    sombra.material.opacity = atual.o * atualChao * (1 - atualNoite * 0.4);

    // dia → noite: luz mais dramática, poeira brilhando, feixe de luz
    ceu.intensity = mix(0.35, 0.18, atualNoite);
    chave.intensity = mix(2.4, 2.9, atualNoite);
    recorte.intensity = mix(2.2, 3.6, atualNoite);
    poeiraMat.uniforms.uCor.value.copy(corDia).lerp(corNoite, atualNoite);
    poeiraMat.uniforms.uAlfa.value = mix(0.15, 0.55, atualNoite);
    poeiraMat.uniforms.uTempo.value = t;
    poeiraMat.uniforms.uFoco.value = camera.position.distanceTo(grupo.position);
    feixe.material.opacity = atualNoite * 0.16;

    if (cortina && chamada) {
      const r = chamada.getBoundingClientRect(), vh = window.innerHeight;
      cortina.style.opacity = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.65))).toFixed(3);
    }
    renderer.render(cena, camera);
  }
  quadro();
  requestAnimationFrame(() => html.classList.add('com-3d'));
}
