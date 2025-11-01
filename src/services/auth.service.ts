import { verifyToken } from '../utils/jwt';
import { calculateRefreshExpiry } from '../utils/token';
import { createHttpError } from '../utils/http-error';
import { refreshTokenService } from './refresh-token.service';
import { userService, type PublicUser } from './user.service';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { calculateAccessExpiry } from '../utils/token';

export interface AuthResponse {
  user: PublicUser;
  tokens: {
    accessToken: string;
    accessTokenExpiresAt: Date;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  };
}

export class AuthService {
  async register(input: { email: string; password: string; name?: string | null }): Promise<AuthResponse> {
    const existing = await userService.findByEmail(input.email);
    if (existing) {
      throw createHttpError(409, 'User already exists');
    }

    const user = await userService.createUser(input);
    return this.issueTokens(user);
  }

  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    const user = await userService.findByEmail(input.email);
    if (!user) {
      throw createHttpError(401, 'Invalid email or password');
    }

    const isValid = await userService.validatePassword(user, input.password);
    if (!isValid) {
      throw createHttpError(401, 'Invalid email or password');
    }

    return this.issueTokens(user);
  }

  async refresh(input: { refreshToken: string }): Promise<AuthResponse> {
    let payload: { sub: string; email?: string };
    try {
      payload = verifyToken(input.refreshToken);
    } catch (error) {
      throw createHttpError(401, 'Invalid refresh token');
    }

    const user = await userService.findById(payload.sub);
    if (!user) {
      throw createHttpError(401, 'User no longer exists');
    }

    const newRefreshToken = signRefreshToken({ sub: user.id, email: user.email ?? undefined });
    const refreshExpiresAt = calculateRefreshExpiry();

    try {
      await refreshTokenService.rotate(input.refreshToken, user.id, newRefreshToken, refreshExpiresAt);
    } catch (error) {
      throw createHttpError(401, 'Refresh token is no longer valid');
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email ?? undefined });
    const accessExpiresAt = calculateAccessExpiry();

    return {
      user: userService.toPublicUser(user),
      tokens: {
        accessToken,
        accessTokenExpiresAt: accessExpiresAt,
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: refreshExpiresAt,
      },
    };
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await userService.findById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    return userService.toPublicUser(user);
  }

  private async issueTokens(user: Parameters<typeof userService.toPublicUser>[0]): Promise<AuthResponse> {
    const accessToken = signAccessToken({ sub: user.id, email: user.email ?? undefined });
    const refreshToken = signRefreshToken({ sub: user.id, email: user.email ?? undefined });

    const accessExpiresAt = calculateAccessExpiry();
    const refreshExpiresAt = calculateRefreshExpiry();

    await refreshTokenService.create(user.id, refreshToken, refreshExpiresAt);

    return {
      user: userService.toPublicUser(user),
      tokens: {
        accessToken,
        accessTokenExpiresAt: accessExpiresAt,
        refreshToken,
        refreshTokenExpiresAt: refreshExpiresAt,
      },
    };
  }
}

export const authService = new AuthService();

