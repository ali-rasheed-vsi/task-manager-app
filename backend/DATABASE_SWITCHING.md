# Database Switching Guide

This backend is designed to easily switch between file-based storage and MongoDB. The current implementation uses a file-based database stored in the `db/` folder.

## Current Setup (File-based Database)

The application currently uses JSON files stored in `backend/db/`:
- `users.json` - Contains user data
- `tasks.json` - Contains task data

## Switching Between Databases

The application now supports automatic switching between file-based and MongoDB databases using environment variables.

### 1. Environment Configuration

Update your `.env` file to specify the database type:

```env
# For file-based database (default)
DATABASE_TYPE=file

# For MongoDB database
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/demodb
```

### 2. Database Types

#### File-based Database (Default)
- **Type**: `DATABASE_TYPE=file`
- **Storage**: JSON files in `backend/db/`
- **Dependencies**: None (built-in)
- **Use case**: Development, testing, simple deployments

#### MongoDB Database
- **Type**: `DATABASE_TYPE=mongodb`
- **Storage**: MongoDB database
- **Dependencies**: `mongoose` (already installed)
- **Use case**: Production, scalable applications

### 3. Automatic Switching

The application automatically detects the `DATABASE_TYPE` environment variable and:
- Loads the appropriate database adapter
- Connects to MongoDB if `DATABASE_TYPE=mongodb`
- Uses file-based storage if `DATABASE_TYPE=file` (default)

### 4. No Code Changes Required

The switching is handled automatically by the database adapter system. All controllers and services work identically with both database types.

## Benefits of This Architecture

1. **Easy Testing**: File-based database is perfect for development and testing
2. **No Dependencies**: No need to install and configure MongoDB for development
3. **Data Persistence**: Data persists between server restarts
4. **Easy Migration**: Simple switch to MongoDB when ready for production
5. **Consistent API**: Same interface regardless of database backend

## File-based Database Features

- **Automatic ID Generation**: Uses timestamp + random string
- **Data Validation**: Basic validation on create/update operations
- **Pagination**: Full pagination support
- **Filtering**: Status, priority, and user filtering
- **Sorting**: Configurable sorting by any field
- **Relationships**: Proper user-task relationships with population

## Data Structure

### Users
```json
{
  "_id": "user_1",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "$2b$10$...",
  "role": "admin",
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

### Tasks
```json
{
  "_id": "task_1",
  "title": "Design new landing page",
  "description": "Create a modern and responsive landing page...",
  "status": "in-progress",
  "priority": "high",
  "assignedTo": "user_2",
  "createdBy": "user_1",
  "dueDate": "2024-02-15T17:00:00.000Z",
  "createdAt": "2024-01-20T09:00:00.000Z",
  "updatedAt": "2024-01-22T14:30:00.000Z"
}
```

## Development vs Production

- **Development**: Use file-based database for simplicity
- **Production**: Switch to MongoDB for scalability and reliability
- **Testing**: File-based database is perfect for unit tests

The application will work identically with both database backends!
