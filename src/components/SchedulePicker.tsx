import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Bell, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchedulePickerProps {
  scheduledDate: string;
  scheduledTime: string;
  sendNow: boolean;
  enableReminders: boolean;
  reminderDays: number[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onSendNowChange: (sendNow: boolean) => void;
  onRemindersChange: (enabled: boolean) => void;
  onReminderDaysChange: (days: number[]) => void;
}

const reminderOptions = [
  { days: 7, label: '7 days before' },
  { days: 3, label: '3 days before' },
  { days: 1, label: '1 day before' },
  { days: 0, label: 'On event day' },
];

export function SchedulePicker({
  scheduledDate,
  scheduledTime,
  sendNow,
  enableReminders,
  reminderDays,
  onDateChange,
  onTimeChange,
  onSendNowChange,
  onRemindersChange,
  onReminderDaysChange,
}: SchedulePickerProps) {
  const toggleReminderDay = (days: number) => {
    if (reminderDays.includes(days)) {
      onReminderDaysChange(reminderDays.filter(d => d !== days));
    } else {
      onReminderDaysChange([...reminderDays, days].sort((a, b) => b - a));
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Send Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            When to Send
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={sendNow ? 'now' : 'schedule'}
            onValueChange={(value) => onSendNowChange(value === 'now')}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Label
              htmlFor="send-now"
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                sendNow ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value="now" id="send-now" />
              <div className="flex items-center gap-3 flex-1">
                <div className={cn(
                  "p-2 rounded-lg",
                  sendNow ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Send Now</p>
                  <p className="text-xs text-muted-foreground">
                    Send invitations immediately
                  </p>
                </div>
              </div>
            </Label>

            <Label
              htmlFor="schedule"
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                !sendNow ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value="schedule" id="schedule" />
              <div className="flex items-center gap-3 flex-1">
                <div className={cn(
                  "p-2 rounded-lg",
                  !sendNow ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Schedule</p>
                  <p className="text-xs text-muted-foreground">
                    Choose date and time
                  </p>
                </div>
              </div>
            </Label>
          </RadioGroup>

          {!sendNow && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    min={minDate}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Reminder Follow-ups
            </div>
            <Switch
              checked={enableReminders}
              onCheckedChange={onRemindersChange}
            />
          </CardTitle>
        </CardHeader>
        {enableReminders && (
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically send reminder calls/messages to guests who haven't confirmed
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {reminderOptions.map((option) => (
                <button
                  key={option.days}
                  onClick={() => toggleReminderDay(option.days)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-center transition-all",
                    reminderDays.includes(option.days)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="text-sm font-medium">{option.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
