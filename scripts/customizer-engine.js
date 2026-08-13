/**
 * SIAP UNDIP Customizer Engine (UndipGampang v3.2)
 * Total Premium Glassmorphism Overhaul & Document-Attached Walking Desktop Pet
 */

(function () {
  'use me strict';

  const STORAGE_KEY = 'undip_gampang_customizer_settings';

  const PET_PRESETS = {
    pikachu: {
      name: '⚡ Pikachu',
      url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif',
      quotes: [
        'Pika Pika! Semangat SKS hari ini! ⚡',
        'Jangan lupa absen jam 09:20 ya! 🕒',
        'Sudah Her-Registrasi & IRS belum? 📝',
        'IPK 3.62 Cumlaude Squad! Mantap! 🏆',
        'Minum air putih dulu yuk biar konsen! 💧'
      ]
    },
    gengar: {
      name: '👻 Gengar',
      url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/94.gif',
      quotes: [
        'Hehe! Siap menghantui tugas-tugas perkuliahan! 👻',
        'Tugas deadline besok? Sikat sekarang! 🔥',
        'Jangan begadang berlebihan ya! 🌙',
        'Lulus tepat waktu squad! 🎓'
      ]
    },
    eevee: {
      name: '🦊 Eevee',
      url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/133.gif',
      quotes: [
        'Vee! Eevee siap nemenin belajar seharian! 🦊',
        'Istirahat 5 menit dulu yuk! ☕',
        'IPK keren, masa depan cerah! 🌟',
        'Semangat Teknik Komputer UNDIP! 💻'
      ]
    },
    cybercat: {
      name: '🐱 Cyber Cat',
      url: 'https://media.giphy.com/media/Lq0h93752f6J9tijrh/giphy.gif',
      quotes: [
        'Meow! Mode Cyberpunk SIAP UNDIP aktif! 🌌',
        'Koding dulu, santai kemudian! 💻',
        'Fokus & sikat habis semua matkul! 🚀'
      ]
    }
  };

  const THEMES = {
    cyberpunk: {
      name: 'Neon Cyberpunk 🌌',
      bg: 'linear-gradient(135deg, #090d16 0%, #111827 100%)',
      cardBg: 'rgba(15, 23, 42, 0.88)',
      cardText: '#f8fafc',
      navbarBg: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)',
      accentColor: '#06b6d4',
      glowColor: 'rgba(6, 182, 212, 0.4)'
    },
    sunset: {
      name: 'Sunset Chill 🌅',
      bg: 'linear-gradient(135deg, #2d1b2d 0%, #1f1425 100%)',
      cardBg: 'rgba(45, 27, 45, 0.88)',
      cardText: '#fdf2f8',
      navbarBg: 'linear-gradient(90deg, #4c1d95 0%, #831843 100%)',
      accentColor: '#f43f5e',
      glowColor: 'rgba(244, 63, 94, 0.4)'
    },
    emerald: {
      name: 'Emerald Fresh 🌿',
      bg: 'linear-gradient(135deg, #062c22 0%, #021a14 100%)',
      cardBg: 'rgba(6, 44, 34, 0.88)',
      cardText: '#ecfdf5',
      navbarBg: 'linear-gradient(90deg, #064e3b 0%, #022c22 100%)',
      accentColor: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.4)'
    },
    sakura: {
      name: 'Cherry Blossom 🌸',
      bg: 'linear-gradient(135deg, #2a1524 0%, #1d0e19 100%)',
      cardBg: 'rgba(42, 21, 36, 0.88)',
      cardText: '#fff1f2',
      navbarBg: 'linear-gradient(90deg, #831843 0%, #500724 100%)',
      accentColor: '#fb7185',
      glowColor: 'rgba(251, 113, 133, 0.4)'
    },
    oled: {
      name: 'OLED Deep Dark 🖤',
      bg: '#000000',
      cardBg: 'rgba(18, 18, 18, 0.92)',
      cardText: '#ffffff',
      navbarBg: '#0a0a0a',
      accentColor: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.4)'
    }
  };

  const DEFAULT_SETTINGS = {
    theme: 'cyberpunk',
    wallpaperUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    wallpaperBlur: 4,
    wallpaperOverlay: 0.45,
    customAvatarUrl: '',
    petPreset: 'pikachu',
    customPetUrl: '',
    enablePet: true,
    enableWidgets: true,
    enableMusicPlayer: true,
    customGreeting: 'Halo Hamka! ⚡ Siap taklukkan semester ini?'
  };

  let currentSettings = loadSettings();
  let petAnimFrame = null;

  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  function saveSettings(settings) {
    currentSettings = { ...currentSettings, ...settings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [STORAGE_KEY]: currentSettings });
      }
    } catch (e) {}
    applyCustomizer();
  }

  function applyCustomizer() {
    let styleTag = document.getElementById('undip-customizer-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'undip-customizer-styles';
      document.head.appendChild(styleTag);
    }

    const theme = THEMES[currentSettings.theme] || THEMES.cyberpunk;
    const bgCss = currentSettings.wallpaperUrl
      ? `background-image: linear-gradient(rgba(0,0,0,${currentSettings.wallpaperOverlay}), rgba(0,0,0,${currentSettings.wallpaperOverlay})), url('${currentSettings.wallpaperUrl}'); background-size: cover; background-position: center; background-attachment: fixed;`
      : `background: ${theme.bg};`;

    styleTag.textContent = `
      /* Global Background */
      body, body.horizontal-layout {
        ${bgCss}
        color: #ffffff !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        transition: all 0.3s ease;
        position: relative !important;
        min-height: 100vh !important;
      }

      /* Navbar Styling */
      .header-navbar {
        background: ${theme.navbarBg} !important;
        box-shadow: 0 4px 24px rgba(0,0,0,0.6) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      /* Premium Glassmorphism on ALL Cards */
      .card, .content-body .card, .profile-card-with-cover, a.web_mhs_menuitem .card, .bs-callout-warning, .bs-callout-danger {
        background: ${theme.cardBg} !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 16px !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease !important;
      }

      /* CLEAR White backgrounds from Card Headers, Footers, and Profile Nav Tabs */
      .card-header, .card-footer, .navbar-profile, .nav-tabs, .nav-item, #web_studentdashboard_tabs {
        background: transparent !important;
        background-color: transparent !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .card-header h1, .card-header h2, .card-header h3, .card-header h4, .card-header .card-title {
        color: #ffffff !important;
        font-weight: 700 !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8) !important;
      }

      /* Profile Nav Tabs Styling */
      .nav-link {
        color: rgba(241, 245, 249, 0.85) !important;
        background: rgba(30, 41, 59, 0.6) !important;
        border-radius: 8px !important;
        margin-right: 6px !important;
        padding: 6px 14px !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        transition: all 0.2s ease !important;
        text-shadow: none !important;
      }

      .nav-link.active, .nav-link:hover {
        color: #ffffff !important;
        background: linear-gradient(135deg, ${theme.accentColor} 0%, #0284c7 100%) !important;
        box-shadow: 0 4px 12px ${theme.glowColor} !important;
        border-color: ${theme.accentColor} !important;
      }

      a.web_mhs_menuitem:hover .card, .card:hover {
        transform: translateY(-5px) scale(1.01) !important;
        border-color: ${theme.accentColor} !important;
        box-shadow: 0 14px 40px ${theme.glowColor} !important;
      }

      /* Universal High-Contrast Text */
      .card-title, h1, h2, h3, h4, h5, h6, p, span, a, div, td, th, label, small, b, strong {
        color: #ffffff !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
      }

      .text-muted, small.text-muted {
        color: rgba(241, 245, 249, 0.8) !important;
      }

      /* Fix menu item headings & icons */
      a.web_mhs_menuitem h3, a.web_mhs_menuitem h4 {
        color: #38bdf8 !important;
        font-weight: 700 !important;
      }

      a.web_mhs_menuitem i, .media i {
        color: #38bdf8 !important;
        filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.6)) !important;
      }

      .badge-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.5) !important;
      }

      /* Profile Cover Banner */
      .profile-with-cover .card-img-top {
        background: linear-gradient(135deg, ${theme.accentColor} 0%, #0f172a 100%) !important;
        border-radius: 16px 16px 0 0 !important;
      }

      /* Profile Avatar Border */
      #user-profile .profile-with-cover .profil-cover-details .profile-image div.img-border {
        border: 4px solid ${theme.accentColor} !important;
        box-shadow: 0 0 20px ${theme.glowColor} !important;
      }
    `;

    // Apply custom avatar if provided
    if (currentSettings.customAvatarUrl) {
      const avatarDivs = document.querySelectorAll('.profile-image div, .dropdown-user-link div');
      avatarDivs.forEach(div => {
        div.style.backgroundImage = `url('${currentSettings.customAvatarUrl}')`;
      });
    }

    // Inject Widgets, Customizer Button, and Document-Attached Desktop Pet
    injectWidgets();
    injectFloatingCustomizerButton();
    renderWalkingDesktopPet();
  }

  function injectWidgets() {
    if (!currentSettings.enableWidgets) return;

    // Greeting Banner
    const cardTitle = document.querySelector('.profile-with-cover .card-title');
    if (cardTitle) {
      let greetingDiv = document.getElementById('undip-fun-greeting');
      if (!greetingDiv) {
        greetingDiv = document.createElement('div');
        greetingDiv.id = 'undip-fun-greeting';
        greetingDiv.style.cssText = 'font-size: 13px; font-weight: 600; color: #38bdf8; margin-top: 6px; text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);';
        cardTitle.parentNode.appendChild(greetingDiv);
      }
      greetingDiv.innerHTML = `🚀 ${escapeHtml(currentSettings.customGreeting)}`;
    }

    // GPA Badge
    const ipkBlock = document.querySelector('.card-body h3.block');
    if (ipkBlock && !document.getElementById('undip-gpa-badge')) {
      const badge = document.createElement('span');
      badge.id = 'undip-gpa-badge';
      badge.style.cssText = `
        display: inline-block;
        margin-left: 8px;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 8px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #fff;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
      `;
      badge.textContent = 'Cumlaude Squad 🏆';
      ipkBlock.appendChild(badge);
    }
  }

  function renderWalkingDesktopPet() {
    if (petAnimFrame) {
      cancelAnimationFrame(petAnimFrame);
      petAnimFrame = null;
    }

    let petContainer = document.getElementById('undip-desktop-pet');
    if (!currentSettings.enablePet) {
      if (petContainer) petContainer.remove();
      return;
    }

    const petData = PET_PRESETS[currentSettings.petPreset] || PET_PRESETS.pikachu;
    const petGifUrl = currentSettings.customPetUrl || petData.url;

    if (!petContainer) {
      petContainer = document.createElement('div');
      petContainer.id = 'undip-desktop-pet';
      // Attached to bottom of document body (scrolls naturally with page)
      petContainer.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 20px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        user-select: none;
      `;

      petContainer.innerHTML = `
        <div id="undip-pet-speech" style="
          display: none;
          position: absolute;
          bottom: 85px;
          left: -60px;
          width: 210px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(56, 189, 248, 0.5);
          border-radius: 12px;
          padding: 10px 12px;
          color: #f8fafc;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(12px);
          text-align: center;
        ">
          <span id="undip-pet-speech-text">Pika Pika! Semangat SKS hari ini! ⚡</span>
        </div>
        <img id="undip-pet-img" src="${petGifUrl}" alt="Pet Mascot" style="
          width: 70px;
          height: 70px;
          object-fit: contain;
          filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.6));
          transition: transform 0.2s ease;
        " />
      `;

      document.body.appendChild(petContainer);
    } else {
      const petImg = petContainer.querySelector('#undip-pet-img');
      if (petImg) petImg.src = petGifUrl;
    }

    // Walking Animation Loop
    let currentX = 20;
    let direction = 1; // 1 = right, -1 = left
    let isPaused = false;
    const speed = 0.8; // pixels per frame

    const petImg = petContainer.querySelector('#undip-pet-img');
    const speechBox = petContainer.querySelector('#undip-pet-speech');
    const speechText = petContainer.querySelector('#undip-pet-speech-text');

    petContainer.onclick = () => {
      isPaused = true;
      const quotes = petData.quotes || ['Semangat kuliahnya ya! 🎓'];
      speechText.textContent = quotes[Math.floor(Math.random() * quotes.length)];
      speechBox.style.display = 'block';

      petImg.style.transform = `${direction === -1 ? 'scaleX(-1)' : 'scaleX(1)'} scale(1.2)`;
      setTimeout(() => {
        petImg.style.transform = direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
      }, 200);

      setTimeout(() => {
        speechBox.style.display = 'none';
        isPaused = false;
      }, 4000);
    };

    function step() {
      if (!isPaused) {
        const maxX = (document.body.clientWidth || window.innerWidth) - 90;
        currentX += speed * direction;

        if (currentX >= maxX) {
          direction = -1;
          currentX = maxX;
        } else if (currentX <= 10) {
          direction = 1;
          currentX = 10;
        }

        petContainer.style.left = `${currentX}px`;
        petImg.style.transform = direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
      }
      petAnimFrame = requestAnimationFrame(step);
    }

    step();
  }

  function injectFloatingCustomizerButton() {
    if (document.getElementById('undip-customizer-float-btn')) return;

    const floatBtn = document.createElement('button');
    floatBtn.id = 'undip-customizer-float-btn';
    floatBtn.innerHTML = '🎨 <strong>Customize SIAP</strong>';
    floatBtn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      color: #ffffff;
      border: none;
      padding: 12px 20px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    floatBtn.addEventListener('mouseenter', () => {
      floatBtn.style.transform = 'scale(1.05) translateY(-2px)';
    });

    floatBtn.addEventListener('mouseleave', () => {
      floatBtn.style.transform = 'scale(1) translateY(0)';
    });

    floatBtn.addEventListener('click', () => openCustomizerPanel());

    document.body.appendChild(floatBtn);
  }

  function openCustomizerPanel() {
    let panel = document.getElementById('undip-customizer-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      return;
    }

    panel = document.createElement('div');
    panel.id = 'undip-customizer-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 99999;
      width: 320px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(16px);
    `;

    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="margin: 0; color: #38bdf8; font-size: 15px;">🎨 Customizer SIAP UNDIP</h4>
        <button id="btn-close-panel" style="background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer;">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto;">
        <div>
          <label style="font-size: 11px; color: #94a3b8;">Pilih Tema Preset</label>
          <select id="select-theme" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; font-size: 12px; margin-top: 4px;">
            ${Object.keys(THEMES).map(k => `<option value="${k}" ${currentSettings.theme === k ? 'selected' : ''}>${THEMES[k].name}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size: 11px; color: #94a3b8;">Pilih Desktop Pet Mascot (GIF)</label>
          <select id="select-pet" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; font-size: 12px; margin-top: 4px;">
            ${Object.keys(PET_PRESETS).map(k => `<option value="${k}" ${currentSettings.petPreset === k ? 'selected' : ''}>${PET_PRESETS[k].name}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size: 11px; color: #94a3b8;">URL Pet GIF Custom (Opsional)</label>
          <input type="text" id="input-pet-url" value="${escapeHtml(currentSettings.customPetUrl)}" placeholder="Paste URL GIF Pet Favorit" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; font-size: 12px; margin-top: 4px;" />
        </div>

        <div>
          <label style="font-size: 11px; color: #94a3b8;">URL Wallpaper Latar</label>
          <input type="text" id="input-wallpaper" value="${escapeHtml(currentSettings.wallpaperUrl)}" placeholder="Paste URL Gambar Wallpaper" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; font-size: 12px; margin-top: 4px;" />
        </div>

        <div>
          <label style="font-size: 11px; color: #94a3b8;">Kegelapan Overlay Wallpaper (${currentSettings.wallpaperOverlay})</label>
          <input type="range" id="range-overlay" min="0" max="0.9" step="0.05" value="${currentSettings.wallpaperOverlay}" style="width: 100%; margin-top: 4px;" />
        </div>

        <div>
          <label style="font-size: 11px; color: #94a3b8;">URL Foto Profil (Avatar)</label>
          <input type="text" id="input-avatar" value="${escapeHtml(currentSettings.customAvatarUrl)}" placeholder="Paste URL Foto Profil Baru" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; font-size: 12px; margin-top: 4px;" />
        </div>

        <div>
          <label style="font-size: 11px; color: #94a3b8;">Pesan Sapaan Fun</label>
          <input type="text" id="input-greeting" value="${escapeHtml(currentSettings.customGreeting)}" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; font-size: 12px; margin-top: 4px;" />
        </div>

        <button id="btn-save-customizer" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 6px;">
          💾 Simpan & Terapkan
        </button>
      </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector('#btn-close-panel').addEventListener('click', () => {
      panel.style.display = 'none';
    });

    panel.querySelector('#btn-save-customizer').addEventListener('click', () => {
      saveSettings({
        theme: panel.querySelector('#select-theme').value,
        petPreset: panel.querySelector('#select-pet').value,
        customPetUrl: panel.querySelector('#input-pet-url').value.trim(),
        wallpaperUrl: panel.querySelector('#input-wallpaper').value.trim(),
        wallpaperOverlay: parseFloat(panel.querySelector('#range-overlay').value),
        customAvatarUrl: panel.querySelector('#input-avatar').value.trim(),
        customGreeting: panel.querySelector('#input-greeting').value.trim()
      });
      alert('✅ Pengaturan Tema & Walking Desktop Pet berhasil diterapkan!');
    });
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyCustomizer);
  } else {
    applyCustomizer();
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'applyCustomizerSettings') {
        saveSettings(request.settings);
      }
    });
  }
})();
