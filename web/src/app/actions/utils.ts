import { Session, getServerSession } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string[]>>;

export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}

export type Action<TInput, TOutput> = (
  data: TInput,
  formData?: FormData
) => Promise<{
  result?: TOutput;
  fieldErrors?: FieldErrors<TInput>;
  error?: string;
}>;

type CreateSafeActionOptions<TInput, TOutput> = {
  scheme: z.Schema<TInput>;
  handler: (
    data: TInput,
    session?: Session | null,
    formData?: FormData | null
  ) => Promise<TOutput>;
  auth?: boolean;
  admin?: boolean;
};

export function createSafeAction<TInput, TOutput>({
  scheme,
  handler,
  auth,
  admin,
}: CreateSafeActionOptions<TInput, TOutput>): Action<TInput, TOutput> {
  return async (data, formData) => {
    let session: Session | null = null;
    if (auth) {
      const session = await getServerSession();
      if (!session) {
        return {
          error: "You must be signed in to perform this action",
        };
      }
    }
    try {
      const parsed = scheme.safeParse(data);
      if (!parsed.success) {
        return {
          error: "Invalid input",
          fieldErrors: parsed.error.flatten()
            .fieldErrors as FieldErrors<TInput>,
        };
      }
      const result = await handler(parsed.data, session, formData);
      return { result };
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const field = error.meta?.target as keyof TInput;
          return {
            error: "Conflict detected, please resolve before proceeding.",
            fieldErrors: {
              [field]: ["This field already taken"],
            } as FieldErrors<TInput>,
          };
        }
      }
      console.error(error);
      if (error instanceof CustomError) {
        return {
          error: error.message,
        };
      }
      return {
        error: "An unexpected error occurred. Please try again later.",
      };
    }
  };
}
