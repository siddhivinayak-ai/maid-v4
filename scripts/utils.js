// Function to get data from localStorage
function getData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Function to save data to localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Get the current user from session
function getCurrentUser() {
  const user = sessionStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Set the current user in session
function setCurrentUser(user) {
  sessionStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear the current user session
function clearCurrentUser() {
  sessionStorage.removeItem('currentUser');
}

// Force logout by clearing all sessions except for the current admin one
function forceLogout(userId) {
  const users = getData('maidConnectUsers');
  const updatedUsers = users.map(user => {
      if (user.id === userId) {
          user.sessionId = null;
      }
      return user;
  });
  saveData('maidConnectUsers', updatedUsers);
}