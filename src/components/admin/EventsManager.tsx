import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { TicketTypeEditor } from '../events/ticket-type-editor';
import { AttendeeManagement } from '../events/attendee-management';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar,
  MapPin,
  Clock,
  Save,
  Upload,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { publicAnonKey, projectId } from '../../utils/supabase/info';

import { Event, Attendee } from '../../types/event';

export function EventsManager() {
  const context = useContext(AppContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Record<string, Attendee[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (!context) {
    return <div>Error: App context not available</div>;
  }

  const { session } = context;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/events`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const createNewEvent = () => {
    const newEvent: Event = {
      id: '',
      title: '',
      description: '',
      location: '',
      date_time: new Date().toISOString().slice(0, 16),
      image_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingEvent(newEvent);
    setIsDialogOpen(true);
  };

  const editEvent = (event: Event) => {
    // Format datetime for input field
    const formattedEvent = {
      ...event,
      date_time: new Date(event.date_time).toISOString().slice(0, 16)
    };
    setEditingEvent(formattedEvent);
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: keyof Event, value: string | number | boolean) => {
    if (!editingEvent) return;
    setEditingEvent({ ...editingEvent, [field]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      handleInputChange('image_url', result.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editingEvent) return;

    try {
      setSaving(true);
      const isNew = !editingEvent.id;
      const url = isNew 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-a369a306/events`
        : `https://${projectId}.supabase.co/functions/v1/make-server-a369a306/events/${editingEvent.id}`;
      
      const method = isNew ? 'POST' : 'PUT';

      // Convert datetime back to ISO string
      const eventToSave = {
        ...editingEvent,
        date_time: new Date(editingEvent.date_time).toISOString()
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(eventToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      toast.success(`Event ${isNew ? 'created' : 'updated'} successfully!`);
      setIsDialogOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      toast.success('Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const fetchAttendees = async (eventId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a369a306/events/${eventId}/attendees`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendees');
      }

      const data = await response.json();
      setAttendees(prev => ({ ...prev, [eventId]: data }));
    } catch (error) {
      console.error('Error fetching attendees:', error);
      toast.error('Failed to load attendees');
    }
  };

  const handleCheckIn = async (eventId: string, attendeeId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a369a306/events/${eventId}/attendees/${attendeeId}/check-in`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check in attendee');
      }

      // Refresh attendees list
      await fetchAttendees(eventId);
      toast.success('Attendee check-in status updated');
    } catch (error) {
      console.error('Error updating check-in status:', error);
      toast.error('Failed to update check-in status');
    }
  };

  const handleExportAttendees = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const attendeesList = attendees[eventId] || [];
      const csvContent = 
        'Name,Email,Ticket Type,Quantity,Registered At,Checked In\n' +
        attendeesList.map(a => 
          `${a.name},${a.email},${a.ticketType},${a.quantity},${a.registeredAt},${a.checkedIn}`
        ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.title}-attendees.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting attendees:', error);
      toast.error('Failed to export attendees list');
    }
  };

  const isUpcoming = (dateTime: string) => {
    return new Date(dateTime) > new Date();
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const upcomingEvents = events.filter(event => isUpcoming(event.date_time));
  const pastEvents = events.filter(event => !isUpcoming(event.date_time));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Events Manager</span>
              </CardTitle>
              <CardDescription>
                Schedule and manage your events
              </CardDescription>
            </div>
            <Button onClick={createNewEvent} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Events Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/70 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{events.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Past Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-500">{pastEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Events</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">No events scheduled yet</p>
              <Button onClick={createNewEvent}>Create your first event</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div>
                  <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span>Upcoming Events</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {upcomingEvents.length}
                    </Badge>
                  </h3>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onEdit={editEvent}
                        onDelete={handleDelete}
                        isUpcoming={true}
                        onManageAttendees={() => {
                          setSelectedEventId(event.id);
                          fetchAttendees(event.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Past Events</span>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {pastEvents.length}
                    </Badge>
                  </h3>
                  <div className="space-y-4">
                    {pastEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onEdit={editEvent}
                        onDelete={handleDelete}
                        isUpcoming={false}
                        onManageAttendees={() => {
                          setSelectedEventId(event.id);
                          fetchAttendees(event.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Event Attendees */}
      {selectedEventId && (
        <AttendeeManagement
          eventId={selectedEventId}
          event={events.find(e => e.id === selectedEventId)!}
          attendees={attendees[selectedEventId] || []}
          onCheckIn={(attendeeId) => handleCheckIn(selectedEventId, attendeeId)}
          onExportList={() => handleExportAttendees(selectedEventId)}
          onToggleRegistration={async () => {
            const event = events.find(e => e.id === selectedEventId);
            if (!event) return;
            
            try {
              const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-a369a306/events/${selectedEventId}/registration`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    isOpen: !event.registrationOpen
                  }),
                }
              );

              if (!response.ok) {
                throw new Error('Failed to toggle registration');
              }

              toast.success(`Registration ${event.registrationOpen ? 'closed' : 'opened'} successfully`);
              fetchEvents();
            } catch (error) {
              console.error('Error toggling registration:', error);
              toast.error('Failed to update registration status');
            }
          }}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent?.id ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <DialogDescription>
              Fill in the event details
            </DialogDescription>
          </DialogHeader>
          
          {editingEvent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={editingEvent.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingEvent.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the event..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editingEvent.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Event location or venue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_time">Date & Time</Label>
                  <Input
                    id="date_time"
                    type="datetime-local"
                    value={editingEvent.date_time}
                    onChange={(e) => handleInputChange('date_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Event Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    value={editingEvent.capacity || ''}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationOpen">Registration Status</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant={editingEvent.registrationOpen ? "default" : "outline"}
                      onClick={() => handleInputChange('registrationOpen', true)}
                      className="flex-1"
                    >
                      Open
                    </Button>
                    <Button
                      type="button"
                      variant={!editingEvent.registrationOpen ? "default" : "outline"}
                      onClick={() => handleInputChange('registrationOpen', false)}
                      className="flex-1"
                    >
                      Closed
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Event Image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" disabled={uploading}>
                    <Upload className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                {editingEvent.image_url && (
                  <img 
                    src={editingEvent.image_url} 
                    alt="Event preview" 
                    className="w-full h-48 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Saving...' : 'Save Event'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventCard({ 
  event, 
  onEdit, 
  onDelete, 
  isUpcoming,
  onManageAttendees 
}: { 
  event: Event; 
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  isUpcoming: boolean;
  onManageAttendees: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {event.image_url && (
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg text-gray-900">{event.title || 'Untitled Event'}</h3>
            <div className="flex items-center space-x-2 flex-wrap">
              <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                {isUpcoming ? 'Upcoming' : 'Past'}
              </Badge>
              {isUpcoming && (
                <Badge variant={event.registrationOpen ? 'success' : 'destructive'}>
                  Registration {event.registrationOpen ? 'Open' : 'Closed'}
                </Badge>
              )}
              {event.capacity && (
                <Badge variant="outline">
                  Capacity: {event.capacity}
                </Badge>
              )}
              {event.enableWaitlist && (
                <Badge variant="secondary">
                  Waitlist Enabled
                </Badge>
              )}
              {event.ticketTypes?.length > 0 && (
                <Badge variant="outline" className="bg-blue-50">
                  {event.ticketTypes.length} Ticket Type{event.ticketTypes.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-3">{event.description}</p>
          <div className="space-y-1 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.date_time).toLocaleString()}</span>
            </div>
            {event.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
                  <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(event)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(event.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onManageAttendees}
            >
              Manage Attendees
            </Button>
          </div>
      </div>
    </div>
  );
}