import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Badge } from '../ui/badge';

interface EventRegistrationProps {
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
    date_time: string;
    image_url: string;
    max_capacity?: number;
    current_registrations?: number;
    ticket_types?: Array<{
      name: string;
      price: number;
      available: number;
    }>;
  };
  onRegister: (data: {
    name: string;
    email: string;
    ticketType: string;
    quantity: number;
  }) => Promise<void>;
}

export function EventRegistration({ event, onRegister }: EventRegistrationProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [ticketType, setTicketType] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const remainingCapacity = event.max_capacity 
    ? event.max_capacity - (event.current_registrations || 0)
    : undefined;

  const selectedTicket = event.ticket_types?.find(t => t.name === ticketType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !ticketType) return;

    try {
      setLoading(true);
      await onRegister({
        name,
        email,
        ticketType,
        quantity
      });
      
      // Reset form
      setName('');
      setEmail('');
      setTicketType('');
      setQuantity(1);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Registration</CardTitle>
        <CardDescription>Register for {event.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Event Details */}
          <div className="space-y-2">
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              {remainingCapacity !== undefined && (
                <Badge variant={remainingCapacity > 10 ? 'default' : 'destructive'}>
                  {remainingCapacity} spots left
                </Badge>
              )}
            </div>
            <p className="text-gray-600">{event.description}</p>
            <div className="space-y-1 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date_time).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{new Date(event.date_time).toLocaleTimeString()}</span>
              </div>
              {event.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.max_capacity && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{event.current_registrations || 0} / {event.max_capacity} registered</span>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            {event.ticket_types && (
              <div className="space-y-2">
                <Label htmlFor="ticket-type">Ticket Type</Label>
                <Select value={ticketType} onValueChange={setTicketType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ticket type" />
                  </SelectTrigger>
                  <SelectContent>
                    {event.ticket_types.map((type) => (
                      <SelectItem 
                        key={type.name} 
                        value={type.name}
                        disabled={type.available === 0}
                      >
                        {type.name} - ${type.price} ({type.available} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Number of Tickets</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={selectedTicket?.available || remainingCapacity || 10}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                required
              />
            </div>

            {selectedTicket && (
              <div className="text-right font-semibold">
                Total: ${(selectedTicket.price * quantity).toFixed(2)}
              </div>
            )}
          </form>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !name || !email || !ticketType}
        >
          {loading ? 'Registering...' : 'Register Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}