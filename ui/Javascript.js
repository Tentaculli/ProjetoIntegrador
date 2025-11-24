document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de Elementos ---
    const mainLoginBtn = document.getElementById('main-login-btn');
    const mainSignupBtn = document.getElementById('main-signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
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

    // 3. Submissão de Formulário de Login (ATUALIZADO PARA USAR O BACKEND)
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro desconhecido');
            }
            
            userEmailDisplay.textContent = result.user.email;
            switchScreens('login-screen', 'dashboard-screen');
            loginForm.reset();

        } catch (error) {
            alert(`Erro no login: ${error.message}`);
        }
    });

    // 4. Submissão de Formulário de Cadastro (ATUALIZADO PARA USAR O BACKEND)
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        // Usamos os IDs dos campos de cadastro
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro desconhecido');
            }

            switchScreens('signup-screen', 'success-notification');
            signupForm.reset();

        } catch (error) {
            alert(`Erro no cadastro: ${error.message}`);
        }
    });
    
    // 5. Botão de Logout
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        toggleScreen('dashboard-screen', false);
    });

});