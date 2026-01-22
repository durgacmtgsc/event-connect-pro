import { cn } from '@/lib/utils';
import { EventStatus, ContactStatus } from '@/lib/types';

type StatusType = EventStatus | ContactStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: { 
    label: 'Pending', 
    className: 'bg-warning/10 text-warning border-warning/20' 
  },
  scheduled: { 
    label: 'Scheduled', 
    className: 'bg-info/10 text-info border-info/20' 
  },
  sending: { 
    label: 'Sending', 
    className: 'bg-primary/10 text-primary border-primary/20' 
  },
  sent: { 
    label: 'Sent', 
    className: 'bg-success/10 text-success border-success/20' 
  },
  partial: { 
    label: 'Partial', 
    className: 'bg-warning/10 text-warning border-warning/20' 
  },
  failed: { 
    label: 'Failed', 
    className: 'bg-destructive/10 text-destructive border-destructive/20' 
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
      config.className,
      className
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-2",
        status === 'sending' && "animate-pulse",
        status === 'sent' ? 'bg-success' : 
        status === 'failed' ? 'bg-destructive' : 
        status === 'pending' || status === 'partial' ? 'bg-warning' : 
        status === 'scheduled' ? 'bg-info' : 'bg-primary'
      )} />
      {config.label}
    </span>
  );
}
