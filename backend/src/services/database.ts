import fs from 'fs';
import path from 'path';
import { User, Task, CreateTaskRequest, UpdateTaskRequest, PaginationQuery, PaginatedResponse } from '../types';
import { filterTasksArray, sortArrayBy, paginateArray } from './db-helpers';

// Database configuration
const DB_PATH = path.join(__dirname, '../../db');
const USERS_FILE = path.join(DB_PATH, 'users.json');
const TASKS_FILE = path.join(DB_PATH, 'tasks.json');

// Ensure database directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Generic file operations
const readFile = <T>(filePath: string): T[] => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

const writeFile = <T>(filePath: string, data: T[]): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
};

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// User operations
export const getUsers = async (query: PaginationQuery = {}): Promise<PaginatedResponse<User>> => {
  const users = readFile<User>(USERS_FILE);
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
  
  // Sort users
  const sortedUsers = sortArrayBy(users, sortBy, sortOrder);

  // Paginate
  const { data: paginatedUsers, total, pages } = paginateArray(sortedUsers, page, limit);

  return {
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
};

export const getUserById = async (id: string): Promise<User | null> => {
  const users = readFile<User>(USERS_FILE);
  return users.find(user => user._id === id) || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = readFile<User>(USERS_FILE);
  const user = users.find(user => user.email === email);
  if (!user) return null;
  
  // Remove password for security
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
};

export const getUserByEmailWithPassword = async (email: string): Promise<User | null> => {
  const users = readFile<User>(USERS_FILE);
  return users.find(user => user.email === email) || null;
};

export const createUser = async (userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  const users = readFile<User>(USERS_FILE);
  const newUser: User = {
    ...userData,
    _id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeFile(USERS_FILE, users);
  return newUser;
};


// Task operations
export const getTasks = async (query: PaginationQuery = {}): Promise<PaginatedResponse<Task>> => {
  const tasks = readFile<Task>(TASKS_FILE);
  const users = readFile<User>(USERS_FILE);
  
  // Populate user references
  const populatedTasks = tasks.map(task => ({
    ...task,
    assignedTo: users.find(user => user._id === task.assignedTo) || task.assignedTo,
    createdBy: users.find(user => user._id === task.createdBy) || task.createdBy
  })) as Task[];

  // Sort tasks
  const { sortBy = 'createdAt', sortOrder = 'desc' } = query;
  const sortedTasks = sortArrayBy(populatedTasks, sortBy, sortOrder);

  // Paginate
  const { page = 1, limit = 10 } = query;
  const { data: paginatedTasks, total, pages } = paginateArray(sortedTasks, page, limit);

  return {
    data: paginatedTasks,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  const tasks = readFile<Task>(TASKS_FILE);
  const users = readFile<User>(USERS_FILE);
  
  const task = tasks.find(task => task._id === id);
  if (!task) return null;

  // Populate user references
  return {
    ...task,
    assignedTo: users.find(user => user._id === task.assignedTo) || task.assignedTo,
    createdBy: users.find(user => user._id === task.createdBy) || task.createdBy
  } as Task;
};

export const createTask = async (taskData: CreateTaskRequest, createdBy: string): Promise<Task> => {
  const tasks = readFile<Task>(TASKS_FILE);
  const newTask: Task = {
    ...taskData,
    _id: generateId(),
    assignedTo: taskData.assignedTo as any, // Will be populated when reading
    createdBy: createdBy as any, // Will be populated when reading
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  writeFile(TASKS_FILE, tasks);
  
  // Return populated task
  return getTaskById(newTask._id) as Promise<Task>;
};

export const updateTask = async (id: string, updateData: UpdateTaskRequest): Promise<Task | null> => {
  const tasks = readFile<Task>(TASKS_FILE);
  const taskIndex = tasks.findIndex(task => task._id === id);
  
  if (taskIndex === -1) return null;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updateData,
    _id: tasks[taskIndex]._id, // Prevent ID changes
    updatedAt: new Date().toISOString()
  };
  
  writeFile(TASKS_FILE, tasks);
  return getTaskById(id);
};

export const deleteTask = async (id: string): Promise<boolean> => {
  const tasks = readFile<Task>(TASKS_FILE);
  const taskIndex = tasks.findIndex(task => task._id === id);
  
  if (taskIndex === -1) return false;
  
  tasks.splice(taskIndex, 1);
  writeFile(TASKS_FILE, tasks);
  return true;
};


// Create a legacy FileDatabase object for backward compatibility
export const FileDatabase = {
  getUsers,
  getUserById,
  getUserByEmail,
  getUserByEmailWithPassword,
  createUser,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default FileDatabase;