import confetti from 'https://cdn.skypack.dev/canvas-confetti';

const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');
const imageDisplay = document.getElementById('imageDisplay');
const valentineQuestion = document.getElementById('valentineQuestion');
const responseButtons = document.getElementById('responseButtons');
const photoContainer = document.getElementById('photoContainer');

let noClickCount = 0;
let buttonHeight = 48;
let buttonWidth = 80;
let fontSize = 20;
const imagePaths = [
  "./images/image1.gif",
  "./images/image2.gif",
  "./images/image3.gif",
  "./images/image4.gif",
  "./images/image5.gif",
  "./images/image6.gif",
  "./images/image7.gif"
];

function getCurrentUser() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const currentUsername = localStorage.getItem('currentUser');
  return users.find(u => u.username === currentUsername);
}

noButton.addEventListener('click', function() {
  if (noClickCount < 5) {
    noClickCount++;
    imageDisplay.src = imagePaths[noClickCount];
    buttonHeight += 35;
    buttonWidth += 35;
    fontSize += 25;
    yesButton.style.height = `${buttonHeight}px`;
    yesButton.style.width = `${buttonWidth}px`;
    yesButton.style.fontSize = `${fontSize}px`;
    if (noClickCount < 6) {
      noButton.textContent = ["No", "Are you sure?", "Pookie please", "Don't do this to me :(", "You're breaking my heart", "I'm gonna cry..."][noClickCount];
    }
  }
});

yesButton.addEventListener('click', async () => {
  const currentUser = getCurrentUser();
  imageDisplay.src = './images/image7.gif';
  valentineQuestion.textContent = "Yayyy!! 🎉❤️";
  responseButtons.style.display = 'none';

  let finalDataUrl = null;
  try {
    finalDataUrl = await createCombinedImage(currentUser);
  } catch (err) {
    console.error('Error creating combined image', err);
  }

  showFullScreenPhoto(finalDataUrl || './images/image7.gif');
  confetti();
});

function createCombinedImage(user) {
  return new Promise((resolve) => {
    if (!user) return resolve(null);

    const imgA_src = user.photoHer || null;
    const imgB_src = user.photoHim || null;

    if (imgA_src && !imgB_src) return resolve(imgA_src);
    if (!imgA_src && imgB_src) return resolve(imgB_src);
    if (!imgA_src && !imgB_src) return resolve(null);

    const imgA = new Image();
    const imgB = new Image();
    imgA.onload = checkDone;
    imgB.onload = checkDone;
    imgA.src = imgA_src;
    imgB.src = imgB_src;

    let loaded = 0;
    function checkDone() {
      loaded++;
      if (loaded < 2) return;

      const width = Math.max(imgA.width + imgB.width, 1200);
      const height = Math.max(Math.max(imgA.height, imgB.height), 700);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, 'rgba(255,208,229,0.12)');
      g.addColorStop(1, 'rgba(255,232,242,0.12)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      const halfW = Math.floor(width / 2);
      const aRatio = Math.min(halfW / imgA.width, height / imgA.height);
      const aW = imgA.width * aRatio;
      const aH = imgA.height * aRatio;
      const aX = Math.floor((halfW - aW) / 2);
      const aY = Math.floor((height - aH) / 2);
      ctx.drawImage(imgA, aX, aY, aW, aH);

      const bRatio = Math.min(halfW / imgB.width, height / imgB.height);
      const bW = imgB.width * bRatio;
      const bH = imgB.height * bRatio;
      const bX = halfW + Math.floor((halfW - bW) / 2);
      const bY = Math.floor((height - bH) / 2);
      ctx.drawImage(imgB, bX, bY, bW, bH);

      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    }
  });
}

function showFullScreenPhoto(dataUrl) {
  const overlay = document.createElement('div');
  overlay.id = 'fullScreenOverlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(180deg, rgba(189,30,89,0.16), rgba(233,30,99,0.08))',
    zIndex: 9999, padding: '20px'
  });

  const img = document.createElement('img');
  img.src = dataUrl;
  Object.assign(img.style, {
    maxWidth: '95%', maxHeight: '95%', borderRadius: '14px', boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
    objectFit: 'cover'
  });

  const close = document.createElement('button');
  close.textContent = '✕';
  Object.assign(close.style, {
    position: 'absolute', top: '18px', right: '18px', zIndex: 10000,
    background: 'rgba(255,255,255,0.9)', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px'
  });
  close.addEventListener('click', () => {
    overlay.remove();
    responseButtons.style.display = '';
    photoContainer.innerHTML = '';
    photoContainer.classList.add('hidden');
  });

  overlay.appendChild(img);
  overlay.appendChild(close);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close.click();
  });
}

window.addEventListener('load', function() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Please login first');
    window.location.href = 'login.html';
  }
});
