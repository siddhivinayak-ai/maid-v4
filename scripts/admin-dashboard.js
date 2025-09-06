document.addEventListener('DOMContentLoaded', () => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
      window.location.href = '../index.html';
      return;
  }

  const logoutBtn = document.getElementById('logout-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  const userTableBody = document.getElementById('user-table-body');
  const jobTableBody = document.getElementById('job-table-body');
  const applicationTableBody = document.getElementById('application-table-body');
  const statsUsers = document.getElementById('stats-users');
  const statsJobs = document.getElementById('stats-jobs');
  const statsApplications = document.getElementById('stats-applications');

  logoutBtn.addEventListener('click', () => {
      const users = getData('maidConnectUsers');
      const user = users.find(u => u.id === currentUser.id);
      if (user) {
          user.sessionId = null;
          saveData('maidConnectUsers', users);
      }
      clearCurrentUser();
      window.location.href = '../index.html';
  });

  refreshBtn.addEventListener('click', () => {
      loadDashboardData();
      alert('Data refreshed!');
  });

  function loadDashboardData() {
      const users = getData('maidConnectUsers');
      const jobs = getData('maidConnectJobs');
      const applications = getData('maidConnectApplications');
      const maids = users.filter(u => u.role === 'maid');
      const flatOwners = users.filter(u => u.role === 'flatowner');

      // Update Stats
      statsUsers.textContent = users.length;
      statsJobs.textContent = jobs.length;
      statsApplications.textContent = applications.length;

      // Render Users
      userTableBody.innerHTML = '';
      users.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${user.id}</td>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.role}</td>
              <td>${user.sessionId ? 'Active' : 'Inactive'}</td>
              <td>
                  <button class="btn btn-accent action-btn" onclick="viewUserDetails(${user.id})">View</button>
                  ${user.role !== 'admin' ? `<button class="btn btn-primary action-btn" onclick="forceLogoutUser(${user.id})">Force Logout</button>` : ''}
                  ${user.role !== 'admin' ? `<button class="btn btn-accent action-btn" onclick="deleteUser(${user.id})">Delete</button>` : ''}
              </td>
          `;
          userTableBody.appendChild(row);
      });

      // Render Jobs
      jobTableBody.innerHTML = '';
      jobs.forEach(job => {
          const flatOwner = users.find(u => u.id === job.flatOwnerId);
          const applicationCount = applications.filter(app => app.jobId === job.id).length;
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${job.id}</td>
              <td>${job.jobTitle}</td>
              <td>${flatOwner ? flatOwner.name : 'N/A'}</td>
              <td>${job.location}</td>
              <td>₹${job.salary}</td>
              <td>${applicationCount}</td>
              <td>
                  <button class="btn btn-accent action-btn" onclick="deleteJob(${job.id})">Delete</button>
              </td>
          `;
          jobTableBody.appendChild(row);
      });

      // Render Applications
      applicationTableBody.innerHTML = '';
      applications.forEach(app => {
          const maid = users.find(u => u.id === app.maidId);
          const job = jobs.find(j => j.id === app.jobId);
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${app.id}</td>
              <td>${maid ? maid.name : 'N/A'}</td>
              <td>${job ? job.jobTitle : 'N/A'}</td>
              <td>${app.status}</td>
              <td>
                  <button class="btn btn-accent action-btn" onclick="viewApplicationDetails(${app.id})">View</button>
              </td>
          `;
          applicationTableBody.appendChild(row);
      });
  }

  // Global functions for admin actions
  window.viewUserDetails = function(userId) {
      const users = getData('maidConnectUsers');
      const user = users.find(u => u.id === userId);
      if (user) {
          alert(`User Details:\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nPhone: ${user.phone}\nStatus: ${user.sessionId ? 'Active' : 'Inactive'}\nProfile Data: ${JSON.stringify(user.profile, null, 2)}`);
      }
  };

  window.forceLogoutUser = function(userId) {
      if (confirm('Are you sure you want to force logout this user?')) {
          const users = getData('maidConnectUsers');
          const userIndex = users.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
              users[userIndex].sessionId = null;
              saveData('maidConnectUsers', users);
              alert('User logged out successfully!');
              loadDashboardData();
          }
      }
  };

  window.deleteUser = function(userId) {
      if (confirm('Are you sure you want to delete this user and all their data?')) {
          const users = getData('maidConnectUsers');
          const newUsers = users.filter(u => u.id !== userId);
          saveData('maidConnectUsers', newUsers);
          
          const jobs = getData('maidConnectJobs').filter(j => j.flatOwnerId !== userId);
          saveData('maidConnectJobs', jobs);
          
          const applications = getData('maidConnectApplications').filter(a => a.maidId !== userId && a.flatOwnerId !== userId);
          saveData('maidConnectApplications', applications);
          
          alert('User and associated data deleted successfully!');
          loadDashboardData();
      }
  };

  window.deleteJob = function(jobId) {
      if (confirm('Are you sure you want to delete this job post?')) {
          const jobs = getData('maidConnectJobs').filter(j => j.id !== jobId);
          saveData('maidConnectJobs', jobs);
          
          const applications = getData('maidConnectApplications').filter(a => a.jobId !== jobId);
          saveData('maidConnectApplications', applications);
          
          alert('Job and all applications deleted successfully!');
          loadDashboardData();
      }
  };

  window.viewApplicationDetails = function(appId) {
      const applications = getData('maidConnectApplications');
      const application = applications.find(a => a.id === appId);
      if (application) {
          alert(`Application Details:\nMaid ID: ${application.maidId}\nJob ID: ${application.jobId}\nStatus: ${application.status}\nMaid Info: ${JSON.stringify(application.maidDetails, null, 2)}`);
      }
  };

  // Initial load
  loadDashboardData();
});