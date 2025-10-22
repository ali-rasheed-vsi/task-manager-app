import { Request, Response } from 'express';
import Database from '../services/database-adapter';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { ApiResponse, LoginRequest, SignupRequest, AuthTokens } from '../types';
import bcrypt from 'bcryptjs';

export const signup = async (req: Request<{}, ApiResponse<AuthTokens>, SignupRequest>, res: Response<ApiResponse<AuthTokens>>) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await Database.getUserByEmailWithPassword(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await Database.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    // Generate tokens
    const tokens = generateTokens(user._id.toString());

    // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request<{}, ApiResponse<AuthTokens>, LoginRequest>, res: Response<ApiResponse<AuthTokens>>) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Backend: Login request received for email:', email);
    console.log('📧 Backend: Request body:', { email, password: '***' });
    console.log('🌐 Backend: Request headers:', {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers['origin']
    });

    // Find user with password for login
    console.log('🔍 Backend: Looking up user in database...');
    const user = await Database.getUserByEmailWithPassword(email);
    console.log('👤 Backend: User lookup result:', {
      found: !!user,
      userId: user?._id,
      userEmail: user?.email,
      userName: user?.name,
      userRole: user?.role
    });
    
    if (!user) {
      console.log('❌ Backend: User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    console.log('🔑 Backend: Validating password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔑 Backend: Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Backend: Invalid password for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    console.log('🎫 Backend: Generating JWT tokens for user ID:', user._id);
    const tokens = generateTokens(user._id.toString());
    console.log('🎫 Backend: Tokens generated successfully:', {
      accessTokenLength: tokens.accessToken.length,
      refreshTokenLength: tokens.refreshToken.length
    });

    // Set refresh token as httpOnly cookie
    console.log('🍪 Backend: Setting refresh token cookie...');
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    console.log('✅ Backend: Refresh token cookie set successfully');

    console.log('✅ Backend: Login successful, sending response...');
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    console.error('❌ Backend: Login error occurred:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const refreshToken = async (req: Request, res: Response<ApiResponse<{ accessToken: string }>>) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Check if user still exists
    const user = await Database.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new access token
    const { accessToken } = generateTokens(user._id.toString());

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

export const logout = async (req: Request, res: Response<ApiResponse>) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProfile = async (req: Request, res: Response<ApiResponse>) => {
  try {
    console.log('👤 Backend: Profile request received');
    console.log('🔍 Backend: Request headers:', {
      'authorization': req.headers.authorization ? 'Bearer ***' : 'Not provided',
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    });
    
    const user = (req as any).user;
    console.log('👤 Backend: User from middleware:', {
      found: !!user,
      userId: user?._id,
      userEmail: user?.email,
      userName: user?.name,
      userRole: user?.role
    });
    
    if (!user) {
      console.log('❌ Backend: No user found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    console.log('✅ Backend: Sending profile response...');
    return res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('❌ Backend: Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
