/**
 * UndipGampang - Form & Captcha Helper Tool
 * Tool untuk membuka popup Captcha SSO Form UNDIP (Makanan Sehat & Form SSO lainnya)
 * secara instan tanpa terhalang validasi tanggal / kuota.
 */

(function () {
  'use strict';

  // Global helper function accessible from console
  window.triggerCaptchaModal = function (forceEnableDates = true) {
    const modal = document.getElementById('captchaModal');
    if (!modal) {
      console.warn('[UndipGampang] Modal #captchaModal tidak ditemukan di halaman ini.');
      alert('Modal #captchaModal tidak ditemukan pada halaman ini!');
      return false;
    }

    // 1. Enable disabled date options if requested
    if (forceEnableDates) {
      const selectTanggal = document.getElementById('tanggal');
      if (selectTanggal) {
        let enabledCount = 0;
        Array.from(selectTanggal.options).forEach((opt, idx) => {
          if (opt.disabled) {
            opt.disabled = false;
            opt.innerText = opt.innerText.replace('##sudah lewat jadwal', '[DIBUKA ULANG]');
            enabledCount++;
          }
        });
        if (!selectTanggal.value && selectTanggal.options.length > 1) {
          selectTanggal.selectedIndex = 1;
        }
        console.log(`[UndipGampang] ${enabledCount} opsi tanggal telah dibuka/di-enable.`);
      }
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

    // 3. Refresh captcha image if img element exists
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

    console.log('[UndipGampang] Popup Captcha berhasil dibuka!');
    return true;
  };

  // Inject Quick Trigger Widget into the page if SSO Form / Captcha Modal exists
  function injectCaptchaToolWidget() {
    if (document.getElementById('undip-captcha-tool-widget')) return;

    const modal = document.getElementById('captchaModal');
    const submitBtn = document.getElementById('btn_submit_pendaftaran');

    if (!modal && !submitBtn) return; // Not an SSO Form page

    // Create Floating Control Widget
    const widget = document.createElement('div');
    widget.id = 'undip-captcha-tool-widget';
    widget.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
      z-index: 999999;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
    `;

    widget.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; font-weight: bold; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">
        <span>⚡ UndipGampang Captcha Tool</span>
        <span style="cursor: pointer; opacity: 0.8; padding: 0 4px;" onclick="this.parentElement.parentElement.remove()">✕</span>
      </div>
      <button id="btn-trigger-captcha-popup" style="
        background: #ff9f43;
        color: #ffffff;
        border: none;
        padding: 9px 14px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(255, 159, 67, 0.4);
        transition: all 0.2s ease;
      ">
        🔓 Buka Popup Captcha (Bypass Validasi)
      </button>
      <button id="btn-enable-all-dates" style="
        background: #28c76f;
        color: #ffffff;
        border: none;
        padding: 7px 12px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      ">
        📅 Buka Semua Opsi Tanggal Dihapus/Disabled
      </button>
    `;

    document.body.appendChild(widget);

    // Event handlers
    document.getElementById('btn-trigger-captcha-popup').addEventListener('click', function () {
      window.triggerCaptchaModal(true);
    });

    document.getElementById('btn-enable-all-dates').addEventListener('click', function () {
      const selectTanggal = document.getElementById('tanggal');
      if (selectTanggal) {
        let count = 0;
        Array.from(selectTanggal.options).forEach(opt => {
          if (opt.disabled) {
            opt.disabled = false;
            opt.innerText = opt.innerText.replace('##sudah lewat jadwal', '[AKTIF]');
            count++;
          }
        });
        alert(`Berhasil membuka ${count} opsi tanggal yang tadinya terkunci!`);
      } else {
        alert('Elemen <select id="tanggal"> tidak ditemukan!');
      }
    });

    // Also add inline trigger next to #btn_submit_pendaftaran if present
    if (submitBtn && !document.getElementById('btn_direct_captcha_inline')) {
      const inlineBtn = document.createElement('button');
      inlineBtn.type = 'button';
      inlineBtn.id = 'btn_direct_captcha_inline';
      inlineBtn.className = 'btn btn-square btn-warning ml-1';
      inlineBtn.innerHTML = '<i class="ft-shield"></i> Buka Popup Captcha';
      inlineBtn.style.fontWeight = 'bold';
      inlineBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.triggerCaptchaModal(true);
      });
      submitBtn.parentNode.appendChild(inlineBtn);
    }
  }

  // Auto-init on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCaptchaToolWidget);
  } else {
    injectCaptchaToolWidget();
  }
})();
