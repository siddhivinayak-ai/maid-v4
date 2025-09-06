document.addEventListener('DOMContentLoaded', () => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'maid') {
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

  // Profile Management
  const profileForm = document.getElementById('profile-form');
  const profileName = document.getElementById('profile-name');
  const profileRole = document.getElementById('profile-role');
  const profileLocation = document.getElementById('profile-location');
  const profileSkills = document.getElementById('profile-skills');
  const profileSalary = document.getElementById('profile-salary');
  const profileAge = document.getElementById('profile-age');
  const profileExperience = document.getElementById('profile-experience');
  const profileReligion = document.getElementById('profile-religion');
  const profileNative = document.getElementById('profile-native');
  const profileEducation = document.getElementById('profile-education');
  const profileLanguage = document.getElementById('profile-language');
  const profileBabyAge = document.getElementById('profile-babyAge');
  const profileBabiesHandled = document.getElementById('profile-babiesHandled');
  const profileNote = document.getElementById('profile-note');

  function loadProfile() {
      const users = getData('maidConnectUsers');
      const user = users.find(u => u.id === currentUser.id);
      if (user && user.profile) {
          const profile = user.profile;
          profileName.value = user.name;
          profileRole.value = user.role;
          profileLocation.value = profile.location || '';
          profileSkills.value = profile.skills || '';
          profileSalary.value = profile.salary || '';
          profileAge.value = profile.age || '';
          profileExperience.value = profile.experience || '';
          profileReligion.value = profile.religion || '';
          profileNative.value = profile.native || '';
          profileEducation.value = profile.education || '';
          profileLanguage.value = profile.language || '';
          profileBabyAge.value = profile.babyAge || '';
          profileBabiesHandled.value = profile.babiesHandled || '';
          profileNote.value = profile.note || '';
      } else {
          profileName.value = user.name;
          profileRole.value = user.role;
      }
  }

  profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const users = getData('maidConnectUsers');
      const userIndex = users.findIndex(u => u.id === currentUser.id);

      if (userIndex !== -1) {
          users[userIndex].profile = {
              location: profileLocation.value,
              skills: profileSkills.value,
              salary: profileSalary.value,
              age: profileAge.value,
              experience: profileExperience.value,
              religion: profileReligion.value,
              native: profileNative.value,
              education: profileEducation.value,
              language: profileLanguage.value,
              babyAge: profileBabyAge.value,
              babiesHandled: profileBabiesHandled.value,
              note: profileNote.value
          };
          saveData('maidConnectUsers', users);
          alert('Profile saved successfully!');
      }
  });

  // Job Listings
  const jobListingsContainer = document.getElementById('job-listings');
  const jobSearchInput = document.getElementById('job-search');
  const jobFilterBtn = document.getElementById('job-filter-btn');

  function renderJobs(jobs) {
      jobListingsContainer.innerHTML = '';
      if (jobs.length === 0) {
          jobListingsContainer.innerHTML = '<p>No jobs available at the moment.</p>';
          return;
      }
      jobs.forEach(job => {
          const jobCard = document.createElement('div');
          jobCard.className = 'job-card card';
          jobCard.innerHTML = `
              <div class="card-header">
                  <h3 class="card-title">${job.jobTitle}</h3>
                  <button class="btn btn-primary apply-btn" data-job-id="${job.id}">Apply</button>
              </div>
              <div class="card-content">
                  <p><span>Location:</span> ${job.location}</p>
                  <p><span>Salary:</span> ₹${job.salary}</p>
                  <p><span>Description:</span> ${job.description.substring(0, 100)}...</p>
              </div>
          `;
          jobListingsContainer.appendChild(jobCard);
      });

      document.querySelectorAll('.apply-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const jobId = e.target.dataset.jobId;
              applyForJob(jobId, currentUser);
          });
      });
  }

  function applyForJob(jobId, maid) {
      const applications = getData('maidConnectApplications');
      const jobs = getData('maidConnectJobs');
      const job = jobs.find(j => j.id == jobId);

      if (applications.some(app => app.jobId == jobId && app.maidId === maid.id)) {
          alert('You have already applied for this job.');
          return;
      }

      if (!maid.profile) {
          alert('Please complete your profile before applying for jobs.');
          return;
      }

      const newApplication = {
          id: applications.length > 0 ? Math.max(...applications.map(a => a.id)) + 1 : 1,
          jobId: parseInt(jobId),
          maidId: maid.id,
          flatOwnerId: job.flatOwnerId,
          status: 'Applied',
          maidDetails: {
              name: maid.name,
              email: maid.email,
              phone: maid.phone,
              ...maid.profile
          },
          createdAt: new Date().toISOString()
      };
      applications.push(newApplication);
      saveData('maidConnectApplications', applications);
      alert('Application submitted successfully!');
  }

  function filterJobs() {
      const jobs = getData('maidConnectJobs');
      const searchTerm = jobSearchInput.value.toLowerCase();
      const filteredJobs = jobs.filter(job =>
          job.jobTitle.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.location.toLowerCase().includes(searchTerm)
      );
      renderJobs(filteredJobs);
  }

  jobSearchInput.addEventListener('keyup', filterJobs);
  jobFilterBtn.addEventListener('click', filterJobs);

  // Initial load
  loadProfile();
  renderJobs(getData('maidConnectJobs'));
});