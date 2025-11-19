document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de Elementos ---
    const mainLoginBtn = document.getElementById('main-login-btn');
    const mainSignupBtn = document.getElementById('main-signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    // Novos elementos do dashboard
    const dashboardScreen = document.getElementById('dashboard-screen');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Funções Helper ---
    const toggleScreen = (screenId, show) => {
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.toggle('visible', show);
    };

    const switchScreens = (hideId, showId) => {
        const screenToHide = document.getElementById(hideId);
        if (screenToHide?.classList.contains('visible')) {
            toggleScreen(hideId, false);
            setTimeout(() => toggleScreen(showId, true), 300);
        } else {
            toggleScreen(showId, true);
        }
    };

    // --- Event Listeners ---

    // 1. Botões da Tela Principal
    mainLoginBtn.addEventListener('click', () => toggleScreen('login-screen', true));
    mainSignupBtn.addEventListener('click', () => toggleScreen('signup-screen', true));

    // 2. Interações Dinâmicas (Voltar, Trocar entre telas)
    document.body.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-action]');
        if (trigger?.closest('.form-overlay')) {
            event.preventDefault();
            const { action, targetId, hideId, showId } = trigger.dataset;
            if (action === 'hide') toggleScreen(targetId, false);
            else if (action === 'switch') switchScreens(hideId, showId);
        }
    });

    // 3. Submissão de Formulário de Login (ATUALIZADO)
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const emailInput = document.getElementById('email');
        
        // Atualiza o nome do usuário no dashboard
        if (userEmailDisplay && emailInput) {
            userEmailDisplay.textContent = emailInput.value;
        }
        
        // Troca a tela de login pela tela do dashboard
        switchScreens('login-screen', 'dashboard-screen');
        
        // Limpa o formulário para a próxima vez
        loginForm.reset();
    });

    // 4. Submissão de Formulário de Cadastro
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        switchScreens('signup-screen', 'success-notification');
        signupForm.reset();
    });
    
    // 5. Botão de Logout (NOVO)
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        toggleScreen('dashboard-screen', false);
    });

});