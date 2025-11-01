import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { getProfile, login, refreshToken, register } from '../controllers/auth.controller';
import { loginSchema, refreshTokenSchema, registerSchema } from '../utils/validators';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh', validateRequest(refreshTokenSchema), refreshToken);
router.get('/me', authenticateJwt, getProfile);

export default router;

