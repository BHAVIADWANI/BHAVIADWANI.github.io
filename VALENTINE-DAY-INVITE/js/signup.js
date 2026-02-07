let currentStep = 1;
const totalSteps = 5;
const formData = {};

function updateProgress() {
  const progress = (currentStep / totalSteps) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
  document.getElementById('stepIndicator').textContent = `Step ${currentStep} of ${totalSteps}`;
}

function showStep(step) {
  document.querySelectorAll('.step-container').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(`step${step}`).classList.add('active');
  updateProgress();
  window.scrollTo(0, 0);
}

function validateStep(step) {
  if (step === 1) {
    const whoFor = document.querySelector('input[name="whoFor"]:checked');
    if (!whoFor) {
      alert('Please select who you are creating this form for');
      return false;
    }
    formData.whoFor = whoFor.value;
    return true;
  }

  if (step === 2) {
    const yourName = document.getElementById('yourName').value.trim();
    const yourEmail = document.getElementById('yourEmail').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!yourName || !yourEmail || !username || !password) {
      alert('Please fill in all fields');
      return false;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(yourEmail)) {
      alert('Please enter a valid email');
      return false;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.username === username)) {
      alert('Username already exists');
      return false;
    }

    if (users.some(u => u.email === yourEmail)) {
      alert('Email already exists');
      return false;
    }

    formData.yourName = yourName;
    formData.yourEmail = yourEmail;
    formData.username = username;
    formData.password = password;
    return true;
  }

  if (step === 3) {
    const partnerName = document.getElementById('partnerName').value.trim();
    const receiverUsername = document.getElementById('receiverUsername').value.trim();
    if (!partnerName) {
      alert('Please enter their name');
      return false;
    }

    const partnerPhotoFile = document.getElementById('partnerPhoto').files[0];
    const yourPhotoFile = document.getElementById('yourPhoto').files[0];

    if (!partnerPhotoFile || !yourPhotoFile) {
      alert('Please upload photos for both');
      return false;
    }

    formData.partnerName = partnerName;
    formData.receiverUsername = receiverUsername || '';
    return true;
  }

  if (step === 4) {
    const recoveryPhotoHimFile = document.getElementById('recoveryPhotoHim').files[0];
    const recoveryPhotoHerFile = document.getElementById('recoveryPhotoHer').files[0];

    if (!recoveryPhotoHimFile || !recoveryPhotoHerFile) {
      alert('Please upload both recovery photos');
      return false;
    }

    return true;
  }

  return true;
}

function nextStep() {
  if (validateStep(currentStep)) {
    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);

      if (currentStep === 5) {
        populateConfirmation();
      }
    }
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

function handlePhotoPreview(input, previewId) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById(previewId);
      img.src = e.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

function getBase64FromFile(fileId) {
  return new Promise((resolve) => {
    const file = document.getElementById(fileId).files[0];
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

function populateConfirmation() {
  const whoForText = formData.whoFor === 'him' ? '👨 For Him' : '👩 For Her';
  document.getElementById('confirmWhoFor').textContent = whoForText;

  document.getElementById('confirmYourName').textContent = 'Name: ' + formData.yourName;
  document.getElementById('confirmPartnerName').textContent = 'Name: ' + formData.partnerName;

  const yourPhotoPreview = document.getElementById('yourPhotoPreview').src;
  const partnerPhotoPreview = document.getElementById('partnerPhotoPreview').src;

  if (yourPhotoPreview) {
    document.getElementById('confirmYourPhoto').src = yourPhotoPreview;
    document.getElementById('confirmYourPhoto').style.display = 'block';
  }

  if (partnerPhotoPreview) {
    document.getElementById('confirmPartnerPhoto').src = partnerPhotoPreview;
    document.getElementById('confirmPartnerPhoto').style.display = 'block';
  }

  const receiver = formData.receiverUsername || '';
  const sender = formData.username || '';
  if (sender && receiver) {
    const link = `view-invite.html?sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}`;
    const container = document.getElementById('inviteLinkContainer');
    const input = document.getElementById('inviteLinkInput');
    input.value = link;
    container.style.display = 'block';
  }
}

async function submitSignup() {
  const agreeTerms = document.getElementById('agreeTerms').checked;
  if (!agreeTerms) {
    alert('Please agree to the Terms of Love');
    return;
  }

  const photoHim = await getBase64FromFile('partnerPhoto');
  const photoHer = await getBase64FromFile('yourPhoto');
  const recoveryPhotoHim = await getBase64FromFile('recoveryPhotoHim');
  const recoveryPhotoHer = await getBase64FromFile('recoveryPhotoHer');

  let users = JSON.parse(localStorage.getItem('users')) || [];

  const receiverUsername = formData.receiverUsername || document.getElementById('receiverUsername')?.value?.trim() || '';

  const newUser = {
    fullname: formData.yourName,
    email: formData.yourEmail,
    username: formData.username,
    password: formData.password,
    whoFor: formData.whoFor,
    partnerName: formData.partnerName,
    receiverUsername: receiverUsername,
    photoHim: photoHim,
    photoHer: photoHer,
    recoveryPhotoHim: recoveryPhotoHim,
    recoveryPhotoHer: recoveryPhotoHer,
    joined: new Date().toISOString().split('T')[0],
    status: 'active',
    role: 'user'
  };

  if (newUser.username && newUser.receiverUsername) {
    newUser.inviteLink = `view-invite.html?sender=${encodeURIComponent(newUser.username)}&receiver=${encodeURIComponent(newUser.receiverUsername)}`;
  }

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  if (newUser.inviteLink && navigator.clipboard) {
    try { await navigator.clipboard.writeText(newUser.inviteLink); } catch (e) {}
  }

  alert('✨ Account created successfully! The invite link has been generated and copied to your clipboard (if supported). Redirecting to login...');
  window.location.href = 'login.html';
}

function copyInviteLink() {
  const input = document.getElementById('inviteLinkInput');
  if (!input) return;
  input.select();
  input.setSelectionRange(0, 99999);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(input.value).then(() => {
      alert('Invite link copied to clipboard');
    }).catch(() => {
      document.execCommand('copy');
      alert('Invite link copied (fallback)');
    });
  } else {
    document.execCommand('copy');
    alert('Invite link copied');
  }
}

// Initialize
showStep(1);
