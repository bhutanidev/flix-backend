import * as z from 'zod/v4';

export const CreateUserSchema = z.object({
    name: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.email("Enter a valid email").trim(),
    password: z.string().min(7, 'Password must contain at least 7 characters'),
});

export const SigninUserSchema = z.object({
    email: z.string().min(1).email('Invalid email format').trim(),
    password: z.string().min(7, 'Password must contain at least 7 characters'),
});
