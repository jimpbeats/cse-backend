import { FormField } from '../admin/FormsManager';

export const formTemplates = {
  contact: {
    title: 'Contact Form',
    description: 'A standard contact form for collecting inquiries',
    schema: [
      {
        id: crypto.randomUUID(),
        type: 'text',
        label: 'Name',
        placeholder: 'John Doe',
        required: true
      },
      {
        id: crypto.randomUUID(),
        type: 'email',
        label: 'Email',
        placeholder: 'john@example.com',
        required: true
      },
      {
        id: crypto.randomUUID(),
        type: 'select',
        label: 'Subject',
        required: true,
        options: ['General Inquiry', 'Support', 'Partnership', 'Other']
      },
      {
        id: crypto.randomUUID(),
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your message here...',
        required: true
      }
    ]
  },
  event: {
    title: 'Event Registration',
    description: 'Collect registrations for your events',
    schema: [
      {
        id: crypto.randomUUID(),
        type: 'text',
        label: 'Full Name',
        placeholder: 'John Doe',
        required: true
      },
      {
        id: crypto.randomUUID(),
        type: 'email',
        label: 'Email',
        placeholder: 'john@example.com',
        required: true
      },
      {
        id: crypto.randomUUID(),
        type: 'select',
        label: 'Ticket Type',
        required: true,
        options: ['Standard', 'VIP', 'Group']
      },
      {
        id: crypto.randomUUID(),
        type: 'checkbox',
        label: 'Additional Options',
        required: false,
        options: ['Parking', 'Accommodation', 'Dietary Requirements']
      }
    ]
  },
  feedback: {
    title: 'Feedback Survey',
    description: 'Collect user feedback and ratings',
    schema: [
      {
        id: crypto.randomUUID(),
        type: 'select',
        label: 'Rating',
        required: true,
        options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Fair', '1 - Poor']
      },
      {
        id: crypto.randomUUID(),
        type: 'textarea',
        label: 'What did you like?',
        placeholder: 'Share what you enjoyed...',
        required: true
      },
      {
        id: crypto.randomUUID(),
        type: 'textarea',
        label: 'What could be improved?',
        placeholder: 'Share your suggestions...',
        required: true
      },
      {
        id: crypto.randomUUID(),
        type: 'checkbox',
        label: 'Would you recommend us?',
        required: true,
        options: ['Yes', 'No', 'Maybe']
      }
    ]
  }
} as const;