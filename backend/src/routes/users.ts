import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { taskQuerySchema } from '../validators/task';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin only)
router.get('/', authorize('admin'), validateQuery(taskQuerySchema), getUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user (admin only)
router.put('/:id', authorize('admin'), updateUser);

// Delete user (admin only)
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
