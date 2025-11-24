import { api } from '../services/api.js';

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

    // 3. Submissão de Formulário de Login (ATUALIZADO COM API)
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        try {
            // Chama a API para fazer login
            const client = await api.loginClient(emailInput.value, passwordInput.value);
            
            // Armazena os dados do cliente no localStorage
            localStorage.setItem('currentClient', JSON.stringify(client));
            
            // Atualiza o nome do usuário no dashboard
            if (userEmailDisplay) {
                userEmailDisplay.textContent = client.name;
            }
            
            // Troca a tela de login pela tela do dashboard
            switchScreens('login-screen', 'dashboard-screen');
            
            loginForm.reset();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });

    // 4. Submissão de Formulário de Cadastro (ATUALIZADO COM API)
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const fullnameInput = document.getElementById('fullname');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        
        try {
            const clientData = {
                name: fullnameInput.value,
                email: emailInput.value,
                password: passwordInput.value,
                active: true
            };
            
            await api.registerClient(clientData);
            
            switchScreens('signup-screen', 'success-notification');
            signupForm.reset();
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    });
    
    // 5. Botão de Logout (ATUALIZADO)
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('currentClient');
        toggleScreen('dashboard-screen', false);
    });

});