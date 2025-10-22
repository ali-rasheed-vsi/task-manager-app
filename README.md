# Team Task Management App

A full-stack task management application built with React, Node.js, and MongoDB. Features a modern, responsive UI with real-time task management, user authentication, and team collaboration tools.

## 🚀 Features

### Frontend (React + TypeScript + TailwindCSS)
- **Modern UI/UX** with custom TailwindCSS theme and smooth animations
- **Authentication** with JWT token management and protected routes
- **Task Management** with full CRUD operations, filtering, and search
- **User Management** with expandable rows showing assigned tasks
- **Dashboard** with statistics and task overview
- **Responsive Design** optimized for all devices
- **Real-time Updates** with React Query
- **Form Validation** with Formik and Yup
- **Toast Notifications** for user feedback

### Backend (Node.js + Express + TypeScript + MongoDB)
- **RESTful API** with comprehensive endpoints
- **JWT Authentication** with access and refresh tokens
- **MongoDB Integration** with Mongoose ODM
- **Input Validation** using Joi
- **Security Features** with CORS, Helmet, and rate limiting
- **Error Handling** with global middleware
- **TypeScript** for type safety

## 🛠 Tech Stack

### Frontend
- Next.js 15 with App Router
- React 19
- TypeScript
- TailwindCSS with custom theme
- React Query for state management
- Formik for forms
- Lucide React for icons
- React Hot Toast for notifications

### Backend
- Node.js 18+
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Joi for validation
- Bcrypt for password hashing
- CORS, Helmet, Rate Limiting

## 📁 Project Structure

```
team-tasks-dashboard/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
└── backend/                  # Node.js backend
    ├── src/
    │   ├── config/          # Database config
    │   ├── controllers/     # Route controllers
    │   ├── middleware/      # Custom middleware
    │   ├── models/          # Mongoose models
    │   ├── routes/          # API routes
    │   ├── types/           # TypeScript types
    │   ├── utils/           # Utility functions
    │   └── validators/      # Joi schemas
    ├── package.json
    └── tsconfig.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB running locally or MongoDB Atlas
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/demodb
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.local.example .env.local
```

4. Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

5. Start the frontend server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile

### Users
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Tasks
- `GET /api/v1/tasks` - Get all tasks
- `GET /api/v1/tasks/my-tasks` - Get current user's tasks
- `GET /api/v1/tasks/:id` - Get task by ID
- `POST /api/v1/tasks` - Create new task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

## 🎨 UI Features

### Custom Theme
- Primary colors (blue palette)
- Secondary colors (gray palette)
- Success, warning, and error colors
- Custom animations and transitions
- Responsive breakpoints
- Custom shadows and borders

### Components
- Reusable UI components
- Loading states and spinners
- Form validation with error messages
- Toast notifications
- Modal dialogs
- Data tables with pagination

## 🔐 Authentication

- JWT-based authentication
- Access tokens (15 minutes)
- Refresh tokens (7 days) in HttpOnly cookies
- Automatic token refresh
- Protected routes
- Role-based access control

## 📱 Responsive Design

- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Optimized for all screen sizes
- Collapsible sidebar on mobile

## 🚀 Deployment

### Backend
- Deploy to any Node.js hosting platform
- Set environment variables
- Ensure MongoDB connection

### Frontend
- Deploy to Vercel (recommended)
- Set `NEXT_PUBLIC_API_URL` environment variable
- Build and deploy

## 🧪 Testing

Both frontend and backend are ready for testing:
- Unit tests can be added
- Integration tests for API endpoints
- E2E tests for user workflows

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ using React, Node.js, and MongoDB**