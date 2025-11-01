import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import { prisma } from '../config/database';

const SALT_ROUNDS = 12;

export interface CreateUserInput {
  email: string;
  name?: string | null;
  password: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export class UserService {
  async createUser({ email, name, password }: CreateUserInput): Promise<User> {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    return prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  toPublicUser(user: User): PublicUser {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

export const userService = new UserService();

