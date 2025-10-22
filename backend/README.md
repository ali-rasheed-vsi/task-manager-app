# Team Task Management Backend

A robust Node.js backend API for the Team Task Management application built with Express, TypeScript, and MongoDB.

## Features

- **JWT Authentication** with access and refresh tokens
- **User Management** with role-based access control
- **Task Management** with full CRUD operations
- **MongoDB Integration** with Mongoose ODM
- **Input Validation** using Joi
- **Error Handling** with global error middleware
- **Security** with CORS, Helmet, and rate limiting
- **TypeScript** for type safety

## Tech Stack

- Node.js 18+
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Joi for validation
- Bcrypt for password hashing
- CORS for cross-origin requests
- Helmet for security headers
- Express Rate Limit for API protection

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB running locally or MongoDB Atlas account
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update `.env` with your configuration:
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

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

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

## Database Schema

### User Model
```typescript
{
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
```

### Task Model
```typescript
{
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: ObjectId (User);
  createdBy: ObjectId (User);
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Authentication

The API uses JWT tokens for authentication:
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) stored in HttpOnly cookie

### Request Headers
```
Authorization: Bearer <access_token>
```

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Validation

Input validation is handled using Joi schemas:
- Request body validation
- Query parameter validation
- Custom error messages

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Security headers with Helmet
- Rate limiting
- Input sanitization
- SQL injection prevention (NoSQL)

## Development

### Project Structure
```
src/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── validators/      # Joi validation schemas
└── server.ts        # Application entry point
```

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
