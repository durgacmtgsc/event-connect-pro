import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PackageCard, packages, Package } from '@/components/PackageCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingCart, 
  CheckCircle2,
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SlotBooking() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    
    // Simulate payment - in production, integrate with payment gateway
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Package Purchased!',
      description: `You've successfully purchased the ${selectedPackage.guests} guests package.`,
    });
    
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Buy Slots</h1>
            <p className="text-muted-foreground mt-1">
              Purchase guest slots for your invitation campaigns
            </p>
          </div>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onSelect={handleSelectPackage}
              selected={selectedPackage?.id === pkg.id}
            />
          ))}
        </div>

        {/* Selected Package Summary */}
        {selectedPackage && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">
                    {selectedPackage.guests} Guests Package
                  </p>
                  <ul className="mt-2 space-y-1">
                    {selectedPackage.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-display font-bold text-primary">
                    ₹{selectedPackage.price}
                  </p>
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                  <Button 
                    onClick={handlePurchase}
                    disabled={loading}
                    className="mt-4 gradient-primary hover:opacity-90"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Processing...' : 'Purchase Now'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold mb-2">💡 Good to Know</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Slots never expire - use them whenever you need</li>
            <li>• All packages include Voice Calls, SMS & WhatsApp</li>
            <li>• Unused slots carry forward to your next event</li>
            <li>• Need more? Purchase additional packages anytime</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
