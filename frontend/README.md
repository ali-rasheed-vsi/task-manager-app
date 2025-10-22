# Team Task Management Frontend

A modern, responsive React frontend for the Team Task Management application built with Next.js, TypeScript, and TailwindCSS.

## Features

- **Modern UI/UX** with custom TailwindCSS theme and animations
- **Authentication** with JWT token management
- **Task Management** with full CRUD operations
- **User Management** with expandable task rows
- **Real-time Updates** with React Query
- **Responsive Design** for all device sizes
- **Dark Mode Support** (ready for implementation)
- **Form Validation** with Formik and Yup
- **Protected Routes** with authentication guards
- **Loading States** and error handling
- **Toast Notifications** for user feedback

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- TailwindCSS with custom theme
- React Query for state management
- Formik for form handling
- Yup for validation
- Lucide React for icons
- React Hot Toast for notifications
- Framer Motion for animations

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Backend API running (see backend README)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.local.example .env.local
```

3. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   ├── signup/
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── layout/          # Layout components
│   └── ui/              # UI components
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── lib/                 # Utility functions
├── types/               # TypeScript types
└── styles/              # Global styles
```

## Features Overview

### Authentication
- User registration and login
- JWT token management
- Automatic token refresh
- Protected routes
- Logout functionality

### Dashboard
- Overview statistics
- Recent tasks
- Task progress tracking
- Quick actions

### Task Management
- Create, read, update, delete tasks
- Task assignment to users
- Priority and status management
- Due date tracking
- Task filtering and search
- Pagination

### User Management
- User listing with task counts
- Expandable rows showing assigned tasks
- User role management
- Task assignment interface

### UI Components
- Custom design system
- Responsive components
- Loading states
- Error handling
- Toast notifications
- Form validation

## Custom Theme

The application uses a custom TailwindCSS theme with:
- Primary colors (blue palette)
- Secondary colors (gray palette)
- Success, warning, and error colors
- Custom animations and transitions
- Responsive breakpoints
- Custom shadows and borders

## API Integration

The frontend communicates with the backend through:
- Axios HTTP client
- Automatic token attachment
- Token refresh handling
- Error interception
- Request/response logging

## State Management

- React Query for server state
- React Context for authentication
- Local state with useState/useReducer
- Optimistic updates
- Cache invalidation

## Form Handling

- Formik for form state management
- Yup for validation schemas
- Custom input components
- Error display
- Loading states

## Responsive Design

- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture

## Deployment

The application can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
