import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  username: z.string().trim().min(1, 'Username wajib diisi'),
  email: z.string().trim().email('Format email tidak valid'),
  phone: z.string().trim().min(1, 'Nomor telepon wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
