import * as THREE from "three";

// ============================================================================
// 1. VARIÁVEIS GLOBAIS
// ============================================================================
// Elementos principais do Three.js
let cena, camera, renderizador;

// Ferramentas de interação (Mouse e Raios)
let raycaster, mouse;
let pecaSelecionada = null; // Guarda a peça que estamos arrastando
let planoArrasto; // Plano invisível no céu para mover a peça

// Listas de controle
const listaInterativos = []; // Objetos clicáveis (hitboxes)
const listaPinos = []; // Referência lógica dos pinos e suas pilhas

// ============================================================================
// 2. CONFIGURAÇÕES (CONSTANTES)
// ============================================================================

// Dimensões do Pino
const RAIO_PINO = 1.3;
const ALTURA_PINO = 8.7;

// Dimensões das Peças
const TAMANHO_LOJA = 3.2; // Tamanho das peças na esquerda
const TAMANHO_ARRASTO = 3.2; // Tamanho das peças sendo movidas
const ESPESSURA_PECA = 2;
const TAMANHO_CHANFRO = 0.3; // Bevel (usado no cálculo de altura)

// Comportamento
const ALTURA_ELEVACAO = 8.0; // Altura que a peça "voa" ao ser pega
const DISTANCIA_IMA = 6.0; // Distância para o pino "puxar" a peça

// Configuração da Loja (Peças Disponíveis)
// IDs: 1 = Círculo, 2 = Quadrado, 3 = Hexágono
const CONFIG_LOJA = [
  { x: -18.5, y: 1.0, z: -14, tipo: "square", idTipo: 2, cor: 0x4f32b8 },
  { x: -15, y: 1.0, z: 0, tipo: "circle", idTipo: 1, cor: 0x9a2ec3 },
  { x: -12.2, y: 1.0, z: 11, tipo: "hexagon", idTipo: 3, cor: 0x001bb7 },
];

// Posição dos Pinos no chão
const POSICOES_PINOS = [
  { x: 3, z: 0 },
  { x: 17, z: 0 },
];

// Inicia o sistema
init();
animar();

// ============================================================================
// 3. FUNÇÕES AUXILIARES (VISUAL)
// ============================================================================

// Cria um fundo gradiente leve e performático sem carregar imagens externas
function criarFundoGradiente() {
  const tamanho = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = tamanho;
  const ctx = canvas.getContext("2d");

  // Gradiente diagonal (Roxo escuro -> Quase preto)
  const gradiente = ctx.createLinearGradient(0, tamanho, tamanho, 0);
  gradiente.addColorStop(0, "#050008");
  gradiente.addColorStop(1, "#1a0f3b");

  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, tamanho, tamanho);

  const textura = new THREE.CanvasTexture(canvas);
  textura.minFilter = THREE.LinearFilter; // Suaviza a textura
  return textura;
}

// ============================================================================
// 4. INICIALIZAÇÃO (SETUP)
// ============================================================================

function init() {
  // 1. Cena e Câmara
  cena = new THREE.Scene();
  cena.background = criarFundoGradiente();

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 30, 35); // Posição elevada
  camera.lookAt(0, 0, 0); // Olhando para o centro

  // 2. Renderizador
  renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderizador.setSize(window.innerWidth, window.innerHeight);
  renderizador.shadowMap.enabled = false; // Desligado para estilo "Flat" e performance

  // Estilo CSS para fixar no fundo
  const canvasStyle = renderizador.domElement.style;
  canvasStyle.position = "absolute";
  canvasStyle.top = "0";
  canvasStyle.left = "0";
  canvasStyle.zIndex = "-1";
  document.body.appendChild(renderizador.domElement);

  // 3. Iluminação (Ambiente + Direcional)
  const luzAmbiente = new THREE.AmbientLight(0xffffff, 2.0);
  cena.add(luzAmbiente);

  const luzHemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  luzHemi.position.set(0, 20, 0);
  cena.add(luzHemi);

  const luzFrontal = new THREE.DirectionalLight(0xffffff, 0.5);
  luzFrontal.position.set(0, 10, 20);
  cena.add(luzFrontal);

  // 4. Elementos Invisíveis de Lógica
  // Plano onde o mouse "desliza" a peça
  planoArrasto = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  planoArrasto.rotation.x = -Math.PI / 2;
  planoArrasto.position.y = ALTURA_ELEVACAO;
  cena.add(planoArrasto);

  // 5. Chão Visual (Espelho escuro)
  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    })
  );
  chao.rotation.x = -Math.PI / 2;
  cena.add(chao);

  // 6. Criar Objetos do Jogo
  criarPino(POSICOES_PINOS[0].x, POSICOES_PINOS[0].z, 0);
  criarPino(POSICOES_PINOS[1].x, POSICOES_PINOS[1].z, 1);

  CONFIG_LOJA.forEach((cfg) => criarPecaLoja(cfg));

  // 7. Eventos e Ferramentas
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener("resize", aoRedimensionar);
  document.addEventListener("mousedown", aoClicar);
  document.addEventListener("mousemove", aoMoverMouse);
  document.addEventListener("mouseup", aoSoltarMouse);

  // Funções globais para botões HTML
  window.limparPino = limparPino;
  window.finalizarCompra = finalizarCompra;
}

// ============================================================================
// 5. CRIAÇÃO DE OBJETOS (GEOMETRIA)
// ============================================================================

function criarPino(x, z, id) {
  const grupo = new THREE.Group();
  const materialPino = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    metalness: 0.4,
    roughness: 0.25,
  });

  // Base do pino
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(4.0, 4.0, 1.2, 64),
    materialPino
  );
  base.position.y = 0.4;
  grupo.add(base);

  // Haste do pino
  const haste = new THREE.Mesh(
    new THREE.CylinderGeometry(RAIO_PINO, RAIO_PINO, ALTURA_PINO, 64),
    materialPino
  );
  haste.position.y = ALTURA_PINO / 2 + 0.4;
  grupo.add(haste);

  grupo.position.set(x, 0, z);
  cena.add(grupo);

  // Regista na lista lógica
  listaPinos.push({ id: id, posicao: new THREE.Vector3(x, 0, z), itens: [] });
}

function criarMalhaPeca(tipo, tamanho, hexCor) {
  // 1. Desenhar a forma 2D
  const forma = new THREE.Shape();
  const raioFuro = RAIO_PINO + 0.25;

  if (tipo === "square") {
    forma.moveTo(-tamanho, -tamanho);
    forma.lineTo(tamanho, -tamanho);
    forma.lineTo(tamanho, tamanho);
    forma.lineTo(-tamanho, tamanho);
    forma.closePath();
  } else if (tipo === "circle") {
    forma.absarc(0, 0, tamanho, 0, Math.PI * 2);
  } else if (tipo === "hexagon") {
    const seg = 6;
    for (let i = 0; i < seg; i++) {
      const ang = (i / seg) * Math.PI * 2;
      const x = Math.cos(ang) * tamanho;
      const y = Math.sin(ang) * tamanho;
      if (i === 0) forma.moveTo(x, y);
      else forma.lineTo(x, y);
    }
    forma.closePath();
  }

  // 2. Fazer o furo
  const furo = new THREE.Path();
  furo.absarc(0, 0, raioFuro, 0, Math.PI * 2);
  forma.holes.push(furo);

  // 3. Extrusão (3D)
  // bevelEnabled: false garante bordas limpas sem falhas visuais
  const configExtrusao = {
    depth: ESPESSURA_PECA,
    bevelEnabled: false,
    curveSegments: 64,
  };

  const geometria = new THREE.ExtrudeGeometry(forma, configExtrusao);
  geometria.center();
  geometria.rotateX(Math.PI / 2); // Deitar a peça
  geometria.computeVertexNormals();

  // 4. Material (Cor da peça)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hexCor).offsetHSL(0, -0.15, +0.2),
    roughness: 0.3,
    metalness: 0.05,
  });

  const malha = new THREE.Mesh(geometria, material);

  // 5. Borda (Linha preta de contorno)
  const geoBorda = new THREE.EdgesGeometry(geometria, 1);
  const matBorda = new THREE.LineBasicMaterial({
    color: 0x000000,
    opacity: 0.35,
    transparent: true,
  });
  const linhas = new THREE.LineSegments(geoBorda, matBorda);
  malha.add(linhas);

  return malha;
}

// Cria um cilindro invisível maior que a peça para facilitar o clique
function criarAreaClique(tamanho) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(tamanho * 1.3, tamanho * 1.3, 3, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
}

// Cria as peças estáticas na "Loja"
function criarPecaLoja(cfg) {
  const grupo = new THREE.Group();
  const malha = criarMalhaPeca(cfg.tipo, TAMANHO_LOJA, cfg.cor);
  grupo.add(malha);

  const areaClique = criarAreaClique(TAMANHO_LOJA);
  grupo.add(areaClique);
  listaInterativos.push(areaClique); // Adiciona à lista de raycast

  grupo.position.set(cfg.x, cfg.y, cfg.z);
  grupo.rotation.x = Math.PI / 6; // Inclina para ficar bonito

  // Dados para saber o que criar ao clicar
  areaClique.userData = {
    grupoPai: grupo,
    ehLoja: true,
    tipo: cfg.tipo,
    idTipo: cfg.idTipo,
    cor: cfg.cor,
  };
  cena.add(grupo);
}

// Cria a peça móvel quando clicamos na loja
function gerarPecaArrastavel(tipo, idTipo, posicao, cor) {
  const grupo = new THREE.Group();
  const malha = criarMalhaPeca(tipo, TAMANHO_ARRASTO, cor);

  // Clona material para brilhar ao selecionar
  malha.material = malha.material.clone();
  malha.material.emissive = new THREE.Color(0x222222);

  grupo.add(malha);

  const areaClique = criarAreaClique(TAMANHO_ARRASTO);
  grupo.add(areaClique);
  listaInterativos.push(areaClique);

  grupo.position.copy(posicao);

  // Dados de controle
  grupo.userData = { pinoAtual: null, tipo: tipo, idTipo: idTipo };
  areaClique.userData = { grupoPai: grupo, ehArrastavel: true };

  cena.add(grupo);
  return grupo;
}

// ============================================================================
// 6. INTERAÇÃO (MOUSE)
// ============================================================================

function aoClicar(e) {
  e.preventDefault();
  // Converter coordenadas do mouse
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersecoes = raycaster.intersectObjects(listaInterativos);

  if (intersecoes.length > 0) {
    const dados = intersecoes[0].object.userData;

    // Caso 1: Clicou na Loja -> Cria nova peça
    if (dados.ehLoja) {
      const pontoChao = intersecoes[0].point;
      pecaSelecionada = gerarPecaArrastavel(
        dados.tipo,
        dados.idTipo,
        pontoChao,
        dados.cor
      );

      // Caso 2: Clicou numa peça móvel -> Agarra ela
    } else if (dados.ehArrastavel) {
      pecaSelecionada = dados.grupoPai;

      // Se estava num pino, remove da pilha
      if (pecaSelecionada.userData.pinoAtual !== null) {
        removerDaPilha(pecaSelecionada);
        pecaSelecionada.userData.pinoAtual = null;

        // Tenta colocar na altura do mouse
        raycaster.setFromCamera(mouse, camera);
        const hitPlano = raycaster.intersectObject(planoArrasto);
        if (hitPlano.length > 0) {
          const p = hitPlano[0].point;
          pecaSelecionada.position.set(p.x, ALTURA_ELEVACAO, p.z);
        } else {
          pecaSelecionada.position.y = ALTURA_ELEVACAO;
        }
      }
    }

    // Reseta rotação ao pegar
    if (pecaSelecionada) pecaSelecionada.rotation.set(0, 0, 0);
  }
}

function aoMoverMouse(e) {
  if (!pecaSelecionada) return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersecoes = raycaster.intersectObject(planoArrasto);

  if (intersecoes.length > 0) {
    const p = intersecoes[0].point;
    pecaSelecionada.position.set(p.x, ALTURA_ELEVACAO, p.z);
  }
}

function aoSoltarMouse() {
  if (!pecaSelecionada) return;

  let encaixou = false;

  // Verifica proximidade com cada pino
  for (let pino of listaPinos) {
    const dist = Math.hypot(
      pecaSelecionada.position.x - pino.posicao.x,
      pecaSelecionada.position.z - pino.posicao.z
    );

    // Efeito Ímã
    if (dist < DISTANCIA_IMA) {
      encaixou = adicionarAoPino(pecaSelecionada, pino);
      if (encaixou) break;
    }
  }

  // Se não encaixou em nada, apaga a peça
  if (!encaixou) deletarObjeto(pecaSelecionada);
  pecaSelecionada = null;
}

// ============================================================================
// 7. LÓGICA DO JOGO (PILHAS)
// ============================================================================

function adicionarAoPino(grupo, pino) {
  if (pino.itens.length >= 3) return false; // Máximo 3 peças

  const indice = pino.itens.length;
  const alturaUnitaria = ESPESSURA_PECA + TAMANHO_CHANFRO * 2;
  const baseOffset = 1.2;

  // Calcula posição na pilha
  const yPilha = baseOffset + indice * alturaUnitaria + alturaUnitaria / 2;

  grupo.position.set(pino.posicao.x, yPilha, pino.posicao.z);
  grupo.userData.pinoAtual = pino.id;

  // Remove brilho de seleção
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

    // Reorganiza quem sobrou
    const alturaUnitaria = ESPESSURA_PECA + TAMANHO_CHANFRO * 2;
    pino.itens.forEach((item, i) => {
      const baseOffset = 1.2;
      item.position.y = baseOffset + i * alturaUnitaria + alturaUnitaria / 2;
    });
  }
}

function deletarObjeto(grupo) {
  cena.remove(grupo);

  // Remove da lista de cliques
  const hitbox = grupo.children.find(
    (c) => !c.material || c.material.visible === false
  );
  if (hitbox) {
    const idx = listaInterativos.indexOf(hitbox);
    if (idx > -1) listaInterativos.splice(idx, 1);
  }

  // Limpa memória
  grupo.traverse((filho) => {
    if (filho.isMesh) {
      filho.geometry.dispose();
      filho.material.dispose();
    }
  });
}

function limparPino(id) {
  const pino = listaPinos.find((p) => p.id === id);
  if (pino) {
    [...pino.itens].forEach((obj) => deletarObjeto(obj));
    pino.itens = [];
  }
}

function finalizarCompra() {
  let vetorResultado = [0, 0, 0, 0, 0, 0];

  // Pino 1 (índices 0-2)
  listaPinos[0].itens.forEach((item, i) => {
    if (i < 3) vetorResultado[i] = item.userData.idTipo;
  });

  // Pino 2 (índices 3-5)
  listaPinos[1].itens.forEach((item, i) => {
    if (i < 3) vetorResultado[i + 3] = item.userData.idTipo;
  });

  console.log("Vetor Final:", vetorResultado);

  // --- MUDANÇA AQUI ---
  // Em vez de alert(), chamamos a nossa função bonita
  // Usamos <br> para quebra de linha no HTML
  const mensagemBonita = `
    Compra Finalizada com sucesso!<br><br>
  `;
  
  mostrarModal(mensagemBonita);
  
  return vetorResultado;
}

// ============================================================================
// 8. LOOP DE ANIMAÇÃO
// ============================================================================

function aoRedimensionar() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderizador.setSize(window.innerWidth, window.innerHeight);
}

function animar() {
  requestAnimationFrame(animar);
  renderizador.render(cena, camera);
}

// ============================================================================
// 9. CONTROLE DA JANELA MODAL (NOTIFICAÇÕES)
// ============================================================================

function mostrarModal(mensagem) {
  const modal = document.getElementById("modal-container");
  const texto = document.getElementById("modal-mensagem");
  
  // VERIFICAÇÃO DE SEGURANÇA
  // Se o HTML não existir, usa o alert antigo para não dar erro
  if (!modal || !texto) {
    console.warn("HTML do modal não encontrado. Usando alert padrão.");
    alert(mensagem.replace(/<br>/g, "\n").replace(/<strong>|<\/strong>/g, ""));
    return;
  }
  
  // Se existir, segue normal
  texto.innerHTML = mensagem;
  modal.classList.remove("fechado");
}

function fecharModal() {
  const modal = document.getElementById("modal-container");
  modal.classList.add("fechado");
}

// Exportar para o HTML poder usar (se estiveres usando modules)
window.fecharModal = fecharModal;