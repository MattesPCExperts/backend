import { Post } from '@prisma/client';
import { prisma } from '../config/database';
import { createHttpError } from '../utils/http-error';

export interface CreatePostInput {
  vehicleId: string;
  platform: string;
  content: string;
  status?: string;
  scheduledFor?: Date | null;
}

export class PostService {
  async create(userId: string, input: CreatePostInput): Promise<Post> {
    await this.ensureVehicleOwnership(userId, input.vehicleId);

    const post = await prisma.post.create({
      data: {
        content: input.content,
        platform: input.platform,
        status: input.status ?? 'draft',
        scheduledFor: input.scheduledFor ?? null,
        userId,
        vehicleId: input.vehicleId,
      },
    });

    await prisma.postAnalytics.create({
      data: {
        postId: post.id,
      },
    });

    return post;
  }

  async publish(userId: string, postId: string): Promise<Post> {
    const post = await this.ensurePostOwnership(userId, postId);

    return prisma.post.update({
      where: { id: post.id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        scheduledFor: null,
      },
    });
  }

  async schedule(userId: string, postId: string, scheduledFor: Date): Promise<Post> {
    if (scheduledFor.getTime() <= Date.now()) {
      throw createHttpError(400, 'Scheduled date must be in the future');
    }

    const post = await this.ensurePostOwnership(userId, postId);

    return prisma.post.update({
      where: { id: post.id },
      data: {
        status: 'scheduled',
        scheduledFor,
      },
    });
  }

  async getAnalytics(userId: string, postId: string) {
    await this.ensurePostOwnership(userId, postId);

    return prisma.postAnalytics.findUnique({
      where: { postId },
    });
  }

  private async ensureVehicleOwnership(userId: string, vehicleId: string): Promise<void> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { userId: true },
    });

    if (!vehicle || vehicle.userId !== userId) {
      throw createHttpError(404, 'Vehicle not found');
    }
  }

  private async ensurePostOwnership(userId: string, postId: string): Promise<Post> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== userId) {
      throw createHttpError(404, 'Post not found');
    }

    return post;
  }
}

export const postService = new PostService();

