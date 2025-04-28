// lib/validators/auth.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  // Add password validation rules as needed
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const SignUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    // Add other fields like name if required
});

 export type SignUpInput = z.infer<typeof SignUpSchema>;
