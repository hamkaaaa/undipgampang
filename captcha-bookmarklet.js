/* 
  ⚡ UndipGampang - Captcha Trigger One-Liner Snippet
  Cara Menggunakan:
  1. Buka file HTML atau halaman SSO Form UNDIP di browser.
  2. Tekan F12 -> Pindah ke tab Console.
  3. Paste kode di bawah ini lalu tekan Enter:
*/

(function(){
  // 1. Enable semua opsi tanggal yang terkunci/disabled
  var sel = document.getElementById('tanggal');
  if (sel) {
    for (var i = 0; i < sel.options.length; i++) {
      sel.options[i].disabled = false;
    }
    if (!sel.value && sel.options.length > 1) sel.selectedIndex = 1;
  }
  
  // 2. Tampilkan Modal Captcha secara langsung
  var modal = document.getElementById('captchaModal');
  if (!modal) {
    alert('Elemen #captchaModal tidak ditemukan!');
    return;
  }
  
  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
    window.jQuery('#captchaModal').modal('show');
  } else {
    modal.style.display = 'block';
    modal.classList.add('show');
    modal.removeAttribute('aria-hidden');
    
    var backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }
    document.body.classList.add('modal-open');
  }
  
  // 3. Refresh gambar captcha
  var img = document.getElementById('captcha_image');
  if (img) {
    img.src = img.src.split('?')[0] + '?t=' + new Date().getTime();
  }
  
  // 4. Focus ke input captcha
  var input = document.getElementById('captcha_input');
  if (input) {
    input.value = '';
    setTimeout(function(){ input.focus(); }, 300);
  }
  
  console.log('⚡ Popup Captcha Berhasil Dikeluarkan!');
})();
