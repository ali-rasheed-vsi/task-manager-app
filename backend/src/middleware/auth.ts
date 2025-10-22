import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Database from '../services/database-adapter';
import { ApiResponse, User } from '../types';

interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    console.log('🛡️ Auth Middleware: Processing authentication request');
    console.log('🔍 Auth Middleware: Request URL:', req.url);
    console.log('🔍 Auth Middleware: Request method:', req.method);
    
    const authHeader = req.header('Authorization');
    console.log('🔑 Auth Middleware: Authorization header:', authHeader ? 'Bearer ***' : 'Not provided');
    
    if (!authHeader) {
      console.log('❌ Auth Middleware: No authorization header provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Auth Middleware: Extracted token length:', token.length);
    
    // Check if token is malformed (basic validation)
    if (!token || token === 'null' || token === 'undefined' || token.length < 10) {
      console.log('❌ Auth Middleware: Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }

    console.log('🔍 Auth Middleware: Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log('✅ Auth Middleware: Token verified successfully, userId:', decoded.userId);
    
    console.log('👤 Auth Middleware: Looking up user in database...');
    const user = await Database.getUserById(decoded.userId);
    console.log('👤 Auth Middleware: User lookup result:', {
      found: !!user,
      userId: user?._id,
      userEmail: user?.email,
      userName: user?.name
    });
    
    if (!user) {
      console.log('❌ Auth Middleware: User not found for userId:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    console.log('✅ Auth Middleware: Authentication successful, setting user in request');
    req.user = user;
    return next();
  } catch (error) {
    console.error('❌ Auth Middleware: Authentication error:', error);
    
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ Auth Middleware: JWT format error');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      console.log('❌ Auth Middleware: Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    console.log('❌ Auth Middleware: General authentication failure');
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    return next();
  };
};
