import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Package {
  id: string;
  guests: number;
  price: number;
  popular?: boolean;
  features: string[];
}

interface PackageCardProps {
  package: Package;
  onSelect: (pkg: Package) => void;
  selected?: boolean;
  loading?: boolean;
}

export function PackageCard({ package: pkg, onSelect, selected, loading }: PackageCardProps) {
  return (
    <div 
      className={cn(
        "relative rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl",
        pkg.popular 
          ? "border-primary bg-primary/5 shadow-lg scale-105" 
          : "border-border bg-card hover:border-primary/50",
        selected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {pkg.guests} Guests
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-display font-bold text-primary">₹{pkg.price}</span>
          <span className="text-muted-foreground text-sm">/event</span>
        </div>
      </div>
      
      <ul className="space-y-3 mb-6">
        {pkg.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        onClick={() => onSelect(pkg)}
        disabled={loading}
        className={cn(
          "w-full",
          pkg.popular ? "gradient-primary hover:opacity-90" : ""
        )}
        variant={pkg.popular ? "default" : "outline"}
      >
        {selected ? "Selected" : "Choose Plan"}
      </Button>
    </div>
  );
}

export const packages: Package[] = [
  {
    id: 'basic',
    guests: 100,
    price: 499,
    features: [
      'Call + SMS + WhatsApp invitations',
      'RSVP tracking dashboard',
      'Reminder follow-ups',
      'Basic templates',
      'Email support',
    ],
  },
  {
    id: 'standard',
    guests: 300,
    price: 999,
    popular: true,
    features: [
      'Call + SMS + WhatsApp invitations',
      'RSVP tracking dashboard',
      'Reminder follow-ups',
      'Premium templates',
      'Priority support',
      'Custom message editor',
    ],
  },
  {
    id: 'premium',
    guests: 500,
    price: 1499,
    features: [
      'Call + SMS + WhatsApp invitations',
      'RSVP tracking dashboard',
      'Multiple reminder follow-ups',
      'All premium templates',
      'Priority phone support',
      'Custom message editor',
      'Detailed analytics',
    ],
  },
  {
    id: 'enterprise',
    guests: 1000,
    price: 2499,
    features: [
      'Call + SMS + WhatsApp invitations',
      'Advanced RSVP dashboard',
      'Unlimited reminder follow-ups',
      'All templates + custom design',
      'Dedicated account manager',
      'Custom message editor',
      'Advanced analytics & export',
      'API access',
    ],
  },
];
