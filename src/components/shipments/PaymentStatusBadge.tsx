import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Loader2, 
  CheckCircle, 
  RefreshCw,
  CreditCard,
  AlertCircle
} from 'lucide-react';

type PaymentStatus = 'pending' | 'paid' | 'completed' | 'refunded';
type ShipmentCategory = 'active' | 'in_process' | 'executed';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md';
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { 
    label: 'Pending', 
    icon: Clock, 
    className: 'bg-warning/10 text-warning border-warning/20' 
  },
  paid: { 
    label: 'Paid', 
    icon: CreditCard, 
    className: 'bg-primary/10 text-primary border-primary/20' 
  },
  completed: { 
    label: 'Completed', 
    icon: CheckCircle, 
    className: 'bg-success/10 text-success border-success/20' 
  },
  refunded: { 
    label: 'Refunded', 
    icon: RefreshCw, 
    className: 'bg-muted text-muted-foreground border-border' 
  },
};

export function PaymentStatusBadge({ status, size = 'md' }: PaymentStatusBadgeProps) {
  const config = paymentStatusConfig[status] || paymentStatusConfig.pending;
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
      {config.label}
    </Badge>
  );
}

/**
 * Map shipment status to category
 * Active = shipment in progress / awaiting steps
 * In Process = verification + transfer of money in progress (platform-controlled)
 * Executed = completed and settled
 */
export function getShipmentCategory(status: string, paymentStatus: string): ShipmentCategory {
  // Executed: completed with payment settled
  if (status === 'completed' && (paymentStatus === 'completed' || paymentStatus === 'refunded')) {
    return 'executed';
  }
  
  // In Process: payment is being processed
  if (paymentStatus === 'paid' && status !== 'completed') {
    return 'in_process';
  }
  
  // Active: everything else that's in progress
  return 'active';
}

interface ShipmentCategoryBadgeProps {
  category: ShipmentCategory;
}

const categoryConfig: Record<ShipmentCategory, { label: string; icon: React.ElementType; className: string }> = {
  active: { 
    label: 'Active', 
    icon: Clock, 
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
  },
  in_process: { 
    label: 'In Process', 
    icon: Loader2, 
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' 
  },
  executed: { 
    label: 'Executed', 
    icon: CheckCircle, 
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
  },
};

export function ShipmentCategoryBadge({ category }: ShipmentCategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  
  return (
    <Badge className={config.className}>
      <Icon className={`h-3 w-3 mr-1 ${category === 'in_process' ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}
