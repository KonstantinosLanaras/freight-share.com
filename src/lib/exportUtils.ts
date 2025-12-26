import { format } from 'date-fns';

interface LoadExportData {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  pallets: number;
  cargo_type: string;
  price: number | null;
  pricing_type: string;
  status: string;
  pickup_date_from: string;
  pickup_date_to: string;
  delivery_date_from?: string;
  delivery_date_to?: string;
  created_at: string;
  shipper_name?: string;
  carrier_name?: string;
  payment_status?: string;
}

interface ShipmentExportData {
  id: string;
  status: string;
  payment_status: string;
  final_price: number;
  created_at: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  pallets: number;
  cargo_type: string;
  shipper_name?: string;
  carrier_name?: string;
  pickup_date?: string;
  delivery_date?: string;
}

/**
 * Export loads to CSV format
 */
export function exportLoadsToCSV(loads: LoadExportData[], filename?: string): void {
  const headers = [
    'Load ID',
    'Origin',
    'Destination',
    'Pallets',
    'Cargo Type',
    'Price (€)',
    'Pricing Type',
    'Status',
    'Pickup Window',
    'Created At',
    'Shipper',
    'Carrier',
    'Payment Status'
  ];

  const rows = loads.map(load => [
    load.id,
    `${load.origin_city}, ${load.origin_country}`,
    `${load.destination_city}, ${load.destination_country}`,
    load.pallets.toString(),
    load.cargo_type,
    load.price ? load.price.toString() : 'Open',
    load.pricing_type,
    load.status,
    `${format(new Date(load.pickup_date_from), 'MMM d, yyyy')} - ${format(new Date(load.pickup_date_to), 'MMM d, yyyy')}`,
    format(new Date(load.created_at), 'MMM d, yyyy HH:mm'),
    load.shipper_name || '',
    load.carrier_name || '',
    load.payment_status || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, filename || `loads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
}

/**
 * Export shipments to CSV format
 */
export function exportShipmentsToCSV(shipments: ShipmentExportData[], filename?: string): void {
  const headers = [
    'Shipment ID',
    'Status',
    'Payment Status',
    'Price (€)',
    'Origin',
    'Destination',
    'Pallets',
    'Cargo Type',
    'Shipper',
    'Carrier',
    'Created At'
  ];

  const rows = shipments.map(s => [
    s.id,
    s.status,
    s.payment_status,
    s.final_price.toString(),
    `${s.origin_city}, ${s.origin_country}`,
    `${s.destination_city}, ${s.destination_country}`,
    s.pallets.toString(),
    s.cargo_type,
    s.shipper_name || '',
    s.carrier_name || '',
    format(new Date(s.created_at), 'MMM d, yyyy HH:mm')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, filename || `shipments-export-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
}

/**
 * Generate printable HTML for loads
 */
export function generateLoadsPrintHTML(loads: LoadExportData[]): string {
  const now = format(new Date(), 'MMMM d, yyyy HH:mm');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Loads Export - FreightShare</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        .meta { color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #f5f5f5; font-weight: 600; }
        tr:nth-child(even) { background: #fafafa; }
        .status { padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        .status-completed { background: #d4edda; color: #155724; }
        .status-accepted { background: #cce5ff; color: #004085; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 11px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>Loads Export</h1>
      <div class="meta">Generated on ${now} | Total: ${loads.length} loads</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Route</th>
            <th>Pallets</th>
            <th>Cargo</th>
            <th>Price</th>
            <th>Status</th>
            <th>Pickup</th>
          </tr>
        </thead>
        <tbody>
          ${loads.map(load => `
            <tr>
              <td>${load.id.slice(0, 8)}</td>
              <td>${load.origin_city} → ${load.destination_city}</td>
              <td>${load.pallets}</td>
              <td>${load.cargo_type}</td>
              <td>${load.price ? `€${load.price}` : 'Open'}</td>
              <td><span class="status status-${load.status}">${load.status}</span></td>
              <td>${format(new Date(load.pickup_date_from), 'MMM d, yyyy')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        FreightShare Platform | This document is for record-keeping purposes.
      </div>
    </body>
    </html>
  `;
}

/**
 * Print loads
 */
export function printLoads(loads: LoadExportData[]): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(generateLoadsPrintHTML(loads));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }
}

/**
 * Helper to download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
