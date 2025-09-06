document.addEventListener('DOMContentLoaded', () => {
  // Check if users already exist, if not, create static users
  initializeStaticUsers();

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
  });

  // Auth Modals
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToLogin = document.getElementById('switch-to-login');
  const userTypes = document.querySelectorAll('.user-type');

  loginBtn.addEventListener('click', () => {
      loginModal.style.display = 'flex';
  });

  signupBtn.addEventListener('click', () => {
      signupModal.style.display = 'flex';
  });

  closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
          loginModal.style.display = 'none';
          signupModal.style.display = 'none';
      });
  });

  switchToSignup.addEventListener('click', () => {
      loginModal.style.display = 'none';
      signupModal.style.display = 'flex';
  });

  switchToLogin.addEventListener('click', () => {
      signupModal.style.display = 'none';
      loginModal.style.display = 'flex';
  });

  window.addEventListener('click', (e) => {
      if (e.target === loginModal) {
          loginModal.style.display = 'none';
      }
      if (e.target === signupModal) {
          signupModal.style.display = 'none';
      }
  });

  // User Type Selection
  userTypes.forEach(type => {
      type.addEventListener('click', () => {
          userTypes.forEach(t => t.classList.remove('active'));
          type.classList.add('active');
      });
  });

  // Login Form Submission
  document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      const users = getData('maidConnectUsers');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
          // Check for active sessions (for simplicity, we'll check `sessionId`)
          if (user.sessionId) {
              alert('This account is already logged in elsewhere. Please try again later.');
              return;
          }

          // Set current user session
          const sessionId = Math.random().toString(36).substring(2, 15);
          user.sessionId = sessionId;
          saveData('maidConnectUsers', users);
          sessionStorage.setItem('currentUser', JSON.stringify({ ...user, sessionId }));
          
          // Redirect based on role
          if (user.role === 'maid') {
              window.location.href = './pages/maid-dashboard.html';
          } else if (user.role === 'flatowner') {
              window.location.href = './pages/flatowner-dashboard.html';
          } else if (user.role === 'admin') {
              window.location.href = './pages/admin.html';
          }
          
          loginModal.style.display = 'none';
      } else {
          alert('Invalid email or password');
      }
  });

  // Signup Form Submission
  document.getElementById('signup-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const selectedType = document.querySelector('.user-type.active').dataset.type;
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const phone = document.getElementById('signup-phone').value;
      
      const users = getData('maidConnectUsers');
      
      // Check if email already exists
      if (users.some(u => u.email === email)) {
          alert('Email already registered');
          return;
      }
      
      const newUser = {
          id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
          name,
          email,
          password,
          phone,
          role: selectedType,
          profile: null,
          createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      saveData('maidConnectUsers', users);
      
      // Log in the new user immediately
      const sessionId = Math.random().toString(36).substring(2, 15);
      newUser.sessionId = sessionId;
      saveData('maidConnectUsers', users);
      sessionStorage.setItem('currentUser', JSON.stringify({ ...newUser, sessionId }));

      // Redirect based on role
      if (newUser.role === 'maid') {
          window.location.href = './pages/maid-dashboard.html';
      } else if (newUser.role === 'flatowner') {
          window.location.href = './pages/flatowner-dashboard.html';
      }
      
      signupModal.style.display = 'none';
  });
});

function initializeStaticUsers() {
  if (!localStorage.getItem('maidConnectUsers')) {
      const staticUsers = [
          { id: 1, name: "Maid 1", email: "maid1@example.com", password: "password1", phone: "1234567890", role: "maid", profile: null, createdAt: new Date().toISOString() },
          { id: 2, name: "Maid 2", email: "maid2@example.com", password: "password2", phone: "1234567891", role: "maid", profile: null, createdAt: new Date().toISOString() },
          { id: 3, name: "Flat Owner 1", email: "flatowner1@example.com", password: "password1", phone: "1234567892", role: "flatowner", profile: null, createdAt: new Date().toISOString() },
          { id: 4, name: "Flat Owner 2", email: "flatowner2@example.com", password: "password2", phone: "1234567893", role: "flatowner", profile: null, createdAt: new Date().toISOString() },
          { id: 5, name: "Admin User", email: "admin@example.com", password: "adminpassword", phone: "1234567894", role: "admin", profile: null, createdAt: new Date().toISOString() }
      ];
      localStorage.setItem('maidConnectUsers', JSON.stringify(staticUsers));
  }

  if (!localStorage.getItem('maidConnectJobs')) {
      localStorage.setItem('maidConnectJobs', JSON.stringify([]));
  }

  if (!localStorage.getItem('maidConnectApplications')) {
      localStorage.setItem('maidConnectApplications', JSON.stringify([]));
  }
}