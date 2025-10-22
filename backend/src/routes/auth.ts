import { Router } from 'express';
import { signup, login, refreshToken, logout, getProfile } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { loginSchema, signupSchema } from '../validators/auth';

const router = Router();

// Public routes
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', logout);
router.get('/profile', authenticate, getProfile);

export default router;
