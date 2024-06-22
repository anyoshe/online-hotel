document.addEventListener('DOMContentLoaded', () => {
    const signupLink = document.getElementById('signup-link');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');

    signupLink.onclick = function(event) {
        event.preventDefault();
        loginModal.style.display = 'block';
    };

    closeModal.onclick = function() {
        loginModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
    };

    document.getElementById('google-login').onclick = function() {
        window.location.href = '/auth/google'; // Replace with backend route for Google login
    };

    document.getElementById('facebook-login').onclick = function() {
        window.location.href = '/auth/facebook'; // Replace with backend route for Facebook login
    };

    document.getElementById('twitter-login').onclick = function() {
        window.location.href = '/auth/twitter'; // Replace with backend route for Twitter login
    };

    document.getElementById('tiktok-login').onclick = function() {
        window.location.href = '/auth/tiktok'; // Replace with backend route for TikTok login
    };

    const authForm = document.getElementById('auth-form');
    const authToggle = document.getElementById('toggle-link');
    const authSubmitButton = document.getElementById('auth-submit');
    const toggleMessage = document.getElementById('toggle-message');
    const confirmPasswordField = document.getElementById('confirm-password');
    let isSignUp = false;

    authToggle.onclick = function(event) {
        event.preventDefault();
        isSignUp = !isSignUp;
        if (isSignUp) {
            toggleMessage.innerHTML = 'Already have an account? <a href="#" id="toggle-link">Log In</a>';
            authSubmitButton.innerText = 'Sign Up';
            confirmPasswordField.style.display = 'block';
        } else {
            toggleMessage.innerHTML = 'Don\'t have an account? <a href="#" id="toggle-link">Sign Up</a>';
            authSubmitButton.innerText = 'Log In';
            confirmPasswordField.style.display = 'none';
        }
    };

    // authForm.onsubmit = function(event) {
    //     event.preventDefault();
    //     const email = document.getElementById('email').value.trim();
    //     const password = document.getElementById('password').value.trim();
    //     const confirmPassword = document.getElementById('confirm-password').value.trim();

    //     document.getElementById('confirm-password').addEventListener('focus', function() {
    //         this.required = true;
    //     }, { once: true }); // Set required when the field becomes visible/focusable

    //     if (isSignUp && password !== confirmPassword) {
    //         alert('Passwords do not match!');
    //         return;
    //     }
        
       
    //    console.log(email, password, confirmPassword);
    //     const endpoint = isSignUp ? 'http://localhost:3000/api/auth/signup' : 'http://localhost:3000/api/auth/login';

    //     fetch(endpoint, { 
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ email, password, confirmPassword: isSignUp ? confirmPassword : undefined }),
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log(data);
    //         if (data.success) {
    //             alert('Log in successful');
    //             // Handle successful authentication (e.g., redirect or update UI)
    //             window.location.href = 'menu.html';
    //         } else {
    //             alert('Authentication failed: ' + data.message);
    //         }
    //     })
    //     .catch(error => console.error('Error:', error));
    // };
    authForm.onsubmit = function(event) {
        event.preventDefault();
      
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        if (isSignUp && password !== confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
      
        // Only send necessary data based on signup/login state
        const body = {
          email,
          password,
        };
        if (isSignUp) {
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
            // Handle successful authentication (e.g., redirect or update UI)
            if (isSignUp) {
              // Handle successful signup (e.g., redirect to login page)
            } else {
              window.location.href = 'menu.html'; // Redirect to menu.html on successful login
            }
          } else {
            alert('Authentication failed: ' + data.message);
          }
        })
        .catch(error => console.error('Error:', error));
      };
    
});
