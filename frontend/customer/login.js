
document.addEventListener('DOMContentLoaded', () => {
    const authLink = document.getElementById('auth-link');
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const authForm = document.getElementById('auth-form');
    const authSubmitButton = document.getElementById('auth-submit');
    const toggleMessage = document.getElementById('toggle-message');
    const signupFields = document.getElementById('signup-fields');
    const authTitle = document.getElementById('auth-title');
    let isSignUp = false;

    authLink.onclick = function(event) {
        event.preventDefault();
        authModal.style.display = 'block';
    };

    closeModal.onclick = function() {
        authModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == authModal) {
            authModal.style.display = 'none';
        }
    };

    document.getElementById('google-login').onclick = function() {
        window.location.href = '/auth/google';
    };

    document.getElementById('facebook-login').onclick = function() {
        window.location.href = '/auth/facebook';
    };

    document.getElementById('tiktok-login').onclick = function() {
        window.location.href = '/auth/tiktok';
    };

    document.getElementById('toggle-link').onclick = function(event) {
        event.preventDefault();
        isSignUp = !isSignUp;
        if (isSignUp) {
            authTitle.textContent = 'Sign Up';
            toggleMessage.innerHTML = 'Already have an account? <a href="#" id="toggle-link">Log In</a>';
            authSubmitButton.innerText = 'Sign Up';
            signupFields.style.display = 'block';
        } else {
            authTitle.textContent = 'Log In';
            toggleMessage.innerHTML = 'Don\'t have an account? <a href="#" id="toggle-link">Sign Up</a>';
            authSubmitButton.innerText = 'Log In';
            signupFields.style.display = 'none';
        }
    };

    authForm.onsubmit = function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const names = document.getElementById('names').value.trim();
        const email = document.getElementById('email').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();

        if (isSignUp && password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const body = { username, password };
        if (isSignUp) {
            body.names = names;
            body.email = email;
            body.phoneNumber = phoneNumber;
            body.confirmPassword = confirmPassword;
        }

        const endpoint = isSignUp ? 'http://localhost:3000/api/auth/signup' : 'http://localhost:3000/api/auth/login';

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Authentication successful');
                if (!isSignUp) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'menu.html';
                }
            } else {
                alert('Authentication failed: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    };
});
