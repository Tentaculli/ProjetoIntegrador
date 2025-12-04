import { api } from '../../services/api.js';

document.addEventListener('DOMContentLoaded', () => {

    const mainLoginBtn = document.getElementById('main-login-btn');
    const mainSignupBtn = document.getElementById('main-signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const userEmailDisplay = document.getElementById('user-email-display');
    const logoutBtn = document.getElementById('logout-btn');

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

    const clearFormErrors = (form) => {
        const errorMessages = form.querySelectorAll('.form-error-message, .form-success-message');
        errorMessages.forEach(msg => msg.remove());
        const inputs = form.querySelectorAll('input.error');
        inputs.forEach(input => input.classList.remove('error'));
        const inputErrors = form.querySelectorAll('.input-error');
        inputErrors.forEach(error => error.remove());
    };

    const showFieldError = (input, message) => {
        input.classList.add('error');
        const existingError = input.parentElement.querySelector('.input-error');
        if (existingError) existingError.remove();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    };

    const showFormError = (form, message) => {
        clearFormErrors(form);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        const errorText = document.createElement('p');
        errorText.textContent = message;
        errorDiv.appendChild(errorText);
        form.insertBefore(errorDiv, form.firstChild);
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 6;
    const validateName = (name) => name.trim().length >= 3;

    // CORREÇÃO: Adicionar event listeners corretos
    if (mainLoginBtn) {
        mainLoginBtn.addEventListener('click', () => {
            console.log('Botão Login clicado'); // Debug
            toggleScreen('login-screen', true);
        });
    }

    if (mainSignupBtn) {
        mainSignupBtn.addEventListener('click', () => {
            console.log('Botão Cadastro clicado'); // Debug
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

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errorMsg = input.parentElement.querySelector('.input-error');
            if (errorMsg) errorMsg.remove();
        });
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormErrors(loginForm);
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        let isValid = true;

        if (!emailInput.value.trim()) {
            showFieldError(emailInput, 'Por favor, insira seu email');
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            showFieldError(emailInput, 'Email inválido');
            isValid = false;
        }

        if (!passwordInput.value) {
            showFieldError(passwordInput, 'Por favor, insira sua senha');
            isValid = false;
        }

        if (!isValid) return;

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Entrando...';
        
        try {
            const client = await api.loginClient(emailInput.value, passwordInput.value);
            localStorage.setItem('currentClient', JSON.stringify(client));
            if (userEmailDisplay) userEmailDisplay.textContent = client.name;
            switchScreens('login-screen', 'dashboard-screen');
            loginForm.reset();
            clearFormErrors(loginForm);
        } catch (error) {
            showFormError(loginForm, error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormErrors(signupForm);
        
        const fullnameInput = document.getElementById('fullname');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        let isValid = true;

        if (!fullnameInput.value.trim()) {
            showFieldError(fullnameInput, 'Por favor, insira seu nome completo');
            isValid = false;
        } else if (!validateName(fullnameInput.value)) {
            showFieldError(fullnameInput, 'Nome deve ter pelo menos 3 caracteres');
            isValid = false;
        }

        if (!emailInput.value.trim()) {
            showFieldError(emailInput, 'Por favor, insira seu email');
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            showFieldError(emailInput, 'Email inválido');
            isValid = false;
        }

        if (!passwordInput.value) {
            showFieldError(passwordInput, 'Por favor, crie uma senha');
            isValid = false;
        } else if (!validatePassword(passwordInput.value)) {
            showFieldError(passwordInput, 'Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }

        if (!isValid) return;

        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
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
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('currentClient');
            toggleScreen('dashboard-screen', false);
        });
    }
});