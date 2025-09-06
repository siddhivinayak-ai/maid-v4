document.addEventListener('DOMContentLoaded', () => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'flatowner') {
      window.location.href = '../index.html';
      return;
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
          clearCurrentUser();
          window.location.href = '../index.html';
      });
  }

  // Job Posting
  const jobPostForm = document.getElementById('job-post-form');
  const jobListingsContainer = document.getElementById('flatowner-job-listings');
  const applicationsContainer = document.getElementById('applications-list');

  jobPostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const jobTitle = document.getElementById('job-title').value;
      const jobLocation = document.getElementById('job-location').value;
      const jobSalary = document.getElementById('job-salary').value;
      const jobDescription = document.getElementById('job-description').value;

      const newJob = {
          id: Date.now(),
          flatOwnerId: currentUser.id,
          jobTitle,
          location: jobLocation,
          salary: parseInt(jobSalary),
          description: jobDescription,
          postedAt: new Date().toISOString()
      };

      const jobs = getData('maidConnectJobs');
      jobs.push(newJob);
      saveData('maidConnectJobs', jobs);
      jobPostForm.reset();
      alert('Job posted successfully!');
      renderMyJobs();
  });

  function renderMyJobs() {
      const jobs = getData('maidConnectJobs');
      const myJobs = jobs.filter(job => job.flatOwnerId === currentUser.id);
      jobListingsContainer.innerHTML = '';
      if (myJobs.length === 0) {
          jobListingsContainer.innerHTML = '<p>You have not posted any jobs yet.</p>';
          return;
      }

      myJobs.forEach(job => {
          const jobCard = document.createElement('div');
          jobCard.className = 'job-card card';
          jobCard.innerHTML = `
              <div class="card-header">
                  <h3 class="card-title">${job.jobTitle}</h3>
                  <small>Posted on: ${new Date(job.postedAt).toLocaleDateString()}</small>
              </div>
              <div class="card-content">
                  <p><span>Location:</span> ${job.location}</p>
                  <p><span>Salary:</span> ₹${job.salary}</p>
                  <p><span>Description:</span> ${job.description}</p>
              </div>
          `;
          jobListingsContainer.appendChild(jobCard);
      });
  }

  // Maid Search and Applications
  const maidSearchInput = document.getElementById('maid-search');
  const maidFilterBtn = document.getElementById('maid-filter-btn');
  const maidListContainer = document.getElementById('maid-list');
  const viewMaidModal = document.getElementById('view-maid-modal');
  const viewMaidContent = document.getElementById('view-maid-details');
  const closeModalBtn = viewMaidModal.querySelector('.close-modal');

  function renderMaids(maids) {
      maidListContainer.innerHTML = '';
      if (maids.length === 0) {
          maidListContainer.innerHTML = '<p>No maids found matching your criteria.</p>';
          return;
      }
      maids.forEach(maid => {
          if (maid.profile) {
              const maidCard = document.createElement('div');
              maidCard.className = 'maid-card card';
              maidCard.innerHTML = `
                  <div class="card-header">
                      <h3 class="card-title">${maid.name}</h3>
                      <button class="btn btn-outline view-more-btn" data-maid-id="${maid.id}">View More</button>
                  </div>
                  <div class="card-content">
                      <p><span>Skills:</span> ${maid.profile.skills}</p>
                      <p><span>Location:</span> ${maid.profile.location}</p>
                      <p><span>Expected Salary:</span> ₹${maid.profile.salary}</p>
                  </div>
              `;
              maidListContainer.appendChild(maidCard);
          }
      });

      document.querySelectorAll('.view-more-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const maidId = e.target.dataset.maidId;
              const maid = getData('maidConnectUsers').find(u => u.id == maidId);
              if (maid && maid.profile) {
                  viewMaidContent.innerHTML = `
                      <h2>${maid.name}</h2>
                      <p><strong>Email:</strong> ${maid.email}</p>
                      <p><strong>Phone:</strong> ${maid.phone}</p>
                      <p><strong>Location:</strong> ${maid.profile.location}</p>
                      <p><strong>Skills:</strong> ${maid.profile.skills}</p>
                      <p><strong>Expected Salary:</strong> ₹${maid.profile.salary}</p>
                      <p><strong>Age:</strong> ${maid.profile.age}</p>
                      <p><strong>Experience:</strong> ${maid.profile.experience} years</p>
                      <p><strong>Religion:</strong> ${maid.profile.religion}</p>
                      <p><strong>Native Place:</strong> ${maid.profile.native}</p>
                      <p><strong>Education:</strong> ${maid.profile.education}</p>
                      <p><strong>Language:</strong> ${maid.profile.language}</p>
                      <p><strong>Can Handle Baby Age:</strong> ${maid.profile.babyAge}</p>
                      <p><strong>No. of Babies Handled:</strong> ${maid.profile.babiesHandled}</p>
                      <p><strong>Note:</strong> ${maid.profile.note}</p>
                  `;
                  viewMaidModal.style.display = 'flex';
              }
          });
      });
  }

  closeModalBtn.addEventListener('click', () => {
      viewMaidModal.style.display = 'none';
  });
  window.addEventListener('click', (e) => {
      if (e.target === viewMaidModal) {
          viewMaidModal.style.display = 'none';
      }
  });

  function filterMaids() {
      const maids = getData('maidConnectUsers').filter(u => u.role === 'maid' && u.profile);
      const searchTerm = maidSearchInput.value.toLowerCase();
      const filteredMaids = maids.filter(maid =>
          (maid.profile.skills && maid.profile.skills.toLowerCase().includes(searchTerm)) ||
          (maid.profile.location && maid.profile.location.toLowerCase().includes(searchTerm))
      );
      renderMaids(filteredMaids);
  }

  maidSearchInput.addEventListener('keyup', filterMaids);
  maidFilterBtn.addEventListener('click', filterMaids);

  // Job Applications
  function renderApplications() {
      const applications = getData('maidConnectApplications').filter(app => app.flatOwnerId === currentUser.id);
      applicationsContainer.innerHTML = '';
      if (applications.length === 0) {
          applicationsContainer.innerHTML = '<p>No new applications for your jobs.</p>';
          return;
      }

      applications.forEach(app => {
          const job = getData('maidConnectJobs').find(j => j.id === app.jobId);
          const applicationCard = document.createElement('div');
          applicationCard.className = 'card';
          applicationCard.innerHTML = `
              <h4>Application for: ${job.jobTitle}</h4>
              <p><strong>Maid Name:</strong> ${app.maidDetails.name}</p>
              <p><strong>Phone:</strong> ${app.maidDetails.phone}</p>
              <p><strong>Email:</strong> ${app.maidDetails.email}</p>
              <p><strong>Status:</strong> ${app.status}</p>
              <p><a href="#" class="view-maid-details-link" data-maid-id="${app.maidId}">View Maid Profile</a></p>
          `;
          applicationsContainer.appendChild(applicationCard);
      });

      document.querySelectorAll('.view-maid-details-link').forEach(link => {
          link.addEventListener('click', (e) => {
              e.preventDefault();
              const maidId = e.target.dataset.maidId;
              const maid = getData('maidConnectUsers').find(u => u.id == maidId);
              if (maid && maid.profile) {
                  viewMaidContent.innerHTML = `
                      <h2>${maid.name}</h2>
                      <p><strong>Email:</strong> ${maid.email}</p>
                      <p><strong>Phone:</strong> ${maid.phone}</p>
                      <p><strong>Location:</strong> ${maid.profile.location}</p>
                      <p><strong>Skills:</strong> ${maid.profile.skills}</p>
                      <p><strong>Expected Salary:</strong> ₹${maid.profile.salary}</p>
                      <p><strong>Age:</strong> ${maid.profile.age}</p>
                      <p><strong>Experience:</strong> ${maid.profile.experience} years</p>
                      <p><strong>Religion:</strong> ${maid.profile.religion}</p>
                      <p><strong>Native Place:</strong> ${maid.profile.native}</p>
                      <p><strong>Education:</strong> ${maid.profile.education}</p>
                      <p><strong>Language:</strong> ${maid.profile.language}</p>
                      <p><strong>Can Handle Baby Age:</strong> ${maid.profile.babyAge}</p>
                      <p><strong>No. of Babies Handled:</strong> ${maid.profile.babiesHandled}</p>
                      <p><strong>Note:</strong> ${maid.profile.note}</p>
                  `;
                  viewMaidModal.style.display = 'flex';
              }
          });
      });
  }

  // Initial load
  renderMyJobs();
  renderMaids(getData('maidConnectUsers').filter(u => u.role === 'maid' && u.profile));
  renderApplications();
});