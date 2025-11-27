import * as THREE from 'three';

// ============================================================================
// 1. VARIÁVEIS GLOBAIS
// ============================================================================
let scene, camera, renderer;
let raycaster, mouse;
let selectedGroup = null;
let dragPlane;
let dragOffset = new THREE.Vector3();

const hitboxes = []; 
const pins = [];

// ============================================================================
// 2. CONFIGURAÇÕES (CONSTANTES)
// ============================================================================

const PIN_RADIUS = 1.3;
const PIN_HEIGHT = 8.7;

const SOURCE_SIZE = 2.8;
const DRAGGABLE_SIZE = 2.8;
const PIECE_THICKNESS = 1.8;
const BEVEL_SIZE = 0.25;

const LIFT_HEIGHT = 8.0;
const SNAP_THRESHOLD = 6.0;

// --- AQUI ESTÁ A MUDANÇA DE LÓGICA ---
// typeId: 1 = Círculo
// typeId: 2 = Quadrado
// typeId: 3 = Hexágono
const SOURCE_POSITIONS = [
    { x: -18, y: 1.0, z: -14, type: 'square',  typeId: 2, color: 0x4F32B8 }, // Quadrado agora é 2
    { x: -15, y: 1.0, z: 0,   type: 'circle',  typeId: 1, color: 0x9A2EC3 }, // Círculo agora é 1
    { x: -12.5, y: 1.0, z: 11, type: 'hexagon', typeId: 3, color: 0x001BB7 }  // Hexágono continua 3
];

const PIN_POSITIONS = [
    { x: 3, z: 0 }, 
    { x: 17, z: 0 } 
];

init();
animate();

// ============================================================================
// 3. INICIALIZAÇÃO (SETUP)
// ============================================================================
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF); 

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 35);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // SOMBRAS DESATIVADAS
    renderer.shadowMap.enabled = false; 
    
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1';
    document.body.appendChild(renderer.domElement);

    // ILUMINAÇÃO "FLAT"
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); 
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 0.5);
    frontLight.position.set(0, 10, 20);
    frontLight.castShadow = false; 
    scene.add(frontLight);

    // PLANO DE ARRASTE
    dragPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    dragPlane.rotation.x = -Math.PI / 2;
    dragPlane.position.y = LIFT_HEIGHT;
    scene.add(dragPlane);

    // CHÃO VISUAL
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshBasicMaterial({ 
            color: 0x444444, 
            transparent: true, 
            opacity: 0.1, 
            side: THREE.DoubleSide
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    createPin(PIN_POSITIONS[0].x, PIN_POSITIONS[0].z, 0);
    createPin(PIN_POSITIONS[1].x, PIN_POSITIONS[1].z, 1);

    SOURCE_POSITIONS.forEach(config => {
        createSourcePiece(config);
    });

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onResize);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    window.limparPino = limparPino;
    window.finalizarCompra = finalizarCompra;
}

// ============================================================================
// 4. CRIAÇÃO DE OBJETOS
// ============================================================================

function createPin(x, z, id) {
    const group = new THREE.Group();

    const pinMat = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        metalness: 0.4,
        roughness: 0.25,
    });

    // BASE (como antes)
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(4.0, 4.0, 1.2, 100),
        pinMat
    );
    base.position.y = 0.4;
    group.add(base);

    // EIXO (cilindro principal)
    const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(PIN_RADIUS, PIN_RADIUS, PIN_HEIGHT, 100),
        pinMat
    );
    shaft.position.y = PIN_HEIGHT / 2 + 0.4;
    group.add(shaft);

    // FINAL
    group.position.set(x, 0, z);
    scene.add(group);

    pins.push({
        id: id,
        position: new THREE.Vector3(x, 0, z),
        group: group,
        items: []
    });
}

function createWasherMesh(type, size, colorHex) {
    const shape = new THREE.Shape();
    const holeRadius = PIN_RADIUS + 0.25;

    if (type === 'square') {
        shape.moveTo(-size, -size);
        shape.lineTo(size, -size);
        shape.lineTo(size, size);
        shape.lineTo(-size, size);
        shape.lineTo(-size, -size);
    } else if (type === 'circle') {
        shape.absarc(0, 0, size, 0, Math.PI * 2);
    } else if (type === 'hexagon') {
        const segments = 6;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        shape.closePath();
    }

    const hole = new THREE.Path();
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2);
    shape.holes.push(hole);

    const extrudeSettings = { 
        depth: PIECE_THICKNESS,
        bevelEnabled: true,
        bevelThickness: BEVEL_SIZE * 2,
        bevelSize: BEVEL_SIZE * 2,
        bevelSegments: 12,
        curveSegments: 64
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    geo.rotateX(Math.PI / 2);
    geo.computeVertexNormals(true);

    const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: 0.3, 
        roughness: 0.2,
        flatShading: false
    });

    return new THREE.Mesh(geo, mat);
}

function createHitbox(size) {
    return new THREE.Mesh(
        new THREE.CylinderGeometry(size * 1.3, size * 1.3, 3, 16),
        new THREE.MeshBasicMaterial({ visible: false })
    );
}

function createSourcePiece(config) {
    const group = new THREE.Group();
    const mesh = createWasherMesh(config.type, SOURCE_SIZE, config.color);
    group.add(mesh);

    const hitbox = createHitbox(SOURCE_SIZE);
    group.add(hitbox);
    hitboxes.push(hitbox);

    group.position.set(config.x, config.y, config.z);
    group.rotation.x = Math.PI / 6;

    hitbox.userData = { 
        parentGroup: group, 
        isSource: true, 
        type: config.type, 
        typeId: config.typeId, // ID correto passado pela config
        color: config.color 
    };
    scene.add(group);
}

function spawnDraggable(type, typeId, position, color) {
    const group = new THREE.Group();
    const mesh = createWasherMesh(type, DRAGGABLE_SIZE, color);
    
    mesh.material = mesh.material.clone();
    mesh.material.emissive = new THREE.Color(0x222222); 

    group.add(mesh);

    const hitbox = createHitbox(DRAGGABLE_SIZE);
    group.add(hitbox);
    hitboxes.push(hitbox);

    group.position.copy(position);
    
    group.userData = { 
        pinnedTo: null,
        type: type,
        typeId: typeId // ID preservado na peça criada
    };

    hitbox.userData = { parentGroup: group, isDraggable: true };
    scene.add(group);
    return group;
}

// ============================================================================
// 5. LÓGICA DE INTERAÇÃO (MOUSE)
// ============================================================================

function onMouseDown(e) {
    e.preventDefault();
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hitboxes);

    if (intersects.length > 0) {
        const hitData = intersects[0].object.userData;

        if (hitData.isSource) {
            const floorPoint = intersects[0].point;
            selectedGroup = spawnDraggable(hitData.type, hitData.typeId, floorPoint, hitData.color);

        } else if (hitData.isDraggable) {
            selectedGroup = hitData.parentGroup;

            if (selectedGroup.userData.pinnedTo !== null) {
                removeStack(selectedGroup);
            }
        }

        if (selectedGroup) {
            selectedGroup.rotation.set(0, 0, 0);
        }
    }
}

function onMouseMove(e) {
    if (!selectedGroup) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(dragPlane);

    if (intersects.length > 0) {
        const p = intersects[0].point;
        selectedGroup.position.set(p.x, LIFT_HEIGHT, p.z);
    }
}

function onMouseUp() {
    if (!selectedGroup) return;

    let droppedOnPin = false;

    for (let pin of pins) {
        const dist = Math.hypot(
            selectedGroup.position.x - pin.position.x,
            selectedGroup.position.z - pin.position.z
        );

        if (dist < SNAP_THRESHOLD) {
            droppedOnPin = addToPin(selectedGroup, pin);
            if (droppedOnPin) break;
        }
    }

    if (!droppedOnPin) deleteObject(selectedGroup);
    selectedGroup = null;
}

// ============================================================================
// 6. LÓGICA DOS PINOS
// ============================================================================

function addToPin(group, pin) {
    if (pin.items.length >= 3) return false;

    const index = pin.items.length;
    const singlePieceHeight = PIECE_THICKNESS + (BEVEL_SIZE * 2);

    const BASE_OFFSET = 1.2; // ajuste fino
    const stackY = BASE_OFFSET + (index * singlePieceHeight) + (singlePieceHeight / 2);

    group.position.set(pin.position.x, stackY, pin.position.z);
    group.userData.pinnedTo = pin.id;

    const mesh = group.children.find(c => c.isMesh);
    if (mesh) mesh.material.emissive.setHex(0x000000);

    pin.items.push(group);
    return true;
}

function removeStack(group) {
    const pinId = group.userData.pinnedTo;
    if (pinId === null) return;

    const pin = pins.find(p => p.id === pinId);
    const index = pin.items.indexOf(group);

    if (index > -1) {
        pin.items.splice(index, 1);
        group.userData.pinnedTo = null;

        const singlePieceHeight = PIECE_THICKNESS + (BEVEL_SIZE * 2);

        pin.items.forEach((item, i) => {
            const BASE_OFFSET = 1.2;
            item.position.y = BASE_OFFSET + (i * singlePieceHeight) + (singlePieceHeight / 2);

        });
    }
}

function deleteObject(group) {
    scene.remove(group);

    const hb = group.children.find(c => !c.material || c.material.visible === false);
    if (hb) {
        const idx = hitboxes.indexOf(hb);
        if (idx > -1) hitboxes.splice(idx, 1);
    }

    group.traverse(child => {
        if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
        }
    });
}

function limparPino(id) {
    const pin = pins.find(p => p.id === id);
    if (pin) {
        [...pin.items].forEach(obj => deleteObject(obj));
        pin.items = [];
    }
}

// ============================================================================
// 7. FINALIZAÇÃO DA COMPRA (GERAÇÃO DO VETOR)
// ============================================================================

function finalizarCompra() {
    // Vetor inicial zerado
    let vetorResultado = [0, 0, 0, 0, 0, 0];

    // Pino 1 (Índices 0, 1, 2)
    const pino1 = pins[0];
    pino1.items.forEach((item, index) => {
        if (index < 3) {
            vetorResultado[index] = item.userData.typeId;
        }
    });

    // Pino 2 (Índices 3, 4, 5)
    const pino2 = pins[1];
    pino2.items.forEach((item, index) => {
        if (index < 3) {
            vetorResultado[index + 3] = item.userData.typeId;
        }
    });

    console.log("Vetor Final:", vetorResultado);
    alert(`Compra Finalizada!\nLegenda: 1=Círculo, 2=Quadrado, 3=Hexágono\nVetor: [${vetorResultado.join(', ')}]`);
    
    return vetorResultado;
}

// ============================================================================
// 8. LOOP DE ANIMAÇÃO E RESIZE
// ============================================================================

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}