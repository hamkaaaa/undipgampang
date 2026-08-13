/**
 * Popup Controller Script for UndipGampang v3.0
 * Handles Schedule Exporter, Glassmorphism Customizer, & Desktop Pet Suite
 */

document.addEventListener('DOMContentLoaded', () => {
  let parsedCourses = [];
  let parsedMeetings = [];
  let currentMode = 'specific';
  let selectedTheme = 'cyberpunk';

  // Navigation Tabs
  const tabBtnSchedule = document.getElementById('tab-btn-schedule');
  const tabBtnCustomizer = document.getElementById('tab-btn-customizer');
  const tabContentSchedule = document.getElementById('tab-content-schedule');
  const tabContentCustomizer = document.getElementById('tab-content-customizer');

  tabBtnSchedule.addEventListener('click', () => {
    tabBtnSchedule.classList.add('active');
    tabBtnCustomizer.classList.remove('active');
    tabContentSchedule.style.display = 'flex';
    tabContentCustomizer.style.display = 'none';
  });

  tabBtnCustomizer.addEventListener('click', () => {
    tabBtnCustomizer.classList.add('active');
    tabBtnSchedule.classList.remove('active');
    tabContentCustomizer.style.display = 'flex';
    tabContentSchedule.style.display = 'none';
  });

  // DOM Elements (Schedule Exporter)
  const statusCard = document.getElementById('status-card');
  const statusIcon = document.getElementById('status-icon');
  const statusText = document.getElementById('status-text');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const startDateInput = document.getElementById('start-date');
  const weeksCountInput = document.getElementById('weeks-count');
  const configWeeklyCard = document.getElementById('config-weekly-card');
  const courseCountSpan = document.getElementById('course-count');
  const courseListContainer = document.getElementById('course-list');
  const btnReload = document.getElementById('btn-reload');
  const btnExportICS = document.getElementById('btn-export-ics');
  const btnExportCSV = document.getElementById('btn-export-csv');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  const labelModeSpecific = document.getElementById('label-mode-specific');
  const labelModeWeekly = document.getElementById('label-mode-weekly');
  const modeRadios = document.getElementsByName('export-mode');

  // DOM Elements (Customizer & Desktop Pet)
  const popupSelectPet = document.getElementById('popup-select-pet');
  const popupCustomPetUrl = document.getElementById('popup-custom-pet-url');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const popupWallpaperUrl = document.getElementById('popup-wallpaper-url');
  const popupAvatarUrl = document.getElementById('popup-avatar-url');
  const popupGreetingText = document.getElementById('popup-greeting-text');
  const btnSaveCustomizer = document.getElementById('btn-save-popup-customizer');

  // Mode switcher listener
  modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentMode = e.target.value;
      if (currentMode === 'weekly') {
        labelModeWeekly.classList.add('active');
        labelModeSpecific.classList.remove('active');
        configWeeklyCard.style.display = 'block';
      } else {
        labelModeSpecific.classList.add('active');
        labelModeWeekly.classList.remove('active');
        configWeeklyCard.style.display = 'none';
      }
      renderPreview();
    });
  });

  // Theme preset selector
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTheme = btn.getAttribute('data-theme');
    });
  });

  // Save Customizer & Pet Settings button
  btnSaveCustomizer.addEventListener('click', () => {
    const settings = {
      theme: selectedTheme,
      petPreset: popupSelectPet.value,
      customPetUrl: popupCustomPetUrl.value.trim(),
      wallpaperUrl: popupWallpaperUrl.value.trim(),
      customAvatarUrl: popupAvatarUrl.value.trim(),
      customGreeting: popupGreetingText.value.trim(),
      enablePet: true
    };

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'applyCustomizerSettings',
            settings: settings
          });
        }
      });
    }

    try {
      localStorage.setItem('undip_gampang_customizer_settings', JSON.stringify(settings));
    } catch (e) {}

    alert('✅ Tema & Desktop Pet Mascot Berhasil Diterapkan di SIAP UNDIP!');
  });

  // Attempt to extract from active tab
  extractFromActiveTab();

  // Reload button
  btnReload.addEventListener('click', () => extractFromActiveTab());

  // Drop zone events
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      updateStatus('warning', '⚠️ Harap pilih file .html atau .htm yang valid.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const htmlContent = event.target.result;
      if (window.UndipParser) {
        parsedCourses = window.UndipParser.parseUndipSchedule(htmlContent);
        parsedMeetings = window.UndipParser.parseUndipAttendanceModal(htmlContent);

        if (parsedMeetings.length > 0) {
          updateStatus('success', `🎯 Terdeteksi ${parsedMeetings.length} sesi pertemuan presisi dari file "${file.name}"!`);
        } else if (parsedCourses.length > 0) {
          updateStatus('success', `✅ Berhasil membaca ${parsedCourses.length} mata kuliah dari file "${file.name}".`);
        } else {
          updateStatus('warning', `⚠️ Tidak dapat menemukan tabel jadwal dalam file "${file.name}".`);
        }
        renderPreview();
      }
    };
    reader.readAsText(file);
  }

  function extractFromActiveTab() {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        const activeTab = tabs[0];

        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            func: () => document.documentElement.outerHTML
          },
          (results) => {
            if (chrome.runtime.lastError || !results || !results[0]) {
              updateStatus('info', '💡 Buka SIAP UNDIP atau drag & drop file HTML di bawah.');
              return;
            }

            const html = results[0].result;
            if (window.UndipParser) {
              parsedCourses = window.UndipParser.parseUndipSchedule(html);
              parsedMeetings = window.UndipParser.parseUndipAttendanceModal(html);

              if (parsedMeetings.length > 0) {
                updateStatus('success', `🎯 Terdeteksi ${parsedMeetings.length} sesi pertemuan presisi dari modal aktif!`);
              } else if (parsedCourses.length > 0) {
                updateStatus('success', `✅ Berhasil mendeteksi ${parsedCourses.length} mata kuliah dari tab aktif!`);
              } else {
                updateStatus('info', '💡 Tab aktif bukan halaman jadwal SIAP. Drag & drop file HTML di bawah.');
              }
              renderPreview();
            }
          }
        );
      });
    } else {
      updateStatus('info', '💡 Mode Pratinjau. Drag & drop file HTML di bawah.');
    }
  }

  function updateStatus(type, message) {
    statusCard.className = `status-card ${type}`;
    if (type === 'success') statusIcon.textContent = '🎯';
    else if (type === 'warning') statusIcon.textContent = '⚠️';
    else statusIcon.textContent = '🔍';

    statusText.textContent = message;
  }

  function renderPreview() {
    if (currentMode === 'specific' && parsedMeetings.length > 0) {
      courseCountSpan.textContent = `${parsedMeetings.length} Pertemuan`;
      btnExportICS.disabled = false;
      btnExportCSV.disabled = false;
      btnCopySummary.disabled = false;

      courseListContainer.innerHTML = parsedMeetings.map(m => `
        <div class="course-card">
          <div class="course-top">
            <span class="course-name">${escapeHtml(m.courseName)} (P-${m.meetingNum})</span>
            <span class="sks-badge">${m.dayName}</span>
          </div>
          <div class="course-meta">
            <span class="meta-item meta-day">📅 ${m.date}</span>
            <span class="meta-item">⏰ ${m.startTime} - ${m.endTime}</span>
          </div>
        </div>
      `).join('');
    } else if (parsedCourses.length > 0) {
      courseCountSpan.textContent = `${parsedCourses.length} Mata Kuliah`;
      btnExportICS.disabled = false;
      btnExportCSV.disabled = false;
      btnCopySummary.disabled = false;

      courseListContainer.innerHTML = parsedCourses.map(course => `
        <div class="course-card">
          <div class="course-top">
            <span class="course-name">${escapeHtml(course.name)}</span>
            <span class="sks-badge">${course.sks} SKS</span>
          </div>
          <div class="course-meta">
            <span class="meta-item meta-day">📅 ${course.dayName}</span>
            <span class="meta-item">⏰ ${course.startTime} - ${course.endTime}</span>
            <span class="meta-item">📍 ${escapeHtml(course.room)}</span>
          </div>
        </div>
      `).join('');
    } else {
      courseCountSpan.textContent = '0';
      courseListContainer.innerHTML = `
        <div class="empty-state">
          <p>Belum ada jadwal yang terdeteksi.</p>
          <p class="sub">Buka SIAP UNDIP atau upload file HTML.</p>
        </div>
      `;
      btnExportICS.disabled = true;
      btnExportCSV.disabled = true;
      btnCopySummary.disabled = true;
    }
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Export Handlers
  btnExportICS.addEventListener('click', () => {
    if (!window.UndipExporter) return;

    let icsContent = '';
    let filename = 'Jadwal_Kuliah_UNDIP.ics';

    if (currentMode === 'specific' && parsedMeetings.length > 0) {
      icsContent = window.UndipExporter.generateSpecificDatesICS(parsedMeetings);
      filename = 'Jadwal_Kuliah_UNDIP_Presisi.ics';
    } else if (parsedCourses.length > 0) {
      const startDate = startDateInput.value || '2026-08-24';
      const weeksCount = weeksCountInput.value || 16;
      icsContent = window.UndipExporter.generateICS(parsedCourses, {
        semesterStartDate: startDate,
        weeksCount: weeksCount
      });
    }

    if (icsContent) {
      downloadFile(icsContent, filename, 'text/calendar;charset=utf-8;');
    }
  });

  btnExportCSV.addEventListener('click', () => {
    if (!window.UndipExporter) return;

    let csvContent = '';
    let filename = 'Jadwal_Kuliah_UNDIP.csv';

    if (currentMode === 'specific' && parsedMeetings.length > 0) {
      csvContent = window.UndipExporter.generateSpecificDatesCSV(parsedMeetings);
      filename = 'Jadwal_Kuliah_UNDIP_Presisi.csv';
    } else if (parsedCourses.length > 0) {
      const startDate = startDateInput.value || '2026-08-24';
      csvContent = window.UndipExporter.generateCSV(parsedCourses, { semesterStartDate: startDate });
    }

    if (csvContent) {
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    }
  });

  btnCopySummary.addEventListener('click', () => {
    let summary = '';
    if (currentMode === 'specific' && parsedMeetings.length > 0) {
      summary = parsedMeetings.map(m => 
        `• Pertemuan ${m.meetingNum}: ${m.courseName}\n  Tanggal: ${m.dayName}, ${m.date} (${m.startTime}-${m.endTime})`
      ).join('\n\n');
    } else if (parsedCourses.length > 0) {
      summary = parsedCourses.map(c => 
        `• ${c.name} (${c.sks} SKS)\n  Hari: ${c.dayName}, Jam: ${c.startTime}-${c.endTime}, Ruang: ${c.room}`
      ).join('\n\n');
    }

    if (summary) {
      navigator.clipboard.writeText(`--- JADWAL KULIAH UNDIP ---\n\n${summary}`).then(() => {
        alert('✅ Ringkasan jadwal berhasil disalin ke clipboard!');
      });
    }
  });

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});
