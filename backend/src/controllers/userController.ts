import { Request, Response } from 'express';
import Database from '../services/database-adapter';
import { ApiResponse, PaginationQuery, PaginatedResponse } from '../types';

export const getUsers = async (req: Request<{}, ApiResponse<PaginatedResponse<any>>, {}, PaginationQuery>, res: Response<ApiResponse<PaginatedResponse<any>>>) => {
  try {
    const query = {
      page: parseInt(String(req.query.page)) || 1,
      limit: parseInt(String(req.query.limit)) || 10,
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc'
    };

    const result = await Database.getUsers(query);

    // Get tasks for each user
    const usersWithTasks = await Promise.all(
      result.data.map(async (user) => {
        const userTasks = await Database.getTasksByUser(user._id, { limit: 10 });
        return {
          ...user,
          tasks: userTasks.data
        };
      })
    );

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        data: usersWithTasks,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserById = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;

    const user = await Database.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's tasks
    const userTasks = await Database.getTasksByUser(id, { limit: 10 });

    return res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        ...user,
        tasks: userTasks.data
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateUser = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const user = await Database.updateUser(id, { name, email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteUser = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;

    // Check if user has assigned tasks
    const userTasks = await Database.getTasksByUser(id);
    if (userTasks.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with assigned tasks'
      });
    }

    const deleted = await Database.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
