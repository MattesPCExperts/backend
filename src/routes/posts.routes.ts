import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createPost, getPostAnalytics, publishPost, schedulePost } from '../controllers/posts.controller';
import {
  createPostSchema,
  postAnalyticsParamsSchema,
  publishPostSchema,
  schedulePostSchema,
} from '../utils/validators';

const router = Router();

router.use(authenticateJwt);

router.post('/create', validateRequest(createPostSchema), createPost);
router.post('/:id/publish', validateRequest(publishPostSchema), publishPost);
router.post('/:id/schedule', validateRequest(schedulePostSchema), schedulePost);
router.get('/:id/analytics', validateRequest(postAnalyticsParamsSchema), getPostAnalytics);

export default router;

