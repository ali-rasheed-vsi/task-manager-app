import { Request, Response } from 'express';
import Database from '../services/database-adapter';
import { ApiResponse, PaginationQuery, PaginatedResponse, CreateTaskRequest, UpdateTaskRequest } from '../types';

export const getTasks = async (req: Request<{}, ApiResponse<PaginatedResponse<any>>, {}, PaginationQuery>, res: Response<ApiResponse<PaginatedResponse<any>>>) => {
  try {
    const query = {
      page: parseInt(String(req.query.page)) || 1,
      limit: parseInt(String(req.query.limit)) || 10,
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc'
    };

    const result = await Database.getTasks(query);

    return res.json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTaskById = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;

    const task = await Database.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.json({
      success: true,
      message: 'Task retrieved successfully',
      data: task
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createTask = async (req: Request<{}, ApiResponse, CreateTaskRequest>, res: Response<ApiResponse>) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const createdBy = (req as any).user._id;

    // Verify assigned user exists
    const assignedUser = await Database.getUserById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    const taskData = {
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      assignedTo,
      dueDate: dueDate || undefined
    };

    const task = await Database.createTask(taskData, createdBy);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateTask = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = (req as any).user._id;

    // Check if task exists
    const existingTask = await Database.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can update this task (creator or admin)
    const user = (req as any).user;
    const creatorId = (existingTask.createdBy && typeof (existingTask.createdBy as any) === 'object')
      ? (existingTask.createdBy as any)._id
      : (existingTask.createdBy as any);
    if (creatorId !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Verify assigned user if provided
    if (updates.assignedTo) {
      const assignedUser = await Database.getUserById(updates.assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }

    const task = await Database.updateTask(id, updates);

    return res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteTask = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    // Check if task exists
    const task = await Database.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can delete this task (creator or admin)
    const user = (req as any).user;
    const creatorId = (task.createdBy && typeof (task.createdBy as any) === 'object')
      ? (task.createdBy as any)._id
      : (task.createdBy as any);
    if (creatorId !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    const deleted = await Database.deleteTask(id);

    return res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

