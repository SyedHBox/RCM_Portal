import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db';

/**
 * User authentication controller
 * Handles login, registration, and user verification
 */

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
}

/**
 * Login user and generate JWT token
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email and password are required' 
      });
    }

    // In a real implementation, fetch the user from the database
    // const userQuery = await pool.query(
    //   'SELECT * FROM users WHERE email = $1',
    //   [email.toLowerCase()]
    // );
    
    // const user = userQuery.rows[0];
    
    // if (!user || !(await bcrypt.compare(password, user.password))) {
    //   return res.status(401).json({
    //     status: 'error',
    //     message: 'Invalid email or password'
    //   });
    // }

    // Temporary mock implementation (replace with real database lookup)
    // This is for demonstration purposes only
    const mockUsers = [
      {
        id: 1,
        email: 'HBilling_RCM@hbox.ai',
        // This would be a bcrypt hash in a real implementation
        password: 'Admin@2025',
        name: 'Admin User',
        role: 'Admin'
      },
      {
        id: 2,
        email: 'syed.a@hbox.ai',
        password: 'User@2025',
        name: 'Regular User',
        role: 'User'
      }
    ];

    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // For demo purposes, we're checking the password with simple comparison
    // In a real implementation, verify the password with bcrypt
    if (user.password !== password) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role
      },
      jwtSecret as Secret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      } as jwt.SignOptions
    );

    // Send response with token
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Verify user JWT token
 */
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is required'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret as Secret);
      
      // In a real implementation, you would verify the user still exists in the database
      // const userQuery = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      // if (userQuery.rows.length === 0) {
      //   return res.status(401).json({
      //     status: 'error',
      //     message: 'User no longer exists'
      //   });
      // }

      res.status(200).json({
        status: 'success',
        data: { 
          user: decoded,
          valid: true
        }
      });
    } catch (jwtError) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
        valid: false
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};