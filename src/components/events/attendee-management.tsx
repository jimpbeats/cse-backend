import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Searc              <div key={attendee.id} 
                className={`py-3 flex items-center justify-between ${
                  selectedAttendees.has(attendee.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  const newSelected = new Set(selectedAttendees);
                  if (selectedAttendees.has(attendee.id)) {
                    newSelected.delete(attendee.id);
                  } else {
                    newSelected.add(attendee.id);
                  }
                  setSelectedAttendees(newSelected);
                }}
                role="button"
                tabIndex={0}
              >Download, CheckCircle2, XCircle } from 'lucide-react';
import type { Event, Attendee } from '../../types/event';

// Using imported Attendee type from types/event.ts

interface AttendeeManagementProps {
  eventId: string;
  event: Event;
  attendees: Attendee[];
  onCheckIn: (attendeeId: string) => Promise<void>;
  onExportList: () => void;
  onToggleRegistration: () => Promise<void>;
}

export function AttendeeManagement({ 
  eventId, 
  event,
  attendees, 
  onCheckIn, 
  onExportList,
  onToggleRegistration
}: AttendeeManagementProps) {
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState<string | null>(null);
  const [selectedAttendees, setSelectedAttendees] = React.useState<Set<string>>(new Set());
  const [showCheckInSettings, setShowCheckInSettings] = React.useState(false);

  const filteredAttendees = attendees.filter(
    attendee =>
      attendee.name.toLowerCase().includes(search.toLowerCase()) ||
      attendee.email.toLowerCase().includes(search.toLowerCase()) ||
      attendee.ticketType.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = async (attendeeId: string) => {
    try {
      setLoading(attendeeId);
      await onCheckIn(attendeeId);
    } finally {
      setLoading(null);
    }
  };

  const stats = {
    total: attendees.length,
    checkedIn: attendees.filter(a => a.checkedIn).length,
    waitlist: attendees.filter(a => a.onWaitlist).length,
    byTicketType: attendees.reduce((acc, curr) => {
      acc[curr.ticketType] = (acc[curr.ticketType] || 0) + curr.quantity;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attendees</CardTitle>
            <CardDescription>Manage event attendees and check-ins</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant={event.registrationOpen ? "destructive" : "default"}
              onClick={onToggleRegistration}
            >
              {event.registrationOpen ? 'Close Registration' : 'Open Registration'}
            </Button>
            <Button variant="outline" onClick={onExportList}>
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  {event.capacity && (
                    <div className="text-sm text-gray-500">
                      of {event.capacity} capacity
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Checked In</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.checkedIn}</div>
                  <div className="text-sm text-gray-500">
                    {Math.round((stats.checkedIn / stats.total) * 100)}% of total
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Registration Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant={event.registrationOpen ? "success" : "destructive"}>
                      {event.registrationOpen ? 'Open' : 'Closed'}
                    </Badge>
                    {event.capacity && stats.total >= event.capacity && (
                      <Badge variant="outline">
                        Full
                      </Badge>
                    )}
                    {stats.waitlist > 0 && (
                      <Badge variant="secondary">
                        {stats.waitlist} on waitlist
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ticket Type Breakdown */}
            {event.ticketTypes && event.ticketTypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ticket Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.ticketTypes.map(ticket => (
                      <div key={ticket.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{ticket.name}</div>
                          <Badge variant={ticket.available ? "outline" : "secondary"}>
                            {ticket.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {stats.byTicketType[ticket.id] || 0} sold
                          {ticket.capacity && ` of ${ticket.capacity}`}
                        </div>
                        {ticket.price > 0 && (
                          <div className="text-sm">${ticket.price.toFixed(2)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSelected = new Set<string>();
                  if (selectedAttendees.size < filteredAttendees.length) {
                    filteredAttendees.forEach(a => newSelected.add(a.id));
                  }
                  setSelectedAttendees(newSelected);
                }}
              >
                {selectedAttendees.size < filteredAttendees.length ? 'Select All' : 'Deselect All'}
              </Button>
              {selectedAttendees.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        setLoading('bulk');
                        await Promise.all(
                          Array.from(selectedAttendees).map(id => onCheckIn(id))
                        );
                        setSelectedAttendees(new Set());
                      } finally {
                        setLoading(null);
                      }
                    }}
                    disabled={loading === 'bulk'}
                  >
                    {loading === 'bulk' ? 'Processing...' : 'Check-in Selected'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Export selected attendees
                      const selectedList = attendees.filter(a => 
                        selectedAttendees.has(a.id)
                      );
                      // Call export function with selected list
                      onExportList();
                      setSelectedAttendees(new Set());
                    }}
                  >
                    Export Selected
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCheckInSettings(true)}
            >
              Check-in Settings
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search attendees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Attendee List */}
          <div className="divide-y">
            {filteredAttendees.map((attendee) => (
              <div 
                key={attendee.id} 
                className="py-3 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{attendee.name}</h3>
                    <Badge variant={attendee.checkedIn ? 'default' : 'secondary'}>
                      {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {attendee.email} • {attendee.ticketType} ({attendee.quantity})
                  </div>
                  <div className="text-xs text-gray-400">
                    Registered: {new Date(attendee.registeredAt).toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCheckIn(attendee.id)}
                  disabled={loading === attendee.id}
                >
                  {attendee.checkedIn ? (
                    <XCircle className="w-4 h-4 text-gray-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}