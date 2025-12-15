/* ==========================================================================
   TENTACULLI LOGIC - PRESENTATION
   ========================================================================== */

// 1. DADOS DA EQUIPE (6 Pessoas)
const teamData = [
    {
        name: "Angelina Chaves",
        role: "Back-end & Full-Stack",
        img: "../../assets/images/team/angelina-chaves.jpg",
        bio: "Orquestra o código e garante que tudo funcione perfeitamente.",
        github: "https://www.github.com/angelinahc/",
        linkedin: "https://www.linkedin.com/in/angelina-chaves/"
    },
    {
        name: "Carlos Matozo",
        role: "Brand design & Front-End",
        img: "../../assets/images/team/carlos-matozo.jpg",
        bio: "Alinha o design, preserva a imagem da marca e integra tudo ao front-end.",
        github: "https://www.github.com/cebolits/",
        linkedin: "https://www.linkedin.com/in/carlos-henrique-matozo-aa0276259/"
    },
    {
        name: "Luan Ziscycki",
        role: "Comunicação Web-CLP",
        img: "../../assets/images/team/luan-ziscycki.jpg",
        bio: "Conecta sistemas industriais à web, transformando dados do CLP em informação acessível e funcional.",
        github: "https://github.com/LuanZiscycki",
        linkedin: "https://www.linkedin.com/in/luanziscycki/"
    },
    {
        name: "Lucas Moreira",
        role: "Frontend",
        img: "../../assets/images/team/lucas-igor.jpg",
        bio: "Dá vida às interfaces, unindo performance, usabilidade e código bem estruturado no front-end.",
        github: "https://github.com/Lucaxcm/",
        linkedin: "https://www.linkedin.com/in/lucas-moreira-381aa5254/"
    },
    {
        name: "Maria Bianchini",
        role: "CLP",
        img: "../../assets/images/team/maria-bianchini.jpg",
        bio: "Atua na lógica e no controle do sistema, garantindo confiabilidade e precisão nos processos automatizados.",
        github: "#",
        linkedin: "https://www.linkedin.com/in/maria-eduarda-bianchini-a95b35383/"
    },
    {
        name: "Maria Lemes",
        role: "Automação do robô",
        img: "../../assets/images/team/maria-lemes.png",
        bio: "Responsável pela automação e comportamento do robô, traduzindo lógica em movimentos inteligentes.",
        github: "https://www.github.com/cebolits/",
        linkedin: "https://www.linkedin.com/in/maria-lemes/"
    },
    {
        name: "Victor Fidelis",
        role: "Comunicação robô-CLP",
        img: "../../assets/images/team/victor-fidelis.jpg",
        bio: "Integra robô e CLP, assegurando comunicação estável e sincronizada entre hardware e controle.",
        github: "#",
        linkedin: "https://www.linkedin.com/in/victor-fidelis-117683350/"
    },
];

// DADOS DAS FERRAMENTAS
const techData = {
    mysql: {
        name: "MySQL",
        description: "Utilizamos o MySQL como banco de dados relacional para armazenar todos os pedidos dos clientes, histórico de encomendas e configurações das peças. A estrutura foi otimizada para consultas rápidas e integridade dos dados.",
        img: "../../assets/images/tech/mySql.png"
    },
    vscode: {
        name: "VS Code",
        description: "Nossa IDE principal para desenvolvimento. Utilizamos extensões como Prettier, ESLint e Live Server para manter o código limpo e produtivo. Toda a interface web e lógica foram desenvolvidas aqui.",
        img: "../../assets/images/tech/vsCode.png"
    },
    nodered: {
        name: "Node-RED",
        description: "Implementamos o Node-RED como middleware entre a API e o CLP. Ele recebe os pedidos via HTTP, processa os dados e envia comandos OPC UA para o controlador industrial.",
        img: "../../assets/images/tech/node-red.jpg"
    },
    csharp: {
        name: "C# / .NET",
        description: "A API REST foi construída em C# com ASP.NET Core. Implementamos autenticação JWT, validação de dados e endpoints seguros para gerenciar pedidos e usuários.",
        img: "../../assets/images/tech/cs-dotnet.png"
    },
    omron: {
        name: "Omron Automation",
        description: "Utilizamos equipamentos Omron (braço robótico e sensores) integrados ao CLP para executar fisicamente os pedidos. A comunicação é feita via protocolos industriais padrão.",
        img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    tia: {
        name: "TIA Portal",
        description: "Programamos o CLP Siemens S7-1200 usando TIA Portal. Criamos a lógica Ladder para controlar motores, válvulas e o braço robótico baseado nos comandos recebidos do Node-RED.",
        img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
};

// DADOS DAS UCs (UNIDADES CURRICULARES)
const ucData = [
    {
        title: "Banco de Dados",
        icon: "fa-database",
        desc: "Modelagem relacional e SQL para persistência segura dos pedidos e histórico."
    },
    {
        title: "Programação de CLPs",
        icon: "fa-microchip",
        desc: "Lógica Ladder e estruturada para controle de processos industriais em tempo real."
    },
    {
        title: "Desenvolvimento Web",
        icon: "fa-laptop-code",
        desc: "Criação de interfaces responsivas e APIs RESTful para interação com o usuário."
    },
    {
        title: "Robótica Industrial",
        icon: "fa-robot",
        desc: "Cinemática e programação de manipuladores robóticos para automação física."
    },
    {
        title: "Redes Industriais",
        icon: "fa-wifi",
        desc: "Protocolos de comunicação (OPC UA, Modbus) unindo o chão de fábrica à TI."
    },
    {
        title: "Gestão de Projetos",
        icon: "fa-tasks",
        desc: "Metodologias ágeis (Scrum/Kanban) para organização e entrega do MVP."
    }
];

// 2. FUNÇÃO EFEITO DIGITAÇÃO (Typewriter)
function typeWriter(text, elementId, speed = 80) {
    const element = document.getElementById(elementId);
    let i = 0;
    element.innerHTML = "";
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// 3. RENDERIZAR CARDS COM ANIMAÇÃO
function renderTeam() {
    const grid = document.getElementById('team-grid');
    grid.innerHTML = "";

    teamData.forEach((member, index) => {
        const cardHTML = `
            <div class="member-card" style="animation-delay: ${index * 200}ms" data-member-index="${index}">
                <img src="${member.img}" alt="${member.name}" class="profile-pic">
                <div class="member-info">
                    <h3 class="member-name">${member.name}</h3>
                    <p class="member-role">${member.role}</p>
                    <p class="member-bio">${member.bio}</p>
                    <div class="social-links">
                        <a href="${member.github}" target="_blank" title="GitHub" onclick="event.stopPropagation()"><i class="fab fa-github"></i></a>
                        <a href="${member.linkedin}" target="_blank" title="LinkedIn" onclick="event.stopPropagation()"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });

    setTimeout(() => {
        const cards = document.querySelectorAll('.member-card');
        cards.forEach(card => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
            
            // Adicionar evento de clique para abrir modal
            card.addEventListener('click', function() {
                const index = this.getAttribute('data-member-index');
                openMemberModal(teamData[index]);
            });
        });
    }, 100);
}

// 4. RENDERIZAR UCs
function renderUCs() {
    const grid = document.getElementById('uc-grid');
    if (!grid) return;

    grid.innerHTML = "";

    ucData.forEach((uc, index) => {
        const ucHTML = `
            <div class="uc-card" style="animation: fadeInUp 0.5s ease forwards; animation-delay: ${index * 100}ms;">
                <div class="uc-header">
                    <div class="uc-icon"><i class="fas ${uc.icon}"></i></div>
                    <div class="uc-title">${uc.title}</div>
                </div>
                <div class="uc-desc">${uc.desc}</div>
            </div>
        `;
        grid.innerHTML += ucHTML;
    });
}

// FUNÇÃO PARA ABRIR MODAL DO MEMBRO
function openMemberModal(member) {
    const modal = document.getElementById('memberModal');
    const modalPic = document.getElementById('memberModalPic');
    const modalName = document.getElementById('memberModalName');
    const modalRole = document.getElementById('memberModalRole');
    const modalBio = document.getElementById('memberModalBio');
    const modalGithub = document.getElementById('memberGithub');
    const modalLinkedin = document.getElementById('memberLinkedin');
    
    modalPic.src = member.img;
    modalName.textContent = member.name;
    modalRole.textContent = member.role;
    modalBio.textContent = member.bio;
    modalGithub.href = member.github;
    modalLinkedin.href = member.linkedin;
    
    modal.classList.add('active');
}

// FUNÇÃO PARA FECHAR MODAL DO MEMBRO
function closeMemberModal() {
    const modal = document.getElementById('memberModal');
    const content = document.querySelector('.member-modal-content');
    
    content.style.opacity = '0';
    content.style.transform = 'scale(0.7) translateY(30px)';
    
    setTimeout(() => {
        modal.classList.remove('active');
        content.style.opacity = '';
        content.style.transform = '';
    }, 300);
}

// 5. FUNCIONALIDADE DE ZOOM NAS IMAGENS (COM ANIMAÇÕES)
function setupImageZoom() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close-modal');
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.getAttribute('data-img');
            modal.classList.add('active');
            
            // Pequeno delay para garantir que a classe 'active' seja aplicada antes da imagem
            setTimeout(() => {
                modalImg.src = imgSrc;
            }, 50);
        });
    });

    closeBtn.addEventListener('click', () => {
        closeModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        // Remove animações suavemente
        modalImg.style.opacity = '0';
        modalImg.style.transform = 'scale(0.7) translateY(30px)';
        closeBtn.style.opacity = '0';
        closeBtn.style.transform = 'rotate(-90deg) scale(0.5)';
        
        setTimeout(() => {
            modal.classList.remove('active');
            modalImg.src = ''; // Limpa a imagem
            // Reset styles
            modalImg.style.opacity = '';
            modalImg.style.transform = '';
            closeBtn.style.opacity = '';
            closeBtn.style.transform = '';
        }, 400);
    }
}

// 6. MODAL DE FERRAMENTAS
function setupTechModal() {
    const techModal = document.getElementById('techModal');
    const techModalClose = document.querySelector('.tech-modal-close');
    const techCards = document.querySelectorAll('.tech-card[data-tech]');
    const techModalTitle = document.getElementById('techModalTitle');
    const techModalImage = document.getElementById('techModalImage');
    const techModalDescription = document.getElementById('techModalDescription');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const imageModalClose = document.querySelector('.close-modal');

    // Variável para controlar se veio do modal de tech
    let voltarParaTechModal = false;

    // Abrir modal ao clicar no card
    techCards.forEach(card => {
        card.addEventListener('click', function() {
            const techKey = this.getAttribute('data-tech');
            const tech = techData[techKey];

            if (tech) {
                techModalTitle.textContent = tech.name;
                techModalImage.src = tech.img;
                techModalDescription.textContent = tech.description;
                techModal.classList.add('active');
                voltarParaTechModal = false; // Resetar flag
            }
        });
    });

    // Fechar modal de tech
    techModalClose.addEventListener('click', () => {
        closeTechModal();
    });

    techModal.addEventListener('click', (e) => {
        if (e.target === techModal) {
            closeTechModal();
        }
    });

    // Zoom na imagem do modal de tech
    const techImageWrapper = document.querySelector('.tech-modal-image-wrapper');
    techImageWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        const imgSrc = techModalImage.src;
        
        // Marcar que deve voltar para o modal de tech
        voltarParaTechModal = true;
        
        // Fechar o modal de tech primeiro
        const content = document.querySelector('.tech-modal-content');
        content.style.opacity = '0';
        content.style.transform = 'scale(0.7) translateY(30px)';
        
        setTimeout(() => {
            techModal.classList.remove('active');
            
            // Abrir o modal de zoom
            setTimeout(() => {
                imageModal.classList.add('active');
                setTimeout(() => {
                    modalImage.src = imgSrc;
                }, 50);
            }, 100);
        }, 300);
    });

    // Fechar modal de imagem (com lógica de retorno)
    function closeImageModal() {
        modalImage.style.opacity = '0';
        modalImage.style.transform = 'scale(0.7) translateY(30px)';
        imageModalClose.style.opacity = '0';
        imageModalClose.style.transform = 'rotate(-90deg) scale(0.5)';
        
        setTimeout(() => {
            imageModal.classList.remove('active');
            modalImage.src = '';
            modalImage.style.opacity = '';
            modalImage.style.transform = '';
            imageModalClose.style.opacity = '';
            imageModalClose.style.transform = '';
            
            // Se veio do modal de tech, reabrir
            if (voltarParaTechModal) {
                setTimeout(() => {
                    const content = document.querySelector('.tech-modal-content');
                    content.style.opacity = '';
                    content.style.transform = '';
                    techModal.classList.add('active');
                    voltarParaTechModal = false; // Resetar flag
                }, 300);
            }
        }, 400);
    }

    // Eventos de fechar modal de imagem
    imageModalClose.addEventListener('click', closeImageModal);
    
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });

    // ESC para fechar modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (imageModal.classList.contains('active')) {
                closeImageModal();
            } else if (techModal.classList.contains('active')) {
                closeTechModal();
            }
        }
    });

    function closeTechModal() {
        const content = document.querySelector('.tech-modal-content');
        content.style.opacity = '0';
        content.style.transform = 'scale(0.7) translateY(30px)';
        voltarParaTechModal = false; // Resetar flag ao fechar manualmente
        
        setTimeout(() => {
            techModal.classList.remove('active');
            content.style.opacity = '';
            content.style.transform = '';
        }, 300);
    }
}

// SETUP DO MODAL DE MEMBRO
function setupMemberModal() {
    const modal = document.getElementById('memberModal');
    const closeBtn = document.querySelector('.member-modal-close');
    
    closeBtn.addEventListener('click', closeMemberModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeMemberModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeMemberModal();
        }
    });
}

// 7. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    typeWriter("Bem-vindo ao Projeto Tentaculli", "typing-title");
    renderTeam();
    renderUCs();
    setupImageZoom();
    setupTechModal();
    setupMemberModal();
    setupScrollReveal();
    setupSpecialNote();
});

// 8. SCROLL REVEAL - Animações ao rolar a página
function setupScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;
        
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    };
    
    // Revelar elementos já visíveis no carregamento
    revealOnScroll();
    
    // Adicionar listener de scroll com throttle para performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(() => {
            revealOnScroll();
        });
    });
}

// 9. EASTER EGG: NOTA ESPECIAL
function setupSpecialNote() {
    const secretTrigger = document.getElementById('secretTrigger');
    const specialModal = document.getElementById('specialNoteModal');
    const closeBtn = document.querySelector('.special-note-close');
    const confettiContainer = document.getElementById('confettiContainer');

    // Abrir modal ao clicar no trigger
    secretTrigger.addEventListener('click', () => {
        specialModal.classList.add('active');
        createConfetti();
    });

    // Fechar modal
    closeBtn.addEventListener('click', closeSpecialModal);

    specialModal.addEventListener('click', (e) => {
        if (e.target === specialModal) {
            closeSpecialModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && specialModal.classList.contains('active')) {
            closeSpecialModal();
        }
    });

    function closeSpecialModal() {
        const content = document.querySelector('.special-note-content');
        content.style.opacity = '0';
        content.style.transform = 'scale(0.5) rotateY(90deg)';
        
        setTimeout(() => {
            specialModal.classList.remove('active');
            confettiContainer.innerHTML = '';
            content.style.opacity = '';
            content.style.transform = '';
        }, 400);
    }

    function createConfetti() {
        const colors = ['#6f42c1', '#a855f7', '#ec4899', '#00d4ff', '#ffd700'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                
                confettiContainer.appendChild(confetti);

                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 50);
        }
    }
}