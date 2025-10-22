import 'dotenv/config';
// Database adapter interface for easy switching between file-based and MongoDB
import { User, Task, CreateTaskRequest, UpdateTaskRequest, PaginationQuery, PaginatedResponse } from '../types';

export interface DatabaseAdapter {
  // User operations
  getUsers(query?: PaginationQuery): Promise<PaginatedResponse<User>>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByEmailWithPassword(email: string): Promise<User | null>;
  createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: string, updateData: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;

  // Task operations
  getTasks(query?: PaginationQuery): Promise<PaginatedResponse<Task>>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(taskData: CreateTaskRequest, createdBy: string): Promise<Task>;
  updateTask(id: string, updateData: UpdateTaskRequest): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  getTasksByUser(userId: string, query?: PaginationQuery): Promise<PaginatedResponse<Task>>;
}

// Database switching logic
const getDatabaseAdapter = (): DatabaseAdapter => {
  const databaseType = (process.env.DATABASE_TYPE || 'file').toString().trim().toLowerCase();
  console.log(`Environment DATABASE_TYPE: "${databaseType}"`);
  
  if (databaseType === 'mongodb') {
    console.log('✅ Using MongoDB database');
    const MongoDBDatabase = require('./mongodb-database').default;
    return MongoDBDatabase;
  } else {
    console.log('📁 Using file-based database');
    const FileDatabase = require('./database').default;
    return FileDatabase;
  }
};

// Export the selected database adapter
export default getDatabaseAdapter();
