import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Trash2 } from 'lucide-react';
import type { TicketType } from '../../types/event';

interface TicketTypeEditorProps {
  ticketTypes: TicketType[];
  onChange: (ticketTypes: TicketType[]) => void;
}

export function TicketTypeEditor({ ticketTypes, onChange }: TicketTypeEditorProps) {
  const addTicketType = () => {
    onChange([
      ...ticketTypes,
      {
        id: crypto.randomUUID(),
        name: '',
        price: 0,
        available: true
      }
    ]);
  };

  const updateTicketType = (index: number, updates: Partial<TicketType>) => {
    const updatedTickets = [...ticketTypes];
    updatedTickets[index] = {
      ...updatedTickets[index],
      ...updates
    };
    onChange(updatedTickets);
  };

  const removeTicketType = (id: string) => {
    onChange(ticketTypes.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Ticket Types</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTicketType}
        >
          Add Ticket Type
        </Button>
      </div>

      <div className="space-y-4">
        {ticketTypes.map((ticket, index) => (
          <div key={ticket.id} className="flex items-start space-x-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ticket Name</Label>
                  <Input
                    value={ticket.name}
                    onChange={(e) => updateTicketType(index, { name: e.target.value })}
                    placeholder="e.g., Early Bird, VIP, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ticket.price}
                    onChange={(e) => updateTicketType(index, { price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity (Optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={ticket.capacity || ''}
                    onChange={(e) => updateTicketType(index, { 
                      capacity: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Button
                    type="button"
                    variant={ticket.available ? "default" : "secondary"}
                    className="w-full"
                    onClick={() => updateTicketType(index, { available: !ticket.available })}
                  >
                    {ticket.available ? 'Available' : 'Unavailable'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={ticket.description || ''}
                  onChange={(e) => updateTicketType(index, { description: e.target.value })}
                  placeholder="Describe what's included with this ticket"
                />
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700"
              onClick={() => removeTicketType(ticket.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}