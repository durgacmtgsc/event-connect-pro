import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border border-border',
  primary: 'bg-primary/5 border border-primary/20',
  success: 'bg-success/5 border border-success/20',
  warning: 'bg-warning/5 border border-warning/20',
  destructive: 'bg-destructive/5 border border-destructive/20',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl p-6 transition-all duration-200 hover:shadow-lg animate-fade-in",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-display font-bold text-card-foreground animate-count-up">
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-sm font-medium mt-2",
              trend.positive ? "text-success" : "text-destructive"
            )}>
              {trend.positive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          iconVariantStyles[variant]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
