import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Clock, QrCode, Mail } from 'lucide-react';

interface CheckInSettings {
  allowEarlyCheckIn: boolean;
  earlyCheckInMinutes: number;
  enableQrCode: boolean;
  sendConfirmationEmail: boolean;
  autoCloseCheckIn: boolean;
  checkInCloseMinutes: number;
}

interface CheckInSettingsProps {
  eventId: string;
  settings: CheckInSettings;
  onUpdate: (settings: CheckInSettings) => Promise<void>;
  onGenerateQrCodes: () => Promise<void>;
  onSendReminders: () => Promise<void>;
}

export function CheckInSettings({
  eventId,
  settings,
  onUpdate,
  onGenerateQrCodes,
  onSendReminders
}: CheckInSettingsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await onUpdate(localSettings);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-in Settings</CardTitle>
        <CardDescription>Configure event check-in options and automation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Early Check-in Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Early Check-in</Label>
                <div className="text-sm text-gray-500">Allow attendees to check in before event starts</div>
              </div>
              <Switch
                checked={localSettings.allowEarlyCheckIn}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, allowEarlyCheckIn: checked }))
                }
              />
            </div>
            {localSettings.allowEarlyCheckIn && (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  value={localSettings.earlyCheckInMinutes}
                  onChange={(e) => 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      earlyCheckInMinutes: parseInt(e.target.value) || 0 
                    }))
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-500">minutes before event</span>
              </div>
            )}
          </div>

          {/* QR Code Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>QR Code Check-in</Label>
                <div className="text-sm text-gray-500">Enable QR code scanning for quick check-in</div>
              </div>
              <Switch
                checked={localSettings.enableQrCode}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, enableQrCode: checked }))
                }
              />
            </div>
            {localSettings.enableQrCode && (
              <Button 
                variant="outline" 
                onClick={onGenerateQrCodes}
                className="w-full"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Codes for All Attendees
              </Button>
            )}
          </div>

          {/* Auto-close Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-close Check-in</Label>
                <div className="text-sm text-gray-500">Automatically close check-in after event starts</div>
              </div>
              <Switch
                checked={localSettings.autoCloseCheckIn}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, autoCloseCheckIn: checked }))
                }
              />
            </div>
            {localSettings.autoCloseCheckIn && (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  value={localSettings.checkInCloseMinutes}
                  onChange={(e) => 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      checkInCloseMinutes: parseInt(e.target.value) || 0 
                    }))
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-500">minutes after event starts</span>
              </div>
            )}
          </div>

          {/* Email Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Check-in Confirmation Emails</Label>
                <div className="text-sm text-gray-500">Send email confirmation after check-in</div>
              </div>
              <Switch
                checked={localSettings.sendConfirmationEmail}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, sendConfirmationEmail: checked }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={onSendReminders}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Check-in Reminders
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              <Clock className="w-4 h-4 mr-2" />
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}