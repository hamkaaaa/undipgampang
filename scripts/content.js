/**
 * Content script for SIAP UNDIP
 * Performs batch fetching of 'get_absen' for all courses on the page
 * to extract exact, specific meeting dates and skip UTS/holiday weeks!
 */

(function () {
  'use me strict';

  function initUndipGampangButton() {
    if (document.getElementById('undip-gampang-btn')) return;

    const cardHeader = document.querySelector('.card-header') || document.querySelector('.content-header');
    if (!cardHeader) return;

    const courses = window.UndipParser ? window.UndipParser.parseUndipSchedule(document) : [];
    if (courses.length === 0) return;

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'margin: 15px 0; text-align: center;';

    const btn = document.createElement('button');
    btn.id = 'undip-gampang-btn';
    btn.innerHTML = '🎯 <strong>Ekspor Jadwal Presisi 100% (.ics)</strong>';
    btn.style.cssText = `
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
    });

    btn.addEventListener('click', async () => {
      if (!window.UndipExporter || !window.UndipParser) {
        alert('UndipGampang: Engine module belum dimuat.');
        return;
      }

      btn.disabled = true;
      let allMeetings = [];

      try {
        // Collect all courses with data-id from the main schedule table
        const courseRows = Array.from(document.querySelectorAll('table tbody tr'));
        const courseTargets = [];

        courseRows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length >= 6) {
            const btnAbsen = row.querySelector('.absen[data-id], [data-id]');
            const courseName = cells[2] ? cells[2].textContent.trim().replace(/\s+/g, ' ') : '';
            const room = cells[3] ? cells[3].textContent.trim().replace(/\s+/g, ' ') : '';
            
            if (btnAbsen && courseName) {
              courseTargets.push({
                id: btnAbsen.getAttribute('data-id'),
                tipeMk: btnAbsen.getAttribute('data-tipe_mk') || 'mata kuliah',
                name: courseName,
                room: room
              });
            }
          }
        });

        if (courseTargets.length > 0) {
          // Perform batch request for each course attendance modal
          for (let i = 0; i < courseTargets.length; i++) {
            const target = courseTargets[i];
            btn.innerHTML = `⏳ <strong>Mengambil Absen (${i + 1}/${courseTargets.length}) ${escapeHtml(target.name.substring(0, 15))}...</strong>`;

            try {
              const bodyParams = new URLSearchParams();
              bodyParams.append('id', target.id);
              bodyParams.append('tipe_mk', target.tipeMk);

              const resp = await fetch('https://siap.undip.ac.id/jadwal_mahasiswa/mhs/jadwal/get_absen', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                  'X-Requested-With': 'XMLHttpRequest'
                },
                body: bodyParams.toString()
              });

              if (resp.ok) {
                const htmlText = await resp.text();
                const meetings = window.UndipParser.parseUndipAttendanceModal(htmlText, target.name);
                
                meetings.forEach(m => {
                  m.room = target.room;
                  allMeetings.push(m);
                });
              }
            } catch (e) {
              console.error(`UndipGampang: Fail to fetch absen for ${target.name}`, e);
            }
          }
        }
      } catch (err) {
        console.error('UndipGampang: Error during batch fetch', err);
      }

      if (allMeetings.length > 0) {
        const icsData = window.UndipExporter.generateSpecificDatesICS(allMeetings);
        downloadBlob(icsData, 'Jadwal_Kuliah_UNDIP_Presisi.ics');
        alert(`🎯 SUKSES PRESISI 100%!\n\nSebanyak ${allMeetings.length} sesi pertemuan presisi (melompati minggu UTS & libur) berhasil di-export ke .ics!`);
      } else {
        // Fallback if no data-id found
        const startDate = '2026-08-24';
        const icsData = window.UndipExporter.generateICS(courses, {
          semesterStartDate: startDate,
          weeksCount: 16
        });
        downloadBlob(icsData, 'Jadwal_Kuliah_UNDIP.ics');
        alert(`Berhasil mengunduh jadwal ${courses.length} mata kuliah dalam format .ics!`);
      }

      btn.disabled = false;
      btn.innerHTML = '🎯 <strong>Ekspor Jadwal Presisi 100% (.ics)</strong>';
    });

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function downloadBlob(content, filename) {
      const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    btnContainer.appendChild(btn);
    cardHeader.appendChild(btnContainer);
  }

  // Chrome Extension Message Listener from Popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'fetchAllAttendance') {
        performBatchFetchAll().then(meetings => {
          sendResponse({ success: true, meetings: meetings });
        }).catch(err => {
          sendResponse({ success: false, error: err.message });
        });
        return true; // Keep channel open for async response
      }
    });
  }

  async function performBatchFetchAll() {
    const courseRows = Array.from(document.querySelectorAll('table tbody tr'));
    const courseTargets = [];

    courseRows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length >= 6) {
        const btnAbsen = row.querySelector('.absen[data-id], [data-id]');
        const courseName = cells[2] ? cells[2].textContent.trim().replace(/\s+/g, ' ') : '';
        const room = cells[3] ? cells[3].textContent.trim().replace(/\s+/g, ' ') : '';
        
        if (btnAbsen && courseName) {
          courseTargets.push({
            id: btnAbsen.getAttribute('data-id'),
            tipeMk: btnAbsen.getAttribute('data-tipe_mk') || 'mata kuliah',
            name: courseName,
            room: room
          });
        }
      }
    });

    const allMeetings = [];
    for (const target of courseTargets) {
      try {
        const bodyParams = new URLSearchParams();
        bodyParams.append('id', target.id);
        bodyParams.append('tipe_mk', target.tipeMk);

        const resp = await fetch('https://siap.undip.ac.id/jadwal_mahasiswa/mhs/jadwal/get_absen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: bodyParams.toString()
        });

        if (resp.ok) {
          const htmlText = await resp.text();
          const meetings = window.UndipParser.parseUndipAttendanceModal(htmlText, target.name);
          meetings.forEach(m => {
            m.room = target.room;
            allMeetings.push(m);
          });
        }
      } catch (e) {
        console.error(`UndipGampang: Fail to fetch absen for ${target.name}`, e);
      }
    }

    return allMeetings;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUndipGampangButton);
  } else {
    initUndipGampangButton();
  }
})();
