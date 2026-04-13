import XLSX from 'xlsx-js-style';
import type { Expense, ExpenseSplit, Member } from '../types';
import { calculateBalances, suggestSettlements, calculateIndividualShares } from './engine';
import { formatDisplayDate } from './dateUtils';

interface ExportData {
  expenses: Expense[];
  splits: ExpenseSplit[];
  members: Member[];
  eventName: string;
  t: (key: any) => string;
}

export const exportToExcel = ({ expenses, splits, members, eventName, t }: ExportData) => {
  const wb = XLSX.utils.book_new();
  const fixedCols = 4;
  const totalCols = fixedCols + members.length * 2;

  // Build header rows
  // Row 1: fixed col labels + member names spanning 2 cols each
  const headerRow1: (string | number)[] = [
    t('date'), t('category'), t('descriptionLabel'), t('amount'),
    ...members.flatMap(m => [m.name, ''])
  ];

  // Row 2: empty for fixed cols (merged with row 1) + Paid/Share sub-headers
  const headerRow2: (string | number)[] = [
    '', '', '', '',
    ...members.flatMap(() => [t('paidBy'), t('share')])
  ];

  // Track totals
  const memberPaidTotals: Record<string, number> = {};
  const memberShareTotals: Record<string, number> = {};
  members.forEach(m => {
    memberPaidTotals[m.id] = 0;
    memberShareTotals[m.id] = 0;
  });
  let grandTotal = 0;

  // Build data rows
  const dataRows = expenses.map(exp => {
    const itemSplits = splits.filter(s => s.expense_id === exp.id);
    const amount = Number(exp.amount);
    grandTotal += amount;

    const individualShares = calculateIndividualShares(exp.id, amount, itemSplits);

    const memberCols = members.flatMap(m => {
      const paid = m.id === exp.payer_member_id ? amount : 0;
      memberPaidTotals[m.id] += paid;

      const share = individualShares[m.id] || 0;
      memberShareTotals[m.id] += share;

      return [paid || '', share || ''];
    });

    return [
      formatDisplayDate(exp.date),
      t(exp.category as any),
      exp.note || '',
      Number(amount.toFixed(2)),
      ...memberCols
    ];
  });

  // Summary row
  const summaryRow: (string | number)[] = [
    '', '', t('summary'), Number(grandTotal.toFixed(2)),
    ...members.flatMap(m => [
      Number(memberPaidTotals[m.id].toFixed(2)),
      Number(memberShareTotals[m.id].toFixed(2))
    ])
  ];

  // Balance row (paid - share)
  const balanceRow: (string | number)[] = [
    '', '', t('balance'), '',
    ...members.flatMap(m => {
      const diff = Number((memberPaidTotals[m.id] - memberShareTotals[m.id]).toFixed(2));
      return [diff, ''];
    })
  ];

  // Assemble sheet
  const titleRow: any[] = [eventName.toUpperCase()];
  const sheetData = [titleRow, headerRow1, headerRow2, ...dataRows, [], summaryRow, balanceRow];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Format all numeric amount cells to 2 decimal places
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref] && ws[ref].t === 'n') {
        ws[ref].z = '0.00';
      }
    }
  }

  // === MERGES ===
  const merges: XLSX.Range[] = [];

  // Merge title row across all columns
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  // Merge fixed col headers (row 1 + row 2) vertically
  for (let c = 0; c < fixedCols; c++) {
    merges.push({ s: { r: 1, c }, e: { r: 2, c } });
  }

  // Merge member name headers (row 1) horizontally across 2 cols
  for (let i = 0; i < members.length; i++) {
    const startCol = fixedCols + i * 2;
    merges.push({ s: { r: 1, c: startCol }, e: { r: 1, c: startCol + 1 } });
  }

  ws['!merges'] = merges;

  // === STYLING ===

  // Style Title (row 0)
  for (let c = 0; c < totalCols; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[ref]) ws[ref] = { v: '', t: 's' };
    ws[ref].s = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } }, // White text
      fill: { fgColor: { rgb: '1F3864' } }, // Very dark blue bg (darker than row 1)
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style fixed col headers (row 1) — vertically merged, centered, bold, dark blue bg
  for (let c = 0; c < fixedCols; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 1, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2F5496' } }
      };
    }
    // Clear row 2 fixed col cells and give them same background
    const cellRef2 = XLSX.utils.encode_cell({ r: 2, c });
    if (!ws[cellRef2]) ws[cellRef2] = { v: '', t: 's' };
    ws[cellRef2].s = {
      fill: { fgColor: { rgb: '2F5496' } }
    };
  }

  // Style member name headers (row 1) — merged, centered, bold, dark blue bg
  for (let i = 0; i < members.length; i++) {
    const startCol = fixedCols + i * 2;
    const cellRef = XLSX.utils.encode_cell({ r: 1, c: startCol });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        alignment: { horizontal: 'center' },
        font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2F5496' } }
      };
    }
    // Style the empty merged-away cell in row 1
    const emptyRef = XLSX.utils.encode_cell({ r: 1, c: startCol + 1 });
    if (!ws[emptyRef]) ws[emptyRef] = { v: '', t: 's' };
    ws[emptyRef].s = { fill: { fgColor: { rgb: '2F5496' } } };
  }

  // Style header row 2 (sub-headers for members) — bold, medium blue bg
  for (let c = fixedCols; c < totalCols; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center' },
        fill: { fgColor: { rgb: '4472C4' } }
      };
    }
  }

  // Style summary row and balance row
  const summaryRowIdx = sheetData.length - 2;
  const balanceRowIdx = sheetData.length - 1;

  for (let c = 0; c < totalCols; c++) {
    const sumRef = XLSX.utils.encode_cell({ r: summaryRowIdx, c });
    if (ws[sumRef]) {
      ws[sumRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'D6E4F0' } },
        alignment: { horizontal: 'right' }
      };
    }
    const balRef = XLSX.utils.encode_cell({ r: balanceRowIdx, c });
    if (ws[balRef]) {
      const isNegative = typeof ws[balRef].v === 'number' && ws[balRef].v < 0;
      ws[balRef].s = {
        font: { bold: true, color: isNegative ? { rgb: 'FF0000' } : undefined },
        fill: { fgColor: { rgb: 'E2EFDA' } },
        alignment: { horizontal: 'right' }
      };
    }
  }

  // Alternating row colors for expense data rows
  const dataStartRow = 3; // data starts at row index 3 (after title + 2 header rows)
  const dataEndRow = dataStartRow + dataRows.length - 1;
  const evenColor = 'DAEAF6'; // medium blue-grey
  const oddColor = 'FFFFFF';  // white
  for (let r = dataStartRow; r <= dataEndRow; r++) {
    const bgColor = (r - dataStartRow) % 2 === 0 ? evenColor : oddColor;
    for (let c = 0; c < totalCols; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (!ws[ref]) ws[ref] = { v: '', t: 's' };
      ws[ref].s = {
        ...(ws[ref].s || {}),
        fill: { fgColor: { rgb: bgColor } }
      };
    }
  }

  // Auto-size columns
  const colWidths: XLSX.ColInfo[] = [];
  for (let c = 0; c < totalCols; c++) {
    let maxLen = 8;
    sheetData.forEach(row => {
      const cellLen = String(row[c] ?? '').length;
      if (cellLen > maxLen) maxLen = cellLen;
    });
    colWidths.push({ wch: Math.max(maxLen + 2, 10) });
  }
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, t('sheetExpenses'));

  // === SETTLEMENTS (appended to same sheet) ===
  const balances = calculateBalances(expenses, splits, members);
  const settlements = suggestSettlements(balances);

  if (settlements.length > 0) {
    // Spacer
    XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });

    // Settlement title row — merged across 3 cols
    XLSX.utils.sheet_add_aoa(ws, [[t('settlementPlan')]], { origin: -1 });
    const titleRowIdx = XLSX.utils.decode_range(ws['!ref']!).e.r;
    ws['!merges']!.push({ s: { r: titleRowIdx, c: 0 }, e: { r: titleRowIdx, c: 2 } });
    const titleRef = XLSX.utils.encode_cell({ r: titleRowIdx, c: 0 });
    if (ws[titleRef]) {
      ws[titleRef].s = {
        font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2F5496' } }
      };
    }

    // Sub-header: From | To | Amount
    XLSX.utils.sheet_add_aoa(ws, [[t('payer'), t('payee'), t('amount')]], { origin: -1 });
    const subHeaderRowIdx = XLSX.utils.decode_range(ws['!ref']!).e.r;
    for (let c = 0; c < 3; c++) {
      const ref = XLSX.utils.encode_cell({ r: subHeaderRowIdx, c });
      if (ws[ref]) {
        ws[ref].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '4472C4' } },
          alignment: { horizontal: 'center' }
        };
      }
    }

    // Settlement data rows with alternating colors
    const settlementEven = 'FCE4EC'; // light pink
    const settlementOdd = 'FFFFFF';
    settlements.forEach((s, idx) => {
      XLSX.utils.sheet_add_aoa(ws, [[
        s.fromName,
        s.toName,
        Number(s.amount.toFixed(2))
      ]], { origin: -1 });

      const rowIdx = XLSX.utils.decode_range(ws['!ref']!).e.r;
      const bgColor = idx % 2 === 0 ? settlementEven : settlementOdd;
      for (let c = 0; c < 3; c++) {
        const ref = XLSX.utils.encode_cell({ r: rowIdx, c });
        if (ws[ref]) {
          ws[ref].s = {
            fill: { fgColor: { rgb: bgColor } },
            alignment: { horizontal: 'right' }
          };
          if (c === 2) ws[ref].z = '0.00'; // format amount
        }
      }
    });
  }

  // Add borders to all cells
  const borderStyle = {
    top: { style: 'thin', color: { rgb: 'B0B0B0' } },
    bottom: { style: 'thin', color: { rgb: 'B0B0B0' } },
    left: { style: 'thin', color: { rgb: 'B0B0B0' } },
    right: { style: 'thin', color: { rgb: 'B0B0B0' } }
  };
  const fullRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let r = fullRange.s.r; r <= fullRange.e.r; r++) {
    for (let c = fullRange.s.c; c <= fullRange.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref]) {
        ws[ref].s = { ...(ws[ref].s || {}), border: borderStyle };
      }
    }
  }

  const fileName = eventName.replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '_Report.xlsx';
  XLSX.writeFile(wb, fileName);
};
