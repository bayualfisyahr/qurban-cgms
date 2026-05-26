/* 
   Qurban Yayasan CGMS - Application Logic (Sprint 5)
   Handles CRUD, LocalStorage, Search, Meat Calculator, Tabs, Status Progress, Cloud Sync, and PDF Export
*/

// Initial Data with Weight, Yield, and Progress details
const INITIAL_DATA = [
  {
    id: 1,
    nama: "Agung Angri Sagita",
    hewan: "Domba",
    permintaan: "Bawa hewan sendiri, semua daging diambil kecuali kulit",
    metodePengambilan: "Belum Ditentukan",
    disembelih: false,
    didistribusikan: false,
    berat: 32,
    totalBungkus: 40,
    jatahMudhohi: 40 // Takes everything
  },
  {
    id: 2,
    nama: "Agus Suryana",
    hewan: "Domba",
    permintaan: "Bawa hewan sendiri, minta 21 kantong untuk keluarga, 1 paha untuk dimasak sendiri, kepala dihadiahkan ke keluarga",
    metodePengambilan: "Belum Ditentukan",
    disembelih: false,
    didistribusikan: false,
    berat: 35,
    totalBungkus: 45,
    jatahMudhohi: 21
  },
  {
    id: 3,
    nama: "Muhammad Fidanial dan keluarga",
    hewan: "Domba",
    permintaan: "Minta 2kg daging tanpa tulang untuk keluarga",
    metodePengambilan: "Belum Ditentukan",
    disembelih: false,
    didistribusikan: false,
    berat: 28,
    totalBungkus: 35,
    jatahMudhohi: 2
  },
  {
    id: 4,
    nama: "Pak Iwan",
    hewan: "Domba",
    permintaan: "Minta 10 bungkus untuk kerabat dan tetangga",
    metodePengambilan: "Belum Ditentukan",
    disembelih: false,
    didistribusikan: false,
    berat: 31,
    totalBungkus: 40,
    jatahMudhohi: 10
  },
  {
    id: 5,
    nama: "Warma bin Hadna",
    hewan: "Domba",
    permintaan: "Minta 2kg daging saja dan 12 bungkus untuk kerabat",
    metodePengambilan: "Belum Ditentukan",
    disembelih: false,
    didistribusikan: false,
    berat: 30,
    totalBungkus: 38,
    jatahMudhohi: 12
  },
  {
    id: 6,
    nama: "Agus Abu Thariq",
    hewan: "Domba",
    permintaan: "Minta 1/3 dari hewan kurban",
    metodePengambilan: "Belum Ditentukan",
    disembelih: false,
    didistribusikan: false,
    berat: 33,
    totalBungkus: 45,
    jatahMudhohi: 15
  }
];

// Default Global Distribution Settings
const DEFAULT_DIST_SETTINGS = {
  pengurus: 20,
  tetangga: 30,
  team: 25,
  halaqoh: 0
};

// App State
let mudohhiiData = [];
let distSettings = {};
let deleteTargetId = null;
let deferredPrompt = null;

// Cloud Sync State
const SYNC_BUCKET_URL = "https://kvdb.io/w8u9k3m2a7d4p5q2v6z1/cgms_kurban_1447h_";
let syncEnabled = false;
let syncSessionId = "";
let syncIntervalId = null;

// DOM Elements
const mudohhiiContainer = document.getElementById('mudohhii-container');
const animalSummaryContainer = document.getElementById('animal-summary-container');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const filterStatus = document.getElementById('filter-status');
const btnPdf = document.getElementById('btn-pdf');
const btnAddDesktop = document.getElementById('btn-add-desktop');
const listCount = document.getElementById('list-count');
const fabAdd = document.getElementById('fab-add');

// Cloud Sync DOM Elements (Automatic Background Sync)

// Mobile Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// Dashboard Elements (Progress & Preferences)
const statTotalMudohhii = document.getElementById('stat-total-mudohhii');
const statTotalHewan = document.getElementById('stat-total-hewan');
const statTotalDisembelih = document.getElementById('stat-total-disembelih');
const statTotalDistHewan = document.getElementById('stat-total-dist-hewan');
const statTotalDidistribusi = document.getElementById('stat-total-didistribusi');

const statPrefDiambil = document.getElementById('stat-pref-diambil');
const statPrefDiantar = document.getElementById('stat-pref-diantar');
const statPrefBelum = document.getElementById('stat-pref-belum');

// Meat Recap Elements (Right Panel)
const meatTotalBerat = document.getElementById('meat-total-berat');
const meatTotalBungkus = document.getElementById('meat-total-bungkus');
const distMudhohiDisplay = document.getElementById('dist-mudhohi');
const distAlert = document.getElementById('dist-alert');

// Distribution Inputs
const inputPengurus = document.getElementById('input-pengurus');
const inputTetangga = document.getElementById('input-tetangga');
const inputTeam = document.getElementById('input-team');
const inputHalaqoh = document.getElementById('input-halaqoh');

// Form Modal Elements
const formModal = document.getElementById('form-modal');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.getElementById('modal-close');
const mudohhiiForm = document.getElementById('mudohhii-form');
const formId = document.getElementById('form-id');
const formNama = document.getElementById('form-nama');
const formHewan = document.getElementById('form-hewan');
const formBerat = document.getElementById('form-berat');
const formTotalBungkus = document.getElementById('form-total-bungkus');
const formJatahMudhohi = document.getElementById('form-jatah-mudhohi');
const formPermintaan = document.getElementById('form-permintaan');
const formMetode = document.getElementById('form-metode');
const formStatusSembelih = document.getElementById('form-status-sembelih');
const formStatusDistribusi = document.getElementById('form-status-distribusi');
const formCancelBtn = document.getElementById('form-cancel-btn');

// Confirm Modal Elements
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmCancel = document.getElementById('confirm-cancel');
const confirmOk = document.getElementById('confirm-ok');

// PWA Elements
const pwaBanner = document.getElementById('pwa-install-banner');
const pwaBtnInstall = document.getElementById('pwa-btn-install');
const pwaBtnClose = document.getElementById('pwa-btn-close');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  registerServiceWorker();
});

// Load data and configurations from LocalStorage
function loadData() {
  // Load Mudohhii Data
  const storedData = localStorage.getItem('mudohhii_data');
  if (storedData) {
    mudohhiiData = JSON.parse(storedData);
  } else {
    mudohhiiData = [...INITIAL_DATA];
    saveDataToStorage();
  }

  // Load Distribution Settings
  const storedSettings = localStorage.getItem('mudohhii_dist_settings');
  if (storedSettings) {
    distSettings = JSON.parse(storedSettings);
  } else {
    distSettings = { ...DEFAULT_DIST_SETTINGS };
    saveSettingsToStorage();
  }

  // Apply Settings to UI Inputs
  inputPengurus.value = distSettings.pengurus;
  inputTetangga.value = distSettings.tetangga;
  inputTeam.value = distSettings.team;
  inputHalaqoh.value = distSettings.halaqoh !== undefined ? distSettings.halaqoh : 0;

  // Load Cloud Sync settings (Forced automated shared background database)
  syncEnabled = true;
  syncSessionId = "CGMS-1447H-DATABASE-SHARED";
  connectToCloud(syncSessionId, false);

  updateAppView();
}

// Save functions
function saveDataToStorage() {
  localStorage.setItem('mudohhii_data', JSON.stringify(mudohhiiData));
  if (syncEnabled && syncSessionId) {
    saveToCloud();
  }
}

function saveSettingsToStorage() {
  localStorage.setItem('mudohhii_dist_settings', JSON.stringify(distSettings));
  if (syncEnabled && syncSessionId) {
    saveToCloud();
  }
}

// Update all UI elements based on current state
function updateAppView() {
  renderDashboard();
  renderMeatCalculations(true); // Automatically calculate Halaqoh remainder on full update
  renderList();
  renderAnimalSummary();
}

// Update Dashboard Statistics (Left Panel)
function renderDashboard() {
  const total = mudohhiiData.length;
  const disembelih = mudohhiiData.filter(item => item.disembelih).length;
  const didistribusi = mudohhiiData.filter(item => item.didistribusikan).length;
  
  const prefDiambil = mudohhiiData.filter(item => item.metodePengambilan === 'Diambil').length;
  const prefDiantar = mudohhiiData.filter(item => item.metodePengambilan === 'Diantar').length;
  const prefBelum = mudohhiiData.filter(item => item.metodePengambilan === 'Belum Ditentukan').length;

  statTotalMudohhii.textContent = total;
  statTotalHewan.textContent = total;
  statTotalDisembelih.textContent = disembelih;
  statTotalDistHewan.textContent = total;
  statTotalDidistribusi.textContent = didistribusi;

  statPrefDiambil.textContent = prefDiambil;
  statPrefDiantar.textContent = prefDiantar;
  statPrefBelum.textContent = prefBelum;
}

// Update Meat Calculation & Distribution (Right Panel)
function renderMeatCalculations(autoFillHalaqoh = true) {
  // Summing up values
  const totalBerat = mudohhiiData.reduce((sum, item) => sum + (parseFloat(item.berat) || 0), 0);
  const totalBungkus = mudohhiiData.reduce((sum, item) => sum + (parseInt(item.totalBungkus) || 0), 0);
  const totalJatahMudhohi = mudohhiiData.reduce((sum, item) => sum + (parseInt(item.jatahMudhohi) || 0), 0);

  // Distribution values
  const pengurusVal = parseInt(inputPengurus.value) || 0;
  const tetanggaVal = parseInt(inputTetangga.value) || 0;
  const teamVal = parseInt(inputTeam.value) || 0;

  let halaqohVal = 0;
  if (autoFillHalaqoh) {
    // Auto calculate Halaqoh as remainder
    halaqohVal = totalBungkus - totalJatahMudhohi - pengurusVal - tetanggaVal - teamVal;
    if (halaqohVal < 0) halaqohVal = 0;
    inputHalaqoh.value = halaqohVal;
    distSettings.halaqoh = halaqohVal;
  } else {
    // Use the value currently typed in Halaqoh
    halaqohVal = parseInt(inputHalaqoh.value) || 0;
  }

  // Displaying summary cards
  meatTotalBerat.textContent = totalBerat.toLocaleString('id-ID');
  meatTotalBungkus.textContent = totalBungkus.toLocaleString('id-ID');

  // Displaying distribution list jatah
  distMudhohiDisplay.textContent = totalJatahMudhohi.toLocaleString('id-ID');

  // Check if sum of all distributions exceeds total
  const sumAllocated = totalJatahMudhohi + pengurusVal + tetanggaVal + teamVal + halaqohVal;

  if (sumAllocated > totalBungkus) {
    distAlert.style.display = 'flex';
    distAlert.querySelector('.alert-text').textContent = `Jumlah alokasi (${sumAllocated} bks) melebihi total bungkus yang tersedia (${totalBungkus} bks)!`;
  } else {
    distAlert.style.display = 'none';
  }
}

// Render Mudohhii list cards (Left Panel)
function renderList() {
  const keyword = searchInput.value.toLowerCase().trim();
  const prefFilter = filterStatus.value;

  // Filter Data
  const filtered = mudohhiiData.filter(item => {
    const matchName = item.nama.toLowerCase().includes(keyword);
    const matchPref = prefFilter === 'semua' || item.metodePengambilan === prefFilter;
    return matchName && matchPref;
  });

  listCount.textContent = `${filtered.length} Data`;

  if (filtered.length === 0) {
    mudohhiiContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🐑</div>
        <p>Tidak ada data mudohhii ditemukan</p>
      </div>
    `;
    return;
  }

  mudohhiiContainer.innerHTML = filtered.map((item, index) => {
    let prefClass = 'badge-belum';
    let prefIcon = '⏳';
    let cardStatusClass = 'status-card-belum';

    if (item.metodePengambilan === 'Diambil') {
      prefClass = 'badge-diambil';
      prefIcon = '📦';
      cardStatusClass = 'status-card-diambil';
    } else if (item.metodePengambilan === 'Diantar') {
      prefClass = 'badge-diantar';
      prefIcon = '🚚';
      cardStatusClass = 'status-card-diantar';
    }

    return `
      <div class="mudohhii-card ${cardStatusClass}" data-id="${item.id}" style="animation-delay: ${index * 0.05}s">
        <div class="card-header">
          <div class="card-number-name">
            <span class="card-number">#${index + 1}</span>
            <h3 class="card-name">${escapeHtml(item.nama)}</h3>
          </div>
          <span class="card-hewan">🐑 ${escapeHtml(item.hewan)}</span>
        </div>
        
        <!-- Meat details (Renamed Yield to Hasil) -->
        <div class="card-details-row">
          <span class="detail-badge">⚖️ Berat: <span>${item.berat || 0}</span> kg</span>
          <span class="detail-badge">🛍️ Hasil: <span>${item.totalBungkus || 0}</span> bks</span>
          <span class="detail-badge">👤 Jatah: <span>${item.jatahMudhohi || 0}</span> bks</span>
        </div>
        
        <div class="card-permintaan-box">
          <div class="card-permintaan-title">Permintaan Khusus</div>
          <p class="card-permintaan-text">${escapeHtml(item.permintaan)}</p>
        </div>

        <!-- Progress Status Toggles -->
        <div class="card-progress-toggles">
          <button class="toggle-status-btn toggle-sembelih ${item.disembelih ? 'status-sudah' : 'status-belum'}" onclick="toggleDisembelih(${item.id})">
            ${item.disembelih ? '🔪 Sudah disembelih' : '⏳ Belum disembelih'}
          </button>
          <button class="toggle-status-btn toggle-distribusi ${item.didistribusikan ? 'status-sudah' : 'status-belum'}" onclick="toggleDidistribusikan(${item.id})">
            ${item.didistribusikan ? '🎁 Sudah didistribusi' : '⏳ Belum didistribusi'}
          </button>
        </div>
        
        <div class="card-footer">
          <span class="card-status-badge ${prefClass}">
            ${prefIcon} Preferensi: ${escapeHtml(item.metodePengambilan)}
          </span>
          <div class="card-actions">
            <button class="btn-icon-only btn-edit" onclick="openEditModal(${item.id})" aria-label="Edit Data">✏️</button>
            <button class="btn-icon-only btn-delete" onclick="triggerDelete(${item.id})" aria-label="Hapus Data">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Direct progress toggles
window.toggleDisembelih = function(id) {
  const item = mudohhiiData.find(d => d.id === id);
  if (!item) return;

  item.disembelih = !item.disembelih;
  saveDataToStorage();
  updateAppView();
};

window.toggleDidistribusikan = function(id) {
  const item = mudohhiiData.find(d => d.id === id);
  if (!item) return;

  item.didistribusikan = !item.didistribusikan;
  saveDataToStorage();
  updateAppView();
};

// Render Animal summary item rows (Aligned table columns, full name)
function renderAnimalSummary() {
  if (mudohhiiData.length === 0) {
    animalSummaryContainer.innerHTML = `
      <div style="grid-column: span 4; text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 20px;">
        Belum ada data hewan kurban.
      </div>
    `;
    return;
  }

  animalSummaryContainer.innerHTML = mudohhiiData.map((item, index) => `
    <div class="animal-summary-item">
      <span class="summary-name" title="${escapeHtml(item.nama)}">#${index + 1} ${escapeHtml(item.nama)}</span>
      <span class="summary-stat text-center"><span>${item.berat || 0} kg</span></span>
      <span class="summary-stat text-center"><span>${item.totalBungkus || 0} bks</span></span>
      <span class="summary-stat text-center"><span>${item.jatahMudhohi || 0} bks</span></span>
    </div>
  `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
  // Search
  searchInput.addEventListener('input', () => {
    clearSearchBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
    renderList();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    renderList();
  });

  // Filter
  filterStatus.addEventListener('change', renderList);

  // Add Buttons
  fabAdd.addEventListener('click', openAddModal);
  if (btnAddDesktop) {
    btnAddDesktop.addEventListener('click', openAddModal);
  }

  // Modal Cancel & Close
  modalClose.addEventListener('click', closeModal);
  formCancelBtn.addEventListener('click', closeModal);

  // Form Submit
  mudohhiiForm.addEventListener('submit', handleFormSubmit);

  // Confirm Modal
  confirmCancel.addEventListener('click', closeConfirmModal);
  confirmOk.addEventListener('click', executeDelete);

  // PDF Export
  btnPdf.addEventListener('click', exportToPDF);

  // Distribution Inputs global settings change
  const handleSettingsChange = () => {
    distSettings.pengurus = parseInt(inputPengurus.value) || 0;
    distSettings.tetangga = parseInt(inputTetangga.value) || 0;
    distSettings.team = parseInt(inputTeam.value) || 0;
    saveSettingsToStorage();
    renderMeatCalculations(true); // Recalculate and auto fill Halaqoh sisa
  };

  inputPengurus.addEventListener('input', handleSettingsChange);
  inputTetangga.addEventListener('input', handleSettingsChange);
  inputTeam.addEventListener('input', handleSettingsChange);

  // Halaqoh manual input change listener
  inputHalaqoh.addEventListener('input', () => {
    distSettings.halaqoh = parseInt(inputHalaqoh.value) || 0;
    saveSettingsToStorage();
    renderMeatCalculations(false); // Do not recalculate remainder when user overrides it
  });

  // Cloud Sync is automated in background

  // Mobile Tabs Switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const targetTab = button.getAttribute('data-tab');
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${targetTab}-panel`) {
          panel.classList.add('active');
        }
      });
    });
  });
}

// Open modal to Add
function openAddModal() {
  modalTitle.textContent = "Tambah Mudohhii";
  formId.value = "";
  mudohhiiForm.reset();
  formHewan.value = "Domba";
  formMetode.value = "Belum Ditentukan";
  formStatusSembelih.value = "Belum";
  formStatusDistribusi.value = "Belum";
  
  // Weights fields are blank by default now
  formBerat.value = "";
  formTotalBungkus.value = "";
  formJatahMudhohi.value = "";

  formModal.classList.add('active');
  formNama.focus();
}

// Open modal to Edit (populate empty fields with blanks)
window.openEditModal = function(id) {
  const item = mudohhiiData.find(d => d.id === id);
  if (!item) return;

  modalTitle.textContent = "Edit Mudohhii";
  formId.value = item.id;
  formNama.value = item.nama;
  formHewan.value = item.hewan;
  
  // If weights are 0, display as blank string
  formBerat.value = item.berat || "";
  formTotalBungkus.value = item.totalBungkus || "";
  formJatahMudhohi.value = item.jatahMudhohi || "";
  
  formPermintaan.value = item.permintaan;
  formMetode.value = item.metodePengambilan;
  formStatusSembelih.value = item.disembelih ? 'Sudah' : 'Belum';
  formStatusDistribusi.value = item.didistribusikan ? 'Sudah' : 'Belum';

  formModal.classList.add('active');
  formNama.focus();
};

// Close modal
function closeModal() {
  formModal.classList.remove('active');
  mudohhiiForm.reset();
}

// Form Submit (Add / Edit) - optional weight fields
function handleFormSubmit(e) {
  e.preventDefault();

  const idVal = formId.value;
  const nama = formNama.value.trim();
  const hewan = formHewan.value;
  
  // Empty values default to 0
  const berat = formBerat.value === "" ? 0 : parseFloat(formBerat.value);
  const totalBungkus = formTotalBungkus.value === "" ? 0 : parseInt(formTotalBungkus.value);
  const jatahMudhohi = formJatahMudhohi.value === "" ? 0 : parseInt(formJatahMudhohi.value);
  
  const permintaan = formPermintaan.value.trim();
  const metodePengambilan = formMetode.value;
  const disembelih = formStatusSembelih.value === 'Sudah';
  const didistribusikan = formStatusDistribusi.value === 'Sudah';

  if (jatahMudhohi > totalBungkus) {
    alert("Jatah Mudhohi tidak boleh melebihi Total Bungkus Hasil Kurban!");
    return;
  }

  if (idVal) {
    const id = parseInt(idVal);
    const index = mudohhiiData.findIndex(item => item.id === id);
    if (index !== -1) {
      mudohhiiData[index] = { id, nama, hewan, berat, totalBungkus, jatahMudhohi, permintaan, metodePengambilan, disembelih, didistribusikan };
    }
  } else {
    const nextId = mudohhiiData.length > 0 ? Math.max(...mudohhiiData.map(item => item.id)) + 1 : 1;
    mudohhiiData.push({ id: nextId, nama, hewan, berat, totalBungkus, jatahMudhohi, permintaan, metodePengambilan, disembelih, didistribusikan });
  }

  saveDataToStorage();
  updateAppView();
  closeModal();
}

// Trigger Delete Confirmation Modal
window.triggerDelete = function(id) {
  const item = mudohhiiData.find(d => d.id === id);
  if (!item) return;

  deleteTargetId = id;
  confirmMessage.innerHTML = `Apakah Anda yakin ingin menghapus data kurban atas nama <strong>${escapeHtml(item.nama)}</strong>?`;
  confirmModal.classList.add('active');
};

// Close Delete Confirmation Modal
function closeConfirmModal() {
  confirmModal.classList.remove('active');
  deleteTargetId = null;
}

// Execute Delete Action
function executeDelete() {
  if (deleteTargetId !== null) {
    mudohhiiData = mudohhiiData.filter(item => item.id !== deleteTargetId);
    saveDataToStorage();
    updateAppView();
  }
  closeConfirmModal();
}

// Format Date Utility
function formatTanggal(date) {
  const bulanNama = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return `${date.getDate()} ${bulanNama[date.getMonth()]} ${date.getFullYear()}`;
}

// ----------------------------------------------------
// CLOUD SYNC FUNCTIONS (Collaborative Real-time Database)
// ----------------------------------------------------

function connectToCloud(sessionId, showFeedback = true) {
  syncSessionId = sessionId;
  syncEnabled = true;
  
  localStorage.setItem('mudohhii_sync_session_id', sessionId);
  localStorage.setItem('mudohhii_sync_enabled', 'true');
  
  if (showFeedback) {
    showSyncStatus("Menghubungkan ke awan...", "var(--text-muted)");
  }

  // Poll cloud database for updates
  fetchCloudData(showFeedback);
  startCloudSyncPolling();
}

function fetchCloudData(showFeedback = true) {
  if (!syncSessionId) return;

  // Append timestamp parameter to bypass browser/Vercel cache
  fetch(SYNC_BUCKET_URL + syncSessionId + "?t=" + new Date().getTime())
    .then(res => {
      if (res.status === 200) {
        return res.json();
      } else if (res.status === 404) {
        // Session does not exist yet, push our current local state to initialize it
        saveToCloud();
        if (showFeedback) {
          showSyncStatus(`Sesi baru "${syncSessionId}" berhasil dibuat di awan!`, "var(--success)");
        }
        return null;
      } else {
        throw new Error("Gagal mengambil data.");
      }
    })
    .then(cloudState => {
      if (cloudState && cloudState.data) {
        // Successfully loaded from cloud, overwrite local data and settings
        mudohhiiData = cloudState.data;
        if (cloudState.settings) {
          distSettings = cloudState.settings;
          inputPengurus.value = distSettings.pengurus;
          inputTetangga.value = distSettings.tetangga;
          inputTeam.value = distSettings.team;
          inputHalaqoh.value = distSettings.halaqoh !== undefined ? distSettings.halaqoh : 0;
        }

        // Save local
        localStorage.setItem('mudohhii_data', JSON.stringify(mudohhiiData));
        localStorage.setItem('mudohhii_dist_settings', JSON.stringify(distSettings));
        
        // Re-render UI
        renderDashboard();
        renderMeatCalculations(false); // Do not recalculate Halaqoh (use loaded settings)
        renderList();
        renderAnimalSummary();

        if (showFeedback) {
          showSyncStatus(`Terhubung dan tersinkronisasi! Sesi: ${syncSessionId}`, "var(--success)");
        }
      }
    })
    .catch(err => {
      console.warn("Sync Error: ", err);
      if (showFeedback) {
        showSyncStatus("Sinkronisasi gagal, periksa koneksi internet.", "var(--danger)");
      }
    });
}

function saveToCloud() {
  if (!syncSessionId) return;

  const payload = {
    data: mudohhiiData,
    settings: {
      pengurus: parseInt(inputPengurus.value) || 0,
      tetangga: parseInt(inputTetangga.value) || 0,
      team: parseInt(inputTeam.value) || 0,
      halaqoh: parseInt(inputHalaqoh.value) || 0
    }
  };

  fetch(SYNC_BUCKET_URL + syncSessionId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (res.status !== 200 && res.status !== 201) {
      console.warn("Cloud save failed: Status code ", res.status);
    }
  })
  .catch(err => console.error("Cloud Save HTTP Error: ", err));
}

function startCloudSyncPolling() {
  stopCloudSyncPolling();
  // Poll cloud data every 5 seconds to keep devices in sync
  syncIntervalId = setInterval(() => {
    fetchCloudData(false);
  }, 5000);
}

function stopCloudSyncPolling() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

function showSyncStatus(msg, color) {
  console.log(`[Cloud Sync Status] ${msg}`);
}

// Export to PDF with two pages (Page 1: Requests & Status, Page 2: Weights, Yields & Distribution List)
function exportToPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("Pustaka PDF gagal dimuat. Harap periksa koneksi internet Anda.");
    return;
  }

  try {
    const doc = new window.jspdf.jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ----------------------------------------------------
    // PAGE 1: KOP SURAT + DAFTAR MUDOHHII & PERMINTAAN
    // ----------------------------------------------------

    // Kop Surat
    const logoX = 14;
    const logoY = 12;
    const logoSize = 26;
    
    if (typeof LOGO_BASE64 !== 'undefined') {
      doc.addImage(LOGO_BASE64, 'JPEG', logoX, logoY, logoSize, logoSize);
    }

    const headerStartX = logoX + logoSize + 4;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 46, 138); // Primary #0A2E8A
    doc.text("YAYASAN CAHAYA GENERASI MULIA SAHABAT", headerStartX, 15);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("AKTA NOTARIS NO. 1 TANGGAL 7 FEBRUARI 2026", headerStartX, 19.5);
    doc.text("KEPUTUSAN MENTERI HUKUM DAN HAM NO. AHU-0003904.AHA.01.04. Tahun 2026", headerStartX, 23.5);
    
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Sekretariat: Kp. Cibuntu No. 42 Desa Cilame Kec. Ngamprah Kab. Bandung Barat, Jawa Barat", headerStartX, 27.5);
    doc.text("Telp: +6285860542479  |  Email: yayasan.cgm.sahabat@gmail.com", headerStartX, 31.5);

    // Double Line Border
    doc.setLineWidth(0.8);
    doc.setDrawColor(10, 46, 138);
    doc.line(14, 41, pageWidth - 14, 41);
    doc.setLineWidth(0.2);
    doc.setDrawColor(0, 101, 141);
    doc.line(14, 42.2, pageWidth - 14, 42.2);

    // Document Title Page 1 (Qurban Yayasan CGMS Tahun 1447 H)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(10, 46, 138);
    doc.text("LAPORAN DAFTAR MUDOHHII & PROGRES KURBAN 1447 H", pageWidth / 2, 51, { align: 'center' });

    // Print Date
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Tanggal Cetak: ${formatTanggal(new Date())}`, pageWidth - 14, 57, { align: 'right' });

    // Table 1 Data: No, Nama, Hewan, Permintaan, Preferensi Pengambilan, Sembelih, Distribusi
    const columns1 = [
      { header: 'No', dataKey: 'no' },
      { header: 'Nama Mudohhii', dataKey: 'nama' },
      { header: 'Hewan', dataKey: 'hewan' },
      { header: 'Permintaan Khusus', dataKey: 'permintaan' },
      { header: 'Preferensi', dataKey: 'preferensi' },
      { header: 'Sembelih', dataKey: 'sembelih' },
      { header: 'Distribusi', dataKey: 'distribusi' }
    ];

    const rows1 = mudohhiiData.map((item, index) => ({
      no: (index + 1).toString(),
      nama: item.nama,
      hewan: item.hewan,
      permintaan: item.permintaan,
      preferensi: item.metodePengambilan,
      sembelih: item.disembelih ? 'Sudah' : 'Belum',
      distribusi: item.didistribusikan ? 'Sudah' : 'Belum'
    }));

    doc.autoTable({
      startY: 60,
      columns: columns1,
      body: rows1,
      theme: 'grid',
      styles: { font: 'Helvetica', fontSize: 8, cellPadding: 2, valign: 'middle' },
      headStyles: { fillColor: [10, 46, 138], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        no: { cellWidth: 8, halign: 'center' },
        nama: { cellWidth: 32, fontStyle: 'bold' },
        hewan: { cellWidth: 14, halign: 'center' },
        permintaan: { cellWidth: 70 },
        preferensi: { cellWidth: 22, halign: 'center' },
        sembelih: { cellWidth: 18, halign: 'center' },
        distribusi: { cellWidth: 18, halign: 'center' }
      },
      alternateRowStyles: { fillColor: [247, 250, 252] },
      margin: { left: 14, right: 14 }
    });

    // ----------------------------------------------------
    // PAGE 2: HASIL TIMBANGAN & KALKULASI DISTRIBUSI DAGING
    // ----------------------------------------------------
    doc.addPage();

    // Small header on Page 2
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(10, 46, 138);
    doc.text("YAYASAN CAHAYA GENERASI MULIA SAHABAT", 14, 15);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Laporan Hasil Timbangan & Alokasi Distribusi Daging Kurban 1447 H", 14, 19);
    doc.setLineWidth(0.25);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 21, pageWidth - 14, 21);

    // Section Title 1: Hasil Per Hewan
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(10, 46, 138);
    doc.text("I. RINCIAN HASIL DAN JATAH PER HEWAN KURBAN", 14, 29);

    // Table 2 Data: No, Nama, Berat, Total Bungkus, Jatah Mudhohi, Sisa Distribusi
    const columns2 = [
      { header: 'No', dataKey: 'no' },
      { header: 'Nama Mudohhii', dataKey: 'nama' },
      { header: 'Berat Hewan', dataKey: 'berat' },
      { header: 'Total Bungkus', dataKey: 'totalBungkus' },
      { header: 'Jatah Mudhohi', dataKey: 'jatah' },
      { header: 'Sisa Distribusi', dataKey: 'sisa' }
    ];

    const rows2 = mudohhiiData.map((item, index) => {
      const sisa = (item.totalBungkus || 0) - (item.jatahMudhohi || 0);
      return {
        no: (index + 1).toString(),
        nama: item.nama,
        berat: `${item.berat || 0} kg`,
        totalBungkus: `${item.totalBungkus || 0} bks`,
        jatah: `${item.jatahMudhohi || 0} bks`,
        sisa: `${sisa} bks`
      };
    });

    doc.autoTable({
      startY: 33,
      columns: columns2,
      body: rows2,
      theme: 'grid',
      styles: { font: 'Helvetica', fontSize: 8.5, cellPadding: 2.5, valign: 'middle' },
      headStyles: { fillColor: [0, 101, 141], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        no: { cellWidth: 10, halign: 'center' },
        nama: { cellWidth: 55, fontStyle: 'bold' },
        berat: { cellWidth: 28, halign: 'center' },
        totalBungkus: { cellWidth: 30, halign: 'center' },
        jatah: { cellWidth: 30, halign: 'center' },
        sisa: { cellWidth: 29, halign: 'center' }
      },
      alternateRowStyles: { fillColor: [247, 250, 252] },
      margin: { left: 14, right: 14 }
    });

    // Calculations summary
    const totalBerat = mudohhiiData.reduce((sum, item) => sum + (parseFloat(item.berat) || 0), 0);
    const totalBungkus = mudohhiiData.reduce((sum, item) => sum + (parseInt(item.totalBungkus) || 0), 0);
    const totalJatahMudhohi = mudohhiiData.reduce((sum, item) => sum + (parseInt(item.jatahMudhohi) || 0), 0);
    
    const pengurusVal = parseInt(inputPengurus.value) || 0;
    const tetanggaVal = parseInt(inputTetangga.value) || 0;
    const teamVal = parseInt(inputTeam.value) || 0;
    const halaqohVal = parseInt(inputHalaqoh.value) || 0;

    let finalY = doc.lastAutoTable.finalY + 8;
    if (finalY > 195) {
      doc.addPage();
      finalY = 25;
    }

    // Section Title 2: Distribusi Prioritas
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(10, 46, 138);
    doc.text("II. REKAPITULASI PRIORITAS DISTRIBUSI DAGING KURBAN", 14, finalY);

    // Distribution Table
    const columnsDist = [
      { header: 'No', dataKey: 'no' },
      { header: 'Kategori Penerima Distribusi', dataKey: 'kategori' },
      { header: 'Jumlah Alokasi (Bungkus)', dataKey: 'jumlah' },
      { header: 'Keterangan Prioritas', dataKey: 'keterangan' }
    ];

    const rowsDist = [
      { no: '1', kategori: 'Jatah Mudhohi (Mudhohhi)', jumlah: `${totalJatahMudhohi} bks`, keterangan: 'Prioritas Utama (Hak Mudhohi)' },
      { no: '2', kategori: 'Pengurus Yayasan', jumlah: `${pengurusVal} bks`, keterangan: 'Prioritas Kedua (Pengurus & Panitia)' },
      { no: '3', kategori: 'Tetangga Ofik', jumlah: `${tetanggaVal} bks`, keterangan: 'Prioritas Ketiga (Masyarakat Sekitar)' },
      { no: '4', kategori: 'Team Qurban (Relawan)', jumlah: `${teamVal} bks`, keterangan: 'Prioritas Keempat (Tenaga Kerja Pelaksana)' },
      { no: '5', kategori: 'Halaqoh (Sisa)', jumlah: `${halaqohVal} bks`, keterangan: 'Prioritas Kelima (Sisa dibagikan merata)' }
    ];

    doc.autoTable({
      startY: finalY + 4,
      columns: columnsDist,
      body: rowsDist,
      theme: 'grid',
      styles: { font: 'Helvetica', fontSize: 8.5, cellPadding: 3, valign: 'middle' },
      headStyles: { fillColor: [0, 145, 159], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        no: { cellWidth: 10, halign: 'center' },
        kategori: { cellWidth: 65, fontStyle: 'bold' },
        jumlah: { cellWidth: 42, halign: 'center', fontStyle: 'bold' },
        keterangan: { cellWidth: 65 }
      },
      alternateRowStyles: { fillColor: [247, 250, 252] },
      margin: { left: 14, right: 14 }
    });

    // Final calculations summary card below the table
    let sumY = doc.lastAutoTable.finalY + 8;
    if (sumY > 235) {
      doc.addPage();
      sumY = 25;
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(14, sumY, pageWidth - 28, 14, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.rect(14, sumY, pageWidth - 28, 14, 'S');

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(10, 46, 138);
    doc.text(`TOTAL KESELURUHAN HEWAN: ${mudohhiiData.length} Domba`, 18, sumY + 5);
    doc.text(`TOTAL BERAT HEWAN: ${totalBerat} kg  |  TOTAL HASIL BUNGKUS DAGING: ${totalBungkus} bks`, 18, sumY + 10);

    // Signatures
    let sigY = sumY + 24;
    if (sigY > 260) {
      doc.addPage();
      sigY = 25;
    }

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Ngamprah, " + formatTanggal(new Date()), 142, sigY);
    doc.text("Yayasan Cahaya Generasi Mulia Sahabat,", 130, sigY + 5);
    doc.text("Panitia Pelaksana Kurban,", 140, sigY + 10);
    
    doc.setLineWidth(0.2);
    doc.setDrawColor(148, 163, 184);
    doc.line(130, sigY + 32, 192, sigY + 32);

    doc.setFont("Helvetica", "bold");
    doc.text("Ketua Panitia Kurban", 143, sigY + 37);

    // Save/Download
    doc.save(`Laporan_Kurban_CGMS_1447H_${new Date().toISOString().slice(0,10)}.pdf`);

  } catch (error) {
    console.error("PDF generation error: ", error);
    alert("Gagal mengekspor PDF. Pastikan data terisi dengan benar.");
  }
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// PWA Service Worker Registration (Disabled and Unregistered to prevent aggressive cache serving)
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
        console.log('Active Service Worker Unregistered successfully');
      }
    }).catch(err => console.warn('Failed to unregister Service Worker', err));
  }
}

// PWA Install banner
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  pwaBanner.classList.add('show');
});

if (pwaBtnInstall) {
  pwaBtnInstall.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        deferredPrompt = null;
        pwaBanner.classList.remove('show');
      });
    }
  });
}

if (pwaBtnClose) {
  pwaBtnClose.addEventListener('click', () => {
    pwaBanner.classList.remove('show');
  });
}
