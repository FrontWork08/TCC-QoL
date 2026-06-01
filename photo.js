/* ═══════════════════════════════════════════
   VitaIA — Módulo de Corte de Foto
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   PHOTO CROP MODAL
══════════════════════════════════════════ */
const cropState = {
  img: null, zoom: 1, rotation: 0,
  dragX: 0, dragY: 0, startX: 0, startY: 0,
  isDragging: false, offsetX: 0, offsetY: 0
};

function openPhotoCropModal() {
  document.getElementById('modal-photo-crop').classList.add('active');
  document.getElementById('photo-crop-area').style.display = 'none';
  document.getElementById('photo-dropzone').style.display = 'block';
  // Setup drag-and-drop on dropzone
  const dz = document.getElementById('photo-dropzone');
  dz.ondragover = e => { e.preventDefault(); dz.style.borderColor = 'var(--cyan)'; dz.style.background = 'var(--surface)'; };
  dz.ondragleave = () => { dz.style.borderColor = 'var(--border)'; dz.style.background = 'var(--surface2)'; };
  dz.ondrop = e => {
    e.preventDefault();
    dz.style.borderColor = 'var(--border)'; dz.style.background = 'var(--surface2)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) photoCropLoadImage(file);
  };
}

function photoCropLoadFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  photoCropLoadImage(file);
}

function photoCropLoadImage(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      cropState.img = img;
      cropState.zoom = 1;
      cropState.rotation = 0;
      cropState.offsetX = 0;
      cropState.offsetY = 0;
      document.getElementById('photo-zoom').value = 1;
      document.getElementById('photo-zoom-val').textContent = '1×';
      document.getElementById('photo-dropzone').style.display = 'none';
      document.getElementById('photo-crop-area').style.display = 'block';
      photoCropSetupCanvas();
      photoCropDraw();
      photoCropSetupDrag();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function photoCropSetupCanvas() {
  const container = document.getElementById('photo-crop-container');
  const size = Math.min(container.clientWidth || 380, 380);
  const canvas = document.getElementById('photo-crop-canvas');
  const overlay = document.getElementById('photo-crop-overlay');
  canvas.width = size; canvas.height = size;
  overlay.width = size; overlay.height = size;
  // Draw overlay: dark vignette with circle cutout
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(0,0,0,0.52)';
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 10, 0, Math.PI*2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 10, 0, Math.PI*2);
  ctx.stroke();
}

function photoCropDraw() {
  const canvas = document.getElementById('photo-crop-canvas');
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const img = cropState.img;
  if (!img) return;

  const zoom = parseFloat(document.getElementById('photo-zoom').value);
  cropState.zoom = zoom;
  document.getElementById('photo-zoom-val').textContent = zoom.toFixed(1) + '×';

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size/2 + cropState.offsetX, size/2 + cropState.offsetY);
  ctx.rotate(cropState.rotation * Math.PI / 180);
  ctx.scale(zoom, zoom);

  const rad = cropState.rotation * Math.PI / 180;
  const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
  const fitW = size / (img.width * cos + img.height * sin);
  const fitH = size / (img.width * sin + img.height * cos);
  const baseScale = Math.max(fitW, fitH);

  ctx.drawImage(img, -img.width*baseScale/2, -img.height*baseScale/2, img.width*baseScale, img.height*baseScale);
  ctx.restore();
  photoCropUpdatePreviews();
}

function photoCropUpdatePreviews() {
  ['photo-preview-lg','photo-preview-sm'].forEach(id => {
    const prev = document.getElementById(id);
    const pCtx = prev.getContext('2d');
    const s = prev.width;
    pCtx.clearRect(0,0,s,s);
    pCtx.save();
    pCtx.beginPath();
    pCtx.arc(s/2,s/2,s/2,0,Math.PI*2);
    pCtx.clip();
    const src = document.getElementById('photo-crop-canvas');
    const cs = src.width;
    const r = (cs/2 - 10);
    pCtx.drawImage(src, cs/2-r, cs/2-r, r*2, r*2, 0, 0, s, s);
    pCtx.restore();
  });
}

function photoCropSetupDrag() {
  const canvas = document.getElementById('photo-crop-canvas');
  canvas.onmousedown = e => { cropState.isDragging=true; cropState.startX=e.clientX-cropState.offsetX; cropState.startY=e.clientY-cropState.offsetY; canvas.style.cursor='grabbing'; };
  window.onmousemove = e => {
    if (!cropState.isDragging) return;
    cropState.offsetX = e.clientX - cropState.startX;
    cropState.offsetY = e.clientY - cropState.startY;
    photoCropDraw();
  };
  window.onmouseup = () => { cropState.isDragging=false; if(document.getElementById('photo-crop-canvas')) document.getElementById('photo-crop-canvas').style.cursor='move'; };
  // Touch
  canvas.ontouchstart = e => { const t=e.touches[0]; cropState.isDragging=true; cropState.startX=t.clientX-cropState.offsetX; cropState.startY=t.clientY-cropState.offsetY; e.preventDefault(); };
  canvas.ontouchmove = e => {
    if (!cropState.isDragging) return;
    const t=e.touches[0]; cropState.offsetX=t.clientX-cropState.startX; cropState.offsetY=t.clientY-cropState.startY;
    photoCropDraw(); e.preventDefault();
  };
  canvas.ontouchend = () => { cropState.isDragging=false; };
}

function photoCropRotate(deg) {
  cropState.rotation = (cropState.rotation + deg + 360) % 360;
  photoCropDraw();
}

function photoCropReset() {
  cropState.zoom=1; cropState.rotation=0; cropState.offsetX=0; cropState.offsetY=0;
  document.getElementById('photo-zoom').value=1;
  photoCropDraw();
}

function photoCropApply() {
  const canvas = document.getElementById('photo-crop-canvas');
  const size = canvas.width;
  const radius = size/2 - 10;
  // Create output canvas (circular crop)
  const out = document.createElement('canvas');
  out.width = 256; out.height = 256;
  const octx = out.getContext('2d');
  octx.beginPath();
  octx.arc(128,128,128,0,Math.PI*2);
  octx.clip();
  octx.drawImage(canvas, size/2-radius, size/2-radius, radius*2, radius*2, 0, 0, 256, 256);
  const dataUrl = out.toDataURL('image/jpeg', 0.92);
  state.profilePhoto = dataUrl;
  updateAvatarDisplay();
  // Also update the modal avatar display
  const profilePic = document.getElementById('profile-avatar-display');
  if (profilePic) {
    let img = profilePic.querySelector('img');
    if (!img) { img = document.createElement('img'); profilePic.appendChild(img); }
    img.src = dataUrl;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;position:absolute;inset:0;';
    // Hide initials
    const initials = document.getElementById('profile-avatar-initials');
    if (initials) initials.style.display = 'none';
  }
  saveState();
  closeModal('modal-photo-crop');
  showToast('Foto atualizada!', 'Sua foto de perfil foi salva com sucesso.', '🎉', 3000);
}

function photoRemove() {
  state.profilePhoto = null;
  updateAvatarDisplay();
  const profilePic = document.getElementById('profile-avatar-display');
  if (profilePic) {
    const img = profilePic.querySelector('img');
    if (img) img.remove();
    const initials = document.getElementById('profile-avatar-initials');
    if (initials) { initials.style.display = ''; initials.textContent = state.name[0]?.toUpperCase() || '?'; }
  }
  saveState();
  closeModal('modal-photo-crop');
  showToast('Foto removida', 'Voltando ao avatar com iniciais.', '👤', 2500);
}
