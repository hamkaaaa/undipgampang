/**
 * UndipGampang - Form & Captcha Helper Tool (Sniper Edition v3.5)
 * 
 * Fitur Utama:
 * 1. Pre-verify Captcha sebelum jam 10:00 WIB (menahan form submit otomatis).
 * 2. Auto-Select 1 dari 12 Lokasi Makanan Sehat UNDIP pada jam 10:00:00 WIB.
 * 3. Auto-Submit Form menggunakan captcha yang sudah terverifikasi sebelumnya.
 */

(function () {
  'use strict';

  // Global State
  window.undipCaptchaVerified = false;
  window.undipVerifiedTimestamp = null;
  window.undipHoldSubmit = true; // Default hold submit before 10:00 AM
  window.undipForceSubmitNow = false;
  window.undipTargetLocation = 'Student Center'; // Default location target
  window.undipAutoSnipeEnabled = true;
  window.undipSnipeExecuted = false;

  // Global Function: Trigger Captcha Modal with Pre-verify mode
  window.triggerCaptchaModal = function (forceEnableDates = true, targetLoc = null) {
    if (targetLoc) window.undipTargetLocation = targetLoc;

    const modal = document.getElementById('captchaModal');
    if (!modal) {
      console.warn('[UndipGampang] Modal #captchaModal tidak ditemukan di halaman ini.');
      alert('Modal #captchaModal tidak ditemukan pada halaman ini!');
      return false;
    }

    // 1. Enable disabled date options if requested
    if (forceEnableDates) {
      window.unlockAllLocationOptions(false);
    }

    // 2. Show Modal via jQuery/Bootstrap if available, otherwise direct DOM fallback
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
      window.jQuery('#captchaModal').modal('show');
    } else {
      modal.style.display = 'block';
      modal.classList.add('show');
      modal.removeAttribute('aria-hidden');
      modal.setAttribute('aria-modal', 'true');

      let backdrop = document.querySelector('.modal-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'undip-gampang-backdrop';
        document.body.appendChild(backdrop);
      } else {
        backdrop.classList.add('show');
        backdrop.style.display = 'block';
      }
      document.body.classList.add('modal-open');

      // Bind close buttons
      const closeBtns = modal.querySelectorAll('#btn_cancel_captcha, .close, [data-dismiss="modal"]');
      closeBtns.forEach(btn => {
        btn.onclick = function () {
          modal.style.display = 'none';
          modal.classList.remove('show');
          modal.setAttribute('aria-hidden', 'true');
          const bd = document.getElementById('undip-gampang-backdrop') || document.querySelector('.modal-backdrop');
          if (bd) bd.remove();
          document.body.classList.remove('modal-open');
        };
      });
    }

    // 3. Refresh captcha image
    const captchaImg = document.getElementById('captcha_image');
    if (captchaImg) {
      const timestamp = new Date().getTime();
      const currentSrc = captchaImg.getAttribute('src') || '';
      if (currentSrc.includes('captcha_image')) {
        captchaImg.setAttribute('src', currentSrc.split('?')[0] + '?t=' + timestamp);
      }
    }

    // 4. Focus input
    const input = document.getElementById('captcha_input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 300);
    }

    console.log('[UndipGampang] Popup Captcha dibuka.');
    return true;
  };

  // Helper: Unlock all options in <select id="tanggal">
  window.unlockAllLocationOptions = function (showAlert = true) {
    const selectTanggal = document.getElementById('tanggal');
    if (!selectTanggal) {
      if (showAlert) alert('Elemen <select id="tanggal"> tidak ditemukan!');
      return 0;
    }

    let enabledCount = 0;
    Array.from(selectTanggal.options).forEach((opt) => {
      if (opt.disabled) {
        opt.disabled = false;
        opt.innerText = opt.innerText.replace('##sudah lewat jadwal', '[TERSEDIA]');
        enabledCount++;
      }
    });

    if (showAlert) {
      alert(`Berhasil membuka ${enabledCount} lokasi/jadwal yang terkunci!`);
    }
    return enabledCount;
  };

  // Helper: Auto Select Location & Auto Submit Form
  window.executeAutoSelectAndSubmit = function (targetLoc) {
    if (targetLoc) window.undipTargetLocation = targetLoc;
    const locName = window.undipTargetLocation || 'Student Center';

    console.log(`[UndipGampang Snipe] Executing auto-select for location: "${locName}"`);

    // 1. Unlock options
    window.unlockAllLocationOptions(false);

    // 2. Find and select target location
    const sel = document.getElementById('tanggal');
    let selectedIndex = -1;

    if (sel && sel.options.length > 0) {
      Array.from(sel.options).forEach((opt, idx) => {
        if (locName !== 'any' && opt.text.toLowerCase().includes(locName.toLowerCase())) {
          if (selectedIndex === -1) selectedIndex = idx;
        }
      });

      // Fallback if target location string not directly found
      if (selectedIndex === -1) {
        for (let i = 1; i < sel.options.length; i++) {
          if (!sel.options[i].text.includes('sisa kuota 0')) {
            selectedIndex = i;
            break;
          }
        }
      }

      if (selectedIndex === -1 && sel.options.length > 1) {
        selectedIndex = 1;
      }

      if (selectedIndex !== -1) {
        sel.selectedIndex = selectedIndex;
        sel.dispatchEvent(new Event('change'));
        console.log(`[UndipGampang Snipe] Selected option [${selectedIndex}]: ${sel.options[selectedIndex].text}`);
      }
    }

    // 3. Force Submit Form
    window.undipForceSubmitNow = true;
    const form = document.getElementById('reg_ddart_covid');
    if (form) {
      console.log('[UndipGampang Snipe] Submitting form #reg_ddart_covid...');
      form.submit();
      window.undipSnipeExecuted = true;
      updatePageBannerStatus('🚀 FORM BERHASIL DI-SUBMIT KILAT!', 'success');
      return true;
    } else {
      alert('Form #reg_ddart_covid tidak ditemukan di halaman ini.');
      return false;
    }
  };

  // --- INTERCEPT FORM SUBMISSION BEFORE 10:00 AM ---
  function initFormSubmitInterceptor() {
    const form = document.getElementById('reg_ddart_covid');
    if (!form) return;

    // Use capturing phase so our listener fires BEFORE inline JS / jQuery submit handlers!
    form.addEventListener('submit', function (e) {
      const now = new Date();
      const isBefore10 = now.getHours() < 10;

      // If hold submit is active AND we are before 10 AM AND forceSubmit is NOT set
      if (window.undipHoldSubmit && isBefore10 && !window.undipForceSubmitNow) {
        e.preventDefault();
        e.stopPropagation();

        console.log('[UndipGampang] Captcha berhasil diverifikasi! Form submit ditahan hingga jam 10:00:00 WIB.');

        // Hide Captcha modal
        if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
          window.jQuery('#captchaModal').modal('hide');
        } else {
          const modal = document.getElementById('captchaModal');
          if (modal) modal.style.display = 'none';
          const bd = document.getElementById('undip-gampang-backdrop') || document.querySelector('.modal-backdrop');
          if (bd) bd.remove();
          document.body.classList.remove('modal-open');
        }

        window.undipCaptchaVerified = true;
        window.undipVerifiedTimestamp = new Date();

        updatePageBannerStatus(
          `🟢 CAPTCHA TERVERIFIKASI (${window.undipVerifiedTimestamp.toLocaleTimeString()})! Helper Siap Auto-Select & Submit Jam 10:00:00 WIB.`,
          'success'
        );

        return false;
      }
    }, true);
  }

  // --- INTERCEPT JQUERY AJAX VERIFY CAPTCHA RESPONSE ---
  function initAjaxInterceptor() {
    if (window.jQuery) {
      window.jQuery(document).ajaxSuccess(function (event, xhr, settings, data) {
        if (settings && settings.url && settings.url.includes('validate_captcha')) {
          try {
            let resp = (typeof data === 'string') ? JSON.parse(data) : data;
            if (resp && resp.status === 'ok') {
              window.undipCaptchaVerified = true;
              window.undipVerifiedTimestamp = new Date();
              console.log('[UndipGampang] Captcha Verified via AJAX!');
              updatePageBannerStatus(
                `🟢 CAPTCHA TERVERIFIKASI (${window.undipVerifiedTimestamp.toLocaleTimeString()})! Helper Siap Auto-Select & Submit Jam 10:00:00 WIB.`,
                'success'
              );
            }
          } catch (e) {}
        }
      });
    }
  }

  // --- PAGE BANNER STATUS ---
  function updatePageBannerStatus(msg, type = 'info') {
    let banner = document.getElementById('undip-sniper-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'undip-sniper-banner';
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999999;
        padding: 10px 16px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        transition: all 0.3s ease;
      `;
      document.body.prepend(banner);
    }

    if (type === 'success') {
      banner.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      banner.style.color = '#ffffff';
    } else {
      banner.style.background = 'linear-gradient(135deg, #ff9f43 0%, #ee5253 100%)';
      banner.style.color = '#ffffff';
    }

    banner.innerHTML = `⚡ UndipGampang Foodtruck Helper: ${msg}`;
  }

  // --- AUTOMATED 10:00:00 WIB TIMER SNIPER ---
  function initSniperClock() {
    setInterval(() => {
      if (window.undipSnipeExecuted || !window.undipAutoSnipeEnabled) return;

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Trigger precisely at 10:00:00 AM WIB
      if (hours === 10 && minutes === 0 && seconds === 0) {
        console.log('[UndipGampang Snipe] 🕒 JAM 10:00:00 WIB DIREACH! Executing Auto-Select & Submit!');
        window.executeAutoSelectAndSubmit(window.undipTargetLocation);
      }
    }, 500);
  }

  // --- FLOATING WIDGET UI ---
  function injectCaptchaToolWidget() {
    if (document.getElementById('undip-captcha-tool-widget')) return;

    const modal = document.getElementById('captchaModal');
    const submitBtn = document.getElementById('btn_submit_pendaftaran');

    if (!modal && !submitBtn) return; // Not an SSO Form page

    const widget = document.createElement('div');
    widget.id = 'undip-captcha-tool-widget';
    widget.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 14px;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 290px;
      border: 1px solid rgba(255,255,255,0.12);
    `;

    widget.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; font-weight: bold; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px; color: #38bdf8;">
        <span>🍱 Foodtruck Auto-Sniper</span>
        <span style="cursor: pointer; opacity: 0.8; padding: 0 4px;" onclick="this.parentElement.parentElement.remove()">✕</span>
      </div>

      <div id="widget-captcha-status" style="
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        padding: 8px 10px;
        border-radius: 8px;
        font-weight: 600;
        text-align: center;
        border: 1px solid rgba(239, 68, 68, 0.3);
      ">
        🔴 Captcha Belum Terverifikasi
      </div>

      <button id="btn-widget-verify-captcha" style="
        background: linear-gradient(135deg, #ff9f43 0%, #ee5253 100%);
        color: #ffffff;
        border: none;
        padding: 9px 12px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(238, 82, 83, 0.3);
      ">
        🔓 Pre-Verify Captcha Sekarang
      </button>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label style="font-weight: 600; color: #94a3b8; font-size: 11px;">Target Lokasi Makanan Sehat:</label>
        <select id="widget-location-select" style="
          background: #0f172a;
          color: #ffffff;
          border: 1px solid #334155;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 11px;
          outline: none;
        ">
          <option value="Student Center">🏛️ Student Center</option>
          <option value="SA-MWA">🅿️ Halaman Parkir SA-MWA</option>
          <option value="Pendopo FSM">🌿 Pendopo FSM</option>
          <option value="Imam Bardjo">🏛️ Auditorium Imam Bardjo</option>
          <option value="any">🌟 Pilihan Kuota Pertama (Auto)</option>
        </select>
      </div>

      <button id="btn-widget-test-snipe" style="
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        border: none;
        padding: 9px 12px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      ">
        🚀 Exec Auto-Select & Submit Sekarang
      </button>
    `;

    document.body.appendChild(widget);

    // Update status in widget periodically
    setInterval(() => {
      const statusDiv = document.getElementById('widget-captcha-status');
      if (statusDiv) {
        if (window.undipCaptchaVerified) {
          statusDiv.style.background = 'rgba(16, 185, 129, 0.15)';
          statusDiv.style.color = '#34d399';
          statusDiv.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          statusDiv.innerHTML = '🟢 Captcha TERVERIFIKASI & TERKUNCI!';
        } else {
          statusDiv.style.background = 'rgba(239, 68, 68, 0.15)';
          statusDiv.style.color = '#f87171';
          statusDiv.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          statusDiv.innerHTML = '🔴 Captcha Belum Terverifikasi';
        }
      }
    }, 500);

    // Event Handlers
    document.getElementById('btn-widget-verify-captcha').addEventListener('click', () => {
      window.triggerCaptchaModal(true);
    });

    document.getElementById('widget-location-select').addEventListener('change', (e) => {
      window.undipTargetLocation = e.target.value;
      console.log('[UndipGampang Widget] Target location set to:', window.undipTargetLocation);
    });

    document.getElementById('btn-widget-test-snipe').addEventListener('click', () => {
      const loc = document.getElementById('widget-location-select').value;
      window.executeAutoSelectAndSubmit(loc);
    });
  }

  // Init sequence
  function init() {
    initFormSubmitInterceptor();
    initAjaxInterceptor();
    initSniperClock();
    injectCaptchaToolWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
