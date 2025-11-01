import type { RequestHandler } from 'express';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { env } from '../config/env';
import { userService } from '../services/user.service';

interface JwtStrategyPayload {
  sub: string;
  email?: string;
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_SECRET,
    },
    async (payload: JwtStrategyPayload, done) => {
      try {
        const user = await userService.findById(payload.sub);
        if (!user) {
          done(null, false);
          return;
        }

        const authUser = { id: user.id, email: user.email ?? undefined } satisfies Express.User;
        done(null, authUser);
      } catch (error) {
        done(error as Error);
      }
    },
  ),
);

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface User {
      id: string;
      email?: string;
    }
  }
}

export const authenticateJwt: RequestHandler = (req, res, next) =>
  passport.authenticate('jwt', { session: false })(req, res, next);

export default passport;

