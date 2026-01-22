import { cn } from '@/lib/utils';
import { MessageMode } from '@/lib/types';
import { MessageSquare, Phone, Send } from 'lucide-react';

interface ModeBadgeProps {
  mode: MessageMode;
  className?: string;
}

const modeConfig: Record<MessageMode, { 
  label: string; 
  icon: typeof MessageSquare;
  className: string;
}> = {
  SMS: { 
    label: 'SMS', 
    icon: Send,
    className: 'bg-info/10 text-info border-info/20' 
  },
  WHATSAPP: { 
    label: 'WhatsApp', 
    icon: MessageSquare,
    className: 'bg-success/10 text-success border-success/20' 
  },
  CALL: { 
    label: 'Voice Call', 
    icon: Phone,
    className: 'bg-accent/10 text-accent border-accent/20' 
  },
};

export function ModeBadge({ mode, className }: ModeBadgeProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
      config.className,
      className
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
