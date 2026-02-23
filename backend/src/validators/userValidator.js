import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  gender: z.enum(["bride", "groom", "male", "female", ""]).optional(),
  role: z.enum(["couple", "vendor", "admin"]).optional(),
  location: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
