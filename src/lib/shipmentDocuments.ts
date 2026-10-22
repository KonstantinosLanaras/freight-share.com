import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface PartyDetails {
  name: string;
  company: string | null;
  address: string | null;
  vatNumber: string | null;
}

export interface ShipmentDocumentData {
  shipmentId: string;
  createdAt: string;
  finalPrice: number;
  platformFeeAmount: number | null;
  carrierPayoutAmount: number | null;
  declaredCargoValueEur: number | null;
  load: {
    originCity: string;
    originCountry: string;
    destinationCity: string;
    destinationCountry: string;
    cargoType: string;
    weightKg: number;
    pallets: number;
    pickupDateFrom: string;
    deliveryDateFrom: string;
  };
  shipper: PartyDetails;
  carrier: PartyDetails;
  pickupEvidence?: {
    signerName: string | null;
    condition: string;
    conditionNotes: string | null;
    createdAt: string;
  } | null;
  deliveryEvidence?: {
    signerName: string | null;
    condition: string;
    conditionNotes: string | null;
    createdAt: string;
  } | null;
  status?: string;
  timestamps?: { status: string; created_at: string }[];
  attachedDocuments?: { file_name: string; document_type: string }[];
}

function partyLines(party: PartyDetails): string[] {
  const lines = [party.company || party.name];
  if (party.company && party.name) lines.push(`Contact: ${party.name}`);
  lines.push(party.address || '[Address not provided]');
  if (party.vatNumber) lines.push(`VAT: ${party.vatNumber}`);
  return lines;
}

/**
 * Generates a CMR-style consignment note from shipment records and the
 * pickup/delivery signatures already captured in shipment_evidence. This
 * covers the particulars the CMR Convention (Art. 6) requires a
 * consignment note to contain -- it is not a certified or government-
 * issued document (a CMR note isn't one; the Convention just requires
 * sender and carrier to complete and sign it themselves). Review all
 * fields for accuracy before relying on it as the shipment's CMR note.
 */
export function generateCmrDocument(data: ShipmentDocumentData): void {
  const doc = new jsPDF();
  const marginX = 15;
  let y = 18;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CMR Consignment Note', marginX, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Shipment ${data.shipmentId.slice(0, 8)} · Generated ${format(new Date(), 'PP')}`, marginX, y + 6);
  y += 16;

  const section = (title: string, lines: string[]) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, marginX, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const line of lines) {
      doc.text(line, marginX + 2, y);
      y += 4.5;
    }
    y += 3;
  };

  section('1. Sender', partyLines(data.shipper));
  section('2. Carrier', partyLines(data.carrier));
  section('3. Place and date of taking over the goods', [
    `${data.load.originCity}, ${data.load.originCountry}`,
    format(new Date(data.load.pickupDateFrom), 'PP'),
  ]);
  section('4. Place designated for delivery', [
    `${data.load.destinationCity}, ${data.load.destinationCountry}`,
    format(new Date(data.load.deliveryDateFrom), 'PP'),
  ]);
  section('5. Marks, numbers, nature, packages, and description of goods', [
    `Cargo type: ${data.load.cargoType}`,
    `Pallets: ${data.load.pallets}`,
    `Gross weight: ${data.load.weightKg} kg`,
    ...(data.declaredCargoValueEur ? [`Declared value: €${data.declaredCargoValueEur.toLocaleString()}`] : []),
  ]);
  section('6. Carrier reservations at time of taking over', [
    data.pickupEvidence
      ? `Condition noted: ${data.pickupEvidence.condition}${data.pickupEvidence.conditionNotes ? ` — ${data.pickupEvidence.conditionNotes}` : ''}`
      : 'No pickup evidence recorded on the platform.',
  ]);
  section('7. Instructions / charges to be paid by', [
    `Transport charge: €${data.finalPrice.toLocaleString()}, payable by the Sender via FreightShare's payment processor.`,
  ]);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Signatures', marginX, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    data.pickupEvidence?.signerName
      ? `Sender / handover, signed by ${data.pickupEvidence.signerName} on ${format(new Date(data.pickupEvidence.createdAt), 'PPp')}`
      : 'Sender / handover: not yet signed on the platform.',
    marginX, y
  );
  y += 5;
  doc.text(
    data.deliveryEvidence?.signerName
      ? `Consignee / delivery, signed by ${data.deliveryEvidence.signerName} on ${format(new Date(data.deliveryEvidence.createdAt), 'PPp')}`
      : 'Consignee / delivery: not yet signed on the platform.',
    marginX, y
  );
  y += 12;

  doc.setFontSize(8);
  doc.setTextColor(120);
  const disclaimer = doc.splitTextToSize(
    "This document is rendered directly from the details the Sender and Carrier entered on FreightShare, plus the signatures captured at pickup/delivery -- FreightShare does not infer, complete, or verify any of the content. It is provided as information, not legal advice, and is not a determination that it satisfies e-CMR or any other regulatory requirement for this movement. Both parties should review every field for accuracy and, for jurisdiction-specific questions, verify with qualified counsel.",
    180
  );
  doc.text(disclaimer, marginX, y);

  doc.save(`CMR-${data.shipmentId.slice(0, 8)}.pdf`);
}

/**
 * Generates a receipt/invoice for the transport service fee. Not
 * guaranteed to satisfy every jurisdiction's VAT invoicing requirements
 * (sequential numbering, reverse-charge wording, etc. vary by country) --
 * treat as a starting point and confirm with an accountant before relying
 * on it for tax filing.
 */
export function generateInvoiceDocument(data: ShipmentDocumentData): void {
  const doc = new jsPDF();
  const marginX = 15;
  let y = 18;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice', marginX, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice ref. INV-${data.shipmentId.slice(0, 8).toUpperCase()} · ${format(new Date(data.createdAt), 'PP')}`, marginX, y + 6);
  y += 18;

  const section = (title: string, lines: string[]) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, marginX, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const line of lines) {
      doc.text(line, marginX + 2, y);
      y += 4.5;
    }
    y += 3;
  };

  section('Billed to (Shipper)', partyLines(data.shipper));
  section('Carrier', partyLines(data.carrier));
  section('Shipment', [
    `${data.load.originCity}, ${data.load.originCountry} → ${data.load.destinationCity}, ${data.load.destinationCountry}`,
    `${data.load.cargoType} · ${data.load.pallets} pallets · ${data.load.weightKg} kg`,
  ]);

  y += 2;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Charges', marginX, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const feeAmount = data.platformFeeAmount ?? 0;
  const carrierAmount = data.carrierPayoutAmount ?? (data.finalPrice - feeAmount);
  const rows: [string, string][] = [
    ['Transport service (carrier)', `€${carrierAmount.toLocaleString()}`],
    ['FreightShare platform fee', `€${feeAmount.toLocaleString()}`],
    ['Total charged', `€${data.finalPrice.toLocaleString()}`],
  ];
  for (const [label, amount] of rows) {
    doc.text(label, marginX + 2, y);
    doc.text(amount, marginX + 130, y);
    y += 5;
  }
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(120);
  const disclaimer = doc.splitTextToSize(
    'This document is generated from FreightShare payment records for the transport service fee. It is not guaranteed to meet every jurisdiction\'s VAT invoicing requirements (sequential numbering, reverse-charge treatment for cross-border B2B services, etc.) -- confirm with your accountant before using it for tax filing.',
    180
  );
  doc.text(disclaimer, marginX, y);

  doc.save(`Invoice-${data.shipmentId.slice(0, 8)}.pdf`);
}

const DOC_TYPE_DISPLAY: Record<string, string> = {
  cargo_insurance: 'Cargo Insurance Certificate',
  cmr: 'CMR Consignment Note',
  customs: 'Customs Documents',
  invoice: 'Invoice / Receipt',
  other: 'Other',
};

const STATUS_DISPLAY: Record<string, string> = {
  accepted: 'Booking accepted',
  paid: 'Payment received',
  picked_up: 'Goods picked up',
  delivered: 'Goods delivered',
  completed: 'Completed — payment released',
  cancelled: 'Cancelled',
};

/**
 * Generates a single comprehensive transaction record combining parties,
 * route, financial summary, status timeline, and list of attached documents.
 * Intended for company bookkeeping — not a certified legal document.
 */
export function generateTransactionRecord(data: ShipmentDocumentData): void {
  const doc = new jsPDF();
  const W = 180;  // usable width (210 - 2×15)
  const mX = 15;
  let y = 15;

  const checkPage = (needed = 10) => {
    if (y + needed > 280) { doc.addPage(); y = 15; }
  };

  const rule = () => {
    checkPage(6);
    doc.setDrawColor(220);
    doc.line(mX, y, mX + W, y);
    y += 5;
  };

  const sectionTitle = (title: string) => {
    checkPage(12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text(title.toUpperCase(), mX, y);
    doc.setTextColor(0);
    y += 6;
  };

  const row = (label: string, value: string, bold = false) => {
    checkPage(6);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(label, mX + 2, y);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(value, mX + 80, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
  };

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Record', mX, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('FreightShare', mX + W, y, { align: 'right' });
  doc.setTextColor(0);
  y += 7;
  doc.setFontSize(9);
  doc.text(`Reference: TXN-${data.shipmentId.slice(0, 8).toUpperCase()}`, mX, y);
  doc.text(`Generated: ${format(new Date(), 'PP')}`, mX + W, y, { align: 'right' });
  y += 5;
  const statusLabel = data.status ? (STATUS_DISPLAY[data.status] ?? data.status).toUpperCase() : '';
  if (statusLabel) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Status: ${statusLabel}`, mX, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
  }
  y += 3;
  rule();

  // ── Parties ──────────────────────────────────────────────────────────────
  sectionTitle('Parties');
  const partyCol = (label: string, party: PartyDetails, x: number, startY: number) => {
    let py = startY;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text(label, x, py); py += 5;
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(party.company || party.name, x, py); py += 4.5;
    doc.setFont('helvetica', 'normal');
    if (party.company && party.name) { doc.text(`Contact: ${party.name}`, x, py); py += 4.5; }
    if (party.address) {
      const wrapped = doc.splitTextToSize(party.address, 85);
      doc.text(wrapped, x, py); py += wrapped.length * 4.5;
    }
    if (party.vatNumber) { doc.text(`VAT: ${party.vatNumber}`, x, py); py += 4.5; }
    return py;
  };
  const leftBottom = partyCol('SHIPPER', data.shipper, mX, y);
  const rightBottom = partyCol('CARRIER', data.carrier, mX + 95, y);
  y = Math.max(leftBottom, rightBottom) + 5;
  rule();

  // ── Shipment Details ──────────────────────────────────────────────────────
  sectionTitle('Shipment Details');
  row('Origin', `${data.load.originCity}, ${data.load.originCountry}`);
  row('Destination', `${data.load.destinationCity}, ${data.load.destinationCountry}`);
  row('Pickup date', format(new Date(data.load.pickupDateFrom), 'PP'));
  row('Delivery date', format(new Date(data.load.deliveryDateFrom), 'PP'));
  row('Cargo type', data.load.cargoType);
  row('Pallets', String(data.load.pallets));
  row('Gross weight', `${data.load.weightKg} kg`);
  if (data.declaredCargoValueEur) {
    row('Declared cargo value', `€${data.declaredCargoValueEur.toLocaleString()}`);
  }
  y += 2;
  rule();

  // ── Financial Summary ─────────────────────────────────────────────────────
  sectionTitle('Financial Summary');
  const fee = data.platformFeeAmount ?? 0;
  const payout = data.carrierPayoutAmount ?? (data.finalPrice - fee);
  row('Transport fee (charged to shipper)', `€${data.finalPrice.toLocaleString()}`, true);
  row('FreightShare platform fee (2%)', `€${fee.toLocaleString()}`);
  row('Carrier payout', `€${payout.toLocaleString()}`);
  y += 2;
  rule();

  // ── Status Timeline ───────────────────────────────────────────────────────
  if (data.timestamps && data.timestamps.length > 0) {
    sectionTitle('Status Timeline');
    for (const ts of data.timestamps) {
      checkPage(6);
      const label = STATUS_DISPLAY[ts.status] ?? ts.status;
      const dateStr = format(new Date(ts.created_at), 'PP p');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`✓  ${label}`, mX + 2, y);
      doc.setTextColor(120);
      doc.text(dateStr, mX + W, y, { align: 'right' });
      doc.setTextColor(0);
      y += 5;
    }
    y += 2;
    rule();
  }

  // ── Attached Documents ────────────────────────────────────────────────────
  sectionTitle('Attached Documents');
  if (data.attachedDocuments && data.attachedDocuments.length > 0) {
    for (const attached of data.attachedDocuments) {
      checkPage(6);
      const typeLabel = DOC_TYPE_DISPLAY[attached.document_type] ?? attached.document_type;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`•  ${attached.file_name}`, mX + 2, y);
      doc.setTextColor(120);
      doc.text(typeLabel, mX + W, y, { align: 'right' });
      doc.setTextColor(0);
      y += 5;
    }
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text('No documents attached to this shipment.', mX + 2, y);
    doc.setTextColor(0);
    y += 5;
  }
  y += 5;

  // ── Disclaimer ────────────────────────────────────────────────────────────
  checkPage(20);
  doc.setFontSize(7.5);
  doc.setTextColor(150);
  const disclaimer = doc.splitTextToSize(
    'This transaction record is generated from data entered by the parties on FreightShare and from platform payment records. ' +
    'FreightShare acts as a technical facilitator only — the transport contract is between the Shipper and Carrier. ' +
    'This document does not constitute a certified CMR consignment note, VAT invoice, or customs declaration. ' +
    'Review all fields for accuracy and confirm with qualified counsel for jurisdiction-specific regulatory requirements.',
    W
  );
  doc.text(disclaimer, mX, y);

  doc.save(`TransactionRecord-${data.shipmentId.slice(0, 8)}.pdf`);
}
