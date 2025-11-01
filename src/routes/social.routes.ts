import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  disconnectAccount,
  getConnectionStatus,
  handleOAuthCallback,
  initiateOAuth,
} from '../controllers/social.controller';
import { socialAuthParamSchema, socialCallbackSchema } from '../utils/validators';

const router = Router();

router.use(authenticateJwt);

router.post('/auth/:platform/initiate', validateRequest(socialAuthParamSchema), initiateOAuth);
router.post('/auth/:platform/callback', validateRequest(socialCallbackSchema), handleOAuthCallback);
router.get('/auth/:platform/status', validateRequest(socialAuthParamSchema), getConnectionStatus);
router.delete('/auth/:platform/disconnect', validateRequest(socialAuthParamSchema), disconnectAccount);

export default router;

