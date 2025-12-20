import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock, CheckCircle, CreditCard } from 'lucide-react';

type PaymentStatus = 'pending' | 'paid' | 'completed' | 'refunded';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

const statusConfig: Record<PaymentStatus, {
  labelKey: string;
  className: string;
  icon: React.ElementType;
}> = {
  pending: {
    labelKey: 'payment.pending',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock,
  },
  paid: {
    labelKey: 'payment.held',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: Lock,
  },
  completed: {
    labelKey: 'payment.completed',
    className: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle,
  },
  refunded: {
    labelKey: 'payment.released',
    className: 'bg-muted text-muted-foreground border-border',
    icon: CreditCard,
  },
};

export const PaymentStatusBadge = ({ status, showIcon = true, size = 'default' }: PaymentStatusBadgeProps) => {
  const { t } = useTranslation();
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1.5'}`} />}
      {t(config.labelKey)}
    </Badge>
  );
};
