/**
 * Parser Engine for SIAP UNDIP Schedule & Attendance Modal ("Lihat Absen")
 * Environment agnostic (Browser & Node.js supported)
 */

(function (global) {
  'use me strict';

  const DAY_MAP = {
    'senin': 1,
    'selasa': 2,
    'rabu': 3,
    'kamis': 4,
    'jumat': 5,
    'sabtu': 6,
    'minggu': 0
  };

  const MONTH_MAP = {
    'januari': '01', 'jan': '01',
    'februari': '02', 'feb': '02',
    'maret': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'mei': '05',
    'juni': '06', 'jun': '06',
    'juli': '07', 'jul': '07',
    'agustus': '08', 'agust': '08', 'agu': '08',
    'september': '09', 'sep': '09',
    'oktober': '10', 'okt': '10',
    'november': '11', 'nov': '11',
    'desember': '12', 'des': '12'
  };

  function parseIndonesianDate(dateStr) {
    if (!dateStr) return null;

    const dmyMatch = dateStr.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
    }

    const textMatch = dateStr.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
    if (textMatch) {
      const day = textMatch[1].padStart(2, '0');
      const monthText = textMatch[2].toLowerCase();
      const year = textMatch[3];
      const month = MONTH_MAP[monthText] || '01';
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  /**
   * Parse Attendance Modal HTML ("Lihat Absen" modal content)
   */
  function parseUndipAttendanceModal(source, defaultCourseName = 'Mata Kuliah') {
    let doc = null;
    let htmlString = typeof source === 'string' ? source : '';

    if (typeof source !== 'string' && source && source.querySelectorAll) {
      doc = source;
    } else if (typeof DOMParser !== 'undefined' && htmlString) {
      const parser = new DOMParser();
      doc = parser.parseFromString(htmlString, 'text/html');
    }

    const meetings = [];

    if (doc) {
      const modalTables = Array.from(doc.querySelectorAll('#modaldata table, table'));

      for (const table of modalTables) {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim().toLowerCase());
        const hasTanggalHeader = headers.some(h => h.includes('tanggal') || h.includes('hari'));
        const hasPertemuanHeader = headers.some(h => h.includes('pertemuan'));

        if (hasTanggalHeader || hasPertemuanHeader) {
          const rows = Array.from(table.querySelectorAll('tbody tr'));
          let currentSection = 'Absensi Kuliah';

          rows.forEach((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length === 1 || (row.textContent.includes('Absensi') && cells.length < 4)) {
              currentSection = row.textContent.trim();
              return;
            }

            if (cells.length < 3) return;

            const tanggalWaktuText = cells[1] ? cells[1].textContent.trim() : '';
            const meetingNumText = cells[2] ? cells[2].textContent.trim() : '';
            const kelasWaktuText = cells[3] ? cells[3].textContent.trim() : '';

            if (!tanggalWaktuText || tanggalWaktuText.includes('Belum ada data')) return;

            const parsedDate = parseIndonesianDate(tanggalWaktuText);
            const timeMatch = (tanggalWaktuText + ' ' + kelasWaktuText).match(/(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(?:s\/d|-|to)\s*(\d{1,2})[:.](\d{2})(?::\d{2})?/i);

            let startTime = '08:00';
            let endTime = '09:40';

            if (timeMatch) {
              startTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
              endTime = `${timeMatch[3].padStart(2, '0')}:${timeMatch[4]}`;
            }

            if (parsedDate) {
              const dayMatch = tanggalWaktuText.match(/^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)/i);
              const dayName = dayMatch ? dayMatch[1] : 'Kuliah';

              meetings.push({
                meetingNum: parseInt(meetingNumText, 10) || (meetings.length + 1),
                courseName: defaultCourseName,
                section: currentSection,
                date: parsedDate,
                dayName: dayName,
                startTime: startTime,
                endTime: endTime,
                rawInfo: kelasWaktuText
              });
            }
          });

          if (meetings.length > 0) break;
        }
      }
    } else if (htmlString) {
      // String regex fallback for Node environment without DOMParser
      const trRegex = /<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi;
      let match;
      let meetingCounter = 1;

      while ((match = trRegex.exec(htmlString)) !== null) {
        const rowContent = match[1];
        const tdRegex = /<td[\s\S]*?>([\s\S]*?)<\/td>/gi;
        const tds = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
          const text = tdMatch[1].replace(/<[^>]+>/g, '\n').trim();
          tds.push(text);
        }

        if (tds.length >= 3) {
          const tanggalWaktuText = tds[1] || '';
          const meetingNumText = tds[2] || '';
          const kelasWaktuText = tds[3] || '';

          if (tanggalWaktuText.includes('Belum ada data') || tanggalWaktuText.includes('Absensi')) continue;

          const parsedDate = parseIndonesianDate(tanggalWaktuText);
          const timeMatch = (tanggalWaktuText + ' ' + kelasWaktuText).match(/(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(?:s\/d|-|to)\s*(\d{1,2})[:.](\d{2})(?::\d{2})?/i);

          if (parsedDate) {
            let startTime = '08:00';
            let endTime = '09:40';
            if (timeMatch) {
              startTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
              endTime = `${timeMatch[3].padStart(2, '0')}:${timeMatch[4]}`;
            }
            const dayMatch = tanggalWaktuText.match(/^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)/i);

            meetings.push({
              meetingNum: parseInt(meetingNumText, 10) || meetingCounter++,
              courseName: defaultCourseName,
              section: 'Absensi Kuliah',
              date: parsedDate,
              dayName: dayMatch ? dayMatch[1] : 'Kuliah',
              startTime: startTime,
              endTime: endTime,
              rawInfo: kelasWaktuText
            });
          }
        }
      }
    }

    return meetings;
  }

  /**
   * Parse HTML string or Document element to extract main schedule list
   */
  function parseUndipSchedule(source) {
    let doc = null;
    let htmlString = typeof source === 'string' ? source : '';

    if (typeof source !== 'string' && source && source.querySelectorAll) {
      doc = source;
    } else if (typeof DOMParser !== 'undefined' && htmlString) {
      const parser = new DOMParser();
      doc = parser.parseFromString(htmlString, 'text/html');
    }

    const courses = [];
    const modalMeetings = parseUndipAttendanceModal(source);

    if (doc) {
      const tables = Array.from(doc.querySelectorAll('table'));

      for (const table of tables) {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim().toLowerCase());
        
        const hariIdx = headers.findIndex(h => h.includes('hari'));
        const mkIdx = headers.findIndex(h => h.includes('matakuliah') || h.includes('mata kuliah'));
        const ruangIdx = headers.findIndex(h => h.includes('ruang'));
        const waktuIdx = headers.findIndex(h => h.includes('waktu') || h.includes('jam'));
        const sksIdx = headers.findIndex(h => h.includes('sks'));

        if (hariIdx !== -1 && mkIdx !== -1 && waktuIdx !== -1) {
          const rows = Array.from(table.querySelectorAll('tbody tr'));
          
          rows.forEach((row, index) => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length <= Math.max(hariIdx, mkIdx, waktuIdx)) return;

            const rawHari = cells[hariIdx] ? cells[hariIdx].textContent.trim().toLowerCase() : '';
            const rawMk = cells[mkIdx] ? cells[mkIdx].textContent.trim() : '';
            const rawRuang = ruangIdx !== -1 && cells[ruangIdx] ? cells[ruangIdx].textContent.trim() : '';
            const rawWaktu = cells[waktuIdx] ? cells[waktuIdx].textContent.trim() : '';
            const rawSks = sksIdx !== -1 && cells[sksIdx] ? cells[sksIdx].textContent.trim() : '';

            let dataId = null;
            const btnAbsen = row.querySelector('.absen, [data-id]');
            if (btnAbsen) {
              dataId = btnAbsen.getAttribute('data-id');
            }

            if (!rawHari || !rawMk || !rawWaktu) return;

            const name = rawMk.replace(/\s+/g, ' ').trim();
            if (!name) return;

            const timeMatch = rawWaktu.match(/(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(?:s\/d|-|to)\s*(\d{1,2})[:.](\d{2})(?::\d{2})?/i);
            
            let startTime = '08:00';
            let endTime = '09:40';

            if (timeMatch) {
              startTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
              endTime = `${timeMatch[3].padStart(2, '0')}:${timeMatch[4]}`;
            }

            const dayIndex = DAY_MAP[rawHari] !== undefined ? DAY_MAP[rawHari] : 1;
            const room = rawRuang.replace(/\s+/g, ' ').trim() || 'Online / Belum Ada Ruang';

            courses.push({
              id: index + 1,
              dataId: dataId,
              dayName: rawHari.charAt(0).toUpperCase() + rawHari.slice(1),
              dayIndex: dayIndex,
              name: name,
              room: room,
              startTime: startTime,
              endTime: endTime,
              sks: parseFloat(rawSks) || 2.0
            });
          });

          if (courses.length > 0) break;
        }
      }
    } else if (htmlString) {
      // Regex fallback for Node test environment
      const rowRegex = /<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi;
      let match;
      let index = 1;

      while ((match = rowRegex.exec(htmlString)) !== null) {
        const rowContent = match[1];
        const tdRegex = /<td[\s\S]*?>([\s\S]*?)<\/td>/gi;
        const tds = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
          const text = tdMatch[1].replace(/<[^>]+>/g, '').trim();
          tds.push(text);
        }

        if (tds.length >= 6) {
          const day = tds[1].toLowerCase();
          if (DAY_MAP[day] !== undefined) {
            const name = tds[2].replace(/\s+/g, ' ').trim();
            const room = tds[3].replace(/\s+/g, ' ').trim() || 'Ruangan Belum Ada';
            const waktuStr = tds[4].trim();
            const sks = parseFloat(tds[5]) || 2.0;

            const timeMatch = waktuStr.match(/(\d{2}:\d{2})(?::\d{2})?\s*s\/d\s*(\d{2}:\d{2})(?::\d{2})?/i);
            if (timeMatch && name) {
              courses.push({
                id: index++,
                dayName: day.charAt(0).toUpperCase() + day.slice(1),
                dayIndex: DAY_MAP[day],
                name: name,
                room: room,
                startTime: timeMatch[1],
                endTime: timeMatch[2],
                sks: sks
              });
            }
          }
        }
      }
    }

    return courses;
  }

  // Export to global scope or export module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseUndipSchedule, parseUndipAttendanceModal, parseIndonesianDate, DAY_MAP, MONTH_MAP };
  } else {
    global.UndipParser = { parseUndipSchedule, parseUndipAttendanceModal, parseIndonesianDate, DAY_MAP, MONTH_MAP };
  }
})(typeof window !== 'undefined' ? window : globalThis);
