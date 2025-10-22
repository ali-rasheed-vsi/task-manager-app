import { Router } from 'express';
import { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../validators/task';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all tasks
router.get('/', validateQuery(taskQuerySchema), getTasks);

// Get task by ID
router.get('/:id', getTaskById);

// Create new task
router.post('/', validate(createTaskSchema), createTask);

// Update task
router.put('/:id', validate(updateTaskSchema), updateTask);

// Delete task
router.delete('/:id', deleteTask);

export default router;
