import { api } from '../../services/api.js';

document.addEventListener('DOMContentLoaded', () => {

    const mainLoginBtn = document.getElementById('main-login-btn');
    const mainSignupBtn = document.getElementById('main-signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutBtn = document.getElementById('logout-btn');

    // Elementos de logo
    const mainLogo = document.getElementById('main-logo');
    const dashboardLogo = document.getElementById('dashboard-logo');

    // DEFINIR A FUNÇÃO toggleScreen ANTES DE USAR
    const toggleScreen = (screenId, show) => {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.toggle('visible', show);
        }
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

    // AGORA SIM verificar se há usuário logado
    const currentClient = localStorage.getItem('currentClient');
    if (currentClient) {
        const client = JSON.parse(currentClient);
        if (userEmailDisplay) {
            userEmailDisplay.textContent = client.name;
        }
        toggleScreen('dashboard-screen', true);
    }

    const clearFormErrors = (form) => {
        form.querySelectorAll('.input-error, .form-error-message').forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    };

    const showInputError = (input, message) => {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    };

    const showFormError = (form, message) => {
        clearFormErrors(form);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.innerHTML = `<p>${message}</p>`;
        form.insertBefore(errorDiv, form.firstChild);
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 6;
    const validateName = (name) => name.trim().length >= 3;

    // Event listeners para botões principais
    if (mainLoginBtn) {
        mainLoginBtn.addEventListener('click', () => {
            console.log('Botão Login clicado');
            toggleScreen('login-screen', true);
        });
    }

    if (mainSignupBtn) {
        mainSignupBtn.addEventListener('click', () => {
            console.log('Botão Cadastro clicado');
            toggleScreen('signup-screen', true);
        });
    }

    document.body.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-action]');
        if (trigger?.closest('.form-overlay')) {
            event.preventDefault();
            const { action, targetId, hideId, showId } = trigger.dataset;

            if (action === 'hide') {
                toggleScreen(targetId, false);
            } else if (action === 'switch') {
                switchScreens(hideId, showId);
            }
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearFormErrors(loginForm);

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            let hasError = false;

            if (!validateEmail(emailInput.value)) {
                showInputError(emailInput, 'Email inválido');
                hasError = true;
            }

            if (!validatePassword(passwordInput.value)) {
                showInputError(passwordInput, 'Senha deve ter no mínimo 6 caracteres');
                hasError = true;
            }

            if (hasError) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Entrando...';

            try {
                const client = await api.loginClient(
                    emailInput.value.trim(),
                    passwordInput.value
                );

                localStorage.setItem('currentClient', JSON.stringify(client));

                if (userEmailDisplay) {
                    userEmailDisplay.textContent = client.name;
                }

                toggleScreen('login-screen', false);
                setTimeout(() => {
                    toggleScreen('dashboard-screen', true);
                }, 300);

                loginForm.reset();
                clearFormErrors(loginForm);
            } catch (error) {
                showFormError(loginForm, error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearFormErrors(signupForm);

            const fullnameInput = document.getElementById('fullname');
            const emailInput = document.getElementById('signup-email');
            const passwordInput = document.getElementById('signup-password');
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            let hasError = false;

            if (!validateName(fullnameInput.value)) {
                showInputError(fullnameInput, 'Nome deve ter no mínimo 3 caracteres');
                hasError = true;
            }

            if (!validateEmail(emailInput.value)) {
                showInputError(emailInput, 'Email inválido');
                hasError = true;
            }

            if (!validatePassword(passwordInput.value)) {
                showInputError(passwordInput, 'Senha deve ter no mínimo 6 caracteres');
                hasError = true;
            }

            if (hasError) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Criando conta...';

            try {
                const clientData = {
                    name: fullnameInput.value.trim(),
                    email: emailInput.value.trim(),
                    password: passwordInput.value,
                    active: true
                };

                await api.registerClient(clientData);
                switchScreens('signup-screen', 'success-notification');
                signupForm.reset();
                clearFormErrors(signupForm);
            } catch (error) {
                showFormError(signupForm, error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('currentClient');
            toggleScreen('dashboard-screen', false);
        });
    }

    // ========================================================================
    // THEME TOGGLE FUNCTIONALITY COM TROCA DE LOGO
    // ========================================================================

    const themeToggle = document.getElementById('theme-toggle');

    // Função para atualizar logos baseado no tema
    function updateLogos(isLightMode) {
        const logoSrc = isLightMode 
            ? '../../assets/images/logo-light.png' 
            : '../../assets/images/logo-dark.png';
        
        if (mainLogo) {
            mainLogo.style.opacity = '0';
            setTimeout(() => {
                mainLogo.src = logoSrc;
                mainLogo.style.transition = 'opacity 0.5s ease';
                mainLogo.style.opacity = '1';
            }, 100);
        }
        
        if (dashboardLogo) {
            dashboardLogo.style.opacity = '0';
            setTimeout(() => {
                dashboardLogo.src = logoSrc;
                dashboardLogo.style.transition = 'opacity 0.5s ease';
                dashboardLogo.style.opacity = '1';
            }, 100);
        }
    }

    // Verificar preferência salva no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateLogos(true);
    } else {
        updateLogos(false);
    }

    // Toggle theme ao clicar no botão
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Theme toggle clicado!');
            
            // Adicionar classe de transição suave
            document.body.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';

            document.body.classList.toggle('light-mode');

            // Salvar preferência
            const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);

            // Atualizar logos
            updateLogos(currentTheme === 'light');

            // Animação do botão mais dramática
            themeToggle.style.transform = 'scale(0.8) rotate(360deg)';
            themeToggle.style.opacity = '0.5';

            setTimeout(() => {
                themeToggle.style.transform = '';
                themeToggle.style.opacity = '';
            }, 400);

            // Efeito de ondulação no fundo
            createRippleEffect();
        });
    } else {
        console.error('Botão theme-toggle não encontrado!');
    }

    // Criar efeito de ondulação ao trocar tema
    function createRippleEffect() {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: ${document.body.classList.contains('light-mode') 
                ? 'radial-gradient(circle, rgba(111, 66, 193, 0.3) 0%, transparent 70%)' 
                : 'radial-gradient(circle, rgba(91, 33, 182, 0.3) 0%, transparent 70%)'
            };
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9998;
            transition: width 1s ease-out, height 1s ease-out, opacity 0.8s ease-out;
            opacity: 0.8;
        `;

        document.body.appendChild(ripple);

        // Animar expansão
        setTimeout(() => {
            ripple.style.width = '300vw';
            ripple.style.height = '300vw';
            ripple.style.opacity = '0';
        }, 10);

        // Remover após animação
        setTimeout(() => {
            if (document.body.contains(ripple)) {
                document.body.removeChild(ripple);
            }
        }, 1200);
    }

});