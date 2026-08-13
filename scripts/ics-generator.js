/**
 * iCalendar (.ics) and CSV Generator Engine for UNDIP Schedule
 * Supports both Weekly Recurrence (RRULE) and Specific Individual Dates Mode.
 */

(function (global) {
  'use me strict';

  function formatDateToICS(dateStr, timeStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    const pad = (n) => String(n).padStart(2, '0');
    return `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
  }

  function getFirstClassDate(startDateStr, targetDayIndex) {
    const startDate = new Date(startDateStr);
    const currentDayIndex = startDate.getDay();

    let diff = targetDayIndex - currentDayIndex;
    if (diff < 0) {
      diff += 7;
    }

    const firstDate = new Date(startDate);
    firstDate.setDate(startDate.getDate() + diff);

    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = firstDate.getFullYear();
    const mm = pad(firstDate.getMonth() + 1);
    const dd = pad(firstDate.getDate());

    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Generate .ics from weekly recurring courses (RRULE Mode)
   */
  function generateICS(courses, options = {}) {
    const startDate = options.semesterStartDate || '2026-08-24';
    const weeksCount = parseInt(options.weeksCount, 10) || 16;

    let icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UndipGampang//Jadwal Kuliah UNDIP//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Jadwal Kuliah UNDIP',
      'X-WR-TIMEZONE:Asia/Jakarta'
    ];

    courses.forEach((course) => {
      const classDate = getFirstClassDate(startDate, course.dayIndex);
      const dtStart = formatDateToICS(classDate, course.startTime);
      const dtEnd = formatDateToICS(classDate, course.endTime);

      const description = `Mata Kuliah: ${course.name}\\n` +
                          `Hari: ${course.dayName}\\n` +
                          `Jam: ${course.startTime} - ${course.endTime}\\n` +
                          `SKS: ${course.sks}\\n` +
                          `Ruangan: ${course.room}\\n` +
                          `Di-export menggunakan UndipGampang`;

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`SUMMARY:${course.name}`);
      icsLines.push(`LOCATION:${course.room}`);
      icsLines.push(`DESCRIPTION:${description}`);
      icsLines.push(`DTSTART;TZID=Asia/Jakarta:${dtStart}`);
      icsLines.push(`DTEND;TZID=Asia/Jakarta:${dtEnd}`);
      icsLines.push(`RRULE:FREQ=WEEKLY;COUNT=${weeksCount}`);
      icsLines.push('END:VEVENT');
    });

    icsLines.push('END:VCALENDAR');
    return icsLines.join('\r\n');
  }

  /**
   * Generate .ics from Specific Meeting Dates (100% Presisi Per-Pertemuan)
   * @param {Array<Object>} meetings Array of meeting objects { courseName, meetingNum, date, startTime, endTime, room, dayName }
   * @returns {string} ICS Content
   */
  function generateSpecificDatesICS(meetings) {
    let icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UndipGampang//Jadwal Kuliah Presisi UNDIP//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Jadwal Kuliah UNDIP Presisi',
      'X-WR-TIMEZONE:Asia/Jakarta'
    ];

    meetings.forEach((m) => {
      const dtStart = formatDateToICS(m.date, m.startTime);
      const dtEnd = formatDateToICS(m.date, m.endTime);
      const room = m.room || 'Ruangan Belum Ada';
      const meetingLabel = m.meetingNum ? `Pertemuan ke-${m.meetingNum}` : 'Sesi Perkuliahan';

      const description = `Mata Kuliah: ${m.courseName}\\n` +
                          `${meetingLabel}\\n` +
                          `Hari/Tanggal: ${m.dayName}, ${m.date}\\n` +
                          `Jam: ${m.startTime} - ${m.endTime}\\n` +
                          `Ruangan: ${room}\\n` +
                          `Di-export menggunakan UndipGampang (Mode Tanggal Presisi)`;

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`SUMMARY:${m.courseName} (${meetingLabel})`);
      icsLines.push(`LOCATION:${room}`);
      icsLines.push(`DESCRIPTION:${description}`);
      icsLines.push(`DTSTART;TZID=Asia/Jakarta:${dtStart}`);
      icsLines.push(`DTEND;TZID=Asia/Jakarta:${dtEnd}`);
      icsLines.push('END:VEVENT');
    });

    icsLines.push('END:VCALENDAR');
    return icsLines.join('\r\n');
  }

  /**
   * Generate Google Calendar CSV format
   */
  function generateCSV(courses, options = {}) {
    const startDate = options.semesterStartDate || '2026-08-24';
    const csvRows = [
      ['Subject', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Description', 'Location']
    ];

    courses.forEach((course) => {
      const classDate = getFirstClassDate(startDate, course.dayIndex);
      const [y, m, d] = classDate.split('-');
      const formattedDate = `${m}/${d}/${y}`;
      const description = `Mata Kuliah ${course.name} (${course.sks} SKS), Hari ${course.dayName}. Di-export via UndipGampang.`;

      csvRows.push([
        `"${course.name.replace(/"/g, '""')}"`,
        `"${formattedDate}"`,
        `"${course.startTime}"`,
        `"${formattedDate}"`,
        `"${course.endTime}"`,
        `"${description.replace(/"/g, '""')}"`,
        `"${course.room.replace(/"/g, '""')}"`
      ]);
    });

    return csvRows.map(row => row.join(',')).join('\n');
  }

  /**
   * Generate Google Calendar CSV for Specific Dates
   */
  function generateSpecificDatesCSV(meetings) {
    const csvRows = [
      ['Subject', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Description', 'Location']
    ];

    meetings.forEach((m) => {
      const [y, month, d] = m.date.split('-');
      const formattedDate = `${month}/${d}/${y}`;
      const meetingLabel = m.meetingNum ? `Pertemuan ke-${m.meetingNum}` : 'Sesi Perkuliahan';
      const description = `${m.courseName} (${meetingLabel}) tanggal ${m.date}. Di-export via UndipGampang Presisi.`;
      const room = m.room || '';

      csvRows.push([
        `"${m.courseName.replace(/"/g, '""')} - P${m.meetingNum || ''}"`,
        `"${formattedDate}"`,
        `"${m.startTime}"`,
        `"${formattedDate}"`,
        `"${m.endTime}"`,
        `"${description.replace(/"/g, '""')}"`,
        `"${room.replace(/"/g, '""')}"`
      ]);
    });

    return csvRows.map(row => row.join(',')).join('\n');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
      generateICS, 
      generateCSV, 
      generateSpecificDatesICS, 
      generateSpecificDatesCSV, 
      getFirstClassDate, 
      formatDateToICS 
    };
  } else {
    global.UndipExporter = { 
      generateICS, 
      generateCSV, 
      generateSpecificDatesICS, 
      generateSpecificDatesCSV, 
      getFirstClassDate, 
      formatDateToICS 
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
