import jsPDF from 'jspdf';
import {SplitSummary, CheckState} from '../types';

interface GeneratePdfOptions {
  summary: SplitSummary;
  state: CheckState;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export async function generateSummaryPdf({
  summary,
  state,
  t,
}: GeneratePdfOptions): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(t('summary.title'), pageWidth / 2, y, {align: 'center'});
  y += 15;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString(), pageWidth / 2, y, {align: 'center'});
  y += 15;

  // Individual totals section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('summary.individualTotals'), margin, y);
  y += 10;

  // Person details
  doc.setFontSize(11);
  for (const personTotal of summary.personTotals) {
    const person = state.people.find((p) => p.id === personTotal.personId);
    if (!person) continue;

    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Person name and total
    doc.setFont('helvetica', 'bold');
    doc.text(person.name, margin, y);
    doc.text(formatCurrency(personTotal.total), pageWidth - margin, y, {
      align: 'right',
    });
    y += 7;

    // Item details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const item of personTotal.items) {
      const itemText = item.isShared
        ? `  ${item.itemName} (${t('common.shared')})`
        : `  ${item.itemName}`;
      doc.text(itemText, margin, y);
      doc.text(formatCurrency(item.amount), pageWidth - margin, y, {
        align: 'right',
      });
      y += 5;
    }

    // Subtotal, tax, tip breakdown
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`  ${t('common.subtotal')}: ${formatCurrency(personTotal.subtotal)}`, margin, y);
    y += 4;
    if (personTotal.tax > 0) {
      doc.text(`  ${t('summary.tax')}: ${formatCurrency(personTotal.tax)}`, margin, y);
      y += 4;
    }
    if (personTotal.tip > 0) {
      doc.text(`  ${t('summary.tip')}: ${formatCurrency(personTotal.tip)}`, margin, y);
      y += 4;
    }
    if (personTotal.serviceCharge > 0) {
      doc.text(
        `  ${t('summary.serviceCharge')}: ${formatCurrency(personTotal.serviceCharge)}`,
        margin,
        y,
      );
      y += 4;
    }
    doc.setTextColor(0);
    y += 5;
    doc.setFontSize(11);
  }

  // Separator line
  y += 5;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Check details section
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('summary.checkDetails'), margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  // Subtotal
  doc.text(t('common.subtotal'), margin, y);
  doc.text(formatCurrency(summary.totalBeforeTaxAndTip), pageWidth - margin, y, {
    align: 'right',
  });
  y += 7;

  // Tax
  if (summary.totalTax > 0) {
    doc.text(t('summary.totalTax', {rate: state.taxRate}), margin, y);
    doc.text(formatCurrency(summary.totalTax), pageWidth - margin, y, {
      align: 'right',
    });
    y += 7;
  }

  // Tip
  if (summary.totalTip > 0) {
    doc.text(t('summary.totalTip', {rate: state.tipRate}), margin, y);
    doc.text(formatCurrency(summary.totalTip), pageWidth - margin, y, {
      align: 'right',
    });
    y += 7;
  }

  // Service charges
  if (summary.totalServiceCharges > 0) {
    doc.text(t('summary.serviceCharge'), margin, y);
    doc.text(formatCurrency(summary.totalServiceCharges), pageWidth - margin, y, {
      align: 'right',
    });
    y += 7;
  }

  // Grand total
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(t('summary.grandTotal'), margin, y);
  doc.text(formatCurrency(summary.grandTotal), pageWidth - margin, y, {
    align: 'right',
  });

  return doc.output('blob');
}
