import fs from 'fs';

const csv = `"Account No","DATE","TRANSACTION DETAILS","CHQ.NO","VALUE DATE","WITHDRAWAL AMT","DEPOSIT AMT","BALANCE AMT"
"409000611074","29-Jun-17","TRF FROM Indiaforensic SERVICES","","29-Jun-17","","10,00,000.00","10,00,000.00"
"409000611074","05-Jul-17","TRF FROM Indiaforensic SERVICES","","05-Jul-17","","10,00,000.00","20,00,000.00"
"409000611074","18-Jul-17","FDRL/INTERNAL FUND TRANSFE","","18-Jul-17","","5,00,000.00","25,00,000.00"
"409000611074","01-Aug-17","TRF FRM Indiaforensic SERVICES","","01-Aug-17","","30,00,000.00","55,00,000.00"
"409000611074","16-Aug-17","INDO GIBL Indiaforensic STL01071","","16-Aug-17","1,33,900.00","","83,66,100.00"
"409000611074","16-Aug-17","INDO GIBL Indiaforensic STL02071","","16-Aug-17","18,000.00","","83,48,100.00"
"409000611074","16-Aug-17","INDO GIBL Indiaforensic STL03071","","16-Aug-17","5,000.00","","83,43,100.00"
"409000611074","16-Aug-17","INDO GIBL Indiaforensic STL04071","","16-Aug-17","1,95,800.00","","81,47,300.00"`;

fs.writeFileSync('./public/test_verify.csv', csv);

async function test() {
  // Step 1: Upload
  const formData = new FormData();
  const fileBytes = fs.readFileSync('./public/test_verify.csv');
  const blob = new Blob([fileBytes], { type: 'text/csv' });
  formData.append('file', blob, 'test_verify.csv');

  console.log('Uploading...');
  const uploadRes = await fetch('http://localhost:3002/api/upload', {
    method: 'POST',
    body: formData,
  });

  const uploadText = await uploadRes.text();
  console.log('Upload status:', uploadRes.status);
  console.log('Upload response:', uploadText.substring(0, 500));

  let uploadData;
  try { uploadData = JSON.parse(uploadText); } catch { console.log('Upload returned non-JSON'); return; }

  if (!uploadData.sessionId) { console.log('No sessionId!'); return; }

  // Step 2: Fetch summary
  const summaryUrl = `http://localhost:3002/api/summary?sessionId=${uploadData.sessionId}`;
  console.log('\nFetching summary from:', summaryUrl);
  const summaryRes = await fetch(summaryUrl);
  const summaryText = await summaryRes.text();
  console.log('Summary status:', summaryRes.status);
  console.log('Summary content-type:', summaryRes.headers.get('content-type'));
  console.log('Summary response:', summaryText.substring(0, 500));

  let s;
  try { s = JSON.parse(summaryText); } catch { console.log('Summary returned non-JSON'); return; }

  console.log('\n=== RESULTS ===');
  console.log('Current Balance:', s.currentBalance);
  console.log('Total Income:', s.totalIncome);
  console.log('Total Expenses:', s.totalExpenses);
  console.log('Net Cash Flow:', s.netCashFlow);
  console.log('Avg Daily Spend:', s.avgDailySpend);
  console.log('Runway:', s.runwayDays, 'days');
  console.log('Safe/Day:', s.safeToSpendPerDay);
  console.log('Status:', s.status);

  console.log('\n=== CHECKS ===');
  const checks = [
    ['Balance = last row BALANCE AMT (81,47,300)', s.currentBalance === 8147300],
    ['Total Income = 55,00,000', s.totalIncome === 5500000],
    ['Total Expenses = 3,52,700', s.totalExpenses === 352700],
    ['Runway > 0', s.runwayDays > 0],
    ['Status is Healthy', s.status === 'Healthy'],
  ];
  checks.forEach(([label, pass]) => console.log(`${pass ? '✓' : '✗'} ${label}`));
}

test().catch(console.error);
