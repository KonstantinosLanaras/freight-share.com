import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ShipmentData {
  id: string;
  status: string;
  payment_status: string;
  final_price: number;
  created_at: string;
  updated_at?: string;
  load?: {
    origin_city: string;
    origin_country: string;
    destination_city: string;
    destination_country: string;
    pallets: number;
    cargo_type?: string;
    weight_kg?: number;
    space_ldm?: number;
    pickup_date_from?: string;
    delivery_date_from?: string;
  };
  shipper?: {
    company_name?: string | null;
    full_name?: string | null;
  };
  carrier?: {
    company_name?: string | null;
    full_name?: string | null;
  };
}

interface ShipmentExportActionsProps {
  shipments: ShipmentData[];
  userRole: 'shipper' | 'carrier';
  disabled?: boolean;
}

// Platform fee percentage (for display purposes)
const PLATFORM_FEE_PERCENT = 5;

export function ShipmentExportActions({ shipments, userRole, disabled }: ShipmentExportActionsProps) {
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);

  // Only allow export of executed (completed) shipments
  const executedShipments = shipments.filter(s => s.status === 'completed');

  const handleExportCSV = async () => {
    if (executedShipments.length === 0) {
      toast.error('No executed shipments to export');
      return;
    }

    setExporting(true);
    try {
      const headers = [
        'Shipment ID',
        'Route',
        'Cargo Type',
        'Pallets',
        'Weight (kg)',
        'Space (LDM)',
        userRole === 'shipper' ? 'Carrier' : 'Shipper',
        'Price (€)',
        'Platform Fee (€)',
        'Net Amount (€)',
        'Execution Date',
        'Pickup Date',
        'Delivery Date',
      ];

      const rows = executedShipments.map(s => {
        const platformFee = s.final_price * (PLATFORM_FEE_PERCENT / 100);
        const netAmount = userRole === 'carrier' 
          ? s.final_price - platformFee 
          : s.final_price;
        
        const counterparty = userRole === 'shipper'
          ? (s.carrier?.company_name || s.carrier?.full_name || 'Carrier')
          : (s.shipper?.company_name || s.shipper?.full_name || 'Shipper');

        return [
          s.id.slice(0, 8),
          `${s.load?.origin_city || ''}, ${s.load?.origin_country || ''} → ${s.load?.destination_city || ''}, ${s.load?.destination_country || ''}`,
          s.load?.cargo_type || 'general',
          s.load?.pallets?.toString() || '0',
          s.load?.weight_kg?.toString() || '',
          s.load?.space_ldm?.toFixed(1) || '',
          counterparty,
          s.final_price.toString(),
          platformFee.toFixed(2),
          netAmount.toFixed(2),
          s.updated_at ? format(new Date(s.updated_at), 'yyyy-MM-dd') : format(new Date(s.created_at), 'yyyy-MM-dd'),
          s.load?.pickup_date_from ? format(new Date(s.load.pickup_date_from), 'yyyy-MM-dd') : '',
          s.load?.delivery_date_from ? format(new Date(s.load.delivery_date_from), 'yyyy-MM-dd') : '',
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `freightshare-executed-shipments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${executedShipments.length} executed shipment(s) to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export shipments');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    if (executedShipments.length === 0) {
      toast.error('No executed shipments to print');
      return;
    }

    setPrinting(true);
    try {
      const now = format(new Date(), 'MMMM d, yyyy HH:mm');
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>FreightShare - Executed Shipments</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              padding: 40px; 
              color: #1a1a1a;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              border-bottom: 2px solid #0066cc; 
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo { font-size: 24px; font-weight: bold; color: #0066cc; }
            .meta { color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 11px; }
            th { background: #f5f5f5; font-weight: 600; }
            tr:nth-child(even) { background: #fafafa; }
            .amount { text-align: right; font-weight: 600; }
            .summary { 
              margin-top: 30px; 
              padding: 20px; 
              background: #f5f5f5; 
              border-radius: 8px;
            }
            .summary-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }
            .summary-row:last-child { border-bottom: none; font-weight: bold; font-size: 16px; }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              color: #666; 
              font-size: 10px;
              text-align: center;
            }
            @media print { 
              body { padding: 20px; } 
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">FreightShare</div>
            <div class="meta">
              <div>Executed Shipments Report</div>
              <div>Generated: ${now}</div>
              <div>Role: ${userRole === 'shipper' ? 'Shipper' : 'Carrier'}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Route</th>
                <th>Cargo</th>
                <th>Pallets</th>
                <th>${userRole === 'shipper' ? 'Carrier' : 'Shipper'}</th>
                <th class="amount">Price (€)</th>
                <th>Execution Date</th>
              </tr>
            </thead>
            <tbody>
              ${executedShipments.map(s => {
                const counterparty = userRole === 'shipper'
                  ? (s.carrier?.company_name || 'Carrier')
                  : (s.shipper?.company_name || 'Shipper');
                return `
                  <tr>
                    <td>${s.id.slice(0, 8)}</td>
                    <td>${s.load?.origin_city || ''} → ${s.load?.destination_city || ''}</td>
                    <td>${s.load?.cargo_type || 'general'}</td>
                    <td>${s.load?.pallets || 0}</td>
                    <td>${counterparty}</td>
                    <td class="amount">€${s.final_price.toLocaleString()}</td>
                    <td>${s.updated_at ? format(new Date(s.updated_at), 'MMM d, yyyy') : format(new Date(s.created_at), 'MMM d, yyyy')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <span>Total Shipments</span>
              <span>${executedShipments.length}</span>
            </div>
            <div class="summary-row">
              <span>Total Volume</span>
              <span>${executedShipments.reduce((sum, s) => sum + (s.load?.pallets || 0), 0)} pallets</span>
            </div>
            <div class="summary-row">
              <span>Total Value</span>
              <span>€${executedShipments.reduce((sum, s) => sum + s.final_price, 0).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            FreightShare Platform | This document is for accounting and record-keeping purposes only.
            <br/>All transactions are subject to FreightShare Terms of Service.
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          setPrinting(false);
        }, 250);
      } else {
        setPrinting(false);
        toast.error('Unable to open print window');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print shipments');
      setPrinting(false);
    }
  };

  if (executedShipments.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={disabled || exporting}
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        disabled={disabled || printing}
      >
        {printing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Printer className="h-4 w-4 mr-2" />
        )}
        Print
      </Button>
    </div>
  );
}
