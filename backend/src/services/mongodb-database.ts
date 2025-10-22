import mongoose from 'mongoose';
import { DatabaseAdapter } from './database-adapter';
import { User, Task, CreateTaskRequest, UpdateTaskRequest, PaginationQuery, PaginatedResponse } from '../types';
import UserModel from '../models/User';
import TaskModel from '../models/Task';
import { buildMongoSort, convertObjectIdToString, toObjectId } from './db-helpers';

// User operations
export const getUsers = async (query: PaginationQuery = {}): Promise<PaginatedResponse<User>> => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
  
  const sortOptions: any = buildMongoSort(sortBy, sortOrder);

  const users = await UserModel.find()
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-password')
    .lean();

  const total = await UserModel.countDocuments();

  return {
    data: users.map(convertObjectIdToString) as User[],
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await UserModel.findById(id).select('-password').lean();
  if (!user) return null;
  return convertObjectIdToString(user) as User;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = await UserModel.findOne({ email }).select('-password').lean();
  if (!user) return null;
  return convertObjectIdToString(user) as User;
};

export const getUserByEmailWithPassword = async (email: string): Promise<User | null> => {
  const user = await UserModel.findOne({ email }).select('+password').lean();
  if (!user) return null;
  return convertObjectIdToString(user) as User;
};

export const createUser = async (userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  const user = new UserModel(userData);
  await user.save();
  return convertObjectIdToString(user.toObject()) as User;
};

export const updateUser = async (id: string, updateData: Partial<User>): Promise<User | null> => {
  const user = await UserModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password').lean();
  
  if (!user) return null;
  return convertObjectIdToString(user) as User;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const result = await UserModel.findByIdAndDelete(id);
  return !!result;
};

// Task operations
export const getTasks = async (query: PaginationQuery = {}): Promise<PaginatedResponse<Task>> => {
  const { 
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    sortOrder = 'desc'
  } = query;

  // Build sort object
  const sortOptions: any = buildMongoSort(sortBy, sortOrder);

  const tasks = await TaskModel.find({})
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await TaskModel.countDocuments({});

  return {
    data: tasks.map(convertObjectIdToString) as Task[],
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  const task = await TaskModel.findById(id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .lean();
  
  return task ? convertObjectIdToString(task) as Task : null;
};

export const createTask = async (taskData: CreateTaskRequest, createdBy: string): Promise<Task> => {
  const task = new TaskModel({
    ...taskData,
    createdBy: toObjectId(createdBy),
    assignedTo: toObjectId(taskData.assignedTo)
  });
  
  await task.save();
  
  const populatedTask = await TaskModel.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .lean();
  
  return convertObjectIdToString(populatedTask) as Task;
};

export const updateTask = async (id: string, updateData: UpdateTaskRequest): Promise<Task | null> => {
  const updateObj: any = { ...updateData };
  
  if (updateData.assignedTo) {
    updateObj.assignedTo = toObjectId(updateData.assignedTo);
  }

  const task = await TaskModel.findByIdAndUpdate(
    id,
    updateObj,
    { new: true, runValidators: true }
  )
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .lean();
  
  return task ? convertObjectIdToString(task) as Task : null;
};

export const deleteTask = async (id: string): Promise<boolean> => {
  const result = await TaskModel.findByIdAndDelete(id);
  return !!result;
};

export const getTasksByUser = async (userId: string, query: PaginationQuery = {}): Promise<PaginatedResponse<Task>> => {
  const { 
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
  } = query;

  // Build filter object
  const filter: any = { assignedTo: toObjectId(userId) };

  // Build sort object
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const tasks = await TaskModel.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await TaskModel.countDocuments(filter);

  return {
    data: tasks.map(convertObjectIdToString) as Task[],
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Create a legacy MongoDBDatabase object for backward compatibility
export const MongoDBDatabase = {
  getUsers,
  getUserById,
  getUserByEmail,
  getUserByEmailWithPassword,
  createUser,
  updateUser,
  deleteUser,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByUser,
};

export default MongoDBDatabase;