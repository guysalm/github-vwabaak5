# Job Management System

A comprehensive job management system built with React, TypeScript, and Supabase for service-based businesses with subcontractor assignment and mobile-friendly job tracking.

## Features

### 🔧 Job Management
- Create, update, and track jobs with detailed customer information
- Real-time job status updates (Pending, Assigned, In Progress, Completed, Cancelled)
- Mobile-optimized job portal for subcontractors
- Automatic job ID generation
- Receipt upload functionality
- Job profit calculation (Sale Price - Parts Cost)

### 👥 User Management
- Admin and regular user roles
- Secure invitation system for new admins
- User creation, promotion/demotion, and deletion
- Password reset functionality
- Email confirmation tracking

### 🏗️ Subcontractor Management
- Add, edit, and delete subcontractors
- Regional assignment system
- Phone number and email validation
- Automatic WhatsApp integration for job notifications

### 📱 Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly interface with proper button sizing
- Prevents zoom on input focus (iOS)
- Native app integration (WhatsApp, Maps, Phone)

### 🔐 Security & Authentication
- Row Level Security (RLS) with Supabase
- JWT-based authentication
- Protected routes and admin-only functions
- Secure API endpoints with proper validation

### 📊 Analytics & Reporting
- Job statistics dashboard
- Export functionality (CSV)
- Update history tracking
- Real-time notifications

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify (frontend), Supabase (backend)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd job-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. Run the development servers:
```bash
npm run dev
```

This will start:
- Frontend on `http://localhost:5173`
- Backend API on `http://localhost:3001` (or next available port)

### Database Setup

The project includes Supabase migrations in the `supabase/migrations` directory. These will set up:

- Jobs table with RLS policies
- Subcontractors table
- Profiles table for user management
- Admin invitations system
- Job updates tracking
- Necessary functions and triggers

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (Supabase client)
├── pages/              # Main application pages
├── server/             # Backend API server
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

supabase/
├── functions/          # Edge functions
└── migrations/         # Database migrations

public/
└── job.html           # Static job view for subcontractors
```

## Key Features Explained

### Public Job Portal
The system includes a static HTML job portal (`/public/job.html`) that works independently of the React app, ensuring subcontractors can access jobs even if the main app is down.

### WhatsApp Integration
Automatic WhatsApp message generation with job details and public links. Supports both mobile app and web versions with fallback options.

### Address Autocomplete
Smart address input with Google Places API integration and OpenStreetMap fallback for reliable address validation.

### Mobile Optimization
- Prevents zoom on input focus for iOS devices
- Touch-friendly button sizing (44px minimum)
- Responsive design with mobile-first approach
- Native app integration for calls, navigation, and messaging

### Security Features
- Row Level Security (RLS) on all database tables
- Admin-only functions for user management
- Secure invitation system with expiring tokens
- Protected API endpoints with proper validation

## API Endpoints

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/role` - Update user role
- `POST /api/admin/users/:id/reset-password` - Generate password reset

### Job Endpoints
- `GET /api/jobs/:jobId` - Get job by ID
- `PUT /api/jobs/:jobId` - Update job

### Utility Endpoints
- `GET /api/config` - Get Supabase configuration
- `GET /api/health` - Health check

## Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Google Places API for address autocomplete
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Optional: WhatsApp API integration
VITE_WHATSAPP_API_TOKEN=your_whatsapp_api_token

# Optional: Email service for notifications
VITE_EMAIL_SERVICE_API_KEY=your_email_service_api_key
```

## Deployment

### Frontend (Netlify)
The project includes a `netlify.toml` configuration file for easy deployment to Netlify with proper redirects for React Router.

### Backend
The Express server can be deployed to any Node.js hosting service. Make sure to set the environment variables in your hosting platform.

### Database
Supabase handles the database hosting. Run the migrations to set up the schema:

```bash
supabase db push
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Built with [Supabase](https://supabase.com) for backend services
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
- Icons provided by [Lucide React](https://lucide.dev)
- Address autocomplete powered by [Google Places API](https://developers.google.com/maps/documentation/places/web-service)