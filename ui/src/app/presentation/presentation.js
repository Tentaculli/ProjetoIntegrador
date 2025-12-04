/* ==========================================================================
   TENTACULLI LOGIC - PRESENTATION
   ========================================================================== */

// 1. DADOS DA EQUIPE (6 Pessoas)
const teamData = [
    {
        name: "Angelina Chaves",
        role: "Back-end & Full Stack",
        img: "../../assets/images/team/angelina-chaves.jpg",
        bio: "Orquestrando o código e garantindo que tudo funcione perfeitamente.",
        github: "https://www.github.com/angelinahc/",
        linkedin: "https://www.linkedin.com/in/angelina-chaves/"
    },
    {
        name: "Carlos Matozo",
        role: "Frontend",
        img: "../../assets/images/team/carlos-matozo.jpg",
        bio: "Transformando café em interfaces incríveis com React e CSS.",
        github: "https://www.github.com/cebolits/",
        linkedin: "https://www.linkedin.com/in/carlos-henrique-matozo-aa0276259/"
    },
    {
        name: "Luan Ziscycki",
        role: "Comunicação Web-CLP",
        img: "../../assets/images/team/luan-ziscycki.jpg",
        bio: "Transformando café em interfaces incríveis com React e CSS.",
        github: "https://github.com/LuanZiscycki",
        linkedin: "https://www.linkedin.com/in/luanziscycki/"
    },
    {
        name: "Lucas Moreira",
        role: "Frontend",
        img: "../../assets/images/team/lucas-igor.jpg",
        bio: "Transformando café em interfaces incríveis com React e CSS.",
        github: "https://github.com/Lucaxcm/",
        linkedin: "https://www.linkedin.com/in/lucas-moreira-381aa5254/"
    },
    {
        name: "Maria Bianchini",
        role: "CLP",
        img: "../../assets/images/team/maria-bianchini.jpg",
        bio: "Transformando café em interfaces incríveis com React e CSS.",
        github: "#",
        linkedin: "https://www.linkedin.com/in/maria-eduarda-bianchini-a95b35383/"
    },
    {
        name: "Maria Lemes",
        role: "Automação do robô",
        img: "../../assets/images/team/carlos-matozo.jpg",
        bio: "Transformando café em interfaces incríveis com React e CSS.",
        github: "https://www.github.com/cebolits/",
        linkedin: "https://www.linkedin.com/in/maria-lemes/"
    },
    {
        name: "Victor Fidelis",
        role: "Comunicação robô-CLP",
        img: "../../assets/images/team/victor-fidelis.jpg",
        bio: "Transformando café em interfaces incríveis com React e CSS.",
        github: "#",
        linkedin: "https://www.linkedin.com/in/victor-fidelis-117683350/"
    },
];

// DADOS DAS FERRAMENTAS
const techData = {
    mysql: {
        name: "MySQL",
        description: "Utilizamos o MySQL como banco de dados relacional para armazenar todos os pedidos dos clientes, histórico de encomendas e configurações das peças. A estrutura foi otimizada para consultas rápidas e integridade dos dados.",
        img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    vscode: {
        name: "VS Code",
        description: "Nossa IDE principal para desenvolvimento. Utilizamos extensões como Prettier, ESLint e Live Server para manter o código limpo e produtivo. Toda a interface web e lógica foram desenvolvidas aqui.",
        img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    nodered: {
        name: "Node-RED",
        description: "Implementamos o Node-RED como middleware entre a API e o CLP. Ele recebe os pedidos via HTTP, processa os dados e envia comandos OPC UA para o controlador industrial.",
        img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    csharp: {
        name: "C# / .NET",
        description: "A API REST foi construída em C# com ASP.NET Core. Implementamos autenticação JWT, validação de dados e endpoints seguros para gerenciar pedidos e usuários.",
        img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
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

// 4. FUNCIONALIDADE DE ZOOM NAS IMAGENS (COM ANIMAÇÕES)
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

// 5. MODAL DE FERRAMENTAS
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

// 6. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    typeWriter("Bem-vindo ao Projeto Tentaculli", "typing-title");
    renderTeam();
    setupImageZoom();
    setupTechModal();
    setupMemberModal();
});

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