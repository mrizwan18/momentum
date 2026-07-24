import type { z } from "zod";

export class ValidationError extends Error {
  readonly issues: z.core.$ZodIssue[];

  constructor(entityName: string, issues: z.core.$ZodIssue[]) {
    const summary = issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    super(`Invalid ${entityName}: ${summary}`);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

/**
 * Every repository write goes through this before touching Dexie — the
 * validation layer that keeps malformed data out of storage, rather than
 * trusting that callers always pass well-formed records.
 */
export function parseOrThrow<Schema extends z.ZodType>(
  schema: Schema,
  entityName: string,
  data: unknown,
): z.infer<Schema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(entityName, result.error.issues);
  }
  return result.data;
}
