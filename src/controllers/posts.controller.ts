import type { NextFunction, Request, Response } from 'express';
import { postService } from '../services/post.service';
import { createHttpError } from '../utils/http-error';

export async function createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const post = await postService.create(req.user.id, {
      vehicleId: req.body.vehicleId,
      platform: req.body.platform,
      content: req.body.content,
      status: req.body.status,
      scheduledFor: req.body.scheduledFor ? new Date(req.body.scheduledFor) : null,
    });

    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
}

export async function publishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const post = await postService.publish(req.user.id, req.params.id);
    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
}

export async function schedulePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const scheduledFor = new Date(req.body.scheduledFor);
    const post = await postService.schedule(req.user.id, req.params.id, scheduledFor);
    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
}

export async function getPostAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const analytics = await postService.getAnalytics(req.user.id, req.params.id);
    res.status(200).json({ analytics });
  } catch (error) {
    next(error);
  }
}

