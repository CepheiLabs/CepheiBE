import * as z from "zod";

export const registrationSchema = z
  .object({
    email: z.email("Please provide a valid email"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    avatarUrl: z.url().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"], //attach to the CP field
      });
    }
  });

export type RegisterInput = z.infer<typeof registrationSchema>;
