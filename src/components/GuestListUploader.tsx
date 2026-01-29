import { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Upload, 
  FileSpreadsheet, 
  Plus, 
  X, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Guest {
  phone: string;
  name?: string;
}

interface GuestListUploaderProps {
  guests: Guest[];
  onChange: (guests: Guest[]) => void;
}

export function GuestListUploader({ guests, onChange }: GuestListUploaderProps) {
  const { toast } = useToast();
  const [pasteInput, setPasteInput] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');

  const parsePhoneNumbers = (input: string): Guest[] => {
    return input
      .split(/[\n,;]+/)
      .map(line => {
        const parts = line.split(/[\t|]+/);
        const phone = parts[0]?.trim().replace(/[^\d+]/g, '');
        const name = parts[1]?.trim();
        return { phone, name };
      })
      .filter(g => g.phone.length >= 10);
  };

  const handlePaste = () => {
    const newGuests = parsePhoneNumbers(pasteInput);
    if (newGuests.length === 0) {
      toast({
        title: 'No valid numbers',
        description: 'Please enter valid phone numbers',
        variant: 'destructive',
      });
      return;
    }
    
    const uniqueGuests = [...guests];
    newGuests.forEach(g => {
      if (!uniqueGuests.some(existing => existing.phone === g.phone)) {
        uniqueGuests.push(g);
      }
    });
    
    onChange(uniqueGuests);
    setPasteInput('');
    toast({
      title: 'Guests Added',
      description: `Added ${newGuests.length} guests`,
    });
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newGuests: Guest[] = lines
        .slice(1) // Skip header row
        .map(line => {
          const parts = line.split(',');
          const phone = parts[0]?.trim().replace(/[^\d+]/g, '');
          const name = parts[1]?.trim().replace(/"/g, '');
          return { phone, name };
        })
        .filter(g => g.phone && g.phone.length >= 10);

      if (newGuests.length === 0) {
        toast({
          title: 'No valid numbers found',
          description: 'Please check your file format',
          variant: 'destructive',
        });
        return;
      }

      const uniqueGuests = [...guests];
      newGuests.forEach(g => {
        if (!uniqueGuests.some(existing => existing.phone === g.phone)) {
          uniqueGuests.push(g);
        }
      });

      onChange(uniqueGuests);
      toast({
        title: 'File Uploaded',
        description: `Found ${newGuests.length} guests`,
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [guests, onChange, toast]);

  const handleManualAdd = () => {
    if (!manualPhone || manualPhone.replace(/[^\d]/g, '').length < 10) {
      toast({
        title: 'Invalid number',
        description: 'Please enter a valid phone number',
        variant: 'destructive',
      });
      return;
    }

    const phone = manualPhone.trim().replace(/[^\d+]/g, '');
    if (guests.some(g => g.phone === phone)) {
      toast({
        title: 'Duplicate',
        description: 'This number already exists',
        variant: 'destructive',
      });
      return;
    }

    onChange([...guests, { phone, name: manualName.trim() || undefined }]);
    setManualPhone('');
    setManualName('');
  };

  const removeGuest = (phone: string) => {
    onChange(guests.filter(g => g.phone !== phone));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Guest List
          </div>
          {guests.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {guests.length} guests added
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="paste">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paste">Paste</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label>Paste phone numbers</Label>
              <Textarea
                placeholder="Paste phone numbers here, one per line or comma-separated&#10;&#10;You can also include names:&#10;9876543210, John Doe&#10;8765432109, Jane Smith"
                value={pasteInput}
                onChange={(e) => setPasteInput(e.target.value)}
                rows={6}
                className="font-mono text-sm resize-none"
              />
            </div>
            <Button onClick={handlePaste} disabled={!pasteInput.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Numbers
            </Button>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <Label htmlFor="excel-upload" className="cursor-pointer">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">Upload Excel or CSV file</p>
                <p className="text-xs text-muted-foreground mb-4">
                  First column: Phone numbers, Second column: Names (optional)
                </p>
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </Label>
              <Input
                id="excel-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="Guest Name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleManualAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
          </TabsContent>
        </Tabs>

        {/* Guest List */}
        {guests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Added Guests</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onChange([])}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
              {guests.map((guest, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 rounded-lg bg-background"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="font-mono text-sm">{guest.phone}</span>
                    {guest.name && (
                      <span className="text-sm text-muted-foreground">• {guest.name}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => removeGuest(guest.phone)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {guests.length === 0 && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="h-5 w-5 text-warning" />
            <p className="text-sm text-warning">No guests added yet. Add at least one guest to continue.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
