import * as THREE from "three";
import { api } from "../services/api.js";

// 1. VARIÁVEIS GLOBAIS
let cena, camera, renderizador;
let raycaster, mouse;
let pecaSelecionada = null;
let planoArrasto;
const listaInterativos = [];
const listaPinos = [];

// 2. CONFIGURAÇÕES
const RAIO_PINO = 1.3;
const ALTURA_PINO = 8.7;
const TAMANHO_LOJA = 3.2;
const TAMANHO_ARRASTO = 3.2;
const ESPESSURA_PECA = 2;
const TAMANHO_CHANFRO = 0.3;
const ALTURA_ELEVACAO = 8.0;
const DISTANCIA_IMA = 6.0;

const CONFIG_LOJA = [
  { x: -18.5, y: 1.0, z: -14, tipo: "square", idTipo: 2, cor: 0x5a2a81 }, 
  { x: -15, y: 1.0, z: 0, tipo: "circle", idTipo: 1, cor: 0x9a2ec3 },
  { x: -12.2, y: 1.0, z: 11, tipo: "hexagon", idTipo: 3, cor: 0x001bb7 },
];

const POSICOES_PINOS = [{ x: 3, z: 0 }, { x: 17, z: 0 }];

init();
animar();

// 3. SETUP E AUXILIARES
function criarFundoGradiente() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradiente = ctx.createLinearGradient(0, 512, 512, 0);
  gradiente.addColorStop(0, "#050008");
  gradiente.addColorStop(1, "#1a0f3b");
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(canvas);
}

function init() {
  cena = new THREE.Scene();
  cena.background = criarFundoGradiente();

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 30, 35);
  camera.lookAt(0, 0, 0);

  renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderizador.setSize(window.innerWidth, window.innerHeight);
  renderizador.shadowMap.enabled = false;
  
  const canvasStyle = renderizador.domElement.style;
  canvasStyle.position = "absolute";
  canvasStyle.top = "0"; canvasStyle.left = "0"; canvasStyle.zIndex = "-1";
  document.body.appendChild(renderizador.domElement);

  const luzAmbiente = new THREE.AmbientLight(0xffffff, 2.0);
  cena.add(luzAmbiente);
  const luzHemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  luzHemi.position.set(0, 20, 0);
  cena.add(luzHemi);
  const luzFrontal = new THREE.DirectionalLight(0xffffff, 0.5);
  luzFrontal.position.set(0, 10, 20);
  cena.add(luzFrontal);

  planoArrasto = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ visible: false }));
  planoArrasto.rotation.x = -Math.PI / 2;
  planoArrasto.position.y = ALTURA_ELEVACAO;
  cena.add(planoArrasto);

  const chao = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.1, side: THREE.DoubleSide }));
  chao.rotation.x = -Math.PI / 2;
  cena.add(chao);

  criarPino(POSICOES_PINOS[0].x, POSICOES_PINOS[0].z, 0);
  criarPino(POSICOES_PINOS[1].x, POSICOES_PINOS[1].z, 1);
  CONFIG_LOJA.forEach((cfg) => criarPecaLoja(cfg));

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  window.addEventListener("resize", aoRedimensionar);
  document.addEventListener("mousedown", aoClicar);
  document.addEventListener("mousemove", aoMoverMouse);
  document.addEventListener("mouseup", aoSoltarMouse);

  window.limparPino = limparPino;
  window.finalizarCompra = finalizarCompra;
  window.fecharModal = fecharModal;
}

// 4. CRIAÇÃO DE OBJETOS
function criarPino(x, z, id) {
  const grupo = new THREE.Group();
  const materialPino = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
  const materialBorda = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true });

  const geoBase = new THREE.CylinderGeometry(4.0, 4.0, 1.2, 64);
  const base = new THREE.Mesh(geoBase, materialPino);
  base.position.y = 0.4;
  base.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoBase, 30), materialBorda));
  grupo.add(base);

  const geoHaste = new THREE.CylinderGeometry(RAIO_PINO, RAIO_PINO, ALTURA_PINO, 64);
  const haste = new THREE.Mesh(geoHaste, materialPino);
  haste.position.y = ALTURA_PINO / 2 + 0.4;
  haste.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoHaste, 30), materialBorda));
  grupo.add(haste);

  const geoJuncao = new THREE.CircleGeometry(RAIO_PINO, 64);
  const anelJuncao = new THREE.LineSegments(new THREE.EdgesGeometry(geoJuncao), materialBorda);
  anelJuncao.rotation.x = -Math.PI / 2; anelJuncao.position.y = 1.01;
  grupo.add(anelJuncao);

  grupo.position.set(x, 0, z);
  cena.add(grupo);
  listaPinos.push({ id: id, posicao: new THREE.Vector3(x, 0, z), itens: [] });
}

function criarMalhaPeca(tipo, tamanho, hexCor) {
  const forma = new THREE.Shape();
  const raioFuro = RAIO_PINO + 0.25;

  if (tipo === "square") {
    forma.moveTo(-tamanho, -tamanho); forma.lineTo(tamanho, -tamanho);
    forma.lineTo(tamanho, tamanho); forma.lineTo(-tamanho, tamanho); forma.closePath();
  } else if (tipo === "circle") {
    forma.absarc(0, 0, tamanho, 0, Math.PI * 2);
  } else if (tipo === "hexagon") {
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const x = Math.cos(ang) * tamanho; const y = Math.sin(ang) * tamanho;
      i === 0 ? forma.moveTo(x, y) : forma.lineTo(x, y);
    }
    forma.closePath();
  }

  const furo = new THREE.Path();
  furo.absarc(0, 0, raioFuro, 0, Math.PI * 2);
  forma.holes.push(furo);

  const geometria = new THREE.ExtrudeGeometry(forma, { depth: ESPESSURA_PECA, bevelEnabled: false, curveSegments: 64 });
  geometria.center(); geometria.rotateX(Math.PI / 2); geometria.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hexCor).offsetHSL(0, -0.15, +0.2),
    roughness: 0.3, metalness: 0.05
  });

  const malha = new THREE.Mesh(geometria, material);
  malha.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometria, 1), new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.35, transparent: true })));
  return malha;
}

function criarAreaClique(tamanho) {
  return new THREE.Mesh(new THREE.CylinderGeometry(tamanho * 1.3, tamanho * 1.3, 3, 16), new THREE.MeshBasicMaterial({ visible: false }));
}

function criarPecaLoja(cfg) {
  const grupo = new THREE.Group();
  const malha = criarMalhaPeca(cfg.tipo, TAMANHO_LOJA, cfg.cor);
  grupo.add(malha);
  const areaClique = criarAreaClique(TAMANHO_LOJA);
  grupo.add(areaClique);
  listaInterativos.push(areaClique);
  grupo.position.set(cfg.x, cfg.y, cfg.z);
  grupo.rotation.x = Math.PI / 6;
  areaClique.userData = { grupoPai: grupo, ehLoja: true, tipo: cfg.tipo, idTipo: cfg.idTipo, cor: cfg.cor };
  cena.add(grupo);
}

function gerarPecaArrastavel(tipo, idTipo, posicao, cor) {
  const grupo = new THREE.Group();
  const malha = criarMalhaPeca(tipo, TAMANHO_ARRASTO, cor);
  malha.material = malha.material.clone();
  malha.material.emissive = new THREE.Color(0x222222);
  grupo.add(malha);
  const areaClique = criarAreaClique(TAMANHO_ARRASTO);
  grupo.add(areaClique);
  listaInterativos.push(areaClique);
  grupo.position.copy(posicao);
  grupo.userData = { pinoAtual: null, tipo: tipo, idTipo: idTipo };
  areaClique.userData = { grupoPai: grupo, ehArrastavel: true };
  cena.add(grupo);
  return grupo;
}

// 5. INTERAÇÃO E LÓGICA
function aoClicar(e) {
  e.preventDefault();
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersecoes = raycaster.intersectObjects(listaInterativos);

  if (intersecoes.length > 0) {
    const dados = intersecoes[0].object.userData;
    if (dados.ehLoja) {
      pecaSelecionada = gerarPecaArrastavel(dados.tipo, dados.idTipo, intersecoes[0].point, dados.cor);
    } else if (dados.ehArrastavel) {
      pecaSelecionada = dados.grupoPai;
      if (pecaSelecionada.userData.pinoAtual !== null) {
        removerDaPilha(pecaSelecionada);
        raycaster.setFromCamera(mouse, camera);
        const hitPlano = raycaster.intersectObject(planoArrasto);
        if (hitPlano.length > 0) pecaSelecionada.position.set(hitPlano[0].point.x, ALTURA_ELEVACAO, hitPlano[0].point.z);
      }
    }
    if (pecaSelecionada) pecaSelecionada.rotation.set(0, 0, 0);
  }
}

function aoMoverMouse(e) {
  if (!pecaSelecionada) return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersecoes = raycaster.intersectObject(planoArrasto);
  if (intersecoes.length > 0) pecaSelecionada.position.set(intersecoes[0].point.x, ALTURA_ELEVACAO, intersecoes[0].point.z);
}

function aoSoltarMouse() {
  if (!pecaSelecionada) return;
  let encaixou = false;
  for (let pino of listaPinos) {
    if (Math.hypot(pecaSelecionada.position.x - pino.posicao.x, pecaSelecionada.position.z - pino.posicao.z) < DISTANCIA_IMA) {
      encaixou = adicionarAoPino(pecaSelecionada, pino);
      if (encaixou) break;
    }
  }
  if (!encaixou) deletarObjeto(pecaSelecionada);
  pecaSelecionada = null;
}

// VALIDAÇÃO DE PEÇAS
function adicionarAoPino(grupo, pino) {
  if (pino.itens.length >= 3) return false;

  const tipoDaPecaNova = grupo.userData.idTipo;
  const jaExisteNoPino = pino.itens.some(item => item.userData.idTipo === tipoDaPecaNova);

  if (jaExisteNoPino) {
    mostrarModal("Peça repetida! Você só pode colocar uma peça de cada tipo por pino.", "erro");
    return false;
  }

  const alturaUnitaria = ESPESSURA_PECA + TAMANHO_CHANFRO * 2;
  grupo.position.set(pino.posicao.x, 1.2 + pino.itens.length * alturaUnitaria + alturaUnitaria / 2, pino.posicao.z);
  grupo.userData.pinoAtual = pino.id;
  const malha = grupo.children.find((c) => c.isMesh);
  if (malha) malha.material.emissive.setHex(0x000000);
  pino.itens.push(grupo);
  return true;
}

function removerDaPilha(grupo) {
  const idPino = grupo.userData.pinoAtual;
  if (idPino === null) return;
  const pino = listaPinos.find((p) => p.id === idPino);
  const indice = pino.itens.indexOf(grupo);
  if (indice > -1) {
    pino.itens.splice(indice, 1);
    grupo.userData.pinoAtual = null;
    const alturaUnitaria = ESPESSURA_PECA + TAMANHO_CHANFRO * 2;
    pino.itens.forEach((item, i) => { item.position.y = 1.2 + i * alturaUnitaria + alturaUnitaria / 2; });
  }
}

function deletarObjeto(grupo) {
  cena.remove(grupo);
  const hitbox = grupo.children.find((c) => !c.material || c.material.visible === false);
  if (hitbox) listaInterativos.splice(listaInterativos.indexOf(hitbox), 1);
  grupo.traverse((filho) => { if (filho.isMesh) { filho.geometry.dispose(); filho.material.dispose(); } });
}

function limparPino(id) {
  const pino = listaPinos.find((p) => p.id === id);
  if (pino) { [...pino.itens].forEach((obj) => deletarObjeto(obj)); pino.itens = []; }
}

function mostrarModal(mensagem, tipo = "sucesso") {
  const modal = document.getElementById("modal-container");
  const tituloEl = document.getElementById("modal-titulo");
  const msgEl = document.getElementById("modal-mensagem");
  const btnEl = document.getElementById("modal-btn");
  const iconSuccess = document.getElementById("icon-success");
  const iconError = document.getElementById("icon-error");

  if (!modal) return;
  msgEl.textContent = mensagem;

  if (tipo === "erro") {
    tituloEl.textContent = "Atenção"; tituloEl.style.color = "#dc3545";
    iconSuccess.style.display = "none"; iconError.style.display = "block";
    btnEl.classList.add("btn-erro"); btnEl.textContent = "Corrigir";
  } else {
    tituloEl.textContent = "Sucesso!"; tituloEl.style.color = "#333";
    iconSuccess.style.display = "block"; iconError.style.display = "none";
    btnEl.classList.remove("btn-erro"); btnEl.textContent = "Continuar";
  }
  modal.classList.remove("fechado");
}

function fecharModal() { document.getElementById("modal-container").classList.add("fechado"); }

function aoRedimensionar() {
  camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  renderizador.setSize(window.innerWidth, window.innerHeight);
}

function animar() { requestAnimationFrame(animar); renderizador.render(cena, camera); }

// Logout Global
window.fazerLogout = function() {
    localStorage.removeItem('currentClient');
    window.location.href = '../login/login.html';
};

// ============================================================================
// 11. LÓGICA DE FINALIZAR COMPRA (CONECTADA À API)
// ============================================================================

function getLoggedClient() {
  const saved = localStorage.getItem("loggedClient");
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

async function finalizarCompra() {
  let vetorResultado = [0, 0, 0, 0, 0, 0];

  // Pino 1 (índices 0-2)
  listaPinos[0].itens.forEach((item, i) => {
    if (i < 3) vetorResultado[i] = item.userData.idTipo;
  });

  // Pino 2 (índices 3-5)
  listaPinos[1].itens.forEach((item, i) => {
    if (i < 3) vetorResultado[i + 3] = item.userData.idTipo;
  });

  // Validação: Pino 1 deve estar completo
  if (vetorResultado[0] === 0 || vetorResultado[1] === 0 || vetorResultado[2] === 0) {
    mostrarModal('❌ Erro!<br><br>O primeiro pino deve estar completamente preenchido com 3 peças.');
    return;
  }

  // Pegar o cliente logado
  const clientData = localStorage.getItem('currentClient');
  if (!clientData) {
    mostrarModal('❌ Erro!<br><br>Você precisa estar logado para fazer um pedido.<br><br><a href="../login/login.html" style="color: #a970ff;">Clique aqui para fazer login</a>');
    return;
  }

  const client = JSON.parse(clientData);

  // Preparar dados do pedido conforme o modelo Order
  const orderData = {
    pin1Pos1: vetorResultado[0],
    pin1Pos2: vetorResultado[1],
    pin1Pos3: vetorResultado[2],
    pin2Pos1: vetorResultado[3],
    pin2Pos2: vetorResultado[4],
    pin2Pos3: vetorResultado[5],
    clientId: client.id,
    status: 1 // 1 = Waiting (StatusType.Waiting)
  };

  console.log("Enviando pedido:", orderData);

  try {
    // Mostrar mensagem de carregamento
    mostrarModal('⏳ Processando seu pedido...');
    
    // Chamar a API
    const response = await api.createOrder(orderData);
    
    console.log("Pedido criado com sucesso:", response);
    
    // Limpar os pinos após sucesso
    limparPino(0);
    limparPino(1);
    
    // Mostrar mensagem de sucesso
    mostrarModal(`
      ✅ Pedido realizado com sucesso!<br><br>
      <strong>Número do Pedido:</strong> #${response.id}<br>
      <strong>Status:</strong> Aguardando produção<br><br>
      Você pode acompanhar seu pedido na área de encomendas.
    `);
    
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    mostrarModal(`❌ Erro ao criar pedido!<br><br>${error.message}`);
  }

  return vetorResultado;
}
