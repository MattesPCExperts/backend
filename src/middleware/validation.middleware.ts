import type { NextFunction, Request, Response } from 'express';
import type { ZodIssue, ZodTypeAny } from 'zod';

type SchemaKey = 'body' | 'query' | 'params';

type RequestSchema = Partial<Record<SchemaKey, ZodTypeAny>>;

export function validateRequest(schema: RequestSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      (Object.keys(schema) as SchemaKey[]).forEach((key) => {
        const validator = schema[key];
        if (!validator) {
          return;
        }

        const result = validator.safeParse(req[key]);
        if (!result.success) {
          const issues = serializeIssues(result.error.issues);
          res.status(400).json({ message: 'Validation failed', issues });
          throwValidationAbort();
        }

        req[key] = result.data as unknown;
      });

      next();
    } catch (error) {
      if (isValidationAbort(error)) {
        return;
      }

      next(error);
    }
  };
}

function serializeIssues(issues: ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.join('.') || issue.path,
    message: issue.message,
    code: issue.code,
  }));
}

const validationAbortToken = Symbol('validation-abort');

function throwValidationAbort(): never {
  throw validationAbortToken;
}

function isValidationAbort(error: unknown): error is symbol {
  return error === validationAbortToken;
}

