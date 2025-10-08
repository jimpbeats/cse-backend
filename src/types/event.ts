export type TicketType = {
  id: string;
  name: string;
  price: number;
  capacity?: number;
  description?: string;
  available: boolean;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  date_time: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  capacity?: number;
  registrationOpen?: boolean;
  ticketTypes: TicketType[];
  enableWaitlist?: boolean;
};

export type Attendee = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  ticketTypeName: string;
  quantity: number;
  registeredAt: string;
  checkedIn: boolean;
  eventId: string;
  onWaitlist: boolean;
  waitlistPosition?: number;
};