'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/features/auth/auth.schema';
import { useLoginMutation } from '@/features/auth/auth.hooks';

function SocialityLogo() {
  return (
    <Link
      href='/'
      aria-label='Sociality22 - Kembali ke Timeline'
      className='inline-flex items-center justify-center gap-3 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500'
    >
      <Image
        src='/images/sociality-logo.png'
        alt='Sociality22 Logo'
        width={40}
        height={40}
        priority
        className='h-10 w-10 object-contain'
      />

      <span className='text-2xl font-bold tracking-tight text-[#FDFDFD]'>
        Sociality22
      </span>
    </Link>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      className='h-5 w-5'
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z'
      />
      <circle cx='12' cy='12' r='3' />
      {visible && <path strokeLinecap='round' d='M4 4 20 20' />}
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (response) => {
        if (response.success) {
          router.push('/');
        }
      },
    });
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-[#0b0e13] px-4 py-3 text-base
    text-white placeholder:text-[#555b67] outline-none transition
    focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
    ${
      hasError
        ? 'border-pink-600 focus:border-pink-500 focus:ring-pink-500/20'
        : 'border-[#1b222d] hover:border-[#343b49]'
    }`;

  return (
    <main className='relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 sm:px-6'>
      {/* Purple gradient background */}
      <div
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 -z-10'
        style={{
          background: `
      radial-gradient(
        ellipse 75% 48% at 0% 100%,
        rgba(109, 40, 217, 0.95) 0%,
        rgba(76, 29, 149, 0.65) 40%,
        transparent 100%
      ),
      radial-gradient(
        ellipse 70% 45% at 100% 100%,
        rgba(126, 34, 206, 0.8) 0%,
        rgba(76, 29, 149, 0.5) 45%,
        transparent 100%
      ),
      linear-gradient(
        to bottom,
        #000000 0%,
        #000000 35%,
        #08020f 58%,
        #160525 78%,
        #21063d 100%
      )
    `,
        }}
      />

      {/* Subtle meteor shower */}
      <div className='meteor-layer' aria-hidden='true'>
        {Array.from({ length: 25 }, (_, i) => (
          <span key={i} className={`meteor meteor-${i + 1}`} />
        ))}
      </div>

      <section className='relative z-10 w-full max-w-[456px] rounded-2xl border border-white/[0.06] bg-black/60 p-6 shadow-2xl shadow-purple-950/10 backdrop-blur-sm sm:p-8'>
        {/* Header */}
        <header className='mb-8 text-center'>
          <SocialityLogo />

          <h1 className='mt-7 text-2xl font-bold tracking-tight text-white'>
            Welcome Back!
          </h1>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className='space-y-6'
        >
          {/* Email */}
          <div>
            <label
              htmlFor='email'
              className='mb-2 block text-sm font-semibold text-white'
            >
              Email
            </label>

            <input
              id='email'
              type='email'
              autoComplete='email'
              placeholder='Enter your email'
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
              className={inputClass(Boolean(errors.email))}
            />

            {errors.email && (
              <p id='email-error' className='mt-2 text-sm text-pink-500'>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor='password'
              className='mb-2 block text-sm font-semibold text-white'
            >
              Password
            </label>

            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                autoComplete='current-password'
                placeholder='Enter your password'
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                {...register('password')}
                className={`${inputClass(Boolean(errors.password))} pr-12`}
              />

              <button
                type='button'
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                }
                aria-pressed={showPassword}
                className='absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>

            {errors.password && (
              <p id='password-error' className='mt-2 text-sm text-pink-500'>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* API authentication error */}
          {loginMutation.isError && (
            <p role='alert' className='text-sm text-pink-500'>
              Login gagal. Periksa email dan password, lalu coba lagi.
            </p>
          )}

          {!loginMutation.isError &&
            loginMutation.isSuccess &&
            !loginMutation.data.success && (
              <p role='alert' className='text-sm text-pink-500'>
                Login gagal. Silakan periksa kembali kredensial Anda.
              </p>
            )}

          {/* Submit */}
          <button
            type='submit'
            disabled={loginMutation.isPending}
            className='w-full rounded-full bg-violet-600 px-5 py-3.5 font-semibold text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60'
          >
            {loginMutation.isPending ? 'Sedang masuk...' : 'Login'}
          </button>
        </form>

        {/* Register link */}
        <p className='mt-6 text-center text-sm font-normal text-white sm:text-base'>
          Don't have an account?{' '}
          <Link
            href='/register'
            className='font-normal text-violet-500 transition hover:text-violet-400'
          >
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
