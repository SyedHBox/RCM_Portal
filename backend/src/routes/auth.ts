import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

/**
 * Authentication routes
 */
router.post('/login', authController.login);
router.post('/verify', authController.verifyToken);

export default router;