# Universal React Backend Boilerplate with Supabase

A comprehensive admin system for managing web content with modern glassmorphism UI design. This boilerplate provides a complete solution for building content management systems with user authentication, role-based access control, and full CRUD functionality.

## Features

### Core Features
- **User Authentication**: Complete auth system with login, signup, and session management
- **Role-Based Access Control**: Admin dashboard with protected routes
- **Content Management**: Full CRUD operations for:
  - Hero sections with customizable content
  - Blog posts with rich text editing
  - Events with date/time management
  - Custom forms with field builder
- **File Uploads**: Integrated Supabase Storage for images and media
- **Real-time Updates**: Live data synchronization using Supabase subscriptions
- **Public Pages**: SEO-friendly public blog and form submission pages
- **Hash-based Routing**: Compatible with Figma Make environment

### UI/UX Features
- **Modern Glassmorphism Design**: Beautiful frosted glass effects
- **Responsive Layout**: Mobile-first design approach
- **Dark/Light Mode**: Complete theme system
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Smooth loading animations
- **Form Validation**: Client-side validation with error handling

## Dependencies

### Core Dependencies
```json
{
  "@supabase/supabase-js": "^2.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

### UI Dependencies
```json
{
  "sonner": "^2.0.3",
  "lucide-react": "latest",
  "tailwindcss": "^4.0.0"
}
```

### Form & Validation
```json
{
  "react-hook-form": "^7.55.0"
}
```

### Utility Libraries
```json
{
  "clsx": "latest",
  "class-variance-authority": "latest"
}
```

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Basic knowledge of React and TypeScript

### 2. Supabase Configuration

#### Database Setup
The application uses a simple key-value store table that's automatically configured. No additional database setup is required.

#### Environment Variables
You'll need to configure the following Supabase credentials:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

#### Storage Setup
The backend automatically creates private storage buckets for file uploads with the prefix `make-a369a306`.

### 3. Authentication Setup
The system includes a demo admin account:
- **Email**: admin@example.com
- **Password**: admin123

### 4. Deployment
This boilerplate is optimized for the Figma Make environment and uses hash-based routing for compatibility.

## Project Structure

```
├── App.tsx                     # Main application entry point
├── components/
│   ├── Login.tsx              # Authentication component
│   ├── AdminDashboard.tsx     # Main admin interface
│   ├── PublicBlog.tsx         # Public blog viewer
│   ├── PublicForm.tsx         # Public form submission
│   ├── admin/                 # Admin-specific components
│   │   ├── Dashboard.tsx      # Analytics dashboard
│   │   ├── HeroManager.tsx    # Hero section management
│   │   ├── BlogManager.tsx    # Blog post management
│   │   ├── EventsManager.tsx  # Events management
│   │   └── FormsManager.tsx   # Form builder
│   └── ui/                    # ShadCN UI components
├── styles/
│   └── globals.css           # Tailwind v4 configuration
├── supabase/
│   └── functions/
│       └── server/           # Backend API endpoints
└── utils/
    └── supabase/            # Supabase utilities
```

## Usage Guide

### Admin Dashboard
1. **Login**: Use admin@example.com / admin123 or create a new account
2. **Dashboard**: View analytics and system overview
3. **Content Management**: Use the sidebar to navigate between different content types
4. **File Uploads**: Drag and drop files or use the upload interface

### Content Types

#### Hero Sections
- Customizable title, subtitle, and call-to-action
- Background image support
- Multiple layout options

#### Blog Posts
- Rich text editor
- Featured images
- SEO-friendly slugs
- Publication status control

#### Events
- Date and time management
- Location information
- Registration links
- Category organization

#### Custom Forms
- Drag-and-drop form builder
- Multiple field types (text, email, select, etc.)
- Form validation
- Submission management

### Public Pages
Access public content via hash routing:
- Blog posts: `#blog/post-slug`
- Forms: `#forms/form-slug`

## Configuration

### Theme Customization
The application uses Tailwind v4 with CSS custom properties for theming. Modify `/styles/globals.css` to customize:
- Colors (light/dark mode)
- Typography
- Spacing
- Border radius
- Glassmorphism effects

### API Endpoints
Backend routes are available at:
```
https://{projectId}.supabase.co/functions/v1/make-server-a369a306/
```

Available endpoints:
- `POST /signup` - User registration
- `GET /analytics` - Dashboard analytics
- Content CRUD operations for all content types

## Security Features

- **Authentication**: Supabase Auth with session management
- **Authorization**: Role-based access control
- **Input Validation**: Client and server-side validation
- **File Security**: Private storage buckets with signed URLs
- **CORS Protection**: Configured for secure cross-origin requests

## Development

### Local Development
1. Clone the repository
2. Configure Supabase credentials
3. Install dependencies
4. Start the development server

### Adding New Content Types
1. Create a new manager component in `/components/admin/`
2. Add routing in `AdminDashboard.tsx`
3. Implement backend endpoints in `/supabase/functions/server/`
4. Update the context type definitions

### Customizing UI
- All UI components are based on ShadCN/UI
- Modify components in `/components/ui/` as needed
- Update theme variables in `globals.css`

## Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Tablet-optimized layouts
- Desktop-specific features
- Touch-friendly interactions

## Real-time Features

Powered by Supabase real-time subscriptions:
- Live content updates
- Real-time form submissions
- Instant notifications
- Collaborative editing support

## Analytics Dashboard

The admin dashboard includes:
- Content statistics
- User engagement metrics
- Form submission analytics
- Growth charts and trends

## Design System

### Colors
- Primary: Deep navy (#030213)
- Secondary: Light gray variants
- Accent: Customizable theme colors
- Status: Success, warning, error states

### Typography
- Headings: Medium weight (500)
- Body: Normal weight (400)
- Consistent line heights (1.5)
- Responsive font scaling

### Components
- Glassmorphism cards with backdrop blur
- Consistent spacing and padding
- Smooth animations and transitions
- Accessible color contrasts

## Contributing

This boilerplate is designed to be extended and customized. Common customization points:
- Add new content types
- Implement additional auth providers
- Extend the analytics dashboard
- Add new UI components

## License

This project is open source and available under the MIT License.

## Links

- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [ShadCN/UI](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)

---

**Demo Account**: admin@example.com / admin123

# cse-backend
# cse-backend
