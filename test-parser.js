const fs = require('fs');
const path = require('path');

const fileJadwal = 'C:\\Users\\lenovo\\Downloads\\alamak\\JADWAL KULIAH.html';
const fileAbsen = 'C:\\Users\\lenovo\\Downloads\\alamak\\KLIKLIHATABSEN.html';

const htmlJadwal = fs.readFileSync(fileJadwal, 'utf-8');
const htmlAbsen = fs.readFileSync(fileAbsen, 'utf-8');

const { parseUndipSchedule, parseUndipAttendanceModal } = require('./scripts/parser.js');
const { generateSpecificDatesICS, generateSpecificDatesCSV } = require('./scripts/ics-generator.js');

console.log('=== VERIFICATION TEST: PARSING MODAL ABSENSI (KLIKLIHATABSEN.HTML) ===');
const meetings = parseUndipAttendanceModal(htmlAbsen, 'Manajemen Proyek TI');
console.log(`Total specific meeting sessions found: ${meetings.length}`);

// List extracted dates
const extractedDates = meetings.map(m => m.date);
console.log('\nExtracted Meeting Dates:', extractedDates);

// Verify UTS weeks (12 Oct 2026 & 19 Oct 2026) are NOT present
const hasOct12 = extractedDates.includes('2026-10-12');
const hasOct19 = extractedDates.includes('2026-10-19');

if (!hasOct12 && !hasOct19) {
  console.log('\n✅ VERIFICATION SUCCESS: UTS weeks (12 Oct & 19 Oct) are properly SKIPPED and left EMPTY!');
} else {
  console.error('\n❌ VERIFICATION FAIL: Found fake events during UTS week!');
}

// Generate .ics output
const specificIcs = generateSpecificDatesICS(meetings);

// Check if .ics contains 20261012 or 20261019
const icsHasOct12 = specificIcs.includes('20261012');
const icsHasOct19 = specificIcs.includes('20261019');

if (!icsHasOct12 && !icsHasOct19) {
  console.log('✅ VERIFICATION SUCCESS: .ics file contains ZERO events on 12 Oct & 19 Oct (UTS Week)!');
} else {
  console.error('❌ VERIFICATION FAIL: .ics file contains events during UTS week!');
}

fs.writeFileSync(path.join(__dirname, 'test_output_specific.ics'), specificIcs);
fs.writeFileSync(path.join(__dirname, 'test_output_specific.csv'), generateSpecificDatesCSV(meetings));

console.log('\nSaved test_output_specific.ics & test_output_specific.csv successfully!');
